import Minion from "./Minion";
import * as Constants from "./Constants"

export default class Scout extends Minion {
    static Type: string = "scout";

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

    static GetOptions(room: Room): any {
        let options = { 
            Type: this.Type,
            Count: 0,
            Parts: [CLAIM, MOVE]
        };
        
        return options;
    }
}