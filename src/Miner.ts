import Minion from "./Minion";
import * as Constants from "./Constants"

export class Miner extends Minion {
    constructor(minion: Creep) {
        super(minion);
    }

    Initialize() {
        this.minion.memory.initialized = true;
        if (this.FindUnoccupiedSource()) {
            return;
        }
        this.minion.memory.initialized = false;
        this.minion.memory.state = Constants.STATE_IDLE;        
    }

    static GetOptions(sources: number, rcl: number): any {
        return null;
    }
}

export class MinerOptions {
    static Type: string = "miner";
    static Count: number = 2;
    static Parts: string[] = [WORK, WORK, WORK, WORK, WORK, MOVE];
}