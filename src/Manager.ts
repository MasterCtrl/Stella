import * as _ from "lodash";
import Minion from "./Minion";
import Turret from "./Turret";
import {Harvester, HarvesterOptions} from "./Harvester";
import {Upgrader, UpgraderOptions} from "./Upgrader";
import {Builder, BuilderOptions} from "./Builder";
import {Miner, MinerOptions} from "./Miner";
import {Courier, CourierOptions} from "./Courier";
import {Scout, ScoutOptions} from "./Scout";
import {SeedHarvester, SeedHarvesterOptions} from "./SeedHarvester";
import {SeedUpgrader, SeedUpgraderOptions} from "./SeedUpgrader";
import {SeedBuilder, SeedBuilderOptions} from "./SeedBuilder";
type CreepHash = {[creepName: string]: Creep;};
type StructureHash = {[id: string]: Structure;};

export default class Manager {

    static Sync(inMemory: CreepHash, inGame: CreepHash) {
        for(let name in inMemory) {
            if(!inGame[name]) {
                delete inMemory[name];
                console.log('RIP:', name);
            }
        }
    }

    static RunAll(){
        this.RunCreeps(Game.creeps);
        this.RunTowers(Game.structures);
    }

    static RunCreeps(creeps: CreepHash) {
        for (let name in creeps) {
            let minion = this.ToMinion(creeps[name]);
            if (minion) {
                minion.Run();
            }
        }
    }

    static RunCreepsForRoom(creeps: Creep[]) {
        for (let i in creeps) {
            let minion = this.ToMinion(creeps[i]);
            if (minion) {
                minion.Run();
            }
        }
    }

    static RunTowers(structures: StructureHash) {
        var towers = _.filter(structures, s => s.structureType == STRUCTURE_TOWER) as Tower[];
        for (let id in towers) {
            let turret = new Turret(towers[id]);
            turret.Run();

        }
    }

    static RunTowersForRoom(towers: Tower[]) {
        for (let i in towers) {
            let turret = new Turret(towers[i]);
            turret.Run();
        }
    }
    
    private static ToMinion(creep: Creep): Minion {
        switch (creep.memory.type) {
            case HarvesterOptions.Type:
                return new Harvester(creep);
            case MinerOptions.Type:
                return new Miner(creep);
            case CourierOptions.Type:
                return new Courier(creep);
            case UpgraderOptions.Type:
                return new Upgrader(creep);
            case BuilderOptions.Type:
                return new Builder(creep);
            case ScoutOptions.Type:
                return new Scout(creep);
            case SeedHarvesterOptions.Type:
                return new SeedHarvester(creep);
            case SeedUpgraderOptions.Type:
                return new SeedUpgrader(creep);
            case SeedBuilderOptions.Type:
                return new SeedBuilder(creep);
            default:
                creep.suicide();
                return null;
        }
    }
}