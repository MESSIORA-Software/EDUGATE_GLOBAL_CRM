import { configureStore } from '@reduxjs/toolkit';
import roleReducer from './reducers/Admin/roleReducer';
import authReducer from './reducers/Auth/authReducer';

export const store = configureStore({
  reducer: {
    roles: roleReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
