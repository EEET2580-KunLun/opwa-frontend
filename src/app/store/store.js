import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { encryptTransform } from 'redux-persist-transform-encrypt';
import { combineReducers } from 'redux';
import authReducer from '../../modules/auth/store/authSlice';
import {apiSlice} from "../config/api/apiSlice.js";
import staffReducer from '../../modules/staff/store/staffSlice';
import lineReducer from '../../modules/line/store/lineSlice';
import stationReducer from '../../modules/station/store/stationSlice';
import ticketReducer from '../../modules/ticket/store/ticketSlice';
import { ticketApi } from '../../modules/ticket/store/ticketApiSlice';
import { setupListeners } from '@reduxjs/toolkit/query';

// Create the encryption transform
const encryptor = encryptTransform({
    secretKey: import.meta.env.VITE_ENCRYPTION_KEY || 'fallback-key',
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

// Define root reducer that handles reset
const rootReducer = (state, action) => {
    // Check if the action is RESET_STATE
    if (action.type === 'RESET_STATE') {
        // Reset the state to undefined, which will trigger the persistReducer to reset
        state = undefined;
    }

    // Continue with the regular combined reducers
    return combineReducers({
        auth: authReducer,
        [apiSlice.reducerPath]: apiSlice.reducer,
        [ticketApi.reducerPath]: ticketApi.reducer,
        staff: staffReducer,
        line: lineReducer,
        station: stationReducer,
        ticket: ticketReducer,
    })(state, action);
};

// Apply persistence to the entire root reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

//
// // Apply persistence to the entire root reducer
// const persistedReducer = persistReducer(persistConfig,
//     combineReducers({
//         auth: authReducer,
//         [apiSlice.reducerPath]: apiSlice.reducer,
//         staff: staffReducer,
//     })
// );

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
    })
        .concat(apiSlice.middleware)
        .concat(ticketApi.middleware),
    devTools: true
});

export const persistor = persistStore(store);