import Logger from "../Tools/Logger";
import RoomProcess from "../os/RoomProcess";
import Spawn from "./Spawn";
import * as Units from "../Units";

/**
 * Census for keeping track of the population in a room and spinning up spawn processes.
 *
 * @export
 * @class Census
 * @extends {Process}
 */
export default class Census extends RoomProcess {
    /**
     * Executes the census process.
     *
     * @memberof Census
     */
    public Execute() {
        const spawnProcessName = `Spawn-${this.RoomName}`;
        // TODO: actually write the spawn process
        let spawnProcess = this.Kernel.GetProcess(spawnProcessName) as Spawn;
        if (!spawnProcess) {
            spawnProcess = this.Kernel.CreateProcess(this.Priority + 1, spawnProcessName, "Spawn", this.ProcessId) as Spawn;
            spawnProcess.RoomName = this.RoomName;
        }
        spawnProcess.Queue = this.GetSpawnQueue(spawnProcess.Queue);

        // Suspend this process for 7 ticks.
        this.Suspend(7);
    }

    private GetSpawnQueue(queue: IUnitOptions[] = []): IUnitOptions[] {
        // TODO: write some units? is this even a good way of doing this?
        for (const type of Object.keys(Units)) {
            const unitDefinition = Units[type] as IUnitDefintion;
            const unit = queue.find((e) => e.Type === unitDefinition.Type);
            // if the queue already has an entry for this type then continue.
            if (unit) {
                continue;
            }

            const units = _.filter(Memory.creeps, (c) => c.type === unitDefinition.Type && c.room === this.RoomName);
            // if we have already reached the population limit for this room then continue.
            if (units.length >= unitDefinition.Population(this.Room)) {
                continue;
            }

            // otherwise push onto the spawn queue
            queue.push({
                Priority: unitDefinition.Priority,
                Type: unitDefinition.Type,
                Body: unitDefinition.CreateBody(this.Room)
            });
        }
        return _.sortBy(queue, (d) => d.Priority);
    }
}
