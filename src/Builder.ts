import Minion from "./Minion";
import * as Constants from "./Constants"

export class Builder extends Minion {
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

    static GetOptions(sources: number, rcl: number): any {
        return null;
    }
}

export class BuilderOptions {
    static Type: string = "builder";
    static Count: number = 3;
    static Parts: string[] = [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
}