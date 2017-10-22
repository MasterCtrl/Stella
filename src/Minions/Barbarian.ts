import RoomController from "../Controllers/RoomController";
import Minion from "./Minion";
import Constants from "../Constants";

/**
 * Barbarian minion, used to defend a room.
 * Spawns minions based on the threat level in the room.
 *
 * @export
 * @class Raider
 * @extends {Minion}
 */
export default class Barbarian extends Minion {
    public static Type: string = "Barbarian";

    /**
     * Creates an instance of Barbarian.
     * @param {Creep} minion
     * @memberof Barbarian
     */
    constructor(minion: Creep) {
        super(minion);
    }

    /**
     *  Initializes the Barbarian, sets state and target.
     *
     * @returns
     * @memberof Barbarian
     */
    public Initialize() {
        this.minion.memory.initialized = true;

        if (this.NeedToHeal) {
            this.minion.memory.state = Constants.STATE_HEAL;
            return;
        }

        if (this.FindHostileMinion()) {
            return;
        }

        this.Rally();
    }

    /**
     * Gets the options for the Barbarian minion based on the room.
     *
     * @static
     * @param {Room} room
     * @returns {*}
     * @memberof Barbarian
     */
    public static GetOptions(room: Room): any {
        const defcon = room.memory.defcon;
        const count = !defcon ? 0 : Math.min(Math.floor(defcon.level / 4), 4);
        if (!count) {
            return undefined;
        }
        return {
            Type: this.Type,
            Count: count,
            Parts: Minion.GetPartsFromRoom(room, 3, this.BarbarianParts)
        };
    }
    private static BarbarianParts: string[] = [TOUGH, MOVE, ATTACK, MOVE, ATTACK, MOVE, HEAL];
}
