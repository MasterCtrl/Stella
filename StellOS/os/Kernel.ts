import {enumerable} from "../Decorators/Property";
import Process from "../Processes/Process";
import * as Processes from "../Processes";
import "./Logger";
import "../Prototypes";

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
        global.StellOS = this;
        this.CreateProcess(Processes.Init, "master", 0);
    }

    /**
     * Loads the serialized processes into the kernel.
     *
     * @memberof Kernel
     */
    public Load(): void {
        _.forEach(Memory.StellOS.Register, (data: IData) => {
            const process = new Processes[data.Type](this, data);
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
        Memory.StellOS.Register = processes;
        const processCount = Object.keys(this.register).length;
        const memoryCount = Object.keys(Memory.StellOS.Context).length;
        if (processCount < memoryCount && Memory.StellOS.Settings.Running) {
            Logger.Warning(`More process memory(${memoryCount}) then processes(${processCount}).`);
        }
        this.LogStats();
        delete global.StellOS;
    }

    private LogStats(): void {
        const current = Game.cpu.getUsed();
        Memory.StellOS.Stats.cpu.unshift(current);
        if (Memory.StellOS.Stats.cpu.length > Memory.StellOS.Stats.average) {
            Memory.StellOS.Stats.cpu = Memory.StellOS.Stats.cpu.slice(0, Memory.StellOS.Stats.average);
        }
        const average = _.sum(Memory.StellOS.Stats.cpu) / Memory.StellOS.Stats.cpu.length;
        new RoomVisual().text(
            `CPU: ${this.Format(current)}/${Game.cpu.limit}  ` +
            `Average: ${this.Format(average)}/${Memory.StellOS.Stats.cpu.length}  ` +
            `Bucket: ${Game.cpu.bucket}`,
            1, 1, {align: "left"});
    }

    private Format(cpu: number): string {
        return cpu.toLocaleString("en", { useGrouping: false, maximumSignificantDigits: 3, minimumSignificantDigits: 3 });
    }

    /**
     * Performs a hard reset on the kernel.
     *
     * @memberof Kernel
     */
    public Reset(): void {
        delete Memory.StellOS;
    }

    /**
     * Run the the processes in the process table in priority order.
     *
     * @memberof Kernel
     */
    public Run(): void {
        while (Memory.StellOS.Settings.Running === true && this.UnderLimit) {
            const process = this.GetNextProcess();
            if (!process) {
                break;
            }
            process.Completed = true;
            if (!process.CheckState()) {
                Logger.Debug(`${process.Name}: process suspended - ${process.State}.`);
                continue;
            }
            Logger.Debug(`${process.Name}: process executing`);
            process.Execute();
        }
        Logger.Debug(`Kernel Unloading - CPU=${Game.cpu.getUsed()}`);
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
     * @param {{ new (kernel: IKernel, data: IData): T }} ctor 
     * @param {string} identifier 
     * @param {number} priority 
     * @param {{ ParentId?: number, Memory?: any }} [options={}] 
     * @returns {T} 
     * @memberof Kernel
     */
    public CreateProcess<T extends IProcess>(ctor: { new (kernel: IKernel, data: IData): T }, identifier: string, priority: number, options: { ParentId?: number, Memory?: any } = {}): T {
        const type = ctor.name;
        const data = {
            ProcessId: this.GetNextProcessId(),
            Priority: priority,
            Name: `${type}-${identifier}`,
            Type: type,
            ParentId: options.ParentId,
            Initialized: Game.time,
            State: true,
            Memory: options.Memory
        };
        Logger.Debug(`Creating process ${data.Name}`);
        const process: T = new ctor(this, data);
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
        return _.sortBy(processesToRun, "Priority")[0];
    }

    /**
     * Gets a process that matches the given criteria.
     *
     * @template T 
     * @param {*} options 
     * @returns {T} 
     * @memberof Kernel
     */
    public GetProcess<T extends IProcess>(options: any): T {
        return _.find(this.register, options) as T;
    }

    /**
     * Gets the children of the given process
     *
     * @param {number} parentProcessId
     * @returns {IProcess[]}
     * @memberof Kernel
     */
    public GetChildren(parentProcessId: number): IProcess[] {
        return _.filter(this.register, { ParentId: parentProcessId });
    }

    /**
     * Gets the next process id to use.
     *
     * @returns {number}
     * @memberof Kernel
     */
    public GetNextProcessId(): number {
        const proc = _.max(this.register, "ProcessId");
        return proc instanceof Process ? proc.ProcessId + 1 : 0;
    }

    /**
     * Terminates the process with the given name and optionally all its children.
     *
     * @template T 
     * @param {*} options 
     * @param {boolean} [killChildren=false] 
     * @returns 
     * @memberof Kernel
     */
    public Terminate<T extends IProcess>(options: any, killChildren: boolean = false) {
        const process = this.GetProcess(options);
        if (!process) {
            Logger.Warning(`process has already been terminated(${JSON.stringify(options)}).`);
            return;
        }
        Logger.Debug(`${process.Name}: terminating process.`);
        process.Dispose();
        delete this.register[process.Name];
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
        const processes = _.sortByAll(_.values<IProcess>(this.register), ["Priority", "ParentId", "State", "Initialized"]);
        for (const current in processes) {
            const process = processes[current].Serialize();
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

    /**
     * Resumes the kernel immediately.
     *
     * @memberof Kernel
     */
    public Resume(): void {
        Memory.StellOS.Settings.Running = true;
    }

    /**
     * Suspends the kernel untill the specified tick/forever
     *
     * @param {number} [tick] 
     * @memberof Kernel
     */
    public Suspend(tick?: number): void {
        if (tick === undefined) {
            Memory.StellOS.Settings.Running = false;
        } else {
            Memory.StellOS.Settings.Running = Game.time + tick;
        }
    }
}

if (Memory.StellOS.Settings.Running === Game.time || Memory.StellOS.Settings.Running === undefined) {
    Memory.StellOS.Settings.Running = true;
}

if (!Memory.StellOS.Stats) {
    Memory.StellOS.Stats = {};
}

if (!Memory.StellOS.Stats.average) {
    Memory.StellOS.Stats.average = 25;
}

if (!Memory.StellOS.Stats.cpu) {
    Memory.StellOS.Stats.cpu = [];
}
