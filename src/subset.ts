import RefSet from "./ref-set";
import { SetShrinkTransform } from "gc-iterator";

class ShrinkTransform<K, V> extends SetShrinkTransform<K, V>
  implements ISetTransform<K, V> {
  constructor(collection: Set<K>, protected readonly reference: RefSet<K, V>) {
    super(collection);
  }

  [Symbol.iterator](): IterableIterator<V> {
    return new ShrinkTransform(this.collection, this.reference);
  }

  transform(key: K): V {
    return this.reference.getValue(key) as V;
  }

  isValid(key: K): boolean {
    return this.reference.hasKey(key);
  }
}

export default class Subset<K, V> implements ISubset<K, V> {
  protected readonly collection: Set<K> = new Set();
  protected readonly shrinkTransform: ShrinkTransform<K, V>;

  static get [Symbol.species](): SetConstructor {
    return Set;
  }

  constructor(protected readonly reference: RefSet<K, V>) {
    this.shrinkTransform = new ShrinkTransform(this.collection, this.reference);
  }

  add(value: V): this {
    if (!this.reference.has(value)) {
      this.reference.add(value);
    }
    this.collection.add(this.reference.getKey(value) as K);
    return this;
  }

  clear(): void {
    this.collection.clear();
  }

  delete(value: V): boolean {
    if (!this.reference.has(value)) {
      return false;
    }
    return this.collection.delete(this.reference.getKey(value) as K);
  }

  forEach(cb: (value: V, value2: V, set: Set<V>) => void, thisArg?: any): void {
    for (const value of this.shrinkTransform) {
      cb.call(thisArg, value, value, this);
    }
  }

  has(value: V): boolean {
    if (!this.reference.has(value)) {
      return false;
    }
    return this.collection.has(this.reference.getKey(value) as K);
  }

  get size(): number {
    this.collectGarbage();
    return this.collection.size;
  }

  [Symbol.iterator](): IterableIterator<V> {
    return this.shrinkTransform[Symbol.iterator]();
  }

  entries(): IterableIterator<[V, V]> {
    const iterator: IterableIterator<V> = this.values();

    return {
      next: (): IteratorResult<[V, V]> => {
        const { value, done }: { value: V; done: boolean } = iterator.next();
        return { value: [value, value], done };
      },

      [Symbol.iterator]: (): IterableIterator<[V, V]> => {
        return this.entries();
      }
    };
  }

  keys(): IterableIterator<V> {
    return this.shrinkTransform[Symbol.iterator]();
  }

  values(): IterableIterator<V> {
    return this.shrinkTransform[Symbol.iterator]();
  }

  get [Symbol.toStringTag](): "Set" {
    return "Set";
  }

  collectGarbage(): void {
    const iterator = this.shrinkTransform[Symbol.iterator]();
    while (!iterator.next().done) {}
  }
}
