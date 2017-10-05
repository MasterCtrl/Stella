/**
 * Link, used to send resources around a room.
 * 
 * @export
 * @class Link
 */
export default class Link {
    private readonly link: StructureLink;

    /**
     * Creates an instance of Link.
     * @param {Link} link 
     * @memberof Link
     */
    constructor(link: StructureLink) {
        this.link = link;
    }

    /**
     * Runs the Link
     * 
     * @memberof Link
     */
    public Run() {
        //if we are the source link(source <= 1 away) then we need to wait for the cooldown to finish then send to the target
        //if we are the target the we need to transfer to the creep next to the link if there is one based on its capacity
    }
}

require("screeps-profiler").registerClass(Link, "Link");