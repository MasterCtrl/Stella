import Minion from "./Minion";
import * as Constants from "./Constants"

export default class Harvester extends Minion {
    static Type: string = "harvester";

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

    static GetOptions(room: Room): any {
        let rcl = Math.ceil(room.controller.level / 2);
        let options = { 
            Type: this.Type,
            Count: rcl,
            Parts: []
        };
        for (var index = 0; index < rcl; index++) {
            options.Parts.push(Minion.MinimumParts)
        }

        return options;
    }
}