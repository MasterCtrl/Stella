import {Bunker} from "./Bunker";
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
        // no matter what we are going to suspend when this is done...
        this.Suspend(43);

        const sitesNeeded = 2 - this.Room.find(FIND_CONSTRUCTION_SITES).length;
        let siteContexts: ArchitectContext[];
        if (sitesNeeded <= 0 || (siteContexts = this.GetBunkerSites(sitesNeeded)).length === 0) {
            // if we already have enough construction sites or there are none to build, suspend
            Logger.Debug("Nothing to build", this.RoomName);
            return;
        }

        Logger.Debug(`Adding ${siteContexts.length} construction sites(${JSON.stringify(siteContexts)}).`, this.RoomName);
        // TODO this will only build the bunker... add more roads, and other features
        for (const context of siteContexts) {
            const result = this.Room.createConstructionSite(context.x, context.y, context.structureType);
        }
    }

    private GetBunkerSites(count: number): ArchitectContext[] {
        // TODO: error correction
        const rcl = this.Room.controller.level;
        const sites = new Array<ArchitectContext>();
        const transform = this.GetTransform();
        if (!transform) {
            return sites;
        }
        for (const type in Bunker.buildings) {
            const maximum = CONTROLLER_STRUCTURES[type][rcl];
            const positions: PositionContext[] = Bunker.buildings[type].pos.slice(0, maximum);
            for (const position of positions) {
                const structures = this.Room.lookAt(position.x + transform.x, position.y + transform.y);
                if (_.some(structures, (s) => s.type === LOOK_STRUCTURES || s.type === LOOK_CONSTRUCTION_SITES)) {
                    continue;
                }
                sites.push({ x: position.x + transform.x, y: position.y + transform.y, structureType: type});
                if (sites.length === count) {
                    return sites;
                }
            }
        }

        return sites;
    }

    private GetTransform(): PositionContext {
        const persisted: PositionContext = Bunker.buildings.spawn.pos[0];
        const actual = this.Room.Spawn;
        return actual ? {x: actual.x - persisted.x, y: actual.y - persisted.y } : undefined;
    }
}
