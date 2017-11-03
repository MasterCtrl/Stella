import Census from "./Census";
import RoomProcess from "../os/RoomProcess";

/**
 * Council process responsible for all aspects of running a room.
 *
 * @export
 * @class Council
 * @extends {Process}
 */
export default class Council extends RoomProcess {
    /**
     * Executes the council process.
     * 
     * @memberof Council
     */
    public Execute() {
        if (!this.Room) {
            this.Kernel.Terminate(this.Name, true);
        }

        // spin up a census to keep track of our population
        const censusProcessName = `Census-${this.RoomName}`;
        if (!this.Kernel.GetProcess(censusProcessName)) {
            const censusProcess = this.Kernel.CreateProcess(this.Priority + 1, censusProcessName, "Census", this.ProcessId) as Census;
            censusProcess.RoomName = this.RoomName;
        }
    }
}
