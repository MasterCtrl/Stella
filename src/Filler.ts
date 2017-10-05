import Minion from "./Minion"

/**
 * Filler minion, used to purely to move energy from links and fill containers.
 * Only spawns if there is a link network in the room.
 * 
 * @export
 * @class Filler
 * @extends {Minion}
 */
export default class Filler extends Minion {
    public static Type: string = "Filler";

    /**
     * Creates an instance of Filler.
     * @param {Creep} minion 
     * @memberof Filler
     */
    constructor(minion: Creep) {
        super(minion);
    }
    
    /**
     * Initializes the Filler, sets state and destination.
     * 
     * @returns 
     * @memberof Filler
     */
    public Initialize() {
        this.minion.memory.initialized = true;
        if (this.FindLink()) {
            return;
        }

        if (this.FindContainerTarget()) {
            return;
        }

        this.Rally();
    }

    /**
     * Gets the options for the Filler minion based on the room.
     * 
     * @static
     * @param {Room} room 
     * @returns {*} 
     * @memberof Filler
     */
    public static GetOptions(room: Room): any {
        let sources = room.find(FIND_SOURCES).length;
        let links = room.find(FIND_MY_STRUCTURES, {filter : link => link.structureType == STRUCTURE_LINK}).length;
        return { 
            Type: this.Type,
            Count: links <= sources ? 0 : 1,
            Parts: [CARRY, CARRY, CARRY, CARRY, MOVE]
        };
    }
}

require("screeps-profiler").registerClass(Filler, "Filler");