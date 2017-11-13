import {BuilderDefinition} from "./Civilians/Builder";
import {CourierDefinition} from "./Civilians/Courier";
import {HarvesterDefinition} from "./Civilians/Harvester";
import {UpgraderDefinition} from "./Civilians/Upgrader";
import {GuardianDefinition} from "./Military/Guardian";
import {MissionaryDefinition} from "./Military/Missionary";

export const Builder = new BuilderDefinition();
export const Courier = new CourierDefinition();
export const Harvester = new HarvesterDefinition();
export const Upgrader = new UpgraderDefinition();
export const Guardian = new GuardianDefinition();
export const Missionary = new MissionaryDefinition();
