import Minion from "./Minion";

/**
 * Drone minion, used to harvest minerals.
 * 
 * @export
 * @class Drone
 * @extends {Minion}
 */
export default class Drone extends Minion {
    public static Type: string = "Drone";
    
    /**
     * Creates an instance of Drone.
     * @param {Creep} minion 
     * @memberof Drone
     */
    constructor(minion: Creep) {
        super(minion);
    }

    /**
     * Initializes the Drone, sets state and destination.
     * 
     * @memberof Drone
     */
    public Initialize() {
        this.minion.memory.initialized = true;
        if (this.FindDroppedResource()) {
            return;
        }

        if (this.FindExtractor()) {
            return;
        }
        
        if (this.FindTerminal()) {
            return;
        }

        this.Rally();
    }

    /**
     * Gets the options for the Builder minion based on the room.
     * 
     * @static
     * @param {Room} room 
     * @returns {*} 
     * @memberof Builder
     */
    public static GetOptions(room: Room): any {
        let rcl = Math.ceil(room.controller.level / 2);
        let count = 0;
        let minerals: Mineral[] = room.find(FIND_MINERALS);
        if (minerals.length > 0 && minerals[0].mineralAmount > 100) {
            count = room.find(FIND_STRUCTURES, {filter: (extractor: Structure) => extractor.structureType == STRUCTURE_EXTRACTOR}).length
        }
        return { 
            Type: this.Type,
            Count: count,
            Parts: [WORK, WORK, MOVE, WORK, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE]
        };
    }
}

import Configuration from "../Configuration"
if (Configuration.Profiling) {
    require("screeps-profiler").registerClass(Drone, "Drone");
}