import Minion from "./Minion";
import Constants from "../Constants"

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

        if (this.FindSource()) {
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
        return { 
            Type: this.Type,
            Count: room.find(FIND_SOURCES).length,
            Parts: Minion.GetPartsFromRoom(room, 1000, 200)
        };
    }
}