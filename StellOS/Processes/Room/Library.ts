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

        if (this.Room.storage || this.Room.terminal) {
            this.RoomMemory.needs = undefined;
        }
        const sourceCount = this.Room.Sources.length;
        if (this.Room.Containers.length < sourceCount + 2) {
            if (this.RoomMemory.containerMining === false) {
                this.RoomMemory.containerMining = undefined;
            }
            this.RoomMemory.containers = undefined;
        }
        if (this.Room.Links.length < sourceCount + 1) {
            if (this.RoomMemory.linkMining === false) {
                this.RoomMemory.linkMining = undefined;
            }
            this.RoomMemory.links = undefined;
        }

        this.Suspend(17);
    }
}
