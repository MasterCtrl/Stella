import {Kernel} from "./Kernel";

/**
 *  Process base class.
 *
 * @export
 * @abstract
 * @class Process
 */
export abstract class Process {
    private readonly kernel: Kernel;
    private readonly processId: number;
    private readonly priority: number;
    private readonly name: string;
    private readonly type: string;
    private readonly parentId: number;
    private readonly initialized: number;
    private suspend: string | number | boolean;

    /**
     * Creates an instance of Process.
     *
     * @param {Kernel} kernel 
     * @param {number} processId 
     * @param {number} parentId 
     * @param {number} priority 
     * @param {number} initialized 
     * @param {string} type 
     * @param {Suspend} suspend 
     * @memberof Process
     */
    constructor(kernel: Kernel, data: IProcessData) {
        this.kernel = kernel;
        this.processId = data.ProcessId;
        this.priority = data.Priority;
        this.name = data.Name;
        this.type = data.Type;
        this.parentId = data.ParentId;
        this.initialized = data.Initialized;
        this.suspend = data.Suspend;
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
     * Gets the Memory of this process.
     *
     * @readonly
     * @type {*}
     * @memberof Process
     */
    public get Memory(): any {
        return Memory.Process[this.ProcessId];
    }

    /**
     * Executes this process.
     *
     * @abstract
     * @memberof Process
     */
    public abstract Execute();

    /**
     * Suspends this process and 
     *
     * @param {Suspend} [suspend=true]
     * @param {boolean} [suspendChildren=false]
     * @memberof Process
     */
    public Suspend(suspend: string | number | boolean = true, suspendChildren: boolean = false) {
        this.suspend = suspend;
        if (suspendChildren) {
            for (const childProcess of this.kernel.GetChildren(this.ProcessId)) {
                childProcess.Suspend(suspend);
            }
        }
    }

    /**
     * Resumes this process
     *
     * @memberof Process
     */
    public Resume() {
        this.suspend = false;
    }

    /**
     * Serializes this process for persistence.
     *
     * @returns {IProcessData} 
     * @memberof Process
     */
    public Serialize(): IProcessData {
        return {
            ProcessId: this.processId,
            Priority: this.priority,
            Name: this.name,
            Type: this.type,
            ParentId: this.parentId,
            Initialized: this.initialized,
            Suspend: this.suspend
        }
    }
}

export interface IProcessData {
    ProcessId: number;
    Priority: number;
    Name: string;
    Type: string;
    ParentId: number;
    Initialized: number;
    Suspend: string | number | boolean;
}
