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
    public Run() {
        let hostile: Creep = this.turret.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (hostile) {
            this.turret.attack(hostile);
            return;
        }

        let structure: Structure = this.turret.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType != STRUCTURE_WALL && 
                                   structure.structureType != STRUCTURE_RAMPART && 
                                   structure.hits < structure.hitsMax
            }
        );
        if (structure) {
            this.turret.repair(structure);
        }
    }
}

require("screeps-profiler").registerClass(Turret, "Turret");