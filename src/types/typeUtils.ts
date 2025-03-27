export type NullableProperty<T> = {
    [K in keyof T]: T[K] | null;
};

export type Nullable<T> = T | null;