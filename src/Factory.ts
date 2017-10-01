import * as _ from "lodash";
import Minion from "./Minion";
import Configuration from "./Configuration"
type SpawnHash = {[spawnName: string]: Spawn;};

export default class Factory {
    static Spawn(spawners: Spawn[], creeps: Creep[], spawnOptions?: any[]){
        for (let key in spawners) {
            Factory.SpawnMinions(spawners[key], creeps, spawnOptions);
        }
    }

    static SpawnMinions(spawner: Spawn, creeps: Creep[], spawnOptions: any[]) {
        for (var index in spawnOptions) {
            var options = spawnOptions[index];
            if (this.SpawnMinion(spawner, creeps, options.Type, options.Count, options.Parts)) {
                break;
            }
        }
    }

    private static SpawnMinion(spawner: Spawn, creeps: Creep[], type: string, count: number, parts: string[]): boolean {
        let creepsOfType = _.filter(creeps, c => c.memory.type == type);
        if (creepsOfType.length < count && spawner.canCreateCreep(parts, undefined) == OK) {
            let name = spawner.createCreep(parts, undefined, {type: type});
            console.log(spawner.room.name + ': Spawning new ' + type + ': ' + name);
            return true;
        }
        return false;
    }
}