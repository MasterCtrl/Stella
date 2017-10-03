import Minion from "./Minion";
import * as Constants from "./Constants"

export default class Scout extends Minion {
    static Type: string = "scout";

    constructor(minion: Creep) {
        super(minion);
    }

    Initialize() {
        this.minion.memory.initialized = true;
        if (this.FindFlaggedRoom(COLOR_GREEN)) {
            return;
        }
        if (this.FindUnclaimedController()) {
            return;
        }
        this.Rally();
    }

    static GetOptions(room: Room): any {
        let flags = _.filter(Game.flags, flag => flag.color == COLOR_GREEN);
        let roomsWithFlags = _.filter(flags, flag => flag.pos.roomName).map(flag => flag.pos.roomName);
        let options = { 
            Type: this.Type,
            Count: roomsWithFlags.indexOf(room.name) != -1 ? 0 : flags.length,
            Parts: [CLAIM, MOVE]
        };
        
        return options;
    }
}