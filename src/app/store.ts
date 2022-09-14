import { configureStore } from '@reduxjs/toolkit';
import reducers from '@reducers/index';

export default configureStore({
  reducer: reducers,
  devTools: process.env.NODE_ENV === 'development',
});
