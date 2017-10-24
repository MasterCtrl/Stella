import {Process, IProcessData} from "./Process";

/**
 * Kernel, used to create/initialize a table of processes and execute them in priority order.
 *
 * @export
 * @class Kernel
 */
export class Kernel {
    private processTable: IProcessTable = {};

    /**
     * 
     *
     * @memberof Kernel
     */
    public Load() {
        _.forEach(Memory.StellOS.ProcessTable, (data: IProcessData) => {
            let type = require(`./${data.Type}`);
            this.processTable[data.Name] = new type(this, data);
        });
    }

    /**
     * 
     *
     * @memberof Kernel
     */
    public Unload() {
        let processes = new Array<IProcessData>();
        _.forEach(this.processTable, (process: Process) => {
            processes.push(process.Serialize());
        });

        Memory.StellOS.ProcessTable = processes;
    }

    /**
     * Adds a process of the given type to the process table
     *
     * @param {*} processClass 
     * @param {number} processId 
     * @param {number} priority 
     * @param {string} type 
     * @param {number} [parentId] 
     * @memberof Kernel
     */
    public AddProcess(processClass: any, processId: number, priority: number, name: string, type: string, parentId?: number) {
        const processData: IProcessData = { 
            ProcessId: processId,
            Priority: priority,
            Name: name,
            Type: type,
            ParentId: parentId,
            Initialized: Game.time,
            Suspend: false
         };
        const process = new processClass(this, processData);
        this.processTable[process.Name] = process;
    }

    /**
     * Gets a process by its type
     *
     * @param {string} type 
     * @returns 
     * @memberof Kernel
     */
    public GetProcess(type: string) {
        return this.processTable[type];
    }

    /**
     * Gets the children of the given process
     *
     * @param {number} parentProcessId 
     * @returns {Process[]} 
     * @memberof Kernel
     */
    public GetChildren(parentProcessId: number): Process[] {
        return _.filter(this.processTable, (p) => p.ParentId === parentProcessId);
    }
}

interface IProcessTable {
    [type: string]: Process;
}
