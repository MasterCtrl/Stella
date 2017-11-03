import Logger from "../Tools/Logger";
import Process from "./Process";

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
        this.CreateProcess(0, "Init-master", "Init");
    }

    /**
     * Loads the serialized processes into the kernel.
     *
     * @memberof Kernel
     */
    public Load() {
        _.forEach(Memory.StellOS.ProcessTable, (data: IData) => {
            this.register[data.Name] = this.ActivateProcess(data);
        });
    }

    /**
     * Unloads all processes and serializes them into memory.
     *
     * @memberof Kernel
     */
    public Unload() {
        const processes = [];
        _.forEach(this.register, (process: Process) => {
            processes.push(process.Serialize());
        });
        Memory.StellOS.ProcessTable = processes;
    }

    /**
     * Run the the processes in the process table in priority order.
     *
     * @memberof Kernel
     */
    public Run() {
        while (this.UnderLimit) {
            const process = this.GetNextProcess();
            if (!process) {
                Logger.Current.Debug("Kernel Unloading.");
                this.Unload();
                return;
            }
            process.Completed = true;
            if (!process.CheckState()) {
                Logger.Current.Debug(`${process.Name}: process suspended - ${process.State}.`);
                continue;
            }
            Logger.Current.Debug(`${process.Name}: process executing`);
            process.Execute();
        }
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
     * @param {number} priority
     * @param {string} name
     * @param {string} type
     * @param {number} [parentId]
     * @returns {IProcess}
     * @memberof Kernel
     */
    public CreateProcess(priority: number, name: string, type: string, parentId?: number): IProcess {
        Logger.Current.Debug(`Creating process ${name}`);
        const data: IData = {
            ProcessId: this.GetNextProcessId(),
            Priority: priority,
            Name: name,
            Type: type,
            ParentId: parentId,
            Initialized: Game.time,
            State: true
        };
        const process = this.ActivateProcess(data);
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
        return _.sortBy(processesToRun, "Priority").reverse()[0];
    }

    /**
     * Gets a process by its name
     *
     * @param {string} name
     * @returns
     * @memberof Kernel
     */
    public GetProcess(name: string): IProcess {
        return this.register[name];
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
     * Activates a process of the given type.
     *
     * @returns {IProcess}
     * @memberof Kernel
     */
    public ActivateProcess(data: IData): IProcess {
        const type = require(`../Processes/${data.Type}`).default;
        return new type(this, data);
    }

    /**
     * Terminates the process with the given name and optionally all its children.
     *
     * @param {string} name
     * @param {boolean} [killChildren=false]
     * @returns
     * @memberof Kernel
     */
    public Terminate(name: string, killChildren: boolean = false) {
        const process = this.GetProcess(name);
        if (!process) {
            Logger.Current.Warning(`${name}: process has already been terminated.`);
            return;
        }
        Logger.Current.Debug(`${name}: terminating process.`);
        delete this.register[name];
        process.Dispose();
        if (!killChildren) {
            return;
        }
        for (const childProcess of this.GetChildren(process.ProcessId)) {
            this.Terminate(childProcess.Name, killChildren);
        }
    }
}
