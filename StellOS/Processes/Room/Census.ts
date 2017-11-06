import {Definitions} from "../../Units";
import Logger from "../../os/Logger";
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
            this.Kernel.Terminate({ Name: this.Name }, true);
            return;
        }

        let spawnProcess = this.Kernel.GetProcess<Spawn>({ Find: (p) => p.Type === "Spawn" && p.RoomName === this.RoomName });
        if (!spawnProcess) {
            spawnProcess = this.Kernel.CreateProcess<Spawn>(Spawn, this.RoomName, this.Priority + 1, this.ProcessId);
            spawnProcess.RoomName = this.RoomName;
        }
        // Update the spawn queue.
        spawnProcess.Queue = this.GetSpawnQueue(spawnProcess.Queue);

        // Suspend this process for a while.
        this.Suspend(7);
    }

    private GetSpawnQueue(queue: IUnitOptions[] = []): IUnitOptions[] {
        let added = false;
        for (const type of Object.keys(Definitions)) {
            const definition = Definitions[type] as IUnitDefinition;
            const existing = _.filter(Memory.creeps, (c) => c.type === type && c.room === this.RoomName);
            const queued = _.filter(queue, (d) => d.Type === type);
            const required = definition.Population(this.Room);
            const needed = required - existing.length - queued.length;
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
                added = true;
            }
        }
        return added ? _.sortBy(queue, (d) => d.Priority) : queue;
    }
}
