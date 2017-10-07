import Link from "../Structures/Link"
import Minion from "../Minions/Minion";
import Turret from "../Structures/Turret";
type CreepHash = {[creepName: string]: Creep;};

/**
 * MinionController, used to run a collection of minions.
 * 
 * @export
 * @class MinionController
 */
export default class MinionController {

    /**
     * Syncs the in memory creep cache with the actual creeps.
     * 
     * @static
     * @param {CreepHash} inMemory 
     * @param {CreepHash} inGame 
     * @memberof MinionController
     */
    public static Sync(inMemory: CreepHash, inGame: CreepHash) {
        for(let name in inMemory) {
            if(!inGame[name]) {
                delete inMemory[name];
            }
        }
    }

    /**
     * Runs each of the creeps in the specified collection.
     * 
     * @static
     * @param {Creep[]} creeps 
     * @memberof MinionController
     */
    public static RunCreeps(creeps: Creep[]) {
        creeps.forEach(c => {
            let minion = this.ToMinion(c);
            if (minion) {
                minion.Run();
            }           
        });
    }

    /**
     * Runs each of the towers in the specified collection.
     * 
     * @static
     * @param {Tower[]} towers 
     * @memberof MinionController
     */
    public static RunTowers(towers: Tower[]) {
        towers.forEach(t => {
            let turret = new Turret(t);
            turret.Run();            
        });
    }

    /**
     * Runs each of the links in the specified collection.
     * 
     * @static
     * @param {StructureLink[]} links 
     * @memberof MinionController
     */
    public static RunLinks(links: StructureLink[]) {
        links.forEach(l => {
            let link = new Link(l);
            link.Run();
        });
    }

    private static ToMinion(creep: Creep): Minion {
        var type = require("../Minions/" + creep.memory.type);
        if (type) {
            return new type.default(creep);
        } else {
            creep.say("❗");
            console.log(creep.name + " is not a minion and has nothing to do.");
            return null;
        }
    }
}

require("screeps-profiler").registerClass(MinionController, "MinionController");