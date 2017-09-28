export default class Turret {
    turret: StructureTower;

    constructor(tower: Tower) {
        this.turret = tower;
    }

    Run() {
        let structure: Structure = this.turret.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType != STRUCTURE_WALL && 
                                   structure.structureType != STRUCTURE_RAMPART && 
                                   structure.hits < structure.hitsMax
            }
        );
        if (structure) {
            this.turret.repair(structure)
        }

        let hostile: Creep = this.turret.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (hostile) {
            this.turret.attack(hostile);
        }
    }
}