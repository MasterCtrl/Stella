import RoomProcess from "./RoomProcess";

/**
 * Network process responsible for coordinating the links in the room.
 *
 * @export
 * @class Network
 * @extends {RoomProcess}
 */
export default class Network extends RoomProcess {
    /**
     * Executes the Network process.
     *
     * @memberof Network
     */
    public Execute(): void {
        if (!this.Room || !this.Room.IsLinkMining) {
            this.Kernel.Terminate({ Name: this.Name });
            return;
        }

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
        this.Suspend(17);
    }
}
