import Minion from "./Minion";
import * as Constants from "./Constants"

export class ScoutUpgrader extends Minion {
    constructor(minion: Creep) {
        super(minion);
    }

    Initialize() {
        this.minion.memory.initialized = true;
        
        if (this.FindMassStorageSource()) {
            return;
        }

        if (this.FindFlaggedRoom()) {
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

export class ScoutUpgraderOptions {
    static Type: string = "scoutupgrader";
    static Count: number = 1;
    //static Parts: string[] = [WORK, CARRY, MOVE];
    static Parts: string[] = [WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
}