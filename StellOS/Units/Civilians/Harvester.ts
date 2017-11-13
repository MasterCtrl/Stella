import { Unit, UnitDefinition, States } from "../Unit";

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
        const sourceContext = this.Unit.Source || this.FindClosestSource();
        if (sourceContext) {
            this.PushState(States.Harvest, sourceContext);
            return;
        }

        const resourceContext = this.FindTransferTarget([STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER]);
        if (resourceContext) {
            this.PushState(States.Transfer, resourceContext);
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
export class HarvesterDefinition extends UnitDefinition {
    /**
     * Gets the harvester population to maintain. 
     *
     * @param {Room} room
     * @returns {number}
     * @memberof HarvesterDefinition
     */
    public Population(room: Room): number {
        return room.IsContainerMining || room.IsLinkMining ? 0 : room.Sources.length;
    }
}
