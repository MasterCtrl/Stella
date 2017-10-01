import Factory from "./Factory";
import Manager from "./Manager";
import {Harvester} from "./Harvester";
import {Upgrader} from "./Upgrader";
import {Builder} from "./Builder";
import {Miner} from "./Miner";
import {Courier} from "./Courier";
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
            Factory.SpawnForRoom(this.room.find(FIND_MY_SPAWNS), creeps, spawnOptions);            
        }
        Manager.RunCreepsForRoom(creeps);
        Manager.RunTowersForRoom(this.room.find(FIND_MY_STRUCTURES, { filter: tower => tower.structureType != STRUCTURE_TOWER }))
    }

    GetSpawnOptions(): any[] {
        let options = [];
        //ok what minions do we need...
        let sources = this.room.find(FIND_SOURCES_ACTIVE).length;
        if (sources <= 0 ) {
            return options;
        }
        let rcl = this.room.controller.level;
        for(let func in RoomController.OptionFuncs) {
            this.AddOptions(options, sources, rcl, func);            
        }
        return options;
    }

    private AddOptions(options: any[], sourceCount: number, rcl: number, getFunc: any) {
        let opt = getFunc(sourceCount, rcl);
        if (opt) {
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
        Harvester.GetOptions,
        Upgrader.GetOptions,
        Builder.GetOptions,
        Miner.GetOptions,
        Courier.GetOptions        
    ];
}