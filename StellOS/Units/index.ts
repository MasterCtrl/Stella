import * as Builder from "./Civilians/Builder";
import * as Harvester from "./Civilians/Harvester";
import * as Upgrader from "./Civilians/Upgrader";

export const Definitions = {
    Builder: Builder.BuilderDefinition,
    Harvester: Harvester.HarvesterDefinition,
    Upgrader: Upgrader.UpgraderDefinition
};

export const Implementations = {
    Builder: Builder.default,
    Harvester: Harvester.default,
    Upgrader: Upgrader.default
};
