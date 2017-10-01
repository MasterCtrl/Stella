import * as _ from "lodash";
import Factory from "./Factory";
import Manager from "./Manager";

export const loop = function () {

    Manager.Sync(Memory.creeps, Game.creeps);

    Factory.Spawn(Game.spawns);

    Manager.RunAll();
}