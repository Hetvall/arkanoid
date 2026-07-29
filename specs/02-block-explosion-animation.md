# SPEC 02 — Animación de explosión al destruir bloques

> **Status:** Approved
> **Depends on:** 01-mvp-arkanoid
> **Date:** 2026-07-29
> **Objective:** Al destruir un bloque, reproducir su animación de explosión de 4 frames (usando EXPLOSION_FRAMES y EXPLOSION_DURATION de assets/spritesheet.js) en lugar de que desaparezca instantáneamente.

## Scope

**In:**

- Al destruirse un bloque, se muestra una animación de explosión de 4 frames en su lugar, usando `EXPLOSION_FRAMES[color]` y repartiendo `EXPLOSION_DURATION` (150ms) entre los 4 frames (~37.5ms cada uno).
- El bloque se marca destruido de inmediato al impacto (igual que hoy): la bola rebota y la colisión física no espera a que termine la animación. La animación es puramente visual, superpuesta sobre la celda vacía.
- Soporte para múltiples explosiones simultáneas en pantalla, cada una con su propio timer independiente.
- Al terminar los 4 frames, la explosión desaparece del todo (la celda queda vacía, sin bloque ni sprite).
- La condición de victoria (overlay "Ganaste") se dispara de inmediato al destruir el último bloque, sin esperar a que termine su animación de explosión.

**Out of scope (para futuros specs):**

- Sonido de explosión/rotura.
- Partículas o efectos adicionales más allá de los 4 frames del spritesheet.
- Animación o efecto distinto al perder la bola o al reiniciar el juego.

## Data model

Se agrega un arreglo de explosiones activas al estado del juego:

```js
// Explosiones activas (animación visual, no afecta colisión)
let explosions = []; // [{ x, y, w, h, color, startTime }]
```

- `x, y, w, h`: posición y tamaño del bloque destruido (se reutiliza el rectángulo del bloque para dibujar el frame).
- `color`: color del bloque destruido, usado para indexar `EXPLOSION_FRAMES[color]`.
- `startTime`: timestamp (`performance.now()` o el `timestamp` del `requestAnimationFrame`) en que se disparó la explosión, usado para calcular qué frame mostrar y cuándo eliminarla del arreglo.

Convención: el frame a mostrar se calcula como `Math.floor((now - startTime) / (EXPLOSION_DURATION / 4))`, y cuando ese índice supera 3, la explosión se elimina de `explosions`.

## Implementation plan

1. En `js/game.js`, agregar el arreglo `explosions = []` y las funciones `spawnExplosion(block)` (agrega una entrada a `explosions` con el rectángulo y color del bloque, y `startTime` actual) y `updateExplosions(now)` (recorre `explosions`, calcula el frame de cada una según `startTime`, y elimina las que ya completaron los 4 frames). Prueba manual: no hay cambio visible aún, pero no debe haber errores en consola.
2. Modificar `checkBlockCollision()` en `js/game.js` para, al detectar el impacto, llamar a `spawnExplosion(block)` antes o junto con marcar `blocks[row][col] = null` (el bloque sigue desapareciendo de inmediato del grid de colisión). Prueba manual: romper un bloque no debe cambiar el comportamiento de rebote ni el score.
3. Agregar `drawExplosions()` en `js/game.js`, que recorre `explosions` y dibuja el frame correspondiente de `EXPLOSION_FRAMES[color]` con `drawFrame(ctx, frame, x, y, w, h)` en la posición del bloque. Prueba manual: aún sin integrar al loop, no debe haber errores.
4. Integrar `updateExplosions(now)` en `update()` y `drawExplosions()` en `draw()` (después de `drawBlocks()`), pasando el `timestamp` de `requestAnimationFrame` a través de `loop(timestamp)`. Prueba manual: romper un bloque y ver la animación de 4 frames de explosión antes de que la celda quede vacía.
5. Verificar que `resetGame()` vacía `explosions = []` al reiniciar, para que no queden animaciones colgadas de la partida anterior. Prueba manual: romper varios bloques, reiniciar a mitad de una explosión (Enter u overlay) y confirmar que no aparecen explosiones fantasma en la nueva partida.

## Acceptance criteria

- [ ] Al destruir un bloque, se reproduce una animación de 4 frames usando `EXPLOSION_FRAMES[color]` en la posición del bloque.
- [ ] La animación completa dura 150ms (cada frame ~37.5ms) antes de desaparecer del todo.
- [ ] El color de la explosión coincide con el color del bloque destruido.
- [ ] La bola rebota y el score aumenta en el mismo frame del impacto, sin esperar a que termine la animación (la física no cambia respecto al spec 01).
- [ ] Es posible ver dos o más explosiones animándose simultáneamente en pantalla si se rompen bloques distintos en sucesión rápida, cada una con su propio timing independiente.
- [ ] Al destruir el último bloque, el overlay de "Ganaste" aparece de inmediato, sin esperar a que termine la animación de ese último bloque.
- [ ] Al reiniciar el juego (botón o Enter), no quedan explosiones de la partida anterior visibles en la nueva partida.
- [ ] El juego sigue funcionando sin errores en consola con esta funcionalidad activa.

## Decisions

- **Yes:** el bloque se marca destruido de inmediato al impacto (colisión libre desde el primer frame); la explosión es puramente visual y no bloquea la física. Consistente con el comportamiento del spec 01 y evita complejizar la detección de colisiones.
- **Yes:** los 150ms de `EXPLOSION_DURATION` se reparten entre los 4 frames (~37.5ms c/u), interpretando el nombre de la constante como duración total de la animación.
- **Yes:** se soportan múltiples explosiones simultáneas mediante un arreglo `explosions`, cada una con su propio `startTime`. Más robusto y no añade complejidad real frente a limitarlo a una sola.
- **Yes:** el color de la explosión coincide con el color del bloque (`EXPLOSION_FRAMES[block.color]`), en vez de usar siempre `gray`. Consistencia visual.
- **Yes:** el overlay de victoria aparece de inmediato al destruir el último bloque, sin esperar a que termine su animación. Mantiene el comportamiento actual de `checkWin()` sin añadir temporizadores adicionales.
- **No:** sonido de explosión. Fuera de alcance, ya excluido en el spec 01.
- **No:** partículas o efectos adicionales más allá de los 4 frames existentes en el spritesheet.

## Risks

| Risk                                                                                                                                                         | Mitigation                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `loop()` actualmente no recibe el `timestamp` de `requestAnimationFrame`; hay que propagarlo a `update()`/`updateExplosions()` sin romper el resto del loop. | Pasar `timestamp` como parámetro de `loop(timestamp)` y reenviarlo a `update(timestamp)`, manteniendo el resto de la lógica intacta. |
| Explosiones que quedan "colgadas" en el arreglo si el juego se reinicia a mitad de la animación.                                                             | `resetGame()` vacía explícitamente `explosions = []`.                                                                                |

## What is **not** in this spec

- Sonido de explosión/rotura.
- Partículas o efectos adicionales más allá de los 4 frames del spritesheet.
- Animación o efecto distinto al perder la bola o al reiniciar el juego.

Cada uno de estos, si se implementa, va en su propio spec.
