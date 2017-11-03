import Logger from "../Tools/Logger";
import Process from "../os/Process";

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
    public Execute() {
        if (!Memory.StellOS) {
            Memory.StellOS = {};
        }
        if (!Memory.Process) {
            Memory.Process = {};
        }

        this.Kernel.Load();

        // loop through all the rooms and make sure the processes are registered for each.
        for (const room in Game.rooms) {
            const councilProcessName = `Council-${room}`;
            if (this.Kernel.GetProcess(councilProcessName)) {
                continue;
            }
            const councilProcess = this.Kernel.CreateProcess(this.Priority + 1, councilProcessName, "Council");
            councilProcess.Memory = { room: room };
        }

        // Kill this process when we are done.
        this.Kernel.Terminate(this.Name);
    }
}
