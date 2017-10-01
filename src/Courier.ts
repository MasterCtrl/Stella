import Minion from "./Minion";
import * as Constants from "./Constants"

export default class Courier extends Minion {
    static Type: string = "courier";

    constructor(minion: Creep) {
        super(minion);
    }

    Initialize() {
        this.minion.memory.initialized = true;
        if (this.FindDroppedEnergy()) {
            return;
        }

        if (this.FindContainerSource()) {
            return;
        }

        if (this.FindStorage()) {
            return;
        }

        if (this.FindStorageTarget()) {
            return;
        }

        this.Rally();
    }
    
    static GetOptions(room: Room): any {
        let rcl = Math.floor(room.controller.level / 3);
        let options = { 
            Type: this.Type,
            Count: rcl * 2,
            Parts: []
        };
        for (var index = 0; index < rcl; index++) {
            this.MinimumParts.forEach(element => {
                options.Parts.push(element);
            });
        }
        return options;
    }

    
    static MinimumParts: string[] = [CARRY, MOVE, CARRY, MOVE];   
}