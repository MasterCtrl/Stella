import Logger from "../os/Logger";
import Unit from "./Unit";

/**
 * Harvester minion, used to mine and fill spawns, extensions, towers, and containers.
 * TODO: this is just the tutorial code... just for testing, probably want a base class for some common stuff and preferably use warinternals
 * pushdown automata example: https://screeps.slack.com/files/U1XTCBJ9L/F7KTF6KMJ/Pushdown_Automata_-_Stack_machine_prototypes__with_examples_.js
 *
 * @export
 * @class Harvester
 * @extends {Unit}
 */
export default class Harvester extends Unit {
    /**
     * Executes the harvester logic.
     *
     * @memberof Harvester
     */
    public Execute(): void {
        if (this.Unit.carry.energy < this.Unit.carryCapacity) {
            const source = this.Unit.pos.findClosestByPath<Source>(FIND_SOURCES);
            if (this.Unit.harvest(source) === ERR_NOT_IN_RANGE) {
                this.Unit.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
            }
        } else {
            const targets = this.Unit.room.find<Structure>(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_EXTENSION ||
                        structure.structureType === STRUCTURE_SPAWN ||
                        structure.structureType === STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                }
            });
            if (targets.length > 0) {
                if (this.Unit.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    this.Unit.moveTo(targets[0], { visualizePathStyle: { stroke: "#ffffff" } });
                }
            }
        }
    }
}

/**
 * Harvester definition.
 *
 * @export
 * @implements {IUnitDefintion}
 */
export const HarvesterDefintion: IUnitDefintion = {
    Priority: 9,
    Population(room: Room): number {
        return room.find(FIND_SOURCES).length;
    },
    CreateBody(room: Room): string[] {
        return [WORK, CARRY, MOVE];
    }
};
