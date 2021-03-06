import RoomController from "../Controllers/RoomController";
import Minion from "./Minion";
import Constants from "../Constants";

/**
 * Filler minion, used to purely to move energy from links and fill storage.
 * Only spawns if there is a link network in the room.
 *
 * @export
 * @class Filler
 * @extends {Minion}
 */
export default class Filler extends Minion {
    public static Type: string = "Filler";

    /**
     * Creates an instance of Filler.
     * @param {Creep} minion
     * @memberof Filler
     */
    constructor(minion: Creep) {
        super(minion);
    }

    /**
     * Initializes the Filler, sets state and destination.
     *
     * @returns
     * @memberof Filler
     */
    public Initialize() {
        this.minion.memory.initialized = true;
        if (this.FindLinkSource()) {
            return;
        }

        if (this.FindTerminalSource()) {
            return;
        }

        if (this.FindStorageTarget()) {
            return;
        }

        this.minion.memory.state = Constants.STATE_IDLE;
        this.minion.memory.idle = 5;
    }

    /**
     * Gets the options for the Filler minion based on the room.
     *
     * @static
     * @param {Room} room
     * @returns {*}
     * @memberof Filler
     */
    public static GetOptions(room: Room): any {
        if (!RoomController.AreWeLinkMining(room)) {
            return undefined;
        }
        return {
            Type: this.Type,
            Count: 1,
            Parts: [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE]
        };
    }
}
