import Minion from "./Minion";
import * as Constants from "./Constants"

export default class Builder extends Minion {
    static Type: string = "builder";

    constructor(minion: Creep) {
        super(minion);
    }

    Initialize() {
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

        if (this.FindSource(-1)) {
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

    static GetOptions(room: Room): any {
        let rcl = Math.ceil(room.controller.level / 2);
        let count = room.find(FIND_SOURCES).length;
        return { 
            Type: this.Type,
            Count: count + 1,
            Parts: Minion.GetParts(rcl)
        };
    }
}