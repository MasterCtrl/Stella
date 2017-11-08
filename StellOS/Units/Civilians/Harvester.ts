import Logger from "../../os/Logger";
import {Unit, UnitDefinition, States} from "../Unit";

/**
 * Harvester minion, used to mine and fill spawns, extensions, towers, and containers.
 *
 * @export
 * @class Harvester
 * @extends {Unit}
 */
export class Harvester extends Unit {
    /**
     * Initializes this unit.
     *
     * @memberof Builder
     */
    public InitializeState(): void {
        if (this.IsEmpty) {
            const source = this.Unit.pos.findClosestByPath<Source>(FIND_SOURCES);
            this.PushState(States.Harvest, {
                sourceId: source.id,
                position: { x: source.pos.x, y: source.pos.y, room: source.pos.roomName }
            });
            return;
        }

        const target = this.Unit.pos.findClosestByPath<Structure>(FIND_STRUCTURES, {
            filter: (s) => (s.structureType === STRUCTURE_EXTENSION ||
                            s.structureType === STRUCTURE_SPAWN ||
                            s.structureType === STRUCTURE_TOWER) && s.energy < s.energyCapacity
        });
        if (target) {
            this.PushState(States.Transfer, {
                targetId: target.id,
                resource: RESOURCE_ENERGY,
                position: { x: target.pos.x, y: target.pos.y, room: target.pos.roomName }
            });
            return;
        }

        this.PushState(States.Upgrade);
    }
}

/**
 * Harvester definition.
 *
 * @export
 * @class HarvesterDefinition
 * @extends {UnitDefinition}
 */
export class HarvesterDefinition extends UnitDefinition { }
