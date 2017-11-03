import Process from "./Process";

/**
 * Room Process base class, used for a room centric processes.
 *
 * @export
 * @abstract
 * @class RoomProcess
 * @extends {Process}
 */
export default abstract class RoomProcess extends Process {
    /**
     * Gets or sets the name of the room that this process is for.
     *
     * @readonly
     * @type {string}
     * @memberof RoomProcess
     */
    public get RoomName(): string {
        return this.Memory.room;
    }
    public set RoomName(value: string) {
        this.Memory.room = value;
    }

    /**
     * Gets the room that this process is for.
     *
     * @readonly
     * @type {Room}
     * @memberof RoomProcess
     */
    public get Room(): Room {
        return Game.rooms[this.RoomName];
    }
}
