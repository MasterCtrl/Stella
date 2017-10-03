import sodb from "sodb"
import Manager from "./Manager";
import RoomController from "./RoomController";

export const loop = function () {
    let db = new sodb()
    Manager.Sync(Memory.creeps, Game.creeps);
    RoomController.RunRooms(Game.rooms);
}