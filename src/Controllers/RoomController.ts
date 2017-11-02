import EntityController from "./EntityController";
import SpawnController from "./SpawnController";
import Barbarian from "../Minions/Barbarian";
import Builder from "../Minions/Builder";
import Courier from "../Minions/Courier";
import Drone from "../Minions/Drone";
import Filler from "../Minions/Filler";
import Guardian from "../Minions/Guardian";
import Harvester from "../Minions/Harvester";
import LinkMiner from "../Minions/LinkMiner";
import Miner from "../Minions/Miner";
import Raider from "../Minions/Raider";
import Scientist from "../Minions/Scientist";
import Scout from "../Minions/Scout";
import Seeder from "../Minions/Seeder";
import Upgrader from "../Minions/Upgrader";
import Configuration from "../Configuration";
type RoomHash = {[roomName: string]: Room};
type DefconType = {level, tick};

/**
 * RoomController, used to run all aspects of a room.
 * Spawns minions, runs each minion in the room, and runs each turret in the room.
 *
 * @export
 * @class RoomController
 */
export default class RoomController {
    private readonly room: Room;

    /**
     * Creates an instance of RoomController.
     * @param {Room} room
     * @memberof RoomController
     */
    constructor(room: Room) {
        this.room = room;
        if (!this.Index) {
            let index = 0;
            const max = _.max(Game.rooms, (r) => r.memory.index);
            if (max && max.memory) {
                index = max.memory.index + 1;
            }
            this.room.memory.index = index;
        }
    }

    /**
     * Gets the index of this room
     *
     * @readonly
     * @type {number}
     * @memberof RoomController
     */
    public get Index(): number {
        return this.room.memory.index;
    }

    /**
     * Runs the room
     *
     * @memberof RoomController
     */
    public Run() {
        this.Initialize();

        const tick = Game.time % Configuration.TickRate;

        if (tick === this.Index) {
            const spawnQueue = this.GetSpawnQueue();
            if (spawnQueue) {
                SpawnController.Spawn(this.room.find(FIND_MY_SPAWNS), spawnQueue);
            }
        }

        if (tick === Configuration.TickRate - 1) {
            EntityController.RunLinks(this.room.find(FIND_MY_STRUCTURES, { filter: (tower) => tower.structureType === STRUCTURE_LINK }));
        }

        if (tick === Configuration.TickRate - 2) {
            this.RefreshRoomMemory();
        }

        EntityController.RunCreeps(this.room.find(FIND_MY_CREEPS));

        if (tick === Configuration.TickRate - 3 || RoomController.GetDefcon(this.room).level > 0) {
            EntityController.RunTowers(this.room.find(FIND_MY_STRUCTURES, { filter: (tower) => tower.structureType === STRUCTURE_TOWER }));
        }

        EntityController.RunTerminal(this.room.terminal);
        EntityController.RunLabs(this.room.find(FIND_MY_STRUCTURES, { filter: (lab) => lab.structureType === STRUCTURE_LAB }));
    }

    private Initialize() {
        this.DrawVisuals();
        this.LogStats();
        if (!this.room.memory.needs) {
            this.room.memory.needs = [];
        }
        if (!this.room.memory.income) {
            this.room.memory.income = [];
        }
        if (!this.room.memory.labs) {
            this.room.memory.labs = {};
        }
    }

    private DrawVisuals() {
        if (!Configuration.DrawVisuals || !this.room.controller || !this.room.controller.my) {
            return;
        }
        new RoomVisual(this.room.name).rect(
            this.room.controller.pos.x - 3,
            this.room.controller.pos.y - 3,
            6,
            6,
            {fill: "transparent", stroke: "#ffffff", lineStyle: "dashed"}
        );
    }

    private LogStats() {
        if (!Configuration.Statistics || Game.time % 1200 !== 0 || !this.room.storage) {
            return;
        }
        this.room.memory.income.push({time: Game.time, bank: this.room.storage.store.energy});
    }

    private RefreshRoomMemory() {
        this.room.memory.needs = [];
        if (this.room.storage && this.room.storage.store.energy < 50000) {
            this.room.memory.needs.push(RESOURCE_ENERGY);
        }
        if (this.room.terminal) {
            for (const resource in Configuration.Terminal) {
                if (resource === RESOURCE_ENERGY || resource === "Fallback") {
                    continue;
                }
                const limits = Configuration.Terminal[resource];
                if (this.room.terminal.store[resource] >= limits.Minimum) {
                    continue;
                }
                this.room.memory.needs.push(resource);
            }
        }

        if (!this.room.memory.linkTarget && this.room.storage && this.room.controller.level >= 5) {
            const targetLink = this.room.storage.pos.findClosestByRange<StructureLink>(FIND_MY_STRUCTURES, { filter: (l) => l.structureType === STRUCTURE_LINK });
            if (targetLink) {
                this.room.memory.linkTarget = targetLink.id;
            }
        }

        if (RoomController.AreWeLinkMining(this.room) && !this.room.memory.sources) {
            const sourceList = {};
            const sources = this.room.find<Source>(FIND_SOURCES);
            for (const source of sources) {
                const ramparts = source.pos.findInRange<StructureRampart>(FIND_STRUCTURES, 1, {
                    filter: (r) => r.structureType === STRUCTURE_RAMPART
                });
                if (ramparts.length === 0) {
                    break;
                }
                let rampart: StructureRampart;
                for (const r in ramparts) {
                    const ramp = ramparts[r];
                    const structures = ramp.pos.lookFor<Structure>(LOOK_STRUCTURES);
                    if (_.all(structures, (s) => s.structureType !== STRUCTURE_LINK)) {
                        rampart = ramp;
                        break;
                    }
                }
                if (!rampart) {
                    break;
                }
                sourceList[source.id] = {
                    x: rampart.pos.x,
                    y: rampart.pos.y
                };
            }
            if (Object.keys(sourceList).length === sources.length) {
                this.room.memory.sources = sourceList;
            }
        }
    }

