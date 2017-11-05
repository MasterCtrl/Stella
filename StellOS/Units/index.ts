import * as Builder from "./Builder";
import * as Harvester from "./Harvester";
import * as Upgrader from "./Upgrader";

export const Definitions = {
    Builder: Builder.BuilderDefintion,
    Harvester: Harvester.HarvesterDefintion,
    Upgrader: Upgrader.UpgraderDefintion
};

export const Implementations = {
    Builder: Builder.default,
    Harvester: Harvester.default,
    Upgrader: Upgrader.default
};
