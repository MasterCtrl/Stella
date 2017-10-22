import EntityController from "./Controllers/EntityController";
import RoomController from "./Controllers/RoomController";
import GC from "./GC";
import Profiler from "./Profiling";

export const loop = () => {
    if (Profiler) {
        Profiler.wrap(mainLoop);
    } else {
        mainLoop();
    }
};

const mainLoop = () => {
    RoomController.RunRooms(Game.rooms);
    GC.SyncAll();
};
