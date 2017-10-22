import RoomController from "../Controllers/RoomController";
import Minion from "./Minion";
import Constants from "../Constants";

/**
 * Raider minion, used to attack another room.
 * Sends 3 minions attack the room with a COLOR_RED flag.
 *
 * @export
 * @class Raider
 * @extends {Minion}
 */
export default class Raider extends Minion {
    public static Type: string = "Raider";

    /**
     * Creates an instance of Raider.
     * @param {Creep} minion
     * @memberof Raider
     */
    constructor(minion: Creep) {
        super(minion);
    }

    /**
     *  Initializes the Raider, sets state and target.
     *
     * @returns
     * @memberof Raider
     */
    public Initialize() {
        this.minion.memory.initialized = true;
        if (this.FindFlag(COLOR_RED)) {
            return;
        }

        if (this.FindHostileSpawn()) {
            return;
        }

        if (this.FindHostileMinion()) {
            return;
        }

        if (this.FindHostileStructure()) {
            return;
        }

        this.RemoveFlagAndSuicide(COLOR_RED);
    }

    /**
     * Gets the options for the Raider minion based on the room.
     *
     * @static
     * @param {Room} room
     * @returns {*}
     * @memberof Raider
     */
    public static GetOptions(room: Room): any {
        const percentage = room.storage ? room.storage.store.energy / room.storage.storeCapacity : 0;
        if (room.memory.needs.indexOf(RESOURCE_ENERGY) !== -1 || percentage <= 0.4) {
            return undefined;
        }
        const raiders = _.filter(Memory.creeps, (c) => c.type === this.Type);
        const rooms = _.filter(Game.flags, (f) => f.color === COLOR_RED).map((f) => f.pos.roomName);
        const count = (rooms.length * 3) - raiders.length;
        if (count <= 0 ) {
            return undefined;
        }
        return {
            Type: this.Type,
            Count: count,
            Parts: Minion.GetPartsFromRoom(room, 4, this.RaiderParts)
        };
    }
    private static RaiderParts: string[] = [TOUGH, RANGED_ATTACK, MOVE, MOVE];
}
