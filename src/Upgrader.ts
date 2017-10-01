import Minion from "./Minion";
import * as Constants from "./Constants"

export default class Upgrader extends Minion {
    static Type: string = "upgrader";
    
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

        if (this.FindContainerSource()) {
            return;
        }

        if (this.FindController()) {
            return;
        }

        this.minion.memory.initialized = false;
        this.minion.memory.state = Constants.STATE_IDLE;
    }

    static GetOptions(room: Room): any {
        let rcl = Math.ceil(room.controller.level / 2);
        let options = { 
            Type: this.Type,
            Count: rcl,
            Parts: []
        };
        for (var index = 0; index < rcl; index++) {
            Minion.MinimumParts.forEach(element => {
                options.Parts.push(element);
            });
        }

        return options;
    }
}