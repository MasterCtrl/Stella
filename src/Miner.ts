import Minion from "./Minion";
import * as Constants from "./Constants"

export class Miner extends Minion {
    constructor(minion: Creep) {
        super(minion);
        //harvest source
    }

    Initialize() {
        this.minion.memory.initialized = true;
        if (this.FindUnoccupiedSource()) {
            return;
        }
        this.minion.memory.initialized = false;
        this.minion.memory.state = Constants.STATE_IDLE;        
    }
}

export class MinerOptions {
    static Type: string = "miner";
    static Count: number = 1;
    //static Parts: string[] = [WORK, CARRY, MOVE];
    static Parts: string[] = [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE];
}