import Logger from "../../os/Logger";
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
        if (this.IsEmpty) {
            const target = this.Unit.pos.findClosestByPath<Source>(FIND_SOURCES);
            this.PushState(States.Harvest, {
                sourceId: target.id,
                position: { x: target.pos.x, y: target.pos.y, room: target.pos.roomName }
            });
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
