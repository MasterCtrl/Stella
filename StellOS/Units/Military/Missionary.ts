import Logger from "../../os/Logger";
import {Unit, UnitDefinition, States} from "../Unit";

/**
 * Missionary unit, used sign, attack, reserve, and claim controllers.
 *
 * @export
 * @class Missionary
 * @extends {Unit}
 */
export class Missionary extends Unit {
    /**
     * Initializes this unit.
     *
     * @memberof Missionary
     */
    public InitializeState(): void {
        const flag = _.find(Game.flags, (f) => f.color === COLOR_ORANGE);
        if (flag && this.Unit.room.name !== flag.room.name) {
            this.PushState(
                States.MoveTo,
                { position: { x: flag.pos.x, y: flag.pos.y, room: flag.pos.roomName }, range: 1 }
            );
            return;
        }
        const controller = this.Unit.room.controller;
        if (controller.sign.username !== this.Unit.owner.username) {
            this.PushState(
                States.Sign,
                { position: { x: controller.pos.x, y: controller.pos.y, room: controller.pos.roomName } }
            );
            return;
        }
        this.PushState(
            States.AttackController,
            { position: { x: controller.pos.x, y: controller.pos.y, room: controller.pos.roomName } }
        );
    }
}

/**
 * Missionary definition.
 *
 * @export
 * @class MissionaryDefinition
 * @extends {UnitDefinition}
 */
export class MissionaryDefinition extends UnitDefinition {
    /**
     * Gets the global unit population to maintain. 
     *
     * @param {Room} room 
     * @returns {number} 
     * @memberof MissionaryDefinition
     */
    public Population(room: Room): number {
        return _.filter(Game.flags, (f) => f.color === COLOR_ORANGE).length - _.filter(Memory.creeps, (c) => c.type === Missionary.name).length;
    }

    /**
     * Creates a claiming body.
     *
     * @param {Room} room
     * @returns {string[]}
     * @memberof MissionaryDefinition
     */
    public CreateBody(room: Room): string[] {
        return [CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE];
    }
 }
