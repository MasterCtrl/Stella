import Minion from "./Minion";
import Turret from "./Turret";
import Harvester from "./Harvester";
import Upgrader from "./Upgrader";
import Builder from "./Builder";
import Miner from "./Miner";
import Courier from "./Courier";
import Scout from "./Scout";
import Seeder from "./Seeder";
type CreepHash = {[creepName: string]: Creep;};
type StructureHash = {[id: string]: Structure;};

/**
 * Manager, used to run a collection of minions.
 * 
 * @export
 * @class Manager
 */
export default class Manager {

    /**
     * Syncs the in memory creep cache with the actual creeps.
     * 
     * @static
     * @param {CreepHash} inMemory 
     * @param {CreepHash} inGame 
     * @memberof Manager
     */
    public static Sync(inMemory: CreepHash, inGame: CreepHash) {
        for(let name in inMemory) {
            if(!inGame[name]) {
                delete inMemory[name];
                console.log('RIP:', name);
            }
        }
    }

    /**
     * Runs each of the creeps in the specified collection.
     * 
     * @static
     * @param {Creep[]} creeps 
     * @memberof Manager
     */
    public static RunCreeps(creeps: Creep[]) {
        for (let i in creeps) {
            let minion = this.ToMinion(creeps[i]);
            if (minion) {
                minion.Run();
            }
        }
    }

    /**
     * Runs each of the towers in the specified collection.
     * 
     * @static
     * @param {Tower[]} towers 
     * @memberof Manager
     */
    public static RunTowers(towers: Tower[]) {
        for (let i in towers) {
            let turret = new Turret(towers[i]);
            turret.Run();
        }
    }
    
    private static ToMinion(creep: Creep): Minion {
        switch (creep.memory.type) {
            case Harvester.Type:
                return new Harvester(creep);
            case Miner.Type:
                return new Miner(creep);
            case Courier.Type:
                return new Courier(creep);
            case Upgrader.Type:
                return new Upgrader(creep);
            case Builder.Type:
                return new Builder(creep);
            case Scout.Type:
                return new Scout(creep);
            case Seeder.Type:
                return new Seeder(creep);
            default:
                creep.say("Im not a minion dummy!");
                console.log(creep.name + " is not a minion and has nothing to do.");
                return null;
        }
    }
}

require("screeps-profiler").registerClass(Manager, 'Manager');