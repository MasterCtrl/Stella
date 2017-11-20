import RoomProcess from "./RoomProcess";

/**
 * Architect process responsible for planning construction in a room.
 *
 * @export
 * @class Architect
 * @extends {RoomProcess}
 */
export default class Architect extends RoomProcess {
    /**
     * Executes the Architect process.
     *
     * @memberof Architect
     */
    public Execute(): void {
        if (!this.Room) {
            this.Kernel.Terminate({ Name: this.Name });
            return;
        }

        if (this.Room.find(FIND_CONSTRUCTION_SITES).length >= 2) {
            // if we already have enough construction sites, suspend
            this.Suspend(43);
        }

        /**
         *  TODO: pick a construction site and create
         *        load from my bunker design
         *        roads to connect the major features(sources, controller)
         *        error correction if it cant place something in the exact place i want it.
         *        Bunker layout json should be relative to the first(main?) spawner
         *        ramparts too
         */
    }
}
