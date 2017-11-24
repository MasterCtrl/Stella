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
            let percentage: number;
            if (structure.structureType === STRUCTURE_CONTROLLER) {
                const controller = structure as StructureController;
                percentage = controller.progress / controller.progressTotal;
                const countDown = controller.progressTotal - controller.progress;
                this.Room.visual.text(
                    `L${controller.level}_${countDown}`,
                    controller.pos.x, controller.pos.y,
                    this.GetTextStyle(percentage)
                );
                continue;
            }
            if (structure.structureType === STRUCTURE_STORAGE) {
                const storage = structure as StructureStorage;
                const store = _.sum(storage.store);
                percentage = store / storage.storeCapacity;
                this.Room.visual.text(
                    this.Kernel.FormatNumber(store),
                    storage.pos,
                    this.GetTextStyle(percentage)
                );
            }
            const pollyStyle = { opacity: 0.2 } as PolyStyle;
            percentage = structure.hits / structure.hitsMax;
            if (percentage > 0.8 || structure.structureType === STRUCTURE_CONTROLLER) {
                continue;
            } else if (percentage > 0.6) {
                pollyStyle.fill = "blue";
            } else if (percentage > 0.4) {
                pollyStyle.fill = "green";
            } else if (percentage > 0.25) {
                pollyStyle.fill = "yellow";
            } else if (percentage > 0.1) {
                pollyStyle.fill = "orange";
            } else {
                pollyStyle.fill = "red";
            }
            this.Room.visual.rect(
                structure.pos.x - 0.5, structure.pos.y - 0.5,
                1, 1,
                pollyStyle
            );
        }
    }

    private GetTextStyle(percentage: number): TextStyle {
        const textStyle = { backgroundColor: "black", backgroundPadding: 0.1, opacity: 0.7 } as TextStyle;
        if (percentage > 0.8) {
            textStyle.color = "blue";
        } else if (percentage > 0.6) {
            textStyle.color = "green";
        } else if (percentage > 0.4) {
            textStyle.color = "yellow";
        } else if (percentage > 0.2) {
            textStyle.color = "orange";
        } else {
            textStyle.color = "red";
        }
        return textStyle;
    }
}