import {BuilderDefinition, Builder} from "./Civilians/Builder";
import {HarvesterDefinition, Harvester} from "./Civilians/Harvester";
import {UpgraderDefinition, Upgrader} from "./Civilians/Upgrader";

export const Definitions = {
    Builder: new BuilderDefinition(),
    Harvester: new HarvesterDefinition(),
    Upgrader: new UpgraderDefinition()
};

export const Implementations = {
    Builder: Builder,
    Harvester: Harvester,
    Upgrader: Upgrader
};
