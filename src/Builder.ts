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
        
        if (this.FindMassStorageSource()) {
            return;
        }

        if (this.FindStorageSource()) {
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
}

export class BuilderOptions {
    static Type: string = "builder";
    static Count: number = 3;
    //static Parts: string[] = [WORK, CARRY, MOVE];
    static Parts: string[] = [WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
}