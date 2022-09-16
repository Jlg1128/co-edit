import lodash from 'lodash';
import counterSlice from './count';

let slices = [
  counterSlice,
];

const actualReducers = {};

function undoable(reducer, initialState) {
  console.log(initialState);
  initialState.past = [];
  initialState.future = [];
  initialState.present = initialState;

  // eslint-disable-next-line @typescript-eslint/default-param-last
  return (state = initialState, action) => {
    const { past, present, future } = state;
    let previous, newPast, newFuture, newPresent;
    switch (action.type) {
      case 'undo':
        previous = past[past.length - 1];
        newPast = past.slice(0, past.length - 1);
        return {
          ...state,
          past: newPast,
          ...previous,
          future: [present, ...future],
        };
      case 'redo':
        previous = future[0];
        newFuture = future.slice(1);
        return {
          ...state,
          past: [...past, present],
          ...previous,
          future: newFuture,
        };
      default:
        newPresent = reducer(present, action);
        if (present === newPresent) {
          return state;
        }
        return {
          ...state,
          past: [...past, present],
          ...newPresent,
          future: [],
        };
    }
  };
}

slices.forEach((slice) => {
  console.log('slice', slice.getInitialState());
  let initialState = slice.getInitialState();
  actualReducers[slice.name] = undoable(slice.reducer, JSON.parse(JSON.stringify(initialState)));
});

export default actualReducers;