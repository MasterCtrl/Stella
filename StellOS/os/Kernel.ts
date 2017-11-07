import Logger from "./Logger";
import Process from "./Process";
import * as Processes from "../Processes";

/**
 * Kernel, used to create/initialize a table of processes and execute them in priority order.
 *
 * @export
 * @class Kernel
 * @implements {IKernel}
 */
export default class Kernel implements IKernel {
    private readonly limit: number;
    private readonly register: IRegister;

    /**
     * Creates an instance of Kernel.
     *
     * @memberof Kernel
     */
    constructor() {
        this.limit = Game.cpu.limit * 0.9;
        this.register = {};
        this.Initialize();
        this.CreateProcess(Processes.Init, "master", 0);
    }

    private Initialize(): void {
        if (!Memory.StellOS) {
            Memory.StellOS = {};
        }
        if (!Memory.Process) {
            Memory.Process = {};
        }
        global.StellOS = this;
    }

    /**
     * Loads the serialized processes into the kernel.
     *
     * @memberof Kernel
     */
    public Load(): void {
        _.forEach(Memory.StellOS.ProcessTable, (data: IData) => {
            const process = new Processes[data.Type](this);
            process.Load(data);
            this.register[data.Name] = process;
        });
    }

    /**
     * Unloads all processes and serializes them into memory.
     *
     * @memberof Kernel
     */
    public Unload(): void {
        const processes = [];
        _.forEach(this.register, (process: Process) => {
            processes.push(process.Serialize());
        });
        Memory.StellOS.ProcessTable = processes;
        delete global.StellOS;
    }

    /**
     * Performs a hard reset on the kernel.
     *
     * @memberof Kernel
     */
    public Reset(): void {
        delete Memory.StellOS;
        delete Memory.Process;
    }

    /**
     * Run the the processes in the process table in priority order.
     *
     * @memberof Kernel
     */
    public Run(): void {
        while (this.UnderLimit) {
            const process = this.GetNextProcess();
            if (!process) {
                break;
            }
            process.Completed = true;
            if (!process.CheckState()) {
                Logger.Current.Debug(`${process.Name}: process suspended - ${process.State}.`);
                continue;
            }
            Logger.Current.Debug(`${process.Name}: process executing`);
            process.Execute();
        }
        Logger.Current.Debug("Kernel Unloading.");
        this.Unload();
    }

    /**
     * Gets if we have cpu left to continue execution.
     *
     * @readonly
     * @type {boolean}
     * @memberof Kernel
     */
    public get UnderLimit(): boolean {
        return Game.cpu.getUsed() < this.limit;
    }

    /**
     * Creates and adds a process of the given type to the process table
     *
     * @template T 
     * @param {*} processClass 
     * @param {string} identifier 
     * @param {number} priority 
     * @param {number} [parentId] 
     * @returns {T} 
     * @memberof Kernel
     */
    public CreateProcess<T extends IProcess>(processClass: any, identifier: string, priority: number, options: { ParentId?: number, Memory?: any } = {}): T {
        const process: T = new processClass(this);
        const type = process.constructor.name;
        process.Load({
            ProcessId: this.GetNextProcessId(),
            Priority: priority,
            Name: `${type}-${identifier}`,
            Type: type,
            ParentId: options.ParentId,
            Initialized: Game.time,
            State: true,
            Memory: options.Memory
        });
        Logger.Current.Debug(`Created process ${process.Name}`);
        return this.register[process.Name] = process;
    }

    /**
     * Gets the next process in priority order.
     *
     * @returns {IProcess}
     * @memberof Kernel
     */
    public GetNextProcess(): IProcess {
        const processesToRun = _.filter(this.register, (e) => !e.Completed);
        if (!processesToRun || processesToRun.length === 0) {
            return undefined;
        }

        // TODO: index this somehow?
        return _.sortBy(processesToRun, "Priority").reverse()[0];
    }

    /**
     * Gets a process that matches the given criteria.
     *
     * @template T 
     * @param {ProcessFindOptions<T>} options 
     * @returns {T} 
     * @memberof Kernel
     */
    public GetProcess<T extends IProcess>(options: ProcessFindOptions<T>): T {
        if (options.Name) {
            return this.register[options.Name] as T;
        } else if (options.ProcessId) {
            return _.find(this.register, (p) => p.ProcessId === options.ProcessId) as T;
        } else if (options.Find) {
            return _.find(this.register, options.Find) as T;
        }
        return undefined;
    }

    /**
     * Gets the children of the given process
     *
     * @param {number} parentProcessId
     * @returns {IProcess[]}
     * @memberof Kernel
     */
    public GetChildren(parentProcessId: number): IProcess[] {
        return _.filter(this.register, (p) => p.ParentId === parentProcessId);
    }

    /**
     * Gets the next process id to use.
     *
     * @returns {number}
     * @memberof Kernel
     */
    public GetNextProcessId(): number {
        const proc = _.max(this.register, (p) => p.Priority);
        return proc ? proc.Priority + 1 : 0;
    }

    /**
     * Terminates the process with the given name and optionally all its children.
     *
     * @template T 
     * @param {ProcessFindOptions<T>} options 
     * @param {boolean} [killChildren=false] 
     * @returns 
     * @memberof Kernel
     */
    public Terminate<T extends IProcess>(options: ProcessFindOptions<T>, killChildren: boolean = false) {
        const process = this.GetProcess(options);
        if (!process) {
            Logger.Current.Warning(`process has already been terminated(${options}).`);
            return;
        }
        Logger.Current.Debug(`${process.Name}: terminating process.`);
        delete this.register[process.Name];
        process.Dispose();
        if (!killChildren) {
            return;
        }
        for (const childProcess of this.GetChildren(process.ProcessId)) {
            this.Terminate({ Name: childProcess.Name }, killChildren);
        }
    }

    /**
     * Outputs the status of the kernel.
     *
     * @memberof Kernel
     */
    public Status(): void {
        let status = `current tick: ${Game.time}<table><tr><th>name  </th><th>pid  </th><th>ppid  </th><th>priority  </th><th>initialized  </th><th>state  </th></tr>`;
        const processes = _.sortBy(this.register, (p) => p.Priority);
        for (const p in processes) {
            const process = processes[p].Serialize();
            status += "<tr>";
            status += ` <th>${process.Name}  </th>`;
            status += ` <th>${process.ProcessId}  </th>`;
            status += ` <th>${process.ParentId}  </th>`;
            status += ` <th>${process.Priority}  </th>`;
            status += ` <th>${process.Initialized}  </th>`;
            status += ` <th>${process.State}  </th>`;
            status += "</tr>";
        }
        status += "</table>";
        console.log(status);
    }
}
