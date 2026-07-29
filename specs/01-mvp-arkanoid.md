# SPEC 01 — MVP jugable de Arkanoid

> **Status:** Draft
> **Depends on:** ninguno
> **Date:** 2026-07-28
> **Objective:** Implementar un Arkanoid de una sola pantalla y un solo nivel, jugable de principio a fin con paddle controlado por teclado/mouse/touch, física simple, puntaje básico y overlay de fin de partida con reinicio.

## Scope

**In:**

- Canvas único de 800×600 píxeles, un solo nivel fijo.
- Grid de bloques de 10 columnas × 6 filas, un color distinto por fila (de la paleta disponible en `assets/spritesheet.js`).
- Cada bloque otorga 10 puntos al romperse, sin importar el color.
- Paddle controlable simultáneamente por teclado (flechas izquierda/derecha), mouse (mover actualiza posición X) y touch (arrastrar el dedo actualiza posición X).
- Bola que arranca pegada al paddle y se lanza con tecla espacio, click o tap.
- Física simple y predecible: velocidad constante, rebote reflejado en paredes, paddle y bloques (sin ángulos variables por punto de impacto).
- 3 vidas. Al caer la bola por debajo del paddle, se pierde una vida y la bola se reposiciona en el paddle en pausa, esperando nuevo lanzamiento.
- Al romper un bloque, este desaparece de inmediato (sin animación ni sonido).
- Overlay superpuesto al canvas (sin cambiar de pantalla) al ganar (se destruyen todos los bloques) o perder (0 vidas), con botón de reinicio (funciona con click/tap) y atajo de tecla Enter.
- Reinicio que reinicia la partida completa: bloques, vidas, score y posición de la bola desde cero.
- Archivos nuevos: `index.html`, `css/style.css`, `js/game.js`.

**Out of scope (for future specs):**

- Múltiples niveles o progresión de dificultad.
- Persistencia de high scores entre sesiones.
- Power-ups.
- Audio (sonidos de rebote/rotura, música de fondo, control de volumen/mute).
- Animación de explosión al romper bloques.
- Pantallas completas separadas de victoria/derrota (solo overlay).
- Física avanzada (ángulo de rebote según punto de impacto en el paddle).

## Data model

```js
// Estado global del juego
const state = {
  score: 0,
  lives: 3,
  status: 'ready', // 'ready' (bola pegada al paddle) | 'playing' | 'won' | 'lost'
};

// Paddle
const paddle = {
  x: 320, y: 560, w: 162, h: 14, // w/h según SPRITES.paddle
};

// Bola
const ball = {
  x: 400, y: 546, w: 16, h: 16, // w/h según SPRITES.ball
  vx: 0, vy: 0, // velocidad fija en px/frame, se define al lanzar
  attached: true, // true mientras está pegada al paddle
};

// Bloques: grid de 10 columnas x 6 filas
// blocks[row][col] = null si ya fue destruido
const blockColors = [ 'red', 'yellow', 'cyan', 'magenta', 'hotpink', 'green' ]; // una por fila
const blocks = []; // 6 filas x 10 columnas de { x, y, w, h, color }
```

Convenciones:

- Coordenadas: origen arriba-izquierda, igual que el canvas.
- Velocidades en píxeles por frame (no por segundo).
- Un bloque roto se elimina de inmediato del grid (`blocks[row][col] = null`), sin animación intermedia.

## Implementation plan

1. Crear `index.html` con el `<canvas>` de 800×600, enlazando `css/style.css`, `assets/spritesheet.js` y `js/game.js`. Prueba manual: abrir en el navegador, ver el canvas vacío sin errores en consola.
2. Crear `css/style.css` con estilos básicos para centrar el canvas en la página. Prueba manual: recargar y ver el canvas centrado.
3. En `js/game.js`, inicializar el contexto 2D, cargar el spritesheet (`loadSpritesheet`) y dibujar el estado inicial estático: paddle, bola pegada al paddle, y el grid completo de bloques (10×6, colores por fila). Prueba manual: recargar y ver paddle, bola y bloques dibujados en su posición inicial.
4. Implementar el movimiento del paddle con teclado (flechas), mouse (`mousemove`) y touch (`touchmove`), limitando su posición a los bordes del canvas. Prueba manual: mover el paddle con teclado, luego con mouse, luego con touch (o emulador táctil del navegador), y confirmar que responde a los tres.
5. Implementar el lanzamiento de la bola (espacio/click/tap) y su física simple: velocidad constante, rebote reflejado en paredes laterales/superior y en el paddle. Prueba manual: lanzar la bola y verla rebotar contra paredes y paddle indefinidamente.
6. Implementar la colisión bola-bloque: al golpear un bloque, este desaparece del grid, rebota la bola, y se suman 10 puntos al score (mostrado en pantalla). Prueba manual: romper varios bloques y ver el score incrementar.
7. Implementar la pérdida de vida: si la bola cae debajo del paddle, se resta una vida, la bola se reposiciona pegada al paddle en pausa (`status: 'ready'`), y si las vidas llegan a 0 se muestra el overlay de derrota. Prueba manual: dejar caer la bola 3 veces y ver el overlay de "perdiste".
8. Implementar la condición de victoria: cuando todos los bloques del grid han sido destruidos, se muestra el overlay de victoria. Prueba manual: romper todos los bloques y ver el overlay de "ganaste".
9. Implementar el botón de reinicio del overlay (click/tap) y el atajo de tecla Enter, que reinician por completo el estado (bloques, vidas, score, bola, status). Prueba manual: ganar o perder, reiniciar, y confirmar que el juego vuelve al estado inicial jugable.

