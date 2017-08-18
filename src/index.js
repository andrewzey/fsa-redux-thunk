import { isFSA } from 'flux-standard-action';

function isThunk(payload) {
  return typeof payload === 'function';
}

function createFsaThunkMiddleWare(extraArgument) {
  return ({ dispatch, getState }) => next => (action) => {
    if (isFSA(action) && isThunk(action.payload)) {
      dispatch(Object.assign({}, action, {
        payload: action.meta && action.meta.preThunkPayload
          ? action.meta.preThunkPayload
          : null,
      }));
      return action.payload(dispatch, getState, extraArgument);
    }
    return next(action);
  };
}

const fsaThunk = createFsaThunkMiddleWare();
fsaThunk.withExtraArgument = createFsaThunkMiddleWare;

export default fsaThunk;
