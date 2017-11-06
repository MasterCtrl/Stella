import Logger from "../../os/Logger";
import Unit from "../Unit";

/**
 * Builder minion, used to build and repair structures.
 *
 * @export
 * @class Builder
 * @extends {Unit}
 */
export default class Builder extends Unit {
    /**
     * Runs the Initialization for this unit.
     *
     * @memberof Builder
     */
    public RunInitialization(): void {
        let target: ConstructionSite | Source | StructureController;
        let range = 1;
        if (this.IsEmpty) {
            target = this.Unit.pos.findClosestByPath<Source>(FIND_SOURCES);
            this.PushState("Harvesting", { sourceId: target.id });
        } else {
            target = this.Unit.pos.findClosestByPath(FIND_CONSTRUCTION_SITES) || this.Unit.room.controller;
            if (target instanceof ConstructionSite) {
                this.PushState("Building", { constructionSiteId: target.id });
            } else {
                this.PushState("Upgrading");
            }
            range = 3;
        }

        this.PushState("MoveTo", { position: { x: target.pos.x, y: target.pos.y, room: target.pos.roomName }, range: range });
    }
}

/**
 * Builder definition.
 *
 * @export
 * @implements {IUnitDefinition}
 */
export const BuilderDefinition: IUnitDefinition = {
    Priority: 9,
    Population(room: Room): number {
        return room.find(FIND_SOURCES).length;
    },
    CreateBody(room: Room): string[] {
        return [WORK, CARRY, MOVE];
    }
};
