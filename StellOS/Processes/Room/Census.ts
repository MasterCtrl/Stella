import * as Definitions from "../../Units";
import RoomProcess from "./RoomProcess";
import Spawn from "./Spawn";

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
        if (!this.Room) {
            this.Kernel.Terminate({ Name: this.Name });
            return;
        }

        let spawnProcess = this.Kernel.GetProcess<Spawn>({ Type: Spawn.name, RoomName: this.RoomName });
        if (!spawnProcess) {
            spawnProcess = this.Kernel.CreateProcess<Spawn>(
                Spawn, this.RoomName, this.Priority + 1,
                { ParentId: this.ProcessId, Memory: { room: this.RoomName } }
            );
        }
        // Update the spawn queue.
        spawnProcess.Queue = this.GetSpawnQueue(spawnProcess.Queue);

        // Suspend this process for a while.
        this.Suspend(7);
    }

    private GetSpawnQueue(queue: IUnitOptions[] = []): IUnitOptions[] {
        let added = false;
        for (const type in Definitions) {
            const definition = Definitions[type] as IUnitDefinition;
            const existing = _.filter(Memory.creeps, (c) => c.type === type && c.room === this.RoomName).length;
            const queued = _.filter(queue, (d) => d.Type === type).length;
            const required = definition.Population(this.Room);
            const needed = required - existing - queued;
            // if we have already reached the population limit for this room then continue.
            if (needed <= 0) {
                continue;
            }

            // otherwise push onto the spawn queue
            const options = {
                Priority: definition.Priority(this.Room),
                Type: type
            };
            for (let index = 0; index < needed; index++) {
                if (index > 0) {
                    options.Priority += index * 20;
                }
                queue.push(options);
                added = true;
            }
        }
        return added ? _.sortBy(queue, (d) => d.Priority) : queue;
    }
}
