import Minion from "./Minion";
import {UpgraderOptions} from "./Upgrader"
import * as Constants from "./Constants"

export class SeedUpgrader extends Minion {
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

        if (this.FindController()) {
            return;
        }

        this.minion.memory.initialized = false;
        this.minion.memory.state = Constants.STATE_IDLE;
    } 
}

export class SeedUpgraderOptions extends UpgraderOptions {
    static Type: string = "seedupgrader";
    static Count: number = 2;
}