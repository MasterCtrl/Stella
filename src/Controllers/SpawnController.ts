import Minion from "../Minions/Minion";
type Options = {Type: string, Count: number, Parts: string[]};

/**
 * SpawnController, used to spawn minions from a spawner
 *
 * @export
 * @class SpawnController
 */
export default class SpawnController {
    /**
     * Spawns minions from each of the specified Spawners.
     *
     * @static
     * @param {Spawn[]} spawners
     * @param {Options[]} spawnQueue
     * @memberof SpawnController
     */
    public static Spawn(spawners: Spawn[], spawnQueue: Options[]) {
        for (const spawner of spawners) {
            this.SpawnMinions(spawner, spawnQueue);
        }
    }

    /**
     * Spawns minions from the specified Spawner.
     *
     * @static
     * @param {Spawn} spawner
     * @param {Options[]} spawnQueue
     * @memberof SpawnController
     */
    public static SpawnMinions(spawner: Spawn, spawnQueue: Options[]) {
        if (!spawner.isActive() || spawner.spawning) {
            return;
        }
        for (let i = 0; i < spawnQueue.length; i++) {
            const options = spawnQueue.shift();
            if (options.Count !== 0 && this.SpawnMinion(spawner, options.Type, options.Count, options.Parts)) {
                break;
            }
            spawnQueue.push(options);
        }
    }

    /**
     * Tries to spawn a Minion from the specified Spawner with the given options.
     *
     * @private
     * @static
     * @param {Spawn} spawner
     * @param {string} type
     * @param {number} count
     * @param {string[]} parts
     * @returns {boolean}
     * @memberof SpawnController
     */
    private static SpawnMinion(spawner: Spawn, type: string, count: number, parts: string[]): boolean {
        const creepsOfType = _.filter(Memory.creeps, (c) => c.type === type && c.room === spawner.room.name);
        const name: string = `${type}_${parts.length}_${(Game.time % 2500).toLocaleString("en", { minimumIntegerDigits: 4, useGrouping: false })}`;
        if (creepsOfType.length < count && spawner.spawnCreep(parts, name, {dryRun: true}) === OK) {
            spawner.spawnCreep(parts, name, { memory: { type: type, room: spawner.room.name } });
            console.log(`${spawner.room.name}: Spawning new minion ${name}`);
            return true;
        }
        return false;
    }
}
