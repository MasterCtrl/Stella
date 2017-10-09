import Constants from "../Constants"
import Minion from "./Minion";

/**
 * Seeder minion, used to provide support to another room.
 * Each room sends 2 minions that it can afford to help any requesting room with a COLOR_BLUE flag.
 * 
 * @export
 * @class Seeder
 * @extends {Minion}
 */
export default class Seeder extends Minion {
    public static Type: string = "Seeder";
    
    /**
     * Creates an instance of Seeder.
     * @param {Creep} minion 
     * @memberof Seeder
     */
    constructor(minion: Creep) {
        super(minion);
    }

    /**
     * Initializes the Seeder, sets state and destination.
     * 
     * @returns 
     * @memberof Seeder
     */
    public Initialize() {
        this.minion.memory.initialized = true;
        if (this.FindStorageSource()) {
            return;
        }

        if (this.FindFlag(COLOR_BLUE)) {
            return;
        }

        if (this.FindSource()) {
            return;
        }
        
        if (this.FindConstructionSite()) {
            return;
        }

        if (this.FindController()) {
            return;
        }

        this.Rally();
    }

    /**
     * Gets the options for the Seeder minion based on the room.
     * Every room tries to spawn 2 Seeders to send to the requesting room
     * 
     * @static
     * @param {Room} room 
     * @returns {*} 
     * @memberof Seeder
     */
    public static GetOptions(room: Room): any {
        let rcl = Math.ceil(room.controller.level / 3);
        let seeders = _.filter(Game.creeps, creep => creep.memory.type == this.Type);
        let rooms = _.filter(Game.flags, flag => flag.color == COLOR_BLUE).map(flag => flag.pos.roomName);
        let count = rooms.indexOf(room.name) == -1 ? rooms.length - seeders.length : 0;
        return { 
            Type: this.Type,
            Count: count * 4,
            Parts: Minion.GetParts(rcl)
        };
    }
}

require("screeps-profiler").registerClass(Seeder, "Seeder");