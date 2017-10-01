import Minion from "./Minion";
import * as Constants from "./Constants"

export class Harvester extends Minion {
    constructor(minion: Creep) {
        super(minion);
    }

    Initialize() {
        this.minion.memory.initialized = true;
        if (this.FindEnergy(0)) {
            return;
        }

        if (this.FindStorage()) {
            return;
        }

        if (this.FindContainerTarget()) {
            return;
        }

        if (this.FindController()) {
            return;
        }
    }

    static GetOptions(sources: number, rcl: number): any {
        return null;
    }
}

export class HarvesterOptions {
    static Type: string = "harvester";
    static Count: number = 0;
    static Parts: string[] = [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
}