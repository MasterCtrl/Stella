import Minion from "./Minion";
import {BuilderOptions} from "./Builder"
import * as Constants from "./Constants"

export class SeedBuilder extends Minion {
    constructor(minion: Creep) {
        super(minion);
    }

    Initialize() {
        this.minion.memory.initialized = true;
        if (this.FindStorageSource()) {
            return;
        }

        if (this.FindFlaggedRoom("lima")) {
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

        this.minion.memory.initialized = false;
        this.minion.memory.state = Constants.STATE_IDLE;
    }    
}

export class SeedBuilderOptions extends BuilderOptions {
    static Type: string = "seedbuilder";
    static Count: number = 1;
}