## Acceptance criteria

- [ ] El juego carga en el navegador sin errores en la consola.
- [ ] El canvas mide exactamente 800×600 píxeles.
- [ ] Se renderiza un grid de 10 columnas × 6 filas de bloques, con un color distinto por fila.
- [ ] El paddle se mueve con las flechas de teclado.
- [ ] El paddle se mueve al mover el mouse sobre el canvas.
- [ ] El paddle se mueve al arrastrar el dedo sobre el canvas (touch).
- [ ] La bola arranca pegada al paddle y se lanza al presionar espacio, hacer click, o tocar la pantalla.
- [ ] La bola rebota de forma predecible contra paredes, paddle y bloques.
- [ ] Al golpear un bloque, este desaparece inmediatamente y el score aumenta exactamente en 10 puntos.
- [ ] Si la bola cae debajo del paddle, se resta una vida y la bola se reposiciona pegada al paddle en pausa.
- [ ] Al llegar a 0 vidas, aparece un overlay de derrota sobre el canvas.
- [ ] Al destruir todos los bloques, aparece un overlay de victoria sobre el canvas.
- [ ] El overlay incluye un botón de reinicio funcional con click y con tap.
- [ ] Presionar Enter con el overlay visible también reinicia el juego.
- [ ] Reiniciar restaura bloques, vidas, score y posición de la bola al estado inicial.

## Decisions

- **Yes:** un solo nivel fijo (grid 10×6). Es más que suficiente para un MVP jugable.
- **No:** múltiples niveles o progresión de dificultad. Queda para un spec futuro.
- **Yes:** 3 vidas, con reposición de la bola en el paddle (pausa) al perder una vida en lugar de terminar el juego de inmediato.
- **Yes:** control simultáneo de paddle por teclado, mouse y touch. El usuario quiere que todos funcionen a la vez, no exclusivos.
- **Yes:** score plano de 10 puntos por bloque sin importar el color. Simplifica el MVP.
- **No:** animación de explosión al romper bloques. El usuario decidió que desaparecer de inmediato es suficiente para el MVP.
- **No:** audio (sonidos de rebote/rotura). El usuario decidió no implementar audio en este MVP, aunque los assets existen.
- **Yes:** overlay superpuesto al canvas para victoria/derrota en vez de pantallas separadas. Mantiene el juego en una sola vista.
- **Yes:** física simple y predecible (rebote reflejado fijo), sin ángulo variable según punto de impacto en el paddle. Fiel al Arkanoid clásico sin complejidad extra.
- **Yes:** reinicio total del estado (bloques, vidas, score, bola) desde el overlay, con botón y atajo Enter.
- **No:** persistencia de high scores entre sesiones. Fuera de alcance del MVP.
- **Yes:** estructura de 3 archivos separados (`index.html`, `css/style.css`, `js/game.js`) en vez de todo-en-uno, para dejar el proyecto ordenado desde el inicio.

## Risks

| Risk | Mitigation |
| --- | --- |
| Eventos de mouse y touch disparándose ambos en dispositivos híbridos (laptops táctiles), causando saltos del paddle | Usar `touchmove`/`touchstart` con `preventDefault` y verificar que no se dupliquen listeners; probar en un dispositivo real o emulador táctil del navegador. |
| Tunneling: a velocidad fija alta la bola podría atravesar el paddle o un bloque delgado sin detectar colisión | Mantener una velocidad de bola moderada y hacer la detección de colisión por frame contra el rectángulo completo del paddle/bloque, no solo por punto. |
| El spritesheet no ha cargado (`loadSpritesheet` es asíncrono) cuando arranca el loop de juego | Iniciar el loop de renderizado solo dentro del callback de `loadSpritesheet`. |

## What is **not** in this spec

- Múltiples niveles o progresión de dificultad.
- Persistencia de high scores entre sesiones.
- Power-ups.
- Audio (sonidos de rebote/rotura, música de fondo, control de volumen/mute).
- Animación de explosión al romper bloques.
- Pantallas completas separadas de victoria/derrota (solo overlay).
- Física avanzada (ángulo de rebote según punto de impacto en el paddle).

Cada uno de estos, si se implementa, va en su propio spec.
