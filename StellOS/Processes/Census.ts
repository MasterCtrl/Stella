import Logger from "../Tools/Logger";
import RoomProcess from "../os/RoomProcess";
import Spawn from "./Spawn";
import * as Units from "../Units";

/**
 * Census for keeping track of the population in a room and spinning up spawn processes.
 *
 * @export
 * @class Census
 * @extends {RoomProcess}
 */
export default class Census extends RoomProcess {
    /**
     * Executes the census process.
     *
     * @memberof Census
     */
    public Execute(): void {
        const spawnProcessName = `Spawn-${this.RoomName}`;
        let spawnProcess = this.Kernel.GetProcess(spawnProcessName) as Spawn;
        if (!spawnProcess) {
            spawnProcess = this.Kernel.CreateProcess(this.Priority + 1, spawnProcessName, "Spawn", this.ProcessId) as Spawn;
            spawnProcess.RoomName = this.RoomName;
        }
        // Update the spawn queue.
        spawnProcess.Queue = this.GetSpawnQueue(spawnProcess.Queue);

        // Suspend this process for a while.
        this.Suspend(7);
    }

    private GetSpawnQueue(queue: IUnitOptions[] = []): IUnitOptions[] {
        for (const type of Object.keys(Units)) {
            const definition = Units[type] as IUnitDefintion;
            const exsisting = _.filter(Memory.creeps, (c) => c.type === type && c.room === this.RoomName);
            const queued = _.filter(queue, (d) => d.Type === type);
            const required = definition.Population(this.Room);
            const needed = required - exsisting.length - queued.length;
            // if we have already reached the population limit for this room then continue.
            if (needed <= 0) {
                continue;
            }

            // otherwise push onto the spawn queue
            const options = {
                Priority: definition.Priority,
                Type: type,
                Body: definition.CreateBody(this.Room)
            };
            for (let index = 0; index < needed; index++) {
                queue.push(options);
            }
        }
        return _.sortBy(queue, (d) => d.Priority);
    }
}
