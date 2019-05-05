import {expect} from 'chai';
import {RefSet, Subset} from '../src/gc-container';

describe('Testing Subsets', function () {
  beforeEach(function () {
    class Ref extends RefSet<number, string> {
      constructor (iterable: ReadonlyArray<string>) {
        super(iterable, 0);
      }

      uid (): number {
        return ++(this._uid as number);
      }
    }

    const a = ['a', 'b', 'c'];
    const ref = new Ref(['a', 'b', 'c']);
    const sub = new Subset(ref);

    // eslint-disable-next-line no-invalid-this
    Object.assign(this, {ref, sub, a});
  });

  it('Adding known elements', function () {
    // eslint-disable-next-line no-invalid-this
    const {ref, sub, a} = this;

    sub.add('a').add('b');

    expect(Array.from(ref)).to.eql(a);
    expect(Array.from(sub)).to.eql(['a', 'b']);
  });

  it('Adding new elements', function () {
    // eslint-disable-next-line no-invalid-this
    const {ref, sub, a} = this;

    sub.add('d').add('e');

    expect(Array.from(ref)).to.eql(a.concat(['d', 'e']));
    expect(Array.from(sub)).to.eql(['d', 'e']);
  });

  it('Deleting known elements', function () {
    // eslint-disable-next-line no-invalid-this
    const {ref, sub} = this;

    sub.add('a').add('b');
    sub.delete('a');
    ref.delete('b');

    expect(Array.from(ref)).to.eql(['a', 'c']);
    expect(Array.from(sub)).to.eql([]);
  });

  it('Deleting unknown elements', function () {
    // eslint-disable-next-line no-invalid-this
    const {ref, sub, a} = this;

    sub.add('a').add('b');
    sub.delete('d');
    ref.delete('e');

    expect(Array.from(ref)).to.eql(a);
    expect(Array.from(sub)).to.eql(['a', 'b']);
  });

  it('Clearing', function () {
    // eslint-disable-next-line no-invalid-this
    const {ref, sub, a} = this;

    sub.add('a').add('b');
    sub.clear();

    expect(Array.from(ref)).to.eql(a);
    expect(Array.from(sub)).to.eql([]);

    sub.add('a').add('b');

    expect(Array.from(ref)).to.eql(a);
    expect(Array.from(sub)).to.eql(['a', 'b']);

    ref.clear();

    expect(Array.from(ref)).to.eql([]);
    expect(Array.from(sub)).to.eql([]);
  });

  it('Checking existence of elements', function () {
    // eslint-disable-next-line no-invalid-this
    const {ref, sub} = this;

    sub.add('a').add('b');

    expect(ref.has('a')).to.be.true;
    expect(ref.has('b')).to.be.true;
    expect(ref.has('c')).to.be.true;

    expect(sub.has('a')).to.be.true;
    expect(sub.has('b')).to.be.true;
    expect(sub.has('c')).to.be.false;

    sub.delete('a');

    expect(ref.has('a')).to.be.true;
    expect(ref.has('b')).to.be.true;
    expect(ref.has('c')).to.be.true;

    expect(sub.has('a')).to.be.false;
    expect(sub.has('b')).to.be.true;
    expect(sub.has('c')).to.be.false;

    ref.delete('b');

    expect(ref.has('a')).to.be.true;
    expect(ref.has('b')).to.be.false;
    expect(ref.has('c')).to.be.true;

    expect(sub.has('a')).to.be.false;
    expect(sub.has('b')).to.be.false;
    expect(sub.has('c')).to.be.false;
  });

  it('Checking size', function () {
    // eslint-disable-next-line no-invalid-this
    const {ref, sub} = this;

    sub.add('a').add('b');

    expect(ref.size).to.eql(3);
    expect(sub.size).to.eql(2);

    sub.delete('a');

    expect(ref.size).to.eql(3);
    expect(sub.size).to.eql(1);

    ref.delete('b');

    expect(ref.size).to.eql(2);
    expect(sub.size).to.eql(0);
  });

  it('Looping', function () {
    // eslint-disable-next-line no-invalid-this
    const {ref, sub, a} = this;
    let i: number;

    sub.add('a').add('b');

    i = 0;
    ref.forEach((value: string) => {
      expect(value).to.equal(a[i]);
      i++;
    });

    i = 0;
    sub.forEach((value: string) => {
      expect(value).to.equal(['a', 'b'][i]);
      i++;
    });

    sub.delete('a');

    i = 0;
    ref.forEach((value: string) => {
      expect(value).to.equal(a[i]);
      i++;
    });

    i = 0;
    sub.forEach((value: string) => {
      expect(value).to.equal(['b'][i]);
      i++;
    });

    ref.delete('b');

    i = 0;
    ref.forEach((value: string) => {
      expect(value).to.equal(['a','c'][i]);
      i++;
    });

    i = 0;
    sub.forEach((value: string) => {
      expect(value).to.equal([][i]);
      i++;
    });
  });

  it('Iterators', function () {
    // eslint-disable-next-line no-invalid-this
    const {ref, sub} = this;

    function init (s: Set<string>) {
      return {
        i1: s[Symbol.iterator](),
        i2: s.keys(),
        i3: s.values(),
        i4: s.entries(),
      };
    }

    function run (s: Set<string>) {
      const {i1, i2, i3, i4} = init(s);

      let size = s.size;
      expect(size).to.be.above(0);

      let stop = false;
      do {
        size--;

        const {value, done} = i1.next();
        stop = done;

        expect(value).to.equal(i2.next().value);
        expect(value).to.equal(i3.next().value);
        expect([value, value]).to.eql(i4.next().value);
      } while (!stop);

      expect(size).to.equal(-1);
    }

    sub.add('a').add('b').add('c');

    run(ref);
    run(sub);

    sub.delete('a');

    run(ref);
    run(sub);

    ref.delete('b');

    run(ref);
    run(sub);
  });
});
