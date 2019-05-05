interface IRefSet<K, V> extends Set<V> {
  deleteKey (key: K): boolean;
  getKey (value: V): K | undefined;
  getValue (key: K): V | undefined;
  hasKey (key: K): boolean;
  uid (): K;
}

interface ISubset<K, V> extends Set<V> {
  collectGarbage (): void;
}
