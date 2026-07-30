# SPEC 03 — Efectos de sonido de rebote y rotura

> **Status:** Approved
> **Depends on:** 02-block-explosion-animation
> **Date:** 2026-07-30
> **Objective:** Reproducir un sonido de rebote (`ball-bounce.mp3`) cada vez que la bola choca contra las paredes, el techo o el paddle, y un sonido de rotura (`break-sound.mp3`) cada vez que se destruye un bloque.

## Scope

**In:**

- Al chocar la bola contra la pared izquierda, la pared derecha, el techo, o el paddle, se reproduce `assets/sounds/ball-bounce.mp3`.
- Al destruirse un bloque (mismo instante en que se dispara la explosión visual del spec 02), se reproduce `assets/sounds/break-sound.mp3`.
- Ambos sonidos suenan a volumen fijo (0.5) y pueden solaparse: si ocurren varios eventos casi simultáneos (varios rebotes o rupturas seguidas), cada uno dispara su propia reproducción sin cortar la anterior.
- Los sonidos se reproducen tanto si el usuario juega con teclado, mouse o touch (no depende del método de control, solo del evento físico).

**Out of scope (para futuros specs):**

- Control de volumen o botón de mute en el HUD.
- Música de fondo.
- Sonidos distintos para victoria/derrota o para perder una vida.
- Sonidos distintos por color de bloque.

## Data model

No se agrega estado nuevo a `state`, `paddle`, `ball` ni `blocks`. Se agregan referencias a los assets de audio y una función helper:

```js
// Sonidos (assets/sounds/*.mp3)
const bounceSound = new Audio("assets/sounds/ball-bounce.mp3");
const breakSound = new Audio("assets/sounds/break-sound.mp3");
bounceSound.volume = 0.5;
breakSound.volume = 0.5;

function playSound(audio) {
  const instance = audio.cloneNode();
  instance.volume = audio.volume;
  instance.play();
}
```

Convención: `playSound()` clona el elemento `Audio` en cada llamada (en vez de reutilizar la misma instancia) para permitir reproducciones solapadas sin cortar sonidos en curso.

## Implementation plan

1. En `js/game.js`, agregar `bounceSound`, `breakSound` y la función `playSound(audio)` (sección Data model). Prueba manual: recargar el juego, no debe haber cambios visibles ni errores en consola.
2. Llamar a `playSound(bounceSound)` en `updateBall()` en cada uno de los tres puntos de rebote: pared izquierda/derecha, techo, y paddle. Prueba manual: lanzar la bola y confirmar que se escucha el sonido de rebote al chocar contra cada pared, el techo y el paddle.
3. Llamar a `playSound(breakSound)` en `checkBlockCollision()` en el mismo punto donde se llama `spawnExplosion(block)`. Prueba manual: romper un bloque y confirmar que se escucha el sonido de rotura junto con la animación de explosión existente.
4. Probar solapamiento: rebotar la bola rápidamente contra varias superficies, y romper varios bloques en sucesión rápida, confirmando que los sonidos se superponen sin cortarse entre sí ni generar errores en consola.

## Acceptance criteria

- [ ] Al chocar la bola contra la pared izquierda, se reproduce `ball-bounce.mp3`.
- [ ] Al chocar la bola contra la pared derecha, se reproduce `ball-bounce.mp3`.
- [ ] Al chocar la bola contra el techo, se reproduce `ball-bounce.mp3`.
- [ ] Al chocar la bola contra el paddle, se reproduce `ball-bounce.mp3`.
- [ ] Al destruirse un bloque, se reproduce `break-sound.mp3` en el mismo instante en que se dispara su animación de explosión.
- [ ] Rebotes o rupturas que ocurren en rápida sucesión producen sonidos superpuestos, sin cortar la reproducción anterior.
- [ ] El juego sigue funcionando sin errores en consola con esta funcionalidad activa.

## Decisions

- **Yes:** `ball-bounce.mp3` se asigna a todo rebote de la bola (paredes, techo y paddle), y `break-sound.mp3` a la destrucción de bloques. Es el mapeo más intuitivo dado los nombres de los assets.
- **Yes:** el paddle también reproduce el sonido de rebote, no solo los límites del canvas. Es lo esperable para el jugador y no hay razón para diferenciarlo de un rebote contra pared.
- **No:** control de volumen o botón de mute en el HUD. Fuera de alcance de esta mejora puntual; queda para un spec futuro si se necesita.
- **Yes:** volumen fijo de 0.5 para ambos sonidos, sin exponer configuración.
- **Yes:** los sonidos se solapan (clonando el elemento `Audio` en cada reproducción) en vez de cortarse entre sí. Es el comportamiento esperado en un juego arcade con eventos rápidos y frecuentes.

## Risks

| Risk                                                                                                                                                                                        | Mitigation                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Los navegadores bloquean el autoplay de audio hasta que ocurre una interacción del usuario; si `playSound()` se llamara antes de esa interacción, la reproducción fallaría silenciosamente. | No es un problema real en este flujo: el primer sonido solo puede dispararse tras lanzar la bola (espacio/click/tap), que ya es una interacción del usuario. Verificar en la prueba manual del paso 2 que no aparecen errores de `NotAllowedError` en consola. |
| Clonar el `Audio` en cada reproducción (`cloneNode`) podría acumular instancias en memoria si se disparan muchísimos eventos por segundo.                                                   | El ritmo de eventos de un Arkanoid (rebotes y roturas) es bajo comparado con el límite práctico del navegador; no se requiere pooling para este alcance.                                                                                                       |

## What is **not** in this spec

- Control de volumen o botón de mute en el HUD.
- Música de fondo.
- Sonidos distintos para victoria/derrota o para perder una vida.
- Sonidos distintos por color de bloque.

Cada uno de estos, si se implementa, va en su propio spec.
