import { configureStore } from '@reduxjs/toolkit';
import roleReducer from './reducers/Admin/roleReducer';
import userReducer from './reducers/Admin/userReducer';

export const store = configureStore({
  reducer: {
    roles: roleReducer,
    users: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
