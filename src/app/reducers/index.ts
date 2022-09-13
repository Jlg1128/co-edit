import counterSlice from './count';

let slices = [
  counterSlice,
];

const actualReducers = {};

slices.forEach((slice) => {
  actualReducers[slice.name] = slice.reducer;
});

export default actualReducers;