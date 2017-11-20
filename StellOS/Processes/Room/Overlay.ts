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
        if (!Memory.StellOS.Settings.Visuals) {
            this.Suspend(13);
            return;
        }
        for (const structure of this.Room.find<Structure>(FIND_STRUCTURES)) {
            let style: CircleStyle = { opacity: 0.4, radius: 0.4 };
            const percentage = structure.hits / structure.hitsMax;
            if (percentage > 0.8) {
                style.fill = "blue";
            } else if (percentage > 0.6) {
                style.fill = "green";
            } else if (percentage > 0.4) {
                style.fill = "yellow";
            } else if (percentage > 0.2) {
                style.fill = "orange";
            } else {
                style.fill = "red";
            }
            this.Room.visual.circle(structure.pos, style);
            this.Room.visual.text(percentage.toLocaleString("en", { useGrouping: false, maximumSignificantDigits: 3 }), structure.pos);
        }
    }
}
