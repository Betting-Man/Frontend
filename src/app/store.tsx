import { configureStore } from '@reduxjs/toolkit';
import singleReducer from '../features/single/singleSlice';

const store = configureStore({
    reducer: {
        single : singleReducer
    },
  });
  
  export type RootState = ReturnType<typeof store.getState>;
  export default store;