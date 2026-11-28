import { configureStore } from '@reduxjs/toolkit';
import singleReducer from '../features/single/singleSlice';
import multiReducer from '../features/multi/multiSlice';
import { bindStore, guestMiddleware } from '../features/multi/room';

const store = configureStore({
    reducer: {
        single : singleReducer,
        multi : multiReducer,
    },
    middleware: (getDefault) => getDefault().concat(guestMiddleware),
  });

bindStore(store);

export type RootState = ReturnType<typeof store.getState>;
export default store;
