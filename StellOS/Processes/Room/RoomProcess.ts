import Process from "../../os/Process";

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
     * Creates an instance of RoomProcess.
     * @param {IKernel} kernel 
     * @param {IData} data 
     * @memberof RoomProcess
     */
    constructor(kernel: IKernel, data: IData) {
        super(kernel, data);
        Object.defineProperties(
            this,
            {
                RoomName: {
                    enumerable: true,
                    configurable: true
                }
            }
        );
    }

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

    /**
     * Gets or sets the memory of this room.
     *
     * @type {*}
     * @memberof RoomProcess
     */
    public get RoomMemory(): any {
        return this.Room.memory || (this.Room.memory = {});
    }
}
