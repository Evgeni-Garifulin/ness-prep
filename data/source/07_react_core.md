# 5. React core

## Rendering

1. Что такое render phase?
2. Что такое commit phase?
3. Почему render должен быть pure?
4. Что может произойти, если делать side effects во время render?
5. Что вызывает re-render компонента?
6. Почему parent re-render может вызвать child re-render?
7. Как работает reconciliation?
8. Зачем нужны keys?
9. Почему index как key может быть проблемой?
10. Что такое controlled component?
11. Что такое uncontrolled component?
12. Когда использовать controlled input?
13. Что такое batching?
14. Как работает automatic batching?
15. Что такое concurrent rendering?
16. Какие проблемы решает concurrent rendering?
17. Почему React может прерывать rendering?
18. Что такое hydration?
19. Какие бывают hydration mismatches?
20. Как отлаживать лишние re-render'ы?

## Hooks

1. Какие правила hooks?
2. Почему hooks нельзя вызывать условно?
3. Когда нужен useState?
4. Когда нужен useReducer?
5. Когда useReducer лучше useState?
6. Когда нужен useRef?
7. Чем изменение ref отличается от state update?
8. Когда нужен useMemo?
9. Когда useMemo вреден?
10. Когда нужен useCallback?
11. Когда useCallback бесполезен?
12. Когда нужен React.memo?
13. Почему memoization не должна быть дефолтной реакцией на performance-проблемы?
14. Что такое stale closure в hook?
15. Как избежать stale state update?
16. Когда использовать functional state update?
17. Как проектировать custom hooks?
18. Что должно быть внутри custom hook, а что снаружи?
19. Как тестировать custom hook?
20. Как не превратить custom hook в hidden global state?

## Effects

1. Для чего нужен useEffect?
2. Когда useEffect не нужен?
3. Что значит "synchronize with external system"?
4. Почему derived state через effect часто плохой паттерн?
5. Как правильно указывать dependencies?
6. Почему ESLint exhaustive-deps важен?
7. Когда можно осознанно убрать dependency?
8. Что делать, если dependency постоянно меняется?
9. Как избежать infinite effect loop?
10. Как правильно делать cleanup?
11. Как отменять async work в effect?
12. Как избежать race condition в effect?
13. Когда нужен useLayoutEffect?
14. Чем useLayoutEffect отличается от useEffect?
15. Что происходит с effects в Strict Mode?
16. Почему effect может выполниться дважды в dev?
17. Как писать idempotent effects?
18. Как работать с subscriptions?
19. Как работать с timers?
20. Как работать с DOM listeners?

## React 18+ / concurrency

1. Что такое useTransition?
2. Когда использовать startTransition?
3. Чем urgent update отличается от transition update?
4. Что такое useDeferredValue?
5. Чем useDeferredValue отличается от debounce?
6. Чем useDeferredValue отличается от useTransition?
7. Когда использовать Suspense?
8. Какие проблемы решает Suspense?
9. Какие риски у Suspense?
10. Что такое useSyncExternalStore?
11. Когда нужен useSyncExternalStore?
12. Почему external store нельзя просто читать из module variable?
13. Как сделать store compatible with concurrent rendering?
14. Как React Strict Mode помогает находить проблемы?
15. Что такое tearing?
16. Как избежать tearing?
17. Как проектировать subscription-based state?
18. Как concurrent rendering влияет на side effects?
19. Какие performance-проблемы не решаются concurrency APIs?
20. Когда concurrency API будет overkill?