    /**
     * Gets the spawn options for the different minion types.
     *
     * @returns {any[]}
     * @memberof RoomController
     */
    public GetSpawnQueue(): any[] {
        const spawnQueue = [];
        for (const i in RoomController.Options) {
            this.AddOptions(spawnQueue, RoomController.Options[i]);
        }
        return spawnQueue;
    }

    private AddOptions(options: any[], getFunc: (room: Room) => any) {
        if (!this.room.controller) {
            return;
        }
        const opt = getFunc(this.room);
        if (opt && opt.Count !== 0) {
            options.push(opt);
        }
    }

    /**
     * Runs each of the rooms in the specified room hash.
     *
     * @static
     * @param {{[roomName: string]: Room;}} rooms
     * @memberof RoomController
     */
    public static RunRooms(rooms: { [roomName: string]: Room }) {
        for (const r in rooms) {
            if (!rooms.hasOwnProperty(r)) {
                continue;
            }
            const controller = new RoomController(rooms[r]);
            controller.Run();
        }
    }

    /**
     * List of functions to get the spawn options for all the minion types.
     *
     * @static
     * @memberof RoomController
     */
    public static Options = [
        (room: Room): any => Harvester.GetOptions(room),
        (room: Room): any => Courier.GetOptions(room),
        (room: Room): any => Miner.GetOptions(room),
        (room: Room): any => LinkMiner.GetOptions(room),
        (room: Room): any => Filler.GetOptions(room),
        (room: Room): any => Builder.GetOptions(room),
        (room: Room): any => Guardian.GetOptions(room),
        (room: Room): any => Barbarian.GetOptions(room),
        (room: Room): any => Scientist.GetOptions(room),
        (room: Room): any => Upgrader.GetOptions(room),
        (room: Room): any => Scout.GetOptions(room),
        (room: Room): any => Seeder.GetOptions(room),
        (room: Room): any => Drone.GetOptions(room),
        (room: Room): any => Raider.GetOptions(room)
    ];

    /**
     * Gets if we are link mining in this room
     *
     * @static
     * @param {Room} room
     * @returns {boolean}
     * @memberof RoomController
     */
    public static AreWeLinkMining(room: Room): boolean {
        if (room.memory.linkMining === undefined) {
            const sources = room.find(FIND_SOURCES).length;
            const links = room.find(FIND_MY_STRUCTURES, { filter: (l) => l.structureType === STRUCTURE_LINK }).length;
            return (room.memory.linkMining = links > sources);
        }
        return room.memory.linkMining;
    }

    /**
     * Gets if we are container mining in this room
     *
     * @static
     * @param {Room} room
     * @returns {boolean}
     * @memberof RoomController
     */
    public static AreWeContainerMining(room: Room): boolean {
        if (room.memory.containerMining === undefined) {
            const sources = room.find(FIND_SOURCES).length;
            const containers = room.find(FIND_STRUCTURES, { filter: (c) => c.structureType === STRUCTURE_CONTAINER }).length;
            return (room.memory.containerMining = containers >= sources);
        }
        return room.memory.containerMining;
    }

    /**
     * Gets the threat level in this room
     *
     * Defcon 0  => no threat.
     *        1  => hostiles in room, turrets fire every tick.
     *        2  => 60 ticks under siege, rooms spawns 2 guardians to defend.
     *        3  => 120 ticks under siege, same as defcon 2.
     *        4+ => 180 ticks under siege, rooms spawns 2 additional guardians to defend
     *
     * @static
     * @param {Room} room
     * @returns {DefconType}
     * @memberof RoomController
     */
    public static GetDefcon(room: Room): DefconType {
        const hostiles = room.find<Creep>(FIND_HOSTILE_CREEPS);
        const current: DefconType = room.memory.defcon || { level: 0, tick: Game.time };
        const tick = Game.time - current.tick;
        if (tick !== 0 && tick % 50 === 0) {
            if (hostiles.length > 0) {
                current.level = Math.min(8, current.level + 1);
                console.log(`${room.name}: Upgrading defcon to ${current.level}`);
            } else if (current.level !== 0) {
                current.level = 0;
                console.log(`${room.name}: Downgrading defcon to ${current.level}`);
            }
            current.tick = Game.time;
        }
        return room.memory.defcon = current;
    }
}
