import Logger from "../os/Logger";

export default class Upgrader implements IUnit {
    public Execute(unit: Creep): void {
        if (unit.memory.upgrading && unit.carry.energy === 0) {
            unit.memory.upgrading = false;
            unit.say("🔄 harvest");
        }
        if (!unit.memory.upgrading && unit.carry.energy === unit.carryCapacity) {
            unit.memory.upgrading = true;
            unit.say("⚡ upgrade");
        }

        if (unit.memory.upgrading) {
            if (unit.upgradeController(unit.room.controller) === ERR_NOT_IN_RANGE) {
                unit.moveTo(unit.room.controller, {visualizePathStyle: {stroke: "#ffffff"}});
            }
        } else {
            const source = unit.pos.findClosestByPath<Source>(FIND_SOURCES);
            if (unit.harvest(source) === ERR_NOT_IN_RANGE) {
                unit.moveTo(source, {visualizePathStyle: {stroke: "#ffaa00"}});
            }
        }
    }
}

export const UpgraderDefintion: IUnitDefintion = {
    Priority: 9,
    Population(room: Room): number {
        return room.find(FIND_SOURCES).length;
    },
    CreateBody(room: Room): string[] {
        return [WORK, CARRY, MOVE];
    }
};
