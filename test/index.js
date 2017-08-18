/* eslint-env mocha */
import { createAction } from 'redux-actions';
import fsaThunk from '../src/index';
import chai, { expect } from 'chai';
import { spy } from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

describe('Redux FSA Thunk Middleware', () => {
  it('is a function', () => {
    expect(fsaThunk).to.be.function;
  });

  describe('returns a next handler', () => {
    const dispatchSpy = spy();
    const getStateSpy = spy();
    const store = { dispatch: dispatchSpy, getState: getStateSpy };
    const nextHandler = fsaThunk(store);

    it('is a function', () => {
      expect(nextHandler).to.be.function;
    });

    describe('returns an action handler', () => {
      const nextSpy = spy();
      const actionHandler = nextHandler(nextSpy);

      beforeEach(() => {
        nextSpy.reset();
      });

      it('is a function', () => {
        expect(actionHandler).to.be.function;
      });

      it('passes non-FSA actions', () => {
        const nonFsaAction = { random: 'stuff' };
        actionHandler(nonFsaAction);
        expect(nextSpy).to.have.been.called;
        expect(nextSpy).to.have.been.calledWith(nonFsaAction);
      });

      it('passes non-thunk FSA actions', () => {
        const fsaNonThunkAction = createAction('FSA_ACTION')();
        actionHandler(fsaNonThunkAction);
        expect(nextSpy).to.have.been.called;
        expect(nextSpy).to.have.been.calledWith(fsaNonThunkAction);
      });

      describe('handles thunk FSA actions', () => {
        const thunkSpy = spy();
        const fsaThunkAction = createAction('FSA_THUNK', () => thunkSpy)();

        beforeEach(() => {
          nextSpy.reset();
          dispatchSpy.reset();
          getStateSpy.reset();
          thunkSpy.reset();
          actionHandler(fsaThunkAction);
        });

        it('does not pass the action', () => {
          expect(nextSpy).to.not.have.been.called;
        });

        it('dispatches the action', () => {
          expect(dispatchSpy).to.have.been.called;
          expect(dispatchSpy).to.have.been.calledWith({
            type: fsaThunkAction.type,
            payload: null,
          });
        });

        it('dispatches with preThunkPayload, if defined in meta', () => {
          const localFsaThunkAction = createAction(
            'FSA_THUNK',
            () => thunkSpy,
            payload => ({ preThunkPayload: payload })
          )('foo');
          actionHandler(localFsaThunkAction);
          expect(dispatchSpy).to.have.been.called;
          expect(dispatchSpy).to.have.been.calledWith({
            type: fsaThunkAction.type,
            payload: 'foo',
            meta: { preThunkPayload: 'foo' },
          });
        });

        it('calls the thunk with dispatch and getState', () => {
          expect(thunkSpy).to.have.been.called;
          expect(thunkSpy).to.have.been.calledWith(dispatchSpy, getStateSpy);
        });
      });
    });
  });

  describe('withExtraArgument', () => {
    it('must pass the third argument', (done) => {
      const dispatchSpy = spy();
      const getStateSpy = spy();
      const store = { dispatch: dispatchSpy, getState: getStateSpy };
      const extraArg = { lol: true };
      const nextHandler = fsaThunk.withExtraArgument(extraArg)(store);
      const nextSpy = spy();
      const actionHandler = nextHandler(nextSpy);
      actionHandler({
        type: 'FSA_THUNK',
        payload: (dispatch, getState, arg) => {
          expect(dispatch).to.equal(dispatchSpy);
          expect(getState).to.equal(getStateSpy);
          expect(arg).to.equal(extraArg);
          done();
        },
      });
    });
  });

  describe('handle errors', () => {
    it('must throw if argument is non-object', () => {
      expect(() => fsaThunk()).to.throw(Error);
    });
  });
});
