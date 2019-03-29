import Muter, {captured} from 'muter';
import {expect} from 'chai';
import GcContainer from '../src/gc-container';

describe('Testing GcContainer', function () {
  const muter = Muter(console, 'log'); // eslint-disable-line new-cap

  it(`Class GcContainer says 'Hello world!'`, captured(muter, function () {
    new GcContainer();
    expect(muter.getLogs()).to.equal('Hello world!\n');
  }));
});
