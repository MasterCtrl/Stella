import Logger from "../../os/Logger";
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
     * Initializes this unit.
     *
     * @memberof Builder
     */
    public RunInitialize(): void {
        if (this.IsEmpty) {
            const source = this.Unit.pos.findClosestByPath<Source>(FIND_SOURCES);
            this.PushState(States.Harvest, {
                sourceId: source.id,
                position: { x: source.pos.x, y: source.pos.y, room: source.pos.roomName }
            });
            return;
        }

        const target = this.Unit.pos.findClosestByPath<ConstructionSite>(FIND_CONSTRUCTION_SITES);
        if (target) {
            this.PushState(States.Build, {
                constructionSiteId: target.id,
                position: { x: target.pos.x, y: target.pos.y, room: target.pos.roomName }
            });
            return;
        }

        const spawn = this.Unit.pos.findClosestByPath<StructureSpawn>(FIND_MY_SPAWNS);
        if (!spawn) {
            this.Unit.suicide();
        }
        this.PushState(States.Recycle, {
            spawnId: spawn.id,
            position: { x: spawn.pos.x, y: spawn.pos.y, room: spawn.pos.roomName }
        });
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
        return room.find(FIND_CONSTRUCTION_SITES).length > 0 ? room.find(FIND_SOURCES).length : 0;
    }
}
