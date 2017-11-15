import {BuilderDefinition} from "./Civilians/Builder";
import {CourierDefinition} from "./Civilians/Courier";
import {ExtractorDefinition} from "./Civilians/Extractor";
import {FillerDefinition} from "./Civilians/Filler";
import {HarvesterDefinition} from "./Civilians/Harvester";
import {MinerDefinition} from "./Civilians/Miner";
import {UpgraderDefinition} from "./Civilians/Upgrader";
import {GuardianDefinition} from "./Military/Guardian";
import {MissionaryDefinition} from "./Military/Missionary";

export const Builder = new BuilderDefinition();
export const Courier = new CourierDefinition();
export const Extractor = new ExtractorDefinition();
export const Filler = new FillerDefinition();
export const Harvester = new HarvesterDefinition();
export const Miner = new MinerDefinition();
export const Upgrader = new UpgraderDefinition();
export const Guardian = new GuardianDefinition();
export const Missionary = new MissionaryDefinition();
/**
 * TODO:
 * import {JanitorDefinition} from "./Janitor";
 * export const Janitor = new JanitorDefinition();
 * import {SeederDefinition} from "./Seeder";
 * export const Seeder = new SeederDefinition();
 * import {MedicDefinition} from "./Medic";
 * export const Medic = new MedicDefinition();
 * import {RaiderDefinition} from "./Raider";
 * export const Raider = new RaiderDefinition();
 */
