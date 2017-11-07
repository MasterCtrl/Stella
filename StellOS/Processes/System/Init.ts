import Council from "../Room/Council";
import GC from "./GC";
import Logger from "../../os/Logger";
import Process from "../../os/Process";

/**
 * Initialization process used to load and start all nessecary processes.
 *
 * @export
 * @class Init
 * @extends {Process}
 */
export default class Init extends Process {
    /**
     * Executes the initialization process and spawns any processes it needs to that don't already exists.
     * 
     * @memberof Init
     */
    public Execute(): void {
        this.Kernel.Load();

        // register the gc process.
        let gcProcess = this.Kernel.GetProcess<GC>({ Find: (p) => p.Type === "GC" });
        if (!gcProcess) {
            gcProcess = this.Kernel.CreateProcess(GC, "master", this.Priority + 1);
        }

        // loop through all the rooms and make sure the processes are registered for each.
        for (const room in Game.rooms) {
            if (this.Kernel.GetProcess<Council>({ Find: (p) => p.Type === "Council" && p.RoomName === room })) {
                continue;
            }
            this.Kernel.CreateProcess(
                Council,
                room,
                this.Priority + 2,
                { Memory: { room: room } }
            );
        }

        // Kill this process when we are done.
        this.Kernel.Terminate({ Name: this.Name });
    }
}
