import Factory from "./Factory";
import Manager from "./Manager";
import Harvester from "./Harvester";
import Upgrader from "./Upgrader";
import Builder from "./Builder";
import Miner from "./Miner";
import Courier from "./Courier";
import Scout from "./Scout";
import Seeder from "./Seeder";
type RoomHash = {[roomName: string]: Room;};

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
        let spawnOptions = this.GetSpawnOptions();
        let creeps: Creep[] = this.room.find(FIND_MY_CREEPS);
        if (spawnOptions) {
            Factory.Spawn(this.room.find(FIND_MY_SPAWNS), creeps, spawnOptions);            
        }
        Manager.RunCreeps(creeps);
        Manager.RunTowers(this.room.find(FIND_MY_STRUCTURES, { filter: tower => tower.structureType == STRUCTURE_TOWER }))
    }

    /**
     * Gets the spawn options for the different minion types.
     * 
     * @returns {any[]} 
     * @memberof RoomController
     */
    public GetSpawnOptions(): any[] {
        let options = [];
        for(let i in RoomController.OptionFuncs) {
            this.AddOptions(options, RoomController.OptionFuncs[i]);            
        }
        return options;
    }

    private AddOptions(options: any[], getFunc: (room: Room) => any) {
        let opt = getFunc(this.room);
        if (opt && opt.Count != 0) {
            options.push(opt);
        }
    }

    /**
     * Runs each of the rooms in the specified room hash.
     * 
     * @static
     * @param {RoomHash} rooms 
     * @memberof RoomController
     */
    public static RunRooms(rooms: RoomHash) {
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
        (room: Room): any => Builder.GetOptions(room),
        (room: Room): any => Upgrader.GetOptions(room),
        (room: Room): any => Scout.GetOptions(room),
        (room: Room): any => Seeder.GetOptions(room)
    ];
}

require("screeps-profiler").registerClass(RoomController, 'RoomController');