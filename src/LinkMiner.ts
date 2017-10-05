import Minion from "./Minion";
import * as Constants from "./Constants"

/**
 * LinkMiner minion, used to purely to mine a source as efficiently as possible and deposit into a link.
 * Only spawns if the rcl is >= 4 and have stopped harvester spawning.
 * 
 * @export
 * @class LinkMiner
 * @extends {Minion}
 */
export default class LinkMiner extends Minion {
    public static Type: string = "LinkMiner";

    /**
     * Creates an instance of Miner.
     * @param {Creep} minion 
     * @memberof Miner
     */
    constructor(minion: Creep) {
        super(minion);
    }

    /**
     * Initializes the LinkMiner, sets state and destination.
     * 
     * @returns 
     * @memberof LinkMiner
     */
    public Initialize() {
        this.minion.memory.initialized = true;
        if (this.FindUnoccupiedSource()) {
            return;
        }

        if (this.FindLink()) {
            return;
        }
        
        this.minion.memory.initialized = false;
        this.minion.memory.state = Constants.STATE_IDLE;        
    }

    /**
     * Gets the options for the LinkMiner minion based on the room.
     * 
     * @static
     * @param {Room} room 
     * @returns {*} 
     * @memberof LinkMiner
     */
    public static GetOptions(room: Room): any {
        let count = room.find(FIND_SOURCES).length;
        let links = room.find(FIND_MY_STRUCTURES, {filter : link => link.structureType == STRUCTURE_LINK}).length;
        if (links <= count){
            count = 0;
        }
        return { 
            Type: this.Type,
            Count: count,
            Parts: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE]
        };
    }
}

require("screeps-profiler").registerClass(LinkMiner, "LinkMiner");