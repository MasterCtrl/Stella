import Minion from "./Minion";
import * as Constants from "./Constants"

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
        this.Rally();
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
        let scouts = _.filter(Game.creeps, creep => creep.memory.type == this.Type);
        let rooms = _.filter(Game.flags, flag => flag.color == COLOR_GREEN).map(flag => flag.pos.roomName);
        let count = rooms.length - scouts.length;
        //TODO: could have multiple spawners try and spawn a scout at the same time meaning we get too many
        let options = { 
            Type: this.Type,
            Count: count < 0 ? 0 : count,
            Parts: [CLAIM, MOVE]
        };
        
        return options;
    }
}

require("screeps-profiler").registerClass(Scout, 'Scout');