export default class Harvester {

}

export const HarvesterDefintion: IUnitDefintion = {
    Priority: 9,
    Type: "Harvester",
    Population(room: Room): number {
        return room.find(FIND_SOURCES).length;
    },
    CreateBody(room: Room): string[] {
        return [WORK, CARRY, MOVE];
    }
};
