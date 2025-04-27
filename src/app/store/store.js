// src/app/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { encryptTransform } from 'redux-persist-transform-encrypt';
import { combineReducers } from 'redux';
import authReducer from '../../modules/auth/store/authSlice';

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

const rootReducer = combineReducers({
    auth: authReducer,
    // Add other reducers here
});

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth'], // Only persist auth state
    transforms: [encryptor]
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these actions for serializability check
                ignoredActions: [
                    'persist/PERSIST',
                    'persist/REHYDRATE',
                    'auth/login/rejected'
                ],
            },
        }),
});

export const persistor = persistStore(store);