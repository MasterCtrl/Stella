import Configuration from "../Configuration";

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
    constructor(terminal: StructureTerminal) {
        this.terminal = terminal;
    }

    /**
     * Runs the Terminal
     *
     * @returns {boolean}
     * @memberof Terminal
     */
    public Run(): boolean {
        if ((this.terminal.store[RESOURCE_ENERGY] < Configuration.Terminal.energy.Maximum) || ((Game.time % 20) !== 0) || this.terminal.cooldown !== 0) {
            return false;
        }
        if (this.SellResources()) {
            return true;
        }
        if (this.SendResources()) {
            return true;
        }
        return this.BuyResources();
    }

    private SellResources(): boolean {
        for (const type in this.terminal.store) {
            if (type === RESOURCE_ENERGY) {
                continue;
            }

            const resource: number = this.terminal.store[type];
            const configuration = Configuration.Terminal[type] || Configuration.Terminal.Fallback;
            if (resource < configuration.Maximum) {
                continue;
            }

            const orders = _.sortBy(Game.market.getAllOrders({ type: ORDER_BUY, resourceType: type }), (o) => o.price).reverse();
            if (orders.length === 0) {
                continue;
            }

            const order = orders[0];
            let amount = configuration.Packet;
            if (order.remainingAmount < amount) {
                amount = order.remainingAmount;
            }

            const cost = Game.market.calcTransactionCost(amount, this.terminal.room.name, order.roomName);
            if (cost > this.terminal.store[RESOURCE_ENERGY]) {
                console.log(`${this.terminal.room.name}: Not enough energy to transfer`);
                return false;
            }
            const result = Game.market.deal(order.id, amount, this.terminal.room.name);
            if (result === OK) {
                console.log(`${this.terminal.room.name}: Sold ${amount} mineral(${type}) to ${order.roomName} for ${order.price * amount}`);
                return true;
            }
        }
        return false;
    }

    private SendResources(): boolean {
        if (!Memory.rooms) {
            return false;
        }
        for (const name in Memory.rooms) {
            const room = Game.rooms[name];
            if (!room || !room.terminal) {
                continue;
            }
            for (const r in Memory.rooms[name].needs) {
                const resource = Memory.rooms[name].needs[r];
                const limit = Configuration.Terminal[resource] || Configuration.Terminal.Fallback;
                if (this.terminal.store[resource] - limit.Packet < limit.Minimum) {
                    continue;
                }
                let cost = Game.market.calcTransactionCost(limit.Packet, this.terminal.room.name, name);
                if (resource === RESOURCE_ENERGY) {
                    cost += limit.Packet;
                }
                if (this.terminal.store.energy < cost) {
                    console.log(`${this.terminal.room.name}: Not enough energy to send resources`);
                    continue;
                }
                const result = this.terminal.send(resource, limit.Packet, name);
                if (result === OK) {
                    console.log(`${this.terminal.room.name}: Sent ${limit.Packet} ${resource} to ${name}`);
                    return true;
                }
            }
        }
        return false;
    }

    private BuyResources(): boolean {
        for (const type of this.terminal.room.memory.needs) {
            if (type === RESOURCE_ENERGY) {
                continue;
            }

            const limit = Configuration.Terminal[type] || Configuration.Terminal.Fallback;
            if (this.terminal.store[type] >= limit.Minimum) {
                continue;
            }

            const orders = _.sortBy(Game.market.getAllOrders({ type: ORDER_SELL, resourceType: type }), (o) => o.price);
            if (orders.length === 0) {
                continue;
            }

            const order = orders[0];
            let amount = limit.Packet;
            if (order.remainingAmount < amount) {
                amount = order.remainingAmount;
            }

            if (order.price * amount > Game.market.credits) {
                console.log(`${this.terminal.room.name}: Not enough credits to transfer`);
                return false;
            }

            if (Game.market.calcTransactionCost(amount, this.terminal.room.name, order.roomName) > this.terminal.store[RESOURCE_ENERGY]) {
                console.log(`${this.terminal.room.name}: Not enough energy to transfer`);
                return false;
            }

            const result = Game.market.deal(order.id, amount, this.terminal.room.name);
            if (result === OK) {
                console.log(`${this.terminal.room.name}: Recieved ${amount} mineral(${type}) from ${order.roomName} for ${order.price * amount}`);
                return true;
            }
        }
        return false;
    }
}
