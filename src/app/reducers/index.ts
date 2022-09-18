import counterSlice from './count';
import counterSlice2 from './form';

let slices = [
  counterSlice,
  counterSlice2,
];

const actualReducers = {};

function undoable(reducer) {
  // Call the reducer with empty action to populate the initial state
  const initialState = {
    past: [],
    present: reducer(undefined, {}),
    future: [],
  };

  // eslint-disable-next-line @typescript-eslint/default-param-last
  return function (state = initialState, action) {
    const { past, present, future } = state;
    switch (action.type) {
      case 'UNDO': {
        if (!past.length) {
          return state;
        }
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        return {
          past: newPast,
          present: previous,
          future: [present, ...future],
        };
      }
      case 'REDO': {
        if (!future.length) {
          return state;
        }
        const next = future[0];
        const newFuture = future.slice(1);
        return {
          past: [...past, present],
          present: next,
          future: newFuture,
        };
      }
      default: {
        const newPresent = reducer(present, action);
        if (present === newPresent) {
          return state;
        }
        return {
          past: [...past, present],
          present: newPresent,
          future: [],
        };
      }
    }
  };
}

slices.forEach((slice) => {
  actualReducers[slice.name] = undoable(slice.reducer);
});

export default actualReducers;