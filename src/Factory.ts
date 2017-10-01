import * as _ from "lodash";
import Minion from "./Minion";
import {HarvesterOptions} from "./Harvester";
import {UpgraderOptions} from "./Upgrader";
import {BuilderOptions} from "./Builder";
import {MinerOptions} from "./Miner";
import {CourierOptions} from "./Courier";
import {ScoutOptions} from "./Scout";
import {SeedHarvesterOptions} from "./SeedHarvester";
import {SeedUpgraderOptions} from "./SeedUpgrader";
import {SeedBuilderOptions} from "./SeedBuilder";
import Configuration from "./Configuration"
type SpawnHash = {[spawnName: string]: Spawn;};

export default class Factory {
    static SpawnOptions = [
        HarvesterOptions,
        MinerOptions,
        CourierOptions,
        UpgraderOptions,
        BuilderOptions,
        ScoutOptions,
        SeedHarvesterOptions,
        SeedUpgraderOptions,
        SeedBuilderOptions
    ];

    static Spawn(spawners: SpawnHash) {
        for (let key in spawners) {
            if (!spawners.hasOwnProperty(key)) {
                continue;
            }
            Factory.SpawnMinions(spawners[key], this.SpawnOptions);
        }
    }
    
    static SpawnForRoom(spawners: Spawn[], creeps: Creep[], spawnOptions?: any[]){
        if (!spawnOptions) {
            spawnOptions = this.SpawnOptions;
        }
        for (let key in spawners) {
            Factory.SpawnMinionsForRoom(spawners[key], creeps, spawnOptions);
        }
    }

    static SpawnMinions(spawner: Spawn, spawnOptions: any[]) {
        for (var index in spawnOptions) {
            var options = spawnOptions[index];
            if (this.SpawnMinion(spawner, options.Type, options.Count, options.Parts)) {
                break;
            }
        }
    }

    static SpawnMinionsForRoom(spawner: Spawn, creeps: Creep[], spawnOptions: any[]) {
        for (var index in spawnOptions) {
            var options = spawnOptions[index];
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

    private static SpawnMinionForRoom(spawner: Spawn, creeps: Creep[], type: string, count: number, parts: string[]): boolean {
        let creepsOfType = _.filter(creeps, c => c.memory.type == type);
        if (creepsOfType.length < count && spawner.canCreateCreep(parts, undefined) == OK) {
            let name = spawner.createCreep(parts, undefined, {type: type});
            console.log('Spawning new ' + type + ': ' + name);
            return true;
        }
        return false;
    }
}