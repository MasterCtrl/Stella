import {Implementations} from "../../Units";
import Logger from "../../os/Logger";
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
            this.Kernel.Terminate({ Name: this.Name }, true);
            return;
        }

        const creeps = this.Room.find<Creep>(FIND_MY_CREEPS);
        for (const creep of creeps) {
            const type = Implementations[creep.memory.type];
            if (!type) {
                creep.say("❗");
                Logger.Current.Error(`${creep.name} is not a minion and has nothing to do.`, this.RoomName);
            }
            const unit = new type(creep) as IUnit;
            unit.Execute();
        }
    }
}
