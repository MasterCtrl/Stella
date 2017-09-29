import Minion from "./Minion";
import {HarvesterOptions} from "./Harvester"
import * as Constants from "./Constants"

export class SeedHarvester extends Minion {
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

        if (this.FindStorage()) {
            return;
        }

        if (this.FindContainerTarget()) {
            return;
        }

        if (this.FindController()) {
            return;
        }

        this.minion.memory.initialized = false;
        this.minion.memory.state = Constants.STATE_IDLE;
    }
}

export class SeedHarvesterOptions extends HarvesterOptions {
    static Type: string = "seedharvester";
    static Count: number = 1;
}