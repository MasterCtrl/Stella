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
     * @returns 
     * @memberof Terminal
     */
    public Run() {
        if ((this.terminal.store[RESOURCE_ENERGY] < Configuration.Terminal[RESOURCE_ENERGY]) || ((Game.time % 20) != 0) || this.terminal.cooldown != 0) {
            return;
        }
        for (let type in this.terminal.store) {
            if (type == RESOURCE_ENERGY) {
                continue;
            }
            
            let resource: number = this.terminal.store[type];
            let configuration = Configuration.Terminal[type] || Configuration.Terminal.Fallback;
            if (resource < configuration.Threshold) {
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
                return;
            }
            let result = Game.market.deal(order.id, amount, this.terminal.room.name);
            if (result == 0) {
                console.log(this.terminal.room.name + ": Sold " + amount + " mineral(" + type + ") to " + order.roomName + " for " + (order.price * amount));
                break;                
            }
        }
    }
}