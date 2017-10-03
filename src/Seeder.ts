import Minion from "./Minion";
import * as Constants from "./Constants"

export default class Seeder extends Minion {
    static Type: string = "seeder";

    constructor(minion: Creep) {
        super(minion);
    }

    Initialize() {
        this.minion.memory.initialized = true;
        if (this.FindStorageSource()) {
            return;
        }

        if (this.FindFlaggedRoom(COLOR_BLUE)) {
            return;
        }

        if (this.FindSource(-1)) {
            return;
        }
        
        if (this.FindConstructionSite()) {
            return;
        }

        if (this.FindStructureToRepair()) {
            return;
        }

        if (this.FindController()) {
            return;
        }

        this.Rally();
    }

    static GetOptions(room: Room): any {
        let rcl = Math.ceil(room.controller.level / 2);
        let flags = _.filter(Game.flags, flag => flag.color == COLOR_BLUE);
        return { 
            Type: this.Type,
            Count: flags.length * 2,
            Parts: Minion.GetParts(rcl)
        };
    }
}