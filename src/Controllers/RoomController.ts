import EntityController from "./EntityController";
import SpawnController from "./SpawnController";
import Builder from "../Minions/Builder";
import Courier from "../Minions/Courier";
import Drone from "../Minions/Drone";
import Filler from "../Minions/Filler"
import Guardian from "../Minions/Guardian"
import Harvester from "../Minions/Harvester";
import LinkMiner from "../Minions/LinkMiner";
import Miner from "../Minions/Miner";
import Raider from "../Minions/Raider";
import Scout from "../Minions/Scout";
import Seeder from "../Minions/Seeder";
import Upgrader from "../Minions/Upgrader";
import Configuration from "../Configuration"
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
            let max = _.max(Game.rooms, r => r.memory.index);
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
        this.LogStats();

        let creeps: Creep[] = this.room.find(FIND_MY_CREEPS);
        let tick = Game.time % Configuration.TickRate;
        
        if (tick == this.Index) {
            let spawnOptions = this.GetSpawnOptions();
            if (spawnOptions) {
                SpawnController.Spawn(this.room.find(FIND_MY_SPAWNS), creeps, spawnOptions);            
            }    
        }
        
        if (tick == Configuration.TickRate - 1) {
            EntityController.RunLinks(this.room.find(FIND_MY_STRUCTURES, { filter: tower => tower.structureType == STRUCTURE_LINK }));            
        }

        if (tick == Configuration.TickRate - 2) {
            this.RefreshRoomMemory();
        }
        
        EntityController.RunCreeps(creeps);
      
        if (tick == Configuration.TickRate - 3 || RoomController.GetDefcon(this.room).level > 0) {
            EntityController.RunTowers(this.room.find(FIND_MY_STRUCTURES, { filter: tower => tower.structureType == STRUCTURE_TOWER }));            
        }
        
        EntityController.RunTerminal(this.room.terminal);
    }

    private LogStats() {
        if (Game.time % 1200 == 0 && this.room.storage) {
            if (!this.room.memory.income) {
                this.room.memory.income = [];
            }
            this.room.memory.income.push({time: Game.time, bank: this.room.storage.store.energy})            
        }
    }

    private RefreshRoomMemory() {
        this.room.memory.needRelief = !this.room.storage || this.room.storage.store.energy < 50000;
        
        this.room.memory.underAttack = undefined;
        
        if (!this.room.memory.linkTarget && this.room.storage && this.room.controller.level >= 5) {
            let targetLink = this.room.storage.pos.findClosestByRange<StructureLink>(FIND_MY_STRUCTURES, { filter: link => link.structureType == STRUCTURE_LINK });
            this.room.memory.linkTarget = targetLink.id;
        }

        if (RoomController.AreWeLinkMining(this.room) && !this.room.memory.sources) {
            let sourceList = {};
            let sources = this.room.find<Source>(FIND_SOURCES);
            for (var s in sources) {
                let source = sources[s];
                let ramparts = source.pos.findInRange<StructureRampart>(FIND_STRUCTURES, 1, {
                    filter: rampart => rampart.structureType == STRUCTURE_RAMPART
                });
                if (ramparts.length == 0) {
                    break;
                }
                let rampart: StructureRampart;
                for (var r in ramparts) {
                    let ramp = ramparts[r];
                    let structures = ramp.pos.lookFor<Structure>(LOOK_STRUCTURES);
                    if (_.all(structures, s => s.structureType != STRUCTURE_LINK)) {
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
            if (Object.keys(sourceList).length == sources.length) {
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
    public GetSpawnOptions(): any[] {
        let options = [];
        for (var i in RoomController.OptionFuncs) {
            this.AddOptions(options, RoomController.OptionFuncs[i]);
        }
        return options;
    }

    private AddOptions(options: any[], getFunc: (room: Room) => any) {
        if (!this.room.controller) {
            return;
        }
        let opt = getFunc(this.room);
        if (opt && opt.Count != 0) {
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
    public static RunRooms(rooms: {[roomName: string]: Room;}) {
        for (var key in rooms) {
            if (!rooms.hasOwnProperty(key)) {
                continue;
            }
            let controller = new RoomController(rooms[key]);
            controller.Run();
        }
    }

    /**
     * List of functions to get the spawn options for all the minion types.
     * 
     * @static
     * @memberof RoomController
     */
    public static OptionFuncs = [
        (room: Room): any => Harvester.GetOptions(room),
        (room: Room): any => Courier.GetOptions(room),
        (room: Room): any => Miner.GetOptions(room),
        (room: Room): any => LinkMiner.GetOptions(room),
        (room: Room): any => Filler.GetOptions(room),
        (room: Room): any => Guardian.GetOptions(room),
        (room: Room): any => Builder.GetOptions(room),
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
        if (room.memory.linkMining == undefined) {
            let sources = room.find(FIND_SOURCES).length;
            let links = room.find(FIND_MY_STRUCTURES, {filter : link => link.structureType == STRUCTURE_LINK}).length;
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
        if (room.memory.containerMining == undefined) {
            let sources = room.find(FIND_SOURCES).length;
            let containers = room.find(FIND_STRUCTURES, {filter : container => container.structureType == STRUCTURE_CONTAINER}).length;
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
        let hostiles = room.find<Creep>(FIND_HOSTILE_CREEPS);
        let current: DefconType = room.memory.defcon || { level: 0, tick: Game.time };
        if (hostiles.length > 0 && (Game.time - current.tick) % 60 == 0) {
            current.level++;
            current.tick = Game.time;
        }
        return room.memory.defcon = current;
    }
}