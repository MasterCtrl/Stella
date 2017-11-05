import * as Harvester from "./Harvester";
import * as Upgrader from "./Upgrader";

export const Definitions = {
    Harvester: Harvester.HarvesterDefintion,
    Upgrader: Upgrader.UpgraderDefintion
};

export const Implementations = {
    Harvester: Harvester.default,
    Upgrader: Upgrader.default
};
