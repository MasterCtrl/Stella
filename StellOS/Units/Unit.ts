/**
 * Unit base class, contains common unit logic.
 *
 * @export
 * @abstract
 * @class Unit
 * @implements {IUnit}
 */
export default abstract class Unit implements IUnit {
    private readonly unit;

    /**
     * Creates an instance of Unit.
     * 
     * @param {Creep} unit
     * @memberof Unit
     */
    public constructor(unit: Creep) {
        this.unit = unit;
    }

    /**
     * Gets the unit.
     *
     * @readonly
     * @type {Creep}
     * @memberof Unit
     */
    public get Unit(): Creep {
        return this.unit;
    }

    /**
     * Executes this unit.
     *
     * @abstract
     * @memberof Unit
     */
    public abstract Execute(): void;
}
