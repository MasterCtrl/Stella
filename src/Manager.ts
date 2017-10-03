import Minion from "./Minion";
import Turret from "./Turret";
import Harvester from "./Harvester";
import Upgrader from "./Upgrader";
import Builder from "./Builder";
import Miner from "./Miner";
import Courier from "./Courier";
import Scout from "./Scout";
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

    static RunCreeps(creeps: Creep[]) {
        for (let i in creeps) {
            let minion = this.ToMinion(creeps[i]);
            if (minion) {
                minion.Run();
            }
        }
    }

    static RunTowers(towers: Tower[]) {
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
            default:
                creep.suicide();
                return null;
        }
    }
}