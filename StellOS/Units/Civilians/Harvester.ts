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
        if (this.IsEmpty && this.Unit.Source) {
            this.PushState(States.Harvest, this.Unit.Source);
            return;
        }

        const transferContext = this.FindTransferTarget([STRUCTURE_SPAWN, STRUCTURE_EXTENSION]) ||
                                this.FindUpgraderTarget() ||
                                this.FindTransferTarget([STRUCTURE_TOWER]);
        if (transferContext) {
            this.PushState(States.Transfer, transferContext);
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
     * Gets the priority of this unit.
     *
     * @param {Room} room 
     * @returns {number} 
     * @memberof HarvesterDefinition
     */
    public Priority(room: Room): number {
        return 5;
    }

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
