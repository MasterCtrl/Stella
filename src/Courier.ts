import Minion from "./Minion";
import * as Constants from "./Constants"

/**
 * Courier minion, used to purely to move energy from sources to fill spawns, extensions, towers, and containers.
 * Only spawns if the rcl is >= 4 and have stopped harvester spawning.
 * 
 * @export
 * @class Courier
 * @extends {Minion}
 */
export default class Courier extends Minion {
    public static Type: string = "Courier";

    /**
     * Creates an instance of Courier.
     * @param {Creep} minion 
     * @memberof Courier
     */
    constructor(minion: Creep) {
        super(minion);
    }

    /**
     * Initializes the Courier, sets state and destination.
     * 
     * @returns 
     * @memberof Courier
     */
    public Initialize() {
        this.minion.memory.initialized = true;
        if (this.FindDroppedEnergy()) {
            return;
        }

        if (this.FindContainerSource()) {
            return;
        }

        if (this.FindStorage()) {
            return;
        }

        if (this.FindStorageTarget()) {
            return;
        }

        this.Rally();
    }
    
    /**
     * Gets the options for the Courier minion based on the room.
     * 
     * @static
     * @param {Room} room 
     * @returns {*} 
     * @memberof Courier
     */
    public static GetOptions(room: Room): any {
        let rcl = Math.floor(room.controller.level / 3);
        let count = room.find(FIND_SOURCES).length;
        return { 
            Type: this.Type,
            Count: room.controller.level < 4 ? 0 : count * 2,
            Parts: Minion.GetParts(rcl, this.CourierParts)
        };
    }

    
    private static CourierParts: string[] = [CARRY, MOVE, CARRY, MOVE];   
}

require("screeps-profiler").registerClass(Courier, "Courier");