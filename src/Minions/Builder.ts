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
        return { 
            Type: this.Type,
            Count: room.find(FIND_SOURCES).length,
            Parts: Minion.GetPartsFromRoom(room, 5)
        };
    }
}