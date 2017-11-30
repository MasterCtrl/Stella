import * as Definitions from "../../Units";
import RoomProcess from "./RoomProcess";

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
        const queue = this.Queue;
        if (!queue || queue.length === 0 || !this.Room) {
            // if the spawn queue is empty then kill the process.
            this.Kernel.Terminate({ Name: this.Name });
            return;
        }

        const spawns = this.Room.find<StructureSpawn>(FIND_MY_SPAWNS);
        const available = _.filter(spawns, (s) => !s.spawning);
        if (available.length === 0) {
            // if there are no spawns available then suspend till one is done.
            this.Suspend(_.min(spawns.map((s) => s.spawning.remainingTime)));
            return;
        }
        for (const spawn of available) {
            const options = queue.shift();
            const body = Definitions[options.Type].CreateBody(this.Room);
            const name = `${options.Type}_${body.length}_${(Game.time % 2500).toLocaleString("en", { minimumIntegerDigits: 4, useGrouping: false })}`;
            const result = spawn.spawnCreep(body, name, { dryRun: true });
            if (result !== OK) {
                // if we couldnt spawn the unit then put the options back into the queue and continue.
                Logger.Debug(`Could not spawn unit ${name} - ${result}`, this.RoomName);
                queue.unshift(options);
                continue;
            }
            Logger.Info(`Spawning new unit ${name}`, this.RoomName);
            spawn.spawnCreep(body, name, { memory: { type: options.Type, room: this.RoomName } });
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
