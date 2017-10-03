import Minion from "./Minion";
import * as Constants from "./Constants"

export default class Miner extends Minion {
    static Type: string = "miner";

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

    static GetOptions(room: Room): any {
        let count = room.find(FIND_SOURCES).length;
        if (room.controller.level < 4) {
            count = 0;
        }
        return { 
            Type: this.Type,
            Count: count,
            Parts: [WORK, WORK, WORK, WORK, WORK, MOVE]
        };
    }
}