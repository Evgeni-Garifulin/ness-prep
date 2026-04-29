# 3. JavaScript fundamentals

## Event loop / async

1. Что такое event loop?
2. Чем task отличается от microtask?
3. В каком порядке выполнятся setTimeout, Promise.then, queueMicrotask, requestAnimationFrame?
4. Когда браузер получает шанс на paint?
5. Почему бесконечная microtask queue может заблокировать UI?
6. Чем Promise.all, Promise.allSettled, Promise.race, Promise.any отличаются друг от друга?
7. Как реализовать retry с backoff?
8. Как отменить fetch-запрос?
9. Что такое race condition в async-коде?
10. Как защититься от stale response в React-компоненте?
11. Что происходит при await внутри цикла?
12. Когда лучше использовать parallel execution, а когда sequential?
13. Как ограничить concurrency для пачки async-задач?
14. Что такое debounce и throttle?
15. Чем debounce отличается от throttle?
16. Где лучше использовать requestAnimationFrame?
17. Где лучше использовать requestIdleCallback?
18. Что такое starvation в контексте event loop?
19. Почему setTimeout(fn, 0) не выполняется сразу?
20. Что произойдёт при ошибке внутри async-функции без try/catch?

## Closures / scope / memory

1. Что такое closure?
2. Где closures приводят к багам?
3. Что такое stale closure?
4. Почему stale closure часто возникает в React hooks?
5. Как избежать stale closure в обработчиках событий?
6. Как работают lexical scope и scope chain?
7. Чем var, let, const отличаются с точки зрения scope?
8. Что такое temporal dead zone?
9. Как closures могут удерживать память?
10. Как найти memory leak в JavaScript?
11. Что может помешать garbage collection?
12. Чем shallow copy отличается от deep copy?
13. Что такое structured cloning?
14. Какие проблемы есть у JSON.parse(JSON.stringify(obj))?
15. Как сравнивать объекты?
16. Что такое referential equality?
17. Почему мутация объекта может сломать React-rendering?
18. Что такое immutability и зачем она нужна?
19. Как работает WeakMap?
20. Когда использовать Map, а когда обычный object?

## Prototypes / objects / classes

1. Что такое prototype chain?
2. Как работает this?
3. Чем arrow function отличается от обычной функции?
4. Что делают call, apply, bind?
5. Как работает new?
6. Чем class в JS отличается от class в классических OOP-языках?
7. Что такое property descriptor?
8. Чем enumerable property отличается от non-enumerable?
9. Что делают Object.create, Object.assign, Object.freeze?
10. Чем == отличается от ===?
11. Что такое coercion?
12. Какие edge cases есть у Number, NaN, Infinity?
13. Что такое optional chaining?
14. Что такое nullish coalescing?
15. Чем || отличается от ??
16. Что такое iterable и iterator?
17. Как работает generator?
18. Что такое symbol?
19. Где используются symbols?
20. Что такое private fields в class?
