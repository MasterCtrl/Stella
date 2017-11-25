import {Bunker} from "./Bunker";
import RoomProcess from "./RoomProcess";
import {StructureLimits} from "./StructureLimits";

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
        const rcl = this.Room.controller.level;
        if (this.Room.Defcon.level > 1) {
            this.Suspend("return this.Room && this.Room.Defcon && this.Room.Defcon.level === 0");
            return;
        }
        // no matter what we are going to suspend when this is done...
        this.Suspend(43);

        const sitesNeeded = 2 - this.Room.find(FIND_CONSTRUCTION_SITES).length;
        if (sitesNeeded <= 0) {
            Logger.Debug("Already have enough construction sites", this.RoomName);
            return;
        }

        let siteContexts: ArchitectContext[];
        if ((siteContexts = this.GetBunkerSites(sitesNeeded, rcl)).length === 0) {
            Logger.Debug("Nothing to build", this.RoomName);
            this.Suspend(1000);
            return;
        }

        Logger.Info(`Adding construction sites ${JSON.stringify(_.map(siteContexts, "structureType"))} .`, this.RoomName);
        /**
         *  TODO this will only build the bunker... add more: 
         *  roads
         *  source containers
         *  source links
         *  upgrader container
         *  extractor
         */
        for (const context of siteContexts) {
            const result = this.Room.createConstructionSite(context.x, context.y, context.structureType);
        }
    }

    private GetBunkerSites(count: number, rcl: number): ArchitectContext[] {
        // TODO: error correction
        const sites = new Array<ArchitectContext>();
        const transform = this.GetTransform();
        if (!transform) {
            return sites;
        }
        for (const type in Bunker.buildings) {
            let maximum = StructureLimits[type][rcl];
            const positions: PositionContext[] = Bunker.buildings[type].pos.slice(0, maximum);
            for (const position of positions) {
                if (!this.CanBuild(type, position.x + transform.x, position.y + transform.y)) {
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

    private CanBuild(type: string, x: number, y: number): boolean {
        const results = this.Room.lookAt(x, y);
        for (const result of results) {
            let structure = result[LOOK_STRUCTURES] || result[LOOK_CONSTRUCTION_SITES];
            if (structure && structure.structureType === type) {
                return false;
            }
        }
        return true;
    }
}
