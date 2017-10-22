import Minion from "../Minions/Minion";
import Link from "../Structures/Link";
import Terminal from "../Structures/Terminal";
import Turret from "../Structures/Turret";
type CreepHash = { [creepName: string]: Creep };

/**
 * EntityController, used to run a entities.
 *
 * @export
 * @class EntityController
 */
export default class EntityController {

    /**
     * Syncs the in memory creep cache with the actual creeps.
     *
     * @static
     * @param {CreepHash} inMemory
     * @param {CreepHash} inGame
     * @memberof EntityController
     */
    public static Sync(inMemory: CreepHash, inGame: CreepHash) {
        for (const name in inMemory) {
            if (!inGame[name]) {
                delete inMemory[name];
            }
        }
    }

    /**
     * Runs each of the creeps in the specified collection.
     *
     * @static
     * @param {Creep[]} creeps
     * @memberof EntityController
     */
    public static RunCreeps(creeps: Creep[]) {
        for (const crp of creeps) {
            const minion = this.ToMinion(crp);
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
     * @memberof EntityController
     */
    public static RunTowers(towers: Tower[]) {
        for (const twr of towers) {
            const turret = new Turret(twr);
            turret.Run();
        }
    }

    /**
     * Runs each of the links in the specified collection.
     *
     * @static
     * @param {StructureLink[]} links
     * @memberof EntityController
     */
    public static RunLinks(links: StructureLink[]) {
        for (const lnk of links) {
            const link = new Link(lnk);
            link.Run();
        }
    }

    /**
     * Runs the terminal in the room.
     *
     * @static
     * @param {StructureTerminal} term
     * @memberof EntityController
     */
    public static RunTerminal(term: StructureTerminal) {
        if (!term) {
            return;
        }
        const terminal = new Terminal(term);
        terminal.Run();
    }

    private static ToMinion(creep: Creep): Minion {
        const type = require("../Minions/" + creep.memory.type);
        if (type) {
            return new type.default(creep);
        } else {
            creep.say("❗");
            console.log(`${creep.name} is not a minion and has nothing to do.`);
            return null;
        }
    }
}
