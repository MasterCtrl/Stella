import RoomController from "../Controllers/RoomController";
import Minion from "./Minion";
import Constants from "../Constants"

/**
 * Courier minion, used to purely to move energy from sources to fill spawns, extensions, towers, and containers.
 * Only spawns if the rcl is >= 4 and have stopped harvester spawning.
 * 
 * @export
 * @class Courier
 * @extends {Minion}
 */
export default class Courier extends Minion {
    public static Type: string = "Courier";

    /**
     * Creates an instance of Courier.
     * @param {Creep} minion 
     * @memberof Courier
     */
    constructor(minion: Creep) {
        super(minion);
    }

    /**
     * Initializes the Courier, sets state and destination.
     * 
     * @returns 
     * @memberof Courier
     */
    public Initialize() {
        this.minion.memory.initialized = true;
        if (this.FindDroppedEnergy()) {
            return;
        }

        if (this.FindContainerSource()) {
            return;
        }

        if (this.FindStorageSource()) {
            return;
        }

        if (this.FindStorage()) {
            return;
        }

        if (this.FindStorageTarget()) {
            return;
        }

        this.Rally();
    }
    
    /**
     * Gets the options for the Courier minion based on the room.
     * 
     * @static
     * @param {Room} room 
     * @returns {*} 
     * @memberof Courier
     */
    public static GetOptions(room: Room): any {
        let count = room.find(FIND_SOURCES).length;
        let size = 1;
        if (!RoomController.AreWeContainerMining(room) && !RoomController.AreWeLinkMining(room)) {
            count = 0;
        } else if (!room.memory.needRelief) {
            size = Math.ceil(Math.min(room.energyCapacityAvailable / 2, room.energyAvailable, 600) / 200);
        }
        return { 
            Type: this.Type,
            Count: count,
            Parts: Minion.GetParts(size, this.CourierParts)
        };
    }
    private static CourierParts: string[] = [CARRY, MOVE, CARRY, MOVE];   
}