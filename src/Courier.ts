import Minion from "./Minion";
import * as Constants from "./Constants"

export class Courier extends Minion {
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

        if (this.FindStorage()) {
            return;
        }

        this.Rally();
    }    
}

export class CourierOptions {
    static Type: string = "courier";
    static Count: number = 2;
    //static Parts: string[] = [WORK, CARRY, MOVE];
    static Parts: string[] = [CARRY, CARRY, CARRY, MOVE, MOVE];
}