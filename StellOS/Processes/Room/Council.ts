import Administrator from "./Administrator";
import Census from "./Census";
import RoomProcess from "./RoomProcess";

/**
 * Council process responsible for all aspects of running a room.
 *
 * @export
 * @class Council
 * @extends {RoomProcess}
 */
export default class Council extends RoomProcess {
    /**
     * Executes the council process.
     * 
     * @memberof Council
     */
    public Execute(): void {
        if (!this.Room) {
            this.Kernel.Terminate({ Name: this.Name }, true);
            return;
        }

        // spin up a census to keep track of our population.
        if (!this.Kernel.GetProcess<Census>({ Find: (p) => p.Type === "Census" && p.RoomName === this.RoomName })) {
            this.Kernel.CreateProcess<Census>(
                Census,
                this.RoomName,
                this.Priority + 1,
                { ParentId: this.ProcessId, Memory: { room: this.RoomName } }
            );
        }

        // spin up an administrator to manage the units in this room.
        if (!this.Kernel.GetProcess<Administrator>({ Find: (p) => p.Type === "Administrator" && p.RoomName === this.RoomName })) {
            this.Kernel.CreateProcess<Administrator>(
                Administrator,
                this.RoomName,
                this.Priority + 1,
                { ParentId: this.ProcessId, Memory: { room: this.RoomName } }
            );
        }

        // Suspend this process for a while.
        this.Suspend(11);
    }
}
