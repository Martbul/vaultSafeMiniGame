type ConstructorType<T extends abstract new (...args: never) => unknown> = new (
  ...params: ConstructorParameters<T>
) => InstanceType<T>;

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

type Pair = {
  value: number;
  rotatingDirection: RotatingDirection;
};

type RotatingDirection = "clockwise" | "counterclockwise";
