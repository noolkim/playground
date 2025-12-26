import {
    create,
    type StateCreator,
    type StoreApi,
    type UseBoundStore,
} from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import type { StoreConfig } from './types';

export function createAppStore<T extends object>(
    storeCreator: StateCreator<T>,
    config?: StoreConfig<T>
): UseBoundStore<StoreApi<T>> {
    const {
        name,
        persist: usePersist = false,
        devtools: useDevtools = true,
        subscribe: useSubscribe = false,
    } = config || {};

    let store = storeCreator;

    // Subscribe middleware
    if (useSubscribe) {
        store = subscribeWithSelector(store as any) as StateCreator<T>;
    }

    // Persist middleware
    if (usePersist) {
        store = persist(store as any, {
            name: name || 'app-store',
            partialize: (state) => state as Partial<T>,
        }) as StateCreator<T>;
    }

    // Devtools middleware
    if (useDevtools && process.env.NODE_ENV === 'development') {
        store = devtools(store as any, {
            name: name || 'AppStore',
        }) as StateCreator<T>;
    }

    return create<T>(store);
}

