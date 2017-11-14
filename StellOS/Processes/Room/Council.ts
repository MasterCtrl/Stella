import Administrator from "./Administrator";
import Census from "./Census";
import General from "./General";
import Library from "./Library";
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
            this.Kernel.Terminate({ Name: this.Name });
            return;
        }

        // spin up a census to keep track of our population.
        if (!this.Kernel.GetProcess({ Type: Census.name, RoomName: this.RoomName })) {
            this.Kernel.CreateProcess(
                Census,
                this.RoomName,
                this.Priority + 1,
                { ParentId: this.ProcessId, Memory: { room: this.RoomName } }
            );
        }

        // spin up a general to manage the military units in this room.
        if (!this.Kernel.GetProcess({ Type: General.name, RoomName: this.RoomName })) {
            this.Kernel.CreateProcess(
                General,
                this.RoomName,
                this.Priority + 1,
                { ParentId: this.ProcessId, Memory: { room: this.RoomName } }
            );
        }

        // spin up an administrator to manage the civilian units in this room.
        if (!this.Kernel.GetProcess({ Type: Administrator.name, RoomName: this.RoomName })) {
            this.Kernel.CreateProcess(
                Administrator,
                this.RoomName,
                this.Priority + 2,
                { ParentId: this.ProcessId, Memory: { room: this.RoomName } }
            );
        }

        // spin up a library process to manage this rooms memory.
        if (!this.Kernel.GetProcess({ Type: Library.name, RoomName: this.RoomName })) {
            this.Kernel.CreateProcess(
                Library,
                this.RoomName,
                this.Priority + 5,
                { ParentId: this.ProcessId, Memory: { room: this.RoomName } }
            );
        }

        // Suspend this process for a while.
        this.Suspend(11);
    }
}
