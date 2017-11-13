/**
 * Process base class.
 *
 * @export
 * @abstract
 * @class Process
 * @implements {IProcess}
 */
export default abstract class Process implements IProcess {
    private readonly kernel: IKernel;
    private processId: number;
    private priority: number;
    private name: string;
    private type: string;
    private parentId: number;
    private initialized: number;
    private state: State;
    private completed: boolean;

    /**
     * Creates an instance of Process.
     *
     * @param {IKernel} kernel 
     * @param {IData} data 
     * @memberof Process
     */
    constructor(kernel: IKernel, data: IData) {
        this.kernel = kernel;
        this.processId = data.ProcessId;
        this.priority = data.Priority;
        this.name = data.Name;
        this.type = data.Type;
        this.parentId = data.ParentId;
        this.initialized = data.Initialized;
        this.state = data.State;
        this.completed = false;
        this.Memory = data.Memory;
    }

    /**
     * Gets the root kernel of this process.
     *
     * @readonly
     * @type {IKernel}
     * @memberof Process
     */
    public get Kernel(): IKernel {
        return this.kernel;
    }

    /**
     * Gets the Id of this process.
     *
     * @readonly
     * @type {number}
     * @memberof Process
     */
    public get ProcessId(): number {
        return this.processId;
    }

    /**
     * Gets the Priority of this process.
     *
     * @readonly
     * @type {number}
     * @memberof Process
     */
    public get Priority(): number {
        return this.priority;
    }

    /**
     * Gets the Name of this process.
     *
     * @readonly
     * @type {string}
     * @memberof Process
     */
    public get Name(): string {
        return this.name;
    }

    /**
     * Gets the Type of this process.
     *
     * @readonly
     * @type {string}
     * @memberof Process
     */
    public get Type(): string {
        return this.type;
    }

    /**
     * Get the Id of this processes parent.
     *
     * @readonly
     * @type {number}
     * @memberof Process
     */
    public get ParentId(): number {
        return this.parentId;
    }

    /**
     * Gets when this process was initialized.
     *
     * @readonly
     * @type {number}
     * @memberof Process
     */
    public get Initialized(): number {
        return this.initialized;
    }

    /**
     * Gets or sets the state of this process.
     *
     * @type {State}
     * @memberof Process
     */
    public get State(): State {
        return this.state;
    }
    public set State(value: State) {
        this.state = value;
    }

    /**
     * Gets or sets the Memory of this process.
     *
     * @type {*}
     * @memberof Process
     */
    public get Memory(): any {
        return Memory.Process[this.ProcessId] || (Memory.Process[this.ProcessId] = {});
    }
    public set Memory(value: any) {
        Memory.Process[this.ProcessId] = value;
    }

    /**
     * Gets or sets if this process has completed this tick.
     *
     * @type {boolean}
     * @memberof Process
     */
    public get Completed(): boolean {
        return this.completed;
    }
    public set Completed(value: boolean) {
        this.completed = value;
    }

    /**
     * Executes this process.
     *
     * @abstract
     * @memberof Process
     */
    public abstract Execute(): void;

    /**
     * Checks if this process is in a runnable state.
     *
     * @returns {boolean} 
     * @memberof Process
     */
    public CheckState(): boolean {
        if (typeof this.state === "number") {
            if (this.state === 0) {
                this.Resume();
            } else {
                this.state--;
            }
        } else if (typeof this.state === "string") {
            const waitProcess = this.Kernel.GetProcess({ Name: this.state });
            if (!waitProcess) {
                this.Resume();
            }
        }
        return this.State === true;
    }

    /**
     * Resumes this process
     *
     * @memberof Process
     */
    public Resume(): void {
        Logger.Debug(`${this.Name}: resuming process.`);
        this.state = true;
    }

    /**
     * Suspends this process and optionally all its children.
     *
     * @param {Suspend} [state=false]
     * @param {boolean} [suspendChildren=false]
     * @memberof Process
     */
    public Suspend(state: State = false, suspendChildren: boolean = false): void {
        Logger.Debug(`${this.Name}: suspending process - ${state}.`);
        this.state = state;
        if (!suspendChildren) {
            return;
        }
        for (const childProcess of this.kernel.GetChildren(this.ProcessId)) {
            childProcess.Suspend(state, suspendChildren);
        }
    }

    /**
     * Serializes this process for persistence.
     *
     * @returns {IData} 
     * @memberof Process
     */
    public Serialize(): IData {
        return {
            ProcessId: this.processId,
            Priority: this.priority,
            Name: this.name,
            Type: this.type,
            ParentId: this.parentId,
            Initialized: this.initialized,
            State: this.state || true
        };
    }

    /**
     * Disposes this process.
     *
     * @memberof Process
     */
    public Dispose(): void {
        Logger.Debug(`${this.Name}: disposing process.`);
        delete Memory.Process[this.ProcessId];
    }
}
