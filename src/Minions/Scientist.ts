import Minion from "./Minion";
import Constants from "../Constants";

/**
 * Scientist minion, fill labs and run reactions.
 *
 * @export
 * @class Scientist
 * @extends {Minion}
 */
export default class Scientist extends Minion {
    public static Type: string = "Scientist";

    /**
     * Creates an instance of Scientist.
     * @param {Creep} minion
     * @memberof Scientist
     */
    constructor(minion: Creep) {
        super(minion);
    }

    /**
     * Initializes the Scientist, sets state and destination.
     *
     * @returns
     * @memberof Scientist
     */
    public Initialize() {
        this.minion.memory.initialized = true;
        if (this.FindLabResources()) {
            return;
        }

        if (this.FindLabTarget()) {
            return;
        }

        this.minion.memory.state = Constants.STATE_IDLE;
        this.minion.memory.idle = 5;
    }

    /**
     * Gets the options for the Scientist minion based on the game state.
     *
     * @static
     * @param {Room} room
     * @returns {*}
     * @memberof Scientist
     */
    public static GetOptions(room: Room): any {
        if (Object.keys(room.memory.labs).length === 0) {
            return undefined;
        }
        return {
            Type: this.Type,
            Count: 1,
            Parts: Minion.GetPartsFromRoom(room, 4, this.ScientistParts)
        };
    }
    private static ScientistParts: string[] = [CARRY, MOVE, CARRY, MOVE];
}
