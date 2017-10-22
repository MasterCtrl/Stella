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
        if(this.AttackHostile()){
            return true;
        }

        return this.RepairStructure();
    }

    private AttackHostile(): boolean {
        let hostiles = this.turret.room.find<Creep>(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
            let hostile = hostiles[Math.floor(Math.random() * hostiles.length)];
            return this.turret.attack(hostile) == OK;
        }
        return false;
    }

    private RepairStructure(): boolean {
        let structures = this.turret.room.find<Structure>(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType != STRUCTURE_WALL && 
                                   structure.structureType != STRUCTURE_RAMPART && 
                                   structure.hits < structure.hitsMax
        });
        let structure = _.min(structures, s => s.hits);
        if (structure) {
            return this.turret.repair(structure) == OK;
        }
        return false;
    }
}