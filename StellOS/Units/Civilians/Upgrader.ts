import {Unit, UnitDefinition, States} from "../Unit";

/**
 * Upgrader unit, used to constantly upgrade the controller in the room.
 *
 * @export
 * @class Upgrader
 * @extends {Unit}
 */
export class Upgrader extends Unit {
    /**
     * Initializes this unit.
     *
     * @memberof Builder
     */
    public InitializeState(): void {
        const withdrawSource = this.FindUpgraderSource();
        if (withdrawSource) {
            this.PushState(States.Withdraw, withdrawSource);
            return;
        }

        const sourceContext = this.FindClosestSource();
        if (sourceContext) {
            this.PushState(States.Harvest, sourceContext);
            return;
        }

        this.PushState(States.Upgrade);
    }
}

/**
 * Upgrader definition.
 *
 * @export
 * @class UpgraderDefinition
 * @extends {UnitDefinition}
 */
export class UpgraderDefinition extends UnitDefinition { }
