import RoomProcess from "./RoomProcess";

/**
 * Library process, keeps all the records in a rooms memory up to date.
 *
 * @export
 * @class Library
 * @extends {RoomProcess}
 */
export default class Library extends RoomProcess {
    /**
     * Executes the library process.
     *
     * @memberof Library
     */
    public Execute(): void {
        if (!this.Room) {
            this.Kernel.Terminate({ Name: this.Name });
            return;
        }
        /** 
         * TODO:
         * 1) Source miner positions
         * 2) Link positions
         * 3) Upgrader container
         * 4) Mineral/energy needs
         * 5) Reset memory to keep it live.
         */
        if (this.RoomMemory.containerMining === false) {
            this.RoomMemory.containerMining = undefined;
        }
        if (this.RoomMemory.linkMining === false) {
            this.RoomMemory.linkMining = undefined;
        }
        if (this.Room.storage || this.Room.terminal) {
            this.RoomMemory.needs = undefined;
        }
        if (this.RoomMemory.upgraderSource === null) {
            this.RoomMemory.upgraderSource = undefined;
        }
        if (this.RoomMemory.recycleBin === null) {
            this.RoomMemory.recycleBin = undefined;
        }

        this.Suspend(17);
    }
}
