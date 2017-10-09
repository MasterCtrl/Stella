import Configuration from "../Configuration"

export default class Terminal {
    private readonly terminal: StructureTerminal;

    constructor(terminal: StructureTerminal){
        this.terminal = terminal;
    }

    public Run() {
        if ((this.terminal.store[RESOURCE_ENERGY] < 2500) || ((Game.time % 20) != 0) || this.terminal.cooldown != 0) {
            return;
        }
        for (let type in this.terminal.store) {
            if (type == RESOURCE_ENERGY) {
                continue;
            }
            
            let resource: number = this.terminal.store[type];
            if (resource < Configuration.MineralSellThreshold) {
                continue;
            }

            let orders = _.sortBy(Game.market.getAllOrders({type: ORDER_BUY, resourceType: type}), order => order.price).reverse();
            if (orders.length == 0) {
                continue;
            }

            let order = orders[0];
            let amount = 500;
            if (order.remainingAmount < amount) {
                amount = order.remainingAmount;
            }

            if (Game.market.calcTransactionCost(amount, this.terminal.room.name, order.roomName) > this.terminal.store[RESOURCE_ENERGY]) {
                console.log(this.terminal.room.name + ": Not enough energy to transfer");
                return;
            }
            let result = Game.market.deal(order.id, amount, this.terminal.room.name);
            if (result == 0) {
                console.log(this.terminal.room.name + ": Sold " + amount + " mineral(" + type + ") to " + order.roomName + "for " + order.price);
                break;                
            }
        }
    }
}

require("screeps-profiler").registerClass(Terminal, "Terminal");