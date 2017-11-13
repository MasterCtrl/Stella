import * as Implementations from "../../Units/Military";
import RoomProcess from "./RoomProcess";

/**
 * General process responsible for all military units in a room.
 *
 * @export
 * @class General
 * @extends {RoomProcess}
 */
export default class General extends RoomProcess {
    /**
     * Executes the general process.
     *
     * @memberof General
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
