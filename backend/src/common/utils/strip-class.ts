// Templated type that removes the functions from a class, allowing
// conversion to an interface

type NonFunctionPropertyNames<T> = {

  [K in keyof T]: T[K] extends Function ? never : K

} [keyof T];

export type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;