import * as _ from "lodash";
import Minion from "./Minion";
import Turret from "./Turret";
import {Harvester, HarvesterOptions} from "./Harvester";
import {Upgrader, UpgraderOptions} from "./Upgrader";
import {Builder, BuilderOptions} from "./Builder";
import {Miner, MinerOptions} from "./Miner";
import {Courier, CourierOptions} from "./Courier";
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
            let minion = this.ToMinion(creeps, name);
            if (minion) {
                minion.Run();
            }
        }
    }

    static RunTowers(structures: StructureHash) {
        var towers = _.filter(structures, s => s.structureType == STRUCTURE_TOWER) as Tower[];
        for (let id in towers) {
            let turret = this.ToTurret(towers, id);
            if (turret) {
                turret.Run();
            }
        }
    }
    
    private static ToMinion(creeps: CreepHash, name: string): Minion {
        if (!creeps.hasOwnProperty(name)) {
            return null;
        }
        let creep = creeps[name];
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
            default:
                creep.suicide();
                return null;
        }
    }

    private static ToTurret(towers: Tower[], id: string) {
        if (!towers.hasOwnProperty(id)) {
            return null;
        }
        let tower = towers[id];
        return new Turret(tower);
    }
}