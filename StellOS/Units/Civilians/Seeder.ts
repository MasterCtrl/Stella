import {Unit, UnitDefinition, States} from "../Unit";

/**
 * Seeder minion, used to seed another room.
 *
 * @export
 * @class Seeder
 * @extends {Unit}
 */
export class Seeder extends Unit {
    /**
     * Initializes the units state stack.
     *
     * @memberof Seeder
     */
    public InitializeState(): void {
        const withdrawContext = this.FindWithdrawSource([STRUCTURE_CONTAINER]) ||
                                this.FindWithdrawSource([STRUCTURE_STORAGE]);
        if (withdrawContext) {
            this.PushState(States.Withdraw, withdrawContext);
            return;
        }

        if (this.IsEmpty && this.Unit.Source) {
            this.PushState(States.Harvest, this.Unit.Source);
            return;
        }

        const flagContext = this.FindFlag(FlagColor);
        if (flagContext && flagContext.position.room !== this.Unit.room.name) {
            this.PushState(States.MoveTo, flagContext);
            return;
        }

        const buildContext = this.FindConstructionSite();
        if (buildContext) {
            this.PushState(States.Build, buildContext);
            return;
        }

        this.PushState(States.Upgrade);
    }
}

/**
 * Seeder definition.
 *
 * @export
 * @class SeederDefinition
 * @extends {UnitDefinition}
 */
export class SeederDefinition extends UnitDefinition {
    /**
     * Gets the Seeder population for this room.
     *
     * @param {Room} room 
     * @returns {number} 
     * @memberof SeederDefinition
     */
    public Population(room: Room): number {
        return _.filter(Game.flags, (f) => f.color === FlagColor).length - _.filter(Memory.creeps, (c) => c.type === Seeder.name).length;
    }
}

const FlagColor = COLOR_BLUE;
