import RoomController from "../Controllers/RoomController";
import Minion from "./Minion";
import Constants from "../Constants";

/**
 * LinkMiner minion, used to purely to mine a source as efficiently as possible and deposit into a link.
 * Only spawns if the rcl is >= 4 and have stopped harvester spawning.
 *
 * @export
 * @class LinkMiner
 * @extends {Minion}
 */
export default class LinkMiner extends Minion {
    public static Type: string = "LinkMiner";

    /**
     * Creates an instance of LinkMiner.
     * @param {Creep} minion
     * @memberof LinkMiner
     */
    constructor(minion: Creep) {
        super(minion);
    }

    /**
     * Initializes the LinkMiner, sets state and destination.
     *
     * @returns
     * @memberof LinkMiner
     */
    public Initialize() {
        this.minion.memory.initialized = true;
        if (this.FindUnoccupiedSource()) {
            return;
        }

        if (this.FindLinkTarget()) {
            return;
        }

        this.minion.memory.initialized = false;
        this.minion.memory.state = Constants.STATE_IDLE;
    }

    /**
     * Gets the options for the LinkMiner minion based on the room.
     *
     * @static
     * @param {Room} room
     * @returns {*}
     * @memberof LinkMiner
     */
    public static GetOptions(room: Room): any {
        if (!RoomController.AreWeLinkMining(room)) {
            return undefined;
        }
        return {
            Type: this.Type,
            Count: room.find(FIND_SOURCES).length,
            Parts: [WORK, WORK, WORK, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE]
        };
    }
}
