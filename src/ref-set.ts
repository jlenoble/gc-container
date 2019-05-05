export default abstract class RefSet<K, V> implements IRefSet<K, V> {
  protected readonly fwd: Map<V, K> = new Map();
  protected readonly bck: Map<K, V> = new Map();

  static get [Symbol.species] (): SetConstructor {
    return Set;
  }

  constructor (
    iterable?: ReadonlyArray<V> | Iterable<V> | null,
    protected _uid?: K
  ) {
    if (iterable) {
      for (const value of iterable) {
        this.add(value);
      }
    }
  }

  add (value: V): this {
    if (!this.fwd.has(value)) {
      const key: K = this.uid();
      this.fwd.set(value, key);
      this.bck.set(key, value);
    }
    return this;
  }

  clear (): void {
    this.fwd.clear();
    this.bck.clear();
  }

  delete (value: V): boolean {
    if (this.fwd.has(value)) {
      const key: K = this.fwd.get(value) as K;
      this.bck.delete(key);
      return this.fwd.delete(value);
    }
    return false;
  }

  forEach (
    cb: (value: V, value2: V, set: Set<V>) => void,
    thisArg?: any
  ): void {
    for (const value of this.fwd.keys()) {
      cb.call(thisArg, value, value, this);
    }
  }

  has (value: V): boolean {
    return this.fwd.has(value);
  }

  get size (): number {
    return this.fwd.size;
  }

  [Symbol.iterator] (): IterableIterator<V> {
    return this.fwd.keys();
  }

  entries (): IterableIterator<[V, V]> {
    const iterator: IterableIterator<V> = this.fwd.keys();

    return {
      next: (): IteratorResult<[V, V]> => {
        const {value, done} : {value: V, done: boolean} = iterator.next();
        return {value: [value, value], done};
      },

      [Symbol.iterator]: (): IterableIterator<[V, V]> => {
        return this.entries();
      },
    };
  }

  keys (): IterableIterator<V> {
    return this.fwd.keys();
  }

  values (): IterableIterator<V> {
    return this.fwd.keys();
  }

  get [Symbol.toStringTag] (): 'Set' {
    return 'Set';
  }

  deleteKey (key: K): boolean {
    if (this.bck.has(key)) {
      const value: V = this.bck.get(key) as V;
      this.fwd.delete(value);
      return this.bck.delete(key);
    }
    return false;
  }

  getKey (value: V): K | undefined {
    return this.fwd.get(value);
  }

  getValue (key: K): V | undefined {
    return this.bck.get(key);
  }

  hasKey (key: K): boolean {
    return this.bck.has(key);
  }

  abstract uid (): K;
}
