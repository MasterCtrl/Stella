import Constants from "../Constants"
import Minion from "./Minion";

/**
 * Builder minion, used to build and repair structures.
 * 
 * @export
 * @class Builder
 * @extends {Minion}
 */
export default class Builder extends Minion {
    public static Type: string = "Builder";
    
    /**
     * Creates an instance of Builder.
     * @param {Creep} minion 
     * @memberof Builder
     */
    constructor(minion: Creep) {
        super(minion);
    }

    /**
     * Initializes the Builder, sets state and destination.
     * 
     * @returns 
     * @memberof Builder
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
        
        if (this.FindConstructionSite()) {
            return;
        }

        if(this.FindStructureToRepair()){
            return;
        }

        if (this.FindController()) {
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
        let count = room.find(FIND_SOURCES).length;
        return { 
            Type: this.Type,
            Count: count + 1,
            Parts: Minion.GetParts(rcl)
        };
    }
}

require("screeps-profiler").registerClass(Builder, "Builder");