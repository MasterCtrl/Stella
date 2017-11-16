import {Unit, UnitDefinition, States} from "../Unit";

/**
 * Missionary unit, used to sign, attack, reserve, and claim controllers.
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
        const flagContext = this.FindFlag(FlagColor);
        if (flagContext && flagContext.position.room !== this.Unit.room.name) {
            this.PushState(States.MoveTo, flagContext);
            return;
        }

        const controller = this.Unit.room.controller;
        if (controller.sign.username !== this.Unit.owner.username && Memory.Settings.Sign) {
            this.PushState(States.Sign, Memory.Settings.Sign);
            return;
        }

        this.PushState(States.AttackController);
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
        return _.filter(Game.flags, (f) => f.color === FlagColor).length - _.filter(Memory.creeps, (c) => c.type === Missionary.name).length;
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

const FlagColor = COLOR_ORANGE;
