import { configureStore } from '@reduxjs/toolkit';
import roleReducer from './reducers/Admin/roleReducer';
import userReducer from './reducers/Admin/userReducer';
import authReducer from './reducers/Auth/authReducer';
import branchReducer from './reducers/Admin/branchReducer';
import clientReducer from './reducers/Admin/clientReducer';
import pipelineReducer from './reducers/Admin/pipelineReducer';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    roles: roleReducer,
    users: userReducer,
    branch: branchReducer,
    client: clientReducer,
    pipeline: pipelineReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
