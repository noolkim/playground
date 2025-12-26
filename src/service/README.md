# Service Layer

이 폴더는 zustand, react-query, ky 라이브러리를 wrapping한 서비스 레이어입니다.

## 구조

```
service/
├── http/           # HTTP Client (ky)
│   ├── client.ts   # API 클라이언트 설정
│   ├── types.ts    # HTTP 관련 타입
│   └── index.ts    # Export
├── query/          # React Query
│   ├── client.ts   # QueryClient 설정
│   ├── provider.tsx # QueryClientProvider
│   ├── hooks.ts    # 커스텀 훅
│   └── index.ts    # Export
└── store/          # Zustand Store
    ├── createStore.ts # 스토어 생성 헬퍼
    ├── types.ts    # 스토어 관련 타입
    ├── exampleStore.ts # 사용 예시
    └── index.ts    # Export
```

## 사용 방법

### 1. HTTP Client (ky)

```typescript
import { api } from '@/service/http';

// GET 요청
const users = await api.get<User[]>('/users');

// POST 요청
const newUser = await api.post<User>('/users', { name: 'John' });

// PUT 요청
const updatedUser = await api.put<User>('/users/1', { name: 'Jane' });

// DELETE 요청
await api.delete('/users/1');

// PATCH 요청
const patchedUser = await api.patch<User>('/users/1', { name: 'Bob' });
```

### 2. React Query

#### Provider 설정
`app/layout.tsx`에 이미 `QueryProvider`가 추가되어 있습니다.

#### Query 사용

```typescript
'use client';

import { useApiQuery } from '@/service/query';

function UsersList() {
    const { data, isLoading, error } = useApiQuery<User[]>(
        ['users'],
        '/users'
    );

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <ul>
            {data?.map((user) => (
                <li key={user.id}>{user.name}</li>
            ))}
        </ul>
    );
}
```

#### Mutation 사용

```typescript
'use client';

import { useApiMutation } from '@/service/query';

function CreateUser() {
    const mutation = useApiMutation<User, { name: string }>('/users', 'post', {
        onSuccess: (data) => {
            console.log('User created:', data);
        },
    });

    const handleSubmit = () => {
        mutation.mutate({ name: 'John' });
    };

    return (
        <button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating...' : 'Create User'}
        </button>
    );
}
```

### 3. Zustand Store

```typescript
import { createAppStore } from '@/service/store';

interface CounterState {
    count: number;
    increment: () => void;
    decrement: () => void;
}

export const useCounterStore = createAppStore<CounterState>(
    (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
        decrement: () => set((state) => ({ count: state.count - 1 })),
    }),
    {
        name: 'counter-store',
        persist: true, // localStorage에 저장
        devtools: true, // Redux DevTools 지원
        subscribe: false,
    }
);

// 컴포넌트에서 사용
function Counter() {
    const { count, increment, decrement } = useCounterStore();
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={increment}>+</button>
            <button onClick={decrement}>-</button>
        </div>
    );
}
```

## 설정

### HTTP Client 설정

환경 변수를 통해 API 기본 URL을 설정할 수 있습니다:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

또는 `src/service/http/client.ts`에서 직접 수정할 수 있습니다.

### React Query 설정

`src/service/query/client.ts`에서 QueryClient의 기본 옵션을 수정할 수 있습니다.

### Zustand Store 설정

`createAppStore`의 두 번째 인자로 다음 옵션을 설정할 수 있습니다:

- `name`: 스토어 이름 (필수)
- `persist`: localStorage에 저장 여부 (기본값: false)
- `devtools`: Redux DevTools 지원 여부 (기본값: true, 개발 환경에서만)
- `subscribe`: 선택적 구독 지원 여부 (기본값: false)

## 인증 토큰

HTTP Client는 자동으로 `localStorage`에서 `authToken`을 읽어 Authorization 헤더에 추가합니다.

토큰을 설정하려면:

```typescript
localStorage.setItem('authToken', 'your-token-here');
```

