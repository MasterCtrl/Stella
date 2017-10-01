import Factory from "./Factory";
import Manager from "./Manager";
import Harvester from "./Harvester";
import Upgrader from "./Upgrader";
import Builder from "./Builder";
import Miner from "./Miner";
import Courier from "./Courier";
type RoomHash = {[roomName: string]: Room;};

export default class RoomController {
    private readonly room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    Run() {
        let spawnOptions = this.GetSpawnOptions();
        let creeps: Creep[] = this.room.find(FIND_MY_CREEPS);
        if (spawnOptions) {
            Factory.Spawn(this.room.find(FIND_MY_SPAWNS), creeps, spawnOptions);            
        }
        Manager.RunCreeps(creeps);
        Manager.RunTowers(this.room.find(FIND_MY_STRUCTURES, { filter: tower => tower.structureType == STRUCTURE_TOWER }))
    }

    GetSpawnOptions(): any[] {
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

    static RunRooms(rooms: RoomHash) {
        for (let key in rooms) {
            if (!rooms.hasOwnProperty(key)) {
                continue;
            }
            let controller = new RoomController(rooms[key]);
            controller.Run();
        }
    }

    static OptionFuncs = [
        (room: Room): any => Harvester.GetOptions(room),
        (room: Room): any => Courier.GetOptions(room),
        (room: Room): any => Miner.GetOptions(room),
        (room: Room): any => Builder.GetOptions(room),
        (room: Room): any => Upgrader.GetOptions(room)     
    ];
}