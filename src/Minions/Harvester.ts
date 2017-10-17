import RoomController from "../Controllers/RoomController"
import Minion from "./Minion";
import Constants from "../Constants"

/**
 * Harvester minion, used to mine and fill spawns, extensions, towers, and containers.
 * Only spawns if the rcl is < 4 at which point we switch over to miners/couriers.
 * 
 * @export
 * @class Harvester
 * @extends {Minion}
 */
export default class Harvester extends Minion {
    public static Type: string = "Harvester";
    
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
        if (this.FindSource()) {
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
        if (RoomController.AreWeContainerMining(room) || RoomController.AreWeLinkMining(room)) {
            return undefined;
        }
        return { 
            Type: this.Type,
            Count: room.find(FIND_SOURCES).length,
            Parts: Minion.GetPartsFromRoom(room, 600, 200)
        };
    }
}