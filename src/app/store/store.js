// src/app/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { encryptTransform } from 'redux-persist-transform-encrypt';
import { combineReducers } from 'redux';
import authReducer from '../../modules/auth/store/authSlice';
import {apiSlice} from "../config/api/apiSlice.js";
import staffReducer from '../../modules/staff/store/staffSlice';

// Create the encryption transform
const encryptor = encryptTransform({
    secretKey: import.meta.env.REACT_APP_ENCRYPTION_KEY || 'fallback-key',
    onError: function(error) {
        // Handle encryption/decryption errors
        console.error('Encryption error:', error);
        // Return empty state on error to prevent app crash
        return {};
    }
});

// Define the persist configuration
const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth'], // Only persist auth state
    transforms: [encryptor]
};

// Apply persistence to the entire root reducer
const persistedReducer = persistReducer(persistConfig,
    combineReducers({
        auth: authReducer,
        [apiSlice.reducerPath]: apiSlice.reducer,
        staff: staffReducer,
    })
);

// Create the Redux store
export const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware => getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [
                'persist/PERSIST',
                'persist/REHYDRATE',
                'persist/PAUSE',
                'persist/FLUSH',
                'persist/PURGE',
                'persist/REGISTER'
            ]
        }
    }).concat(apiSlice.middleware),
    devTools: true
});

export const persistor = persistStore(store);