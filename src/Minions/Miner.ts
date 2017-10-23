import RoomController from "../Controllers/RoomController";
import Minion from "./Minion";
import Constants from "../Constants";

/**
 * Miner minion, used to purely to mine a source as efficiently as possible.
 * Only spawns if the rcl is >= 4 and have stopped harvester spawning.
 *
 * @export
 * @class Miner
 * @extends {Minion}
 */
export default class Miner extends Minion {
    public static Type: string = "Miner";

    /**
     * Creates an instance of Miner.
     * @param {Creep} minion
     * @memberof Miner
     */
    constructor(minion: Creep) {
        super(minion);
    }

    /**
     * Initializes the Miner, sets state and destination.
     *
     * @returns
     * @memberof Miner
     */
    public Initialize() {
        this.minion.memory.initialized = true;
        if (this.FindUnoccupiedSource()) {
            return;
        }
        this.minion.memory.initialized = false;
        this.minion.memory.state = Constants.STATE_IDLE;
    }

    /**
     * Gets the options for the Miner minion based on the room.
     *
     * @static
     * @param {Room} room
     * @returns {*}
     * @memberof Miner
     */
    public static GetOptions(room: Room): any {
        if (RoomController.AreWeLinkMining(room) || !RoomController.AreWeContainerMining(room)) {
            return undefined;
        }
        const parts = this.BasicParts;
        let cost  = this.GetPartsCost(parts);
        while (cost < Math.min(room.energyAvailable, 600)) {
            cost += BODYPART_COST.work;
            parts.unshift(WORK);
        }
        return {
            Type: this.Type,
            Count: room.find(FIND_SOURCES).length,
            Parts: parts
        };
    }
    private static BasicParts: string[] = [WORK, MOVE, WORK, MOVE];
}
