import Configuration from "./Configuration";

let Profiler;
if (Configuration.Profiling) {
    Profiler = require("screeps-profiler");
    Profiler.enable();
    Profiler.registerClass(require("./Controllers/EntityController").default, "EntityController");
    Profiler.registerClass(require("./Controllers/RoomController").default, "RoomController");
    Profiler.registerClass(require("./Controllers/SpawnController").default, "SpawnController");
    Profiler.registerClass(require("./Minions/Builder").default, "Builder");
    Profiler.registerClass(require("./Minions/Courier").default, "Courier");
    Profiler.registerClass(require("./Minions/Drone").default, "Drone");
    Profiler.registerClass(require("./Minions/Filler").default, "Filler");
    Profiler.registerClass(require("./Minions/Guardian").default, "Guardian");
    Profiler.registerClass(require("./Minions/Harvester").default, "Harvester");
    Profiler.registerClass(require("./Minions/LinkMiner").default, "LinkMiner");
    Profiler.registerClass(require("./Minions/Miner").default, "Miner");
    Profiler.registerClass(require("./Minions/Minion").default, "Minion");
    Profiler.registerClass(require("./Minions/Raider").default, "Raider");
    Profiler.registerClass(require("./Minions/Scout").default, "Scout");
    Profiler.registerClass(require("./Minions/Seeder").default, "Seeder");
    Profiler.registerClass(require("./Minions/Upgrader").default, "Upgrader");
    Profiler.registerClass(require("./Structures/Link").default, "Link");
    Profiler.registerClass(require("./Structures/Terminal").default, "Terminal");
    Profiler.registerClass(require("./Structures/Turret").default, "Turret");
    Profiler.registerClass(require("./GC").default, "GC");
}

export default Profiler;
