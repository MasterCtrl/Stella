import Minion from "./Minion";
import * as Constants from "./Constants"

export class Scout extends Minion {
    constructor(minion: Creep) {
        super(minion);
    }

    Initialize() {
        this.minion.memory.initialized = true;
        if (this.FindFlaggedRoom("lima")) {
            return;
        }
        if (this.FindUnclaimedController()) {
            return;
        }
        this.Rally();
    }

    static GetOptions(sources: number, rcl: number): any {
        return null;
    }
}

export class ScoutOptions {
    static Type: string = "scout";
    static Count: number = 0;
    static Parts: string[] = [CLAIM, MOVE];
}