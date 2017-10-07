import Minion from "../Minions/Minion";

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
     * @param {Creep[]} creeps 
     * @param {any[]} [spawnOptions] 
     * @memberof SpawnController
     */
    public static Spawn(spawners: Spawn[], creeps: Creep[], spawnOptions?: any[]){
        spawners.forEach(s => {
            SpawnController.SpawnMinions(s, creeps, spawnOptions);
        });
    }

    /**
     * Spawns minions from the specified Spawner.
     * 
     * @static
     * @param {Spawn} spawner 
     * @param {Creep[]} creeps 
     * @param {any[]} spawnOptions 
     * @memberof SpawnController
     */
    public static SpawnMinions(spawner: Spawn, creeps: Creep[], spawnOptions: any[]) {
        for (var index in spawnOptions) {
            if (!spawner.isActive() || spawner.spawning) {
                return;
            }
            var options = spawnOptions[index];
            if (this.SpawnMinion(spawner, creeps, options.Type, options.Count, options.Parts)) {
                break;
            }
        }
    }

    /**
     * Tries to spawn a Minion from the specified Spawner with the given options.
     * 
     * @private
     * @static
     * @param {Spawn} spawner 
     * @param {Creep[]} creeps 
     * @param {string} type 
     * @param {number} count 
     * @param {string[]} parts 
     * @returns {boolean} 
     * @memberof SpawnController
     */
    private static SpawnMinion(spawner: Spawn, creeps: Creep[], type: string, count: number, parts: string[]): boolean {
        let creepsOfType = _.filter(creeps, c => c.memory.type == type);
        if (creepsOfType.length < count && spawner.canCreateCreep(parts, undefined) == OK) {
            let name = spawner.createCreep(parts, undefined, {type: type});
            console.log(spawner.room.name + ": Spawning new " + type + ": " + name);
            return true;
        }
        return false;
    }
}

require("screeps-profiler").registerClass(SpawnController, "SpawnController");