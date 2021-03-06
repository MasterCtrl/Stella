import Minion from "./Minion";

/**
 * Drone minion, used to harvest minerals.
 *
 * @export
 * @class Drone
 * @extends {Minion}
 */
export default class Drone extends Minion {
    public static Type: string = "Drone";

    /**
     * Creates an instance of Drone.
     * @param {Creep} minion
     * @memberof Drone
     */
    constructor(minion: Creep) {
        super(minion);
    }

    /**
     * Initializes the Drone, sets state and destination.
     *
     * @memberof Drone
     */
    public Initialize() {
        this.minion.memory.initialized = true;
        if (this.FindDroppedResource()) {
            return;
        }

        if (this.FindExtractor()) {
            return;
        }

        if (this.FindTerminalTarget()) {
            return;
        }

        this.Rally();
    }

    /**
     * Gets the options for the Drone minion based on the room.
     *
     * @static
     * @param {Room} room
     * @returns {*}
     * @memberof Drone
     */
    public static GetOptions(room: Room): any {
        let count = 0;
        const minerals: Mineral[] = room.find(FIND_MINERALS);
        if (minerals.length > 0 && minerals[0].mineralAmount > 0) {
            count = room.find(FIND_STRUCTURES, {filter: (extractor: Structure) => extractor.structureType === STRUCTURE_EXTRACTOR}).length;
        }
        if (count <= 0 || !room.terminal) {
            return undefined;
        }
        return {
            Type: this.Type,
            Count: count,
            Parts: [WORK, WORK, MOVE, WORK, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE]
        };
    }
}
