import Configuration from "../Configuration"

/**
 * Terminal, used to send resources between rooms.
 * 
 * @export
 * @class Terminal
 */
export default class Terminal {
    private readonly terminal: StructureTerminal;

    /**
     * Creates an instance of Terminal.
     * @param {StructureTerminal} terminal 
     * @memberof Terminal
     */
    constructor(terminal: StructureTerminal){
        this.terminal = terminal;
    }

    /**
     * Runs the Terminal
     * 
     * @returns {boolean} 
     * @memberof Terminal
     */
    public Run(): boolean {
        if ((this.terminal.store[RESOURCE_ENERGY] < Configuration.Terminal.energy.Maximum) || ((Game.time % 20) != 0) || this.terminal.cooldown != 0) {
            return false;
        }
        if (this.SellResources()) {
            return true;
        }
        return this.SendRelief();
    }

    private SellResources(): boolean {
        for (var type in this.terminal.store) {
            if (type == RESOURCE_ENERGY) {
                continue;
            }
            
            let resource: number = this.terminal.store[type];
            let configuration = Configuration.Terminal[type] || Configuration.Terminal.Fallback;
            if (resource < configuration.Maximum) {
                continue;
            }

            let orders = _.sortBy(Game.market.getAllOrders({type: ORDER_BUY, resourceType: type}), order => order.price).reverse();
            if (orders.length == 0) {
                continue;
            }

            let order = orders[0];
            let amount = configuration.Packet;
            if (order.remainingAmount < amount) {
                amount = order.remainingAmount;
            }

            let cost = Game.market.calcTransactionCost(amount, this.terminal.room.name, order.roomName);
            if (cost > this.terminal.store[RESOURCE_ENERGY]) {
                console.log(this.terminal.room.name + ": Not enough energy to transfer");
                return false;
            }
            let result = Game.market.deal(order.id, amount, this.terminal.room.name);
            if (result == OK) {
                console.log(this.terminal.room.name + ": Sold " + amount + " mineral(" + type + ") to " + order.roomName + " for " + (order.price * amount));
                return true;                
            }
        }
        return false;
    }

    private SendRelief(): boolean {
        if (!Memory.rooms) {
            return false;
        }
        for (var name in Memory.rooms) {
            let room = Game.rooms[name];
            if (!room || !room.terminal) {
                continue;
            }
            for (var r in Memory.rooms[name].needs) {
                let resource = Memory.rooms[name].needs[r];
                let amount = 1000;
                let limit = Configuration.Terminal[resource] || Configuration.Terminal.Fallback;
                if (this.terminal.store[resource] - amount < limit.Minimum) {
                    continue;
                }
                let cost = Game.market.calcTransactionCost(amount, this.terminal.room.name, name);
                if (resource == RESOURCE_ENERGY) {
                    cost += amount;
                }
                if (this.terminal.store.energy < cost) {
                    console.log(this.terminal.room.name + ": Not enough energy to send resources");
                    continue;
                }
                let result = this.terminal.send(resource, amount, name);
                if (result == OK) {
                    console.log(this.terminal.room.name + ": Sent " + amount + " " + resource + " to " + name);
                    return true;
                }
            }
        }
        return false;
    }
}