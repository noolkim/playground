/**
 * Zustand Store 사용 예시
 * 
 * 이 파일은 예시입니다. 실제 사용 시 삭제하거나 참고용으로 사용하세요.
 */

import { createAppStore } from './createStore';

interface ExampleState {
    count: number;
    increment: () => void;
    decrement: () => void;
    reset: () => void;
}

export const useExampleStore = createAppStore<ExampleState>(
    (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
        decrement: () => set((state) => ({ count: state.count - 1 })),
        reset: () => set({ count: 0 }),
    }),
    {
        name: 'example-store',
        persist: true, // localStorage에 저장
        devtools: true, // Redux DevTools 지원
        subscribe: false, // 선택적 구독
    }
);

