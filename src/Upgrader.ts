import Minion from "./Minion";
import * as Constants from "./Constants"

export class Upgrader extends Minion {
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

        if (this.FindController()) {
            return;
        }

        this.minion.memory.initialized = false;
        this.minion.memory.state = Constants.STATE_IDLE;
    }

    static GetOptions(sources: number, rcl: number): any {
        return null;
    }
}

export class UpgraderOptions {
    static Type: string = "upgrader";
    static Count: number = 3;
    static Parts: string[] = [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
}