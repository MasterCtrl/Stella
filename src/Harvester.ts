import Minion from "./Minion";
import * as Constants from "./Constants"

/**
 * Harvester minion, used to mine and fill spawns, extensions, towers, and containers.
 * Only spawns if the rcl is < 4 at which point we switch over to miners/couriers.
 * 
 * @export
 * @class Harvester
 * @extends {Minion}
 */
export default class Harvester extends Minion {
    public static Type: string = "harvester";

    /**
     * Creates an instance of Harvester.
     * @param {Creep} minion 
     * @memberof Harvester
     */
    constructor(minion: Creep) {
        super(minion);
    }

    /**
     * Initializes the Harvester, sets state and destination.
     * 
     * @returns 
     * @memberof Harvester
     */
    public Initialize() {
        this.minion.memory.initialized = true;
        if (this.FindSource(-1)) {
            return;
        }

        if (this.FindStorage()) {
            return;
        }

        if (this.FindContainerTarget()) {
            return;
        }

        if (this.FindController()) {
            return;
        }
    }

    /**
     * Gets the options for the Harvester minion based on the room.
     * 
     * @static
     * @param {Room} room 
     * @returns {*} 
     * @memberof Harvester
     */
    public static GetOptions(room: Room): any {
        let rcl = Math.ceil(room.controller.level / 3);
        let count = room.find(FIND_SOURCES).length;
        return { 
            Type: this.Type,
            Count: room.controller.level >= 4 ? 0 : count * 2,
            Parts: Minion.GetParts(rcl)
        };
    }
}

require("screeps-profiler").registerClass(Harvester, 'Harvester');