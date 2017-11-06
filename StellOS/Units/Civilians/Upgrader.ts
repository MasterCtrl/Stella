import Logger from "../../os/Logger";
import Unit from "../Unit";

/**
 * Upgrader unit, used to constantly upgrade the controller in the room.
 *
 * @export
 * @class Upgrader
 * @extends {Unit}
 */
export default class Upgrader extends Unit {
    /**
     * Runs the Initialization for this unit.
     *
     * @memberof Builder
     */
    public RunInitialization(): void {
        let target: Source | StructureController;
        let range = 1;
        if (this.IsEmpty) {
            target = this.Unit.pos.findClosestByPath<Source>(FIND_SOURCES);
            this.PushState("Harvesting", { sourceId: target.id });
        } else {
            target = this.Unit.room.controller;
            this.PushState("Upgrading");
            range = 3;
        }

        this.PushState("MoveTo", { position: { x: target.pos.x, y: target.pos.y, room: target.pos.roomName }, range: range });
    }
}

/**
 * Upgrader definition.
 *
 * @export
 * @implements {IUnitDefinition}
 */
export const UpgraderDefinition: IUnitDefinition = {
    Priority: 9,
    Population(room: Room): number {
        return room.find(FIND_SOURCES).length;
    },
    CreateBody(room: Room): string[] {
        return [WORK, CARRY, MOVE];
    }
};
