import Logger from "../os/Logger";
import Unit from "./Unit";

/**
 * Builder minion, used to build and repair structures.
 *
 * @export
 * @class Builder
 * @extends {Unit}
 */
export default class Builder extends Unit {
    /**
     * Executes the Builder logic.
     *
     * @memberof Builder
     */
    public Execute(): void {
        if (this.Unit.memory.building && this.Unit.carry.energy === 0) {
            this.Unit.memory.building = false;
            this.Unit.say("🔄 harvest");
        }
        if (!this.Unit.memory.building && this.Unit.carry.energy === this.Unit.carryCapacity) {
            this.Unit.memory.building = true;
            this.Unit.say("🚧 build");
        }

        if (this.Unit.memory.building) {
            const target = this.Unit.pos.findClosestByPath<ConstructionSite>(FIND_CONSTRUCTION_SITES);
            if (target) {
                if (this.Unit.build(target) === ERR_NOT_IN_RANGE) {
                    this.Unit.moveTo(target, { range: 3, visualizePathStyle: { stroke: "#ffffff" } });
                }
            }
        } else {
            const source = this.Unit.pos.findClosestByPath<Source>(FIND_SOURCES);
            if (this.Unit.harvest(source) === ERR_NOT_IN_RANGE) {
                this.Unit.moveTo(source, { visualizePathStyle: { stroke: "#ffaa00" } });
            }
        }
    }
}

/**
 * Builder definition.
 *
 * @export
 * @implements {IUnitDefintion}
 */
export const BuilderDefintion: IUnitDefintion = {
    Priority: 9,
    Population(room: Room): number {
        return room.find(FIND_SOURCES).length;
    },
    CreateBody(room: Room): string[] {
        return [WORK, CARRY, MOVE];
    }
};
