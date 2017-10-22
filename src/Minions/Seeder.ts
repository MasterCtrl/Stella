import Minion from "./Minion";
import Constants from "../Constants";

/**
 * Seeder minion, used to provide support to another room.
 * Sends 2 minions to help any requesting room with a COLOR_BLUE flag.
 *
 * @export
 * @class Seeder
 * @extends {Minion}
 */
export default class Seeder extends Minion {
    public static Type: string = "Seeder";

    /**
     * Creates an instance of Seeder.
     * @param {Creep} minion
     * @memberof Seeder
     */
    constructor(minion: Creep) {
        super(minion);
    }

    /**
     * Initializes the Seeder, sets state and destination.
     *
     * @returns
     * @memberof Seeder
     */
    public Initialize() {
        this.minion.memory.initialized = true;
        if (this.FindStorageSource()) {
            return;
        }

        if (this.FindFlag(COLOR_BLUE)) {
            return;
        }

        if (this.FindSource()) {
            return;
        }

        if (this.FindStorage()) {
            return;
        }

        if (this.FindConstructionSite()) {
            return;
        }

        if (this.FindController()) {
            return;
        }

        this.Rally();
    }

    /**
     * Gets the options for the Seeder minion based on the room.
     * Every other room tries to spawn Seeders to send to the requesting room
     *
     * @static
     * @param {Room} room
     * @returns {*}
     * @memberof Seeder
     */
    public static GetOptions(room: Room): any {
        const rooms = _.filter(Game.flags, (f) => f.color === COLOR_BLUE).map((f) => f.pos.roomName);
        if (rooms.indexOf(room.name) !== -1 || room.memory.needs.indexOf(RESOURCE_ENERGY) !== -1) {
            return undefined;
        }
        const seeders = _.filter(Memory.creeps, (c) => c.type === this.Type);
        const count = (rooms.length * 2) - seeders.length;
        return {
            Type: this.Type,
            Count: count,
            Parts: Minion.GetPartsFromRoom(room, 5)
        };
    }
}
