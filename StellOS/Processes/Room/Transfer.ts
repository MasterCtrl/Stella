import RoomProcess from "./RoomProcess";

/**
 * Transfer process responsible for coordinating the links in the room.
 *
 * @export
 * @class Transfer
 * @extends {RoomProcess}
 */
export default class Transfer extends RoomProcess {
    /**
     * Executes the Transfer process.
     *
     * @memberof Transfer
     */
    public Execute(): void {
        if (!this.Room || !this.Room.IsLinkMining) {
            this.Kernel.Terminate({ Name: this.Name });
            return;
        }
        if (this.Room.CentralLink) {
            const centralLink = Game.getObjectById<StructureLink>(this.Room.CentralLink.targetId);
            for (const context of this.Room.Links) {
                if (context.center) {
                    continue;
                }
                const link = Game.getObjectById<StructureLink>(context.targetId);
                if (link.cooldown > 0 || link.energy < (link.energyCapacity / 2)) {
                    continue;
                }
                link.transferEnergy(centralLink);
            }
        }
        this.Suspend(17);
    }
}
