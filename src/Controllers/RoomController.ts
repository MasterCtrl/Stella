import EntityController from "./EntityController";
import SpawnController from "./SpawnController";
import Builder from "../Minions/Builder";
import Courier from "../Minions/Courier";
import Drone from "../Minions/Drone";
import Filler from "../Minions/Filler"
import Harvester from "../Minions/Harvester";
import LinkMiner from "../Minions/LinkMiner";
import Miner from "../Minions/Miner";
import Scout from "../Minions/Scout";
import Seeder from "../Minions/Seeder";
import Upgrader from "../Minions/Upgrader";
import Configuration from "../Configuration"

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
    }

    /**
     * Runs the room
     * 
     * @memberof RoomController
     */
    public Run() {
        let creeps: Creep[] = this.room.find(FIND_MY_CREEPS);
        let tick = Game.time % Configuration.HashFactor;
        
        if (tick == this.HashRoomName(this.room.name)) {
            let spawnOptions = this.GetSpawnOptions();
            if (spawnOptions) {
                SpawnController.Spawn(this.room.find(FIND_MY_SPAWNS), creeps, spawnOptions);            
            }    
        }
        
        if (tick == 2) {
            EntityController.RunLinks(this.room.find(FIND_MY_STRUCTURES, { filter: tower => tower.structureType == STRUCTURE_LINK }));            
        }
        
        EntityController.RunCreeps(creeps);
        
        if (tick == 3 || RoomController.UnderAttack(this.room.name)) {
            EntityController.RunTowers(this.room.find(FIND_MY_STRUCTURES, { filter: tower => tower.structureType == STRUCTURE_TOWER }));            
        }
        
        EntityController.RunTerminal(this.room.terminal);
    }

    private HashRoomName(roomName: string): number {
        var hash = 0, i, chr;
        if (roomName.length === 0) {
            return hash;
        }
        for (i = 0; i < roomName.length; i++) {
            chr  = roomName.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return hash % Configuration.HashFactor;
    }

    /**
     * Gets the spawn options for the different minion types.
     * 
     * @returns {any[]} 
     * @memberof RoomController
     */
    public GetSpawnOptions(): any[] {
        let options = [];
        for (let i in RoomController.OptionFuncs) {
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
        for (let key in rooms) {
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
        (room: Room): any => Builder.GetOptions(room),
        (room: Room): any => Upgrader.GetOptions(room),
        (room: Room): any => Scout.GetOptions(room),
        (room: Room): any => Seeder.GetOptions(room),
        (room: Room): any => Drone.GetOptions(room)
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
        let areWeLinkMining: boolean; 
        if (!this.areWeLinkMining.hasOwnProperty(room.name)) {
            let sources = room.find(FIND_SOURCES).length;
            let links = room.find(FIND_MY_STRUCTURES, {filter : link => link.structureType == STRUCTURE_LINK}).length;
            areWeLinkMining = links > sources;
            this.areWeLinkMining[room.name] = areWeLinkMining;
        } else {
            areWeLinkMining = this.areWeLinkMining[room.name];
        }
        return areWeLinkMining;
    }
    private static areWeLinkMining: { [roomName: string]: boolean; } = {};

    /**
     * Gets if we are container mining in this room
     * 
     * @static
     * @param {Room} room 
     * @returns {boolean} 
     * @memberof RoomController
     */
    public static AreWeContainerMining(room: Room): boolean {
        let areWeContainerMining: boolean; 
        if (!this.areWeContainerMining.hasOwnProperty(room.name)) {
            let sources = room.find(FIND_SOURCES).length;
            let containers = room.find(FIND_STRUCTURES, {filter : container => container.structureType == STRUCTURE_CONTAINER}).length;
            areWeContainerMining = containers >= sources;
            this.areWeContainerMining[room.name] = areWeContainerMining;
        } else {
            areWeContainerMining = this.areWeContainerMining[room.name];
        }
        return areWeContainerMining;
    }
    private static areWeContainerMining: { [roomName: string]: boolean; } = {};

    /**
     * Gets if we are under attack in this room
     * 
     * @static
     * @param {string} room 
     * @returns {boolean} 
     * @memberof RoomController
     */
    public static UnderAttack(room: string): boolean {
        let underAttack: boolean; 
        if (!this.roomsUnderAttack.hasOwnProperty(room)) {
            let hostiles = Game.rooms[room].find(FIND_HOSTILE_CREEPS);
            underAttack = hostiles.length != 0;
            this.roomsUnderAttack[room] = underAttack;
        } else {
            underAttack = this.roomsUnderAttack[room];
        }
        return underAttack;
    }
    private static roomsUnderAttack: { [roomName: string]: boolean; } = {};
}