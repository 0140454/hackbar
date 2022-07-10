type CamelToSnake<T extends string, P extends string = ''> = string extends T
  ? string
  : T extends `${infer C0}${infer R}`
  ? CamelToSnake<
      R,
      `${P}${C0 extends Lowercase<C0> ? '' : '_'}${Lowercase<C0>}`
    >
  : P

type CamelToSnakeEnum<
  T extends string,
  T1 = {
    [K in T]: Uppercase<CamelToSnake<K>>
  },
  T2 = { [K in keyof T1 as T1[K]]: K },
> = T2
