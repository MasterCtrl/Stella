import Minion from "./Minion";
import Constants from "../Constants";

/**
 * Scout minion, used to claim additional rooms.
 * Sends 1 minion to claim a room with a COLOR_GREEN flag.
 *
 * @export
 * @class Scout
 * @extends {Minion}
 */
export default class Scout extends Minion {
    public static Type: string = "Scout";

    /**
     * Creates an instance of Scout.
     * @param {Creep} minion
     * @memberof Scout
     */
    constructor(minion: Creep) {
        super(minion);
    }

    /**
     * Initializes the Scout, sets state and destination.
     *
     * @returns
     * @memberof Scout
     */
    public Initialize() {
        this.minion.memory.initialized = true;
        if (this.FindUnoccupiedRoom(COLOR_GREEN)) {
            return;
        }

        if (this.FindUnclaimedController()) {
            return;
        }

        this.RemoveFlagAndSuicide(COLOR_GREEN);
    }

    /**
     * Gets the options for the Scout minion based on the game state.
     *
     * @static
     * @param {Room} room
     * @returns {*}
     * @memberof Scout
     */
    public static GetOptions(room: Room): any {
        if (room.memory.needs.indexOf(RESOURCE_ENERGY) !== -1) {
            return undefined;
        }
        const scouts = _.filter(Memory.creeps, (c) => c.type === this.Type);
        const rooms = _.filter(Game.flags, (f) => f.color === COLOR_GREEN).map((f) => f.pos.roomName);
        const count = rooms.length - scouts.length;
        if (count <= 0) {
            return undefined;
        }
        return {
            Type: this.Type,
            Count: count,
            Parts: [CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE]
        };
    }
}
