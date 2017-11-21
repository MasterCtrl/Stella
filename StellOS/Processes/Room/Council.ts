import Administrator from "./Administrator";
import Architect from "./Architect";
import Artillery from "./Artillery";
import Census from "./Census";
import Commander from "./Commander";
import Library from "./Library";
import Overlay from "./Overlay";
import RoomProcess from "./RoomProcess";
import Transfer from "./Transfer";

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
                Census, this.RoomName, this.Priority + 1,
                { ParentId: this.ProcessId, Memory: { room: this.RoomName } }
            );
        }

        // spin up a commander to manage the military units in this room.
        if (!this.Kernel.GetProcess({ Type: Commander.name, RoomName: this.RoomName })) {
            this.Kernel.CreateProcess(
                Commander, this.RoomName, this.Priority + 1,
                { ParentId: this.ProcessId, Memory: { room: this.RoomName } }
            );
        }

        // spin up a transfer process to manager the links in the room.
        if (this.Room.IsLinkMining && !this.Kernel.GetProcess({ Type: Transfer.name, RoomName: this.RoomName })) {
            this.Kernel.CreateProcess(
                Transfer, this.RoomName, this.Priority + 1,
                { ParentId: this.ProcessId, Memory: { room: this.RoomName } }
            );
        }

        // spin up an administrator to manage the civilian units in this room.
        if (!this.Kernel.GetProcess({ Type: Administrator.name, RoomName: this.RoomName })) {
            this.Kernel.CreateProcess(
                Administrator, this.RoomName, this.Priority + 2,
                { ParentId: this.ProcessId, Memory: { room: this.RoomName } }
            );
        }

        // spin up an artillery process to manage the towers in the room.
        if (!this.Kernel.GetProcess({ Type: Artillery.name, RoomName: this.RoomName })) {
            this.Kernel.CreateProcess(
                Artillery, this.RoomName, 5,
                { ParentId: this.ProcessId, Memory: { room: this.RoomName } }
            );
        }

        // spin up a library process to manage this rooms memory.
        if (!this.Kernel.GetProcess({ Type: Library.name, RoomName: this.RoomName })) {
            this.Kernel.CreateProcess(
                Library, this.RoomName, this.Priority + 5,
                { ParentId: this.ProcessId, Memory: { room: this.RoomName } }
            );
        }

        // spin up a architect process to manage this rooms construction sites.
        if (!this.Kernel.GetProcess({ Type: Architect.name, RoomName: this.RoomName })) {
            this.Kernel.CreateProcess(
                Architect, this.RoomName, this.Priority + 5,
                { ParentId: this.ProcessId, Memory: { room: this.RoomName } }
            );
        }

        // spin up a overlay process to manage this rooms visuals.
        if (!this.Kernel.GetProcess({ Type: Overlay.name, RoomName: this.RoomName })) {
            this.Kernel.CreateProcess(
                Overlay, this.RoomName, this.Priority + 10,
                { ParentId: this.ProcessId, Memory: { room: this.RoomName } }
            );
        }

        // Suspend this process for a while.
        this.Suspend(11);
    }
}
