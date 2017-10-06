import * as Constants from "../Constants"
import Minion from "./Minion";

/**
 * Upgrader minion, used to constantly upgrade the controller in the room.
 * 
 * @export
 * @class Upgrader
 * @extends {Minion}
 */
export default class Upgrader extends Minion {
    public static Type: string = "Upgrader";
    
    /**
     * Creates an instance of Upgrader.
     * @param {Creep} minion 
     * @memberof Upgrader
     */
    constructor(minion: Creep) {
        super(minion);
    }

    /**
     * Initializes the Upgrader, sets state and destination.
     * 
     * @returns 
     * @memberof Upgrader
     */
    public Initialize() {
        this.minion.memory.initialized = true;
        if (this.FindDroppedEnergy()) {
            return;
        }
        
        if (this.FindStorageSource()) {
            return;
        }

        if (this.FindContainerSource()) {
            return;
        }

        if (this.FindController()) {
            return;
        }

        this.minion.memory.initialized = false;
        this.minion.memory.state = Constants.STATE_IDLE;
    }

    /**
     * Gets the options for the Upgrader minion based on the room.
     * 
     * @static
     * @param {Room} room 
     * @returns {*} 
     * @memberof Upgrader
     */
    public static GetOptions(room: Room): any {
        let rcl = Math.ceil(room.controller.level / 3);
        let count = room.find(FIND_SOURCES).length;
        return { 
            Type: this.Type,
            Count: count + 1,
            Parts: Minion.GetParts(rcl)
        };
    }
}

require("screeps-profiler").registerClass(Upgrader, "Upgrader");