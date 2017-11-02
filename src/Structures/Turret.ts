/**
 * Turret, used to defend and repair structures in a room.
 *
 * @export
 * @class Turret
 */
export default class Turret {
    private readonly turret: StructureTower;

    /**
     * Creates an instance of Turret.
     * @param {Tower} tower
     * @memberof Turret
     */
    constructor(tower: Tower) {
        this.turret = tower;
    }

    /**
     * Runs the turret
     *
     * @memberof Turret
     */
    public Run(): boolean {
        if (this.AttackHostile()) {
            return true;
        }

        return this.RepairStructure();
    }

    private AttackHostile(): boolean {
        const hostiles = this.turret.room.find<Creep>(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
            const hostile = hostiles[Math.floor(Math.random() * hostiles.length)];
            return this.turret.attack(hostile) === OK;
        }
        return false;
    }

    private RepairStructure(): boolean {
        const structures = this.turret.room.find<Structure>(FIND_STRUCTURES, {
            filter: (s) => s.structureType !== STRUCTURE_WALL &&
                           s.structureType !== STRUCTURE_RAMPART &&
                           s.hits < s.hitsMax
        });
        const structure = _.min(structures, (s) => s.hits);
        if (structure) {
            return this.turret.repair(structure) === OK;
        }
        return false;
    }
}
