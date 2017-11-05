import Logger from "../os/Logger";

// TODO: this is just the tutorial code... just for testing, probably want a base class for some common stuff and preferably use warinternals
// pushdown automata example: https://screeps.slack.com/files/U1XTCBJ9L/F7KTF6KMJ/Pushdown_Automata_-_Stack_machine_prototypes__with_examples_.js
export default class Harvester implements IUnit {
    public Execute(unit: Creep): void {
        if (unit.carry.energy < unit.carryCapacity) {
            const source = unit.pos.findClosestByPath<Source>(FIND_SOURCES);
            if (unit.harvest(source) === ERR_NOT_IN_RANGE) {
                unit.moveTo(source, {visualizePathStyle: {stroke: "#ffaa00"}});
            }
        } else {
            const targets = unit.room.find<Structure>(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_EXTENSION ||
                        structure.structureType === STRUCTURE_SPAWN ||
                        structure.structureType === STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                }
            });
            if (targets.length > 0) {
                if (unit.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    unit.moveTo(targets[0], {visualizePathStyle: {stroke: "#ffffff"}});
                }
            }
        }
    }
}

export const HarvesterDefintion: IUnitDefintion = {
    Priority: 9,
    Population(room: Room): number {
        return room.find(FIND_SOURCES).length;
    },
    CreateBody(room: Room): string[] {
        return [WORK, CARRY, MOVE];
    }
};
