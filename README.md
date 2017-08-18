FSA Redux Thunk
=============

Fork of [`redux-thunk` middleware](https://github.com/gaearon/redux-thunk) that enforces
[Flux Standard Actions](https://github.com/acdlite/flux-standard-action).

[![build status](https://img.shields.io/travis/andrewzey/fsa-redux-thunk/master.svg?style=flat-square)](https://travis-ci.org/andrewzey/fsa-redux-thunk)
[![npm version](https://img.shields.io/npm/v/fsa-redux-thunk.svg?style=flat-square)](https://www.npmjs.com/package/fsa-redux-thunk)
[![npm downloads](https://img.shields.io/npm/dm/fsa-redux-thunk.svg?style=flat-square)](https://www.npmjs.com/package/fsa-redux-thunk)

## Installation

```
npm install --save redux-thunk
```

or

```js
yarn add fsa-redux-thunk
```

Then, to enable Redux Thunk, use [`applyMiddleware()`](http://redux.js.org/docs/api/applyMiddleware.html):

```js
import { createStore, applyMiddleware } from 'redux';
import FsaThunk from 'fsa-redux-thunk';
import rootReducer from './reducers/index';

// Note: this API requires redux@>=3.1.0
const store = createStore(
  rootReducer,
  applyMiddleware(FsaThunk)
);
```

## Usage with [`redux-actions` FSA library](https://github.com/acdlite/redux-actions)

### Dispatching `null` initial payload
```js
import { createAction } from 'redux-actions';

const fetchSomeApiSuccess = createAction('FETCH_SOME_API_SUCCESS');
const fetchSomeApiFailure = createAction('FETCH_SOME_API_FAILURE');
const fetchSomeApiRequest = createAction('FETCH_SOME_API_REQUEST', () => dispatch => {
  return fetch
    .get('some/url')
    .catch(err => {
      dispatch(fetchSomeApiFailure(err));
      throw err;
    })
    .then(data => dispatch(fetchSomeApiSuccess(data)));
});
```

Calling:

```js
store.dispatch(fetchSomeApiRequest(true));
```

will dispatch an FSA action with this shape first, then will execute the
payload creator function defined as the second argument to `createAction`:

```js
{ type: 'FETCH_SOME_API_REQUEST', payload: null }
```

### Dispatching WITH initial payload
In order to dispatch the initial request action (`FETCH_SOME_API_REQUEST` in our example),
we must provide the value in the `meta` field, as follows (the third argument to
`createAction`):

```js
import { createAction } from 'redux-actions';

const fetchSomeApiSuccess = createAction('FETCH_SOME_API_SUCCESS');
const fetchSomeApiFailure = createAction('FETCH_SOME_API_FAILURE');
const fetchSomeApiRequest = createAction(
  // action type
  'FETCH_SOME_API_REQUEST',
  // payload creator function
  payload => dispatch => {
    return fetch
      .get('some/url')
      .catch(err => {
        dispatch(fetchSomeApiFailure(err));
        throw err;
      })
      .then(data => dispatch(fetchSomeApiSuccess(data)));
  },
  // meta creator function
  payload => ({ preThunkPayload: payload }),
);
```

Calling:

```js
store.dispatch(fetchSomeApiRequest('foobar'));
```

will dispatch an FSA action with this shape first, then will execute the
payload creator function defined as the second argument to `createAction`:

```js
{ type: 'FETCH_SOME_API_REQUEST', payload: 'foobar' }
```



## License

MIT
