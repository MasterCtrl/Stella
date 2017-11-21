import RoomProcess from "./RoomProcess";

/**
 * Overlay process responsible for room visuals.
 *
 * @export
 * @class Overlay
 * @extends {RoomProcess}
 */
export default class Overlay extends RoomProcess {
    /**
     * Executes the Overlay process.
     *
     * @memberof Overlay
     */
    public Execute(): void {
        if (!this.Room) {
            this.Kernel.Terminate({ Name: this.Name });
            return;
        }

        for (const structure of this.Room.find<Structure>(FIND_STRUCTURES)) {
            let style: PolyStyle = { opacity: 0.4 };
            const percentage = structure.hits / structure.hitsMax;
            if (percentage > 0.8 || structure.structureType === STRUCTURE_CONTROLLER) {
                continue;
            } else if (percentage > 0.6) {
                style.fill = "blue";
            } else if (percentage > 0.4) {
                style.fill = "green";
            } else if (percentage > 0.25) {
                style.fill = "yellow";
            } else if (percentage > 0.1) {
                style.fill = "orange";
            } else {
                style.fill = "red";
            }
            this.Room.visual.rect(structure.pos.x - 0.5, structure.pos.y - 0.5, 1, 1, style);
        }
    }
}
