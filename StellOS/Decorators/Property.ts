/**
 * Sets the enumerable property descriptor.
 *
 * @export
 * @param {boolean} value
 * @returns {*}
 */
export function enumerable(value: boolean): any {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor): void => {
        descriptor.enumerable = value;
    };
}
