import Logger from "../../os/Logger";
import Unit from "../Unit";

/**
 * Harvester minion, used to mine and fill spawns, extensions, towers, and containers.
 *
 * @export
 * @class Harvester
 * @extends {Unit}
 */
export default class Harvester extends Unit {
    /**
     * Runs the Initialization for this unit.
     *
     * @memberof Builder
     */
    public RunInitialization(): void {
        let target: Source | Structure | StructureController;
        let range = 1;
        if (this.IsEmpty) {
            target = this.Unit.pos.findClosestByPath<Source>(FIND_SOURCES);
            this.PushState("Harvesting", { sourceId: target.id });
        } else {
            target = this.Unit.pos.findClosestByPath<Structure>(FIND_STRUCTURES, {
                filter: (s) => (s.structureType === STRUCTURE_EXTENSION ||
                                s.structureType === STRUCTURE_SPAWN ||
                                s.structureType === STRUCTURE_TOWER) && s.energy < s.energyCapacity
            }) || this.Unit.room.controller;
            if (target instanceof StructureController) {
                this.PushState("Upgrading");
                range = 3;
            } else {
                this.PushState("Transfering", { targetId: target.id, resource: RESOURCE_ENERGY });
            }
        }

        this.PushState("MoveTo", { position: { x: target.pos.x, y: target.pos.y, room: target.pos.roomName }, range: range });
    }
}

/**
 * Harvester definition.
 *
 * @export
 * @implements {IUnitDefinition}
 */
export const HarvesterDefinition: IUnitDefinition = {
    Priority: 9,
    Population(room: Room): number {
        return room.find(FIND_SOURCES).length;
    },
    CreateBody(room: Room): string[] {
        return [WORK, CARRY, MOVE];
    }
};
