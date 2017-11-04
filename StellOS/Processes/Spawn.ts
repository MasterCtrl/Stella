import Logger from "../Tools/Logger";
import RoomProcess from "../os/RoomProcess";

/**
 * Spawn process responsible for spawning new units. 
 *
 * @export
 * @class Spawn
 * @extends {RoomProcess}
 */
export default class Spawn extends RoomProcess {
    /**
     * Executes the spawn process.
     *
     * @memberof Spawn
     */
    public Execute(): void {
        if (!this.Queue || this.Queue.length === 0) {
            // if the spawn queue is empty then kill the process.
            this.Kernel.Terminate(this.Name);
            return;
        }

        const queue = this.Queue;
        const spawns = this.Room.find<StructureSpawn>(FIND_MY_SPAWNS);
        for (const spawn of spawns) {
            const options = queue.shift();
            const name = `${options.Type}_${options.Body.length}_${(Game.time % 2500).toLocaleString("en", { minimumIntegerDigits: 4, useGrouping: false })}`;
            const result = spawn.spawnCreep(options.Body, name, { dryRun: true });
            if (result !== OK) {
                // if we couldnt spawn the unit then put the options back into the queue and continue.
                Logger.Current.Debug(`Could not spawn unit ${name} - ${result}`, this.RoomName);
                queue.unshift(options);
                continue;
            }
            Logger.Current.Info(`Spawning new unit ${name}`, this.RoomName);
            spawn.spawnCreep(options.Body, name, { memory: { type: options.Type, room: this.RoomName } });
        }
        this.Queue = queue;
    }

    /**
     * Gets or sets the spawn queue for this process.
     *
     * @readonly
     * @type {IUnitOptions[]}
     * @memberof Spawn
     */
    public get Queue(): IUnitOptions[] {
        return this.Memory.queue;
    }
    public set Queue(value: IUnitOptions[]) {
        this.Memory.queue = value;
    }
}
