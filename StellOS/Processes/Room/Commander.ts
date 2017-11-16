import * as Implementations from "../../Units/Military";
import RoomProcess from "./RoomProcess";

/**
 * Commander process responsible for all military units in a room.
 *
 * @export
 * @class Commander
 * @extends {RoomProcess}
 */
export default class Commander extends RoomProcess {
    /**
     * Executes the Commander process.
     *
     * @memberof Commander
     */
    public Execute(): void {
        if (!this.Room) {
            this.Kernel.Terminate({ Name: this.Name });
            return;
        }
        const forces = Object.keys(Implementations);
        const creeps = this.Room.find<Creep>(FIND_MY_CREEPS, { filter: (c) =>  forces.indexOf(c.memory.type) !== -1});
        for (const creep of creeps) {
            const ctor = Implementations[creep.memory.type];
            const unit = new ctor(creep, this.Kernel) as IUnit;
            unit.Execute();
        }
    }
}
