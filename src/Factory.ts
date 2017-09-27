import * as _ from "lodash";
import Minion from "./Minion";
import {HarvesterOptions} from "./Harvester";
import {UpgraderOptions} from "./Upgrader";
import {BuilderOptions} from "./Builder";
import {MinerOptions} from "./Miner";
import {CourierOptions} from "./Courier";
import Configuration from "./Configuration"
type SpawnHash = {[spawnName: string]: Spawn;};

export default class Factory {
    static SpawnOptions = [
        HarvesterOptions,
        MinerOptions,
        CourierOptions,
        UpgraderOptions,
        BuilderOptions
    ];

    static Spawn(spawners: SpawnHash) {
        for (let key in spawners) {
            if (!spawners.hasOwnProperty(key)) {
                continue;
            }
            Factory.SpawnMinions(spawners[key]);
        }
    }

    private static SpawnMinions(spawner: Spawn) {
        for (var index in this.SpawnOptions) {
            var options = this.SpawnOptions[index];
            if (this.SpawnMinion(spawner, options.Type, options.Count, options.Parts)) {
                break;
            }
        }
    }

    private static SpawnMinion(spawner: Spawn, type: string, count: number, parts: string[]): boolean {
        let creeps = _.filter(Game.creeps, c => c.memory.type == type);
        if (creeps.length < count && spawner.canCreateCreep(parts, undefined) == OK) {
            let name = spawner.createCreep(parts, undefined, {type: type});
            console.log('Spawning new ' + type + ': ' + name);
            return true;
        }
        return false;
    }
}