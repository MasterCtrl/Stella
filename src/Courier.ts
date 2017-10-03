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
        let count = room.find(FIND_SOURCES).length;
        if (room.controller.level >= 4) {
            count = 0;
        }
        return { 
            Type: this.Type,
            Count: count * 2,
            Parts: Minion.GetParts(rcl, this.CourierParts)
        };
    }

    
    private static CourierParts: string[] = [CARRY, MOVE, CARRY, MOVE];   
}