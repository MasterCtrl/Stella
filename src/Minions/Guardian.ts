import RoomController from "../Controllers/RoomController";
import Minion from "./Minion";
import Constants from "../Constants"


/**
 * Guardian minion, used to defend a room.
 * Spawns minions based on the threat level in the room. 
 * 
 * @export
 * @class Raider
 * @extends {Minion}
 */
export default class Guardian extends Minion {
    public static Type: string = "Guardian";


    /**
     * Creates an instance of Guardian.
     * @param {Creep} minion 
     * @memberof Guardian
     */
    constructor(minion: Creep) {
        super(minion);
    }


    /**
     *  Initializes the Guardian, sets state and target.
     * 
     * @returns 
     * @memberof Guardian
     */
    public Initialize() {
        this.minion.memory.initialized = true;
        if (this.FindHostileMinion()) {
            return;
        }
        
        this.Rally();
    }


    /**
     * Gets the options for the Guardian minion based on the room.
     * 
     * @static
     * @param {Room} room 
     * @returns {*} 
     * @memberof Guardian
     */
    public static GetOptions(room: Room): any {
        let defcon = room.memory.defcon;
        if (!defcon || defcon.level < 2) {
            return undefined;
        }
        return { 
            Type: this.Type,
            Count: defcon.level > 3 ? 4 : 2,
            Parts: Minion.GetPartsFromRoom(room, 1040, 260, this.GuardianParts)
        };
    }
    private static GuardianParts: string[] = [TOUGH, RANGED_ATTACK, MOVE, MOVE];   
}