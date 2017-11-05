import Logger from "../os/Logger";
import Unit from "./Unit";

/**
 * Upgrader unit, used to constantly upgrade the controller in the room.
 *
 * @export
 * @class Upgrader
 * @extends {Unit}
 */
export default class Upgrader extends Unit {
    /**
     * Executes the upgrader logic.
     *
     * @memberof Upgrader
     */
    public Execute(): void {
        if (this.Unit.memory.upgrading && this.Unit.carry.energy === 0) {
            this.Unit.memory.upgrading = false;
            this.Unit.say("🔄 harvest");
        }
        if (!this.Unit.memory.upgrading && this.Unit.carry.energy === this.Unit.carryCapacity) {
            this.Unit.memory.upgrading = true;
            this.Unit.say("⚡ upgrade");
        }

        if (this.Unit.memory.upgrading) {
            if (this.Unit.upgradeController(this.Unit.room.controller) === ERR_NOT_IN_RANGE) {
                this.Unit.moveTo(this.Unit.room.controller, { visualizePathStyle: { stroke: "#ffffff" } });
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
 * Upgrader definition.
 *
 * @export
 * @implements {IUnitDefintion}
 */
export const UpgraderDefintion: IUnitDefintion = {
    Priority: 9,
    Population(room: Room): number {
        return room.find(FIND_SOURCES).length;
    },
    CreateBody(room: Room): string[] {
        return [WORK, CARRY, MOVE];
    }
};
