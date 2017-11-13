import * as Implementations from "../../Units/Civilians";
import RoomProcess from "./RoomProcess";

/**
 * Administrator process responsible for all the units in a room.
 *
 * @export
 * @class Administrator
 * @extends {RoomProcess}
 */
export default class Administrator extends RoomProcess {
    /**
     * Executes the administrator process.
     *
     * @memberof Administrator
     */
    public Execute(): void {
        if (!this.Room) {
            this.Kernel.Terminate({ Name: this.Name });
            return;
        }
        const civilians = Object.keys(Implementations);
        const creeps = this.Room.find<Creep>(FIND_MY_CREEPS, { filter: (c) =>  civilians.indexOf(c.memory.type) !== -1});
        for (const creep of creeps) {
            const ctor = Implementations[creep.memory.type];
            const unit = new ctor(creep, this.Kernel) as IUnit;
            unit.Execute();
        }
    }
}
