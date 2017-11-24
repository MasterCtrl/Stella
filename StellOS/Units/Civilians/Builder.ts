import {Unit, UnitDefinition, States} from "../Unit";

/**
 * Builder minion, used to build and repair structures.
 *
 * @export
 * @class Builder
 * @extends {Unit}
 */
export class Builder extends Unit {
    /**
     * Initializes the units state stack.
     *
     * @memberof Builder
     */
    public InitializeState(): void {
        const droppedEnergyContext = this.FindDroppedResource(RESOURCE_ENERGY);
        if (droppedEnergyContext) {
            this.PushState(States.Pickup, droppedEnergyContext);
            return;
        }

        const withdrawContext = this.FindWithdrawSource([STRUCTURE_CONTAINER]) ||
                                this.FindWithdrawSource([STRUCTURE_STORAGE]);
        if (withdrawContext) {
            this.PushState(States.Withdraw, withdrawContext);
            return;
        }

        if (this.IsEmpty && this.Unit.Source && !this.Unit.room.IsContainerMining && !this.Unit.room.IsLinkMining) {
            this.PushState(States.Harvest, this.Unit.Source);
            return;
        }

        const buildContext = this.FindConstructionSite();
        if (buildContext) {
            this.PushState(States.Build, buildContext);
            return;
        }

        const repairContext = this.FindRepair([]);
        if (repairContext) {
            this.PushState(States.Repair, repairContext);
            return;
        }

        if (this.Memory.DeathRow < 3) {
            this.Memory.DeathRow++;
            return;
        }

        if (this.Unit.room.RecycleBin) {
            this.PushState(States.Recycle, this.Unit.room.RecycleBin);
        } else {
            this.ClearState();
            this.Unit.suicide();
        }
    }
}

/**
 * Builder definition.
 *
 * @export
 * @class BuilderDefinition
 * @extends {UnitDefinition}
 */
export class BuilderDefinition extends UnitDefinition {
    /**
     * Gets the builder population for this room.
     *
     * @param {Room} room 
     * @returns {number} 
     * @memberof BuilderDefinition
     */
    public Population(room: Room): number {
        return room.find(FIND_CONSTRUCTION_SITES).length > 0 ? room.Sources.length : 1;
    }
}
