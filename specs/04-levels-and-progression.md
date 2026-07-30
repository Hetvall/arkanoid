# SPEC 04 — Niveles y progresión de dificultad

> **Status:** Approved
> **Depends on:** 01-mvp-arkanoid
> **Date:** 2026-07-30
> **Objective:** Agregar 3 niveles jugados en secuencia, cada uno con el mismo grid base pero mayor velocidad de bola y un patrón de bloques distinto, mostrando el nivel actual en el HUD y avanzando al siguiente nivel mediante click/tap/Enter tras el mensaje de "Ganaste" de cada nivel.

## Scope

**In:**

- 3 niveles jugados en secuencia, cada uno con distinta velocidad de bola y distinto patrón de bloques sobre el mismo grid base de 10 columnas × 6 filas:
  - **Nivel 1:** BALL_SPEED = 6 (el actual). Patrón actual: las 60 celdas completas, un color por fila.
  - **Nivel 2:** BALL_SPEED ≈ 7. Patrón tablero de ajedrez: se omite una celda de cada dos, alternando por celda según `(fila + columna) % 2` (aprox. 30 bloques).
  - **Nivel 3:** BALL_SPEED ≈ 8.3. Patrón pirámide invertida: el ancho de bloques por fila crece hacia abajo, centrado horizontalmente — fila 0: 2 bloques, fila 1: 4, fila 2: 6, fila 3: 8, filas 4 y 5: 10 (ancho completo).
  - En los 3 niveles, cada celda con bloque conserva el color de `blockColors[row]` (el color no depende del patrón, solo de la fila).
- El paddle no cambia de tamaño entre niveles; solo cambian la velocidad de bola y el patrón de bloques.
- Al destruir todos los bloques de un nivel que no es el último (nivel 1 o 2), se muestra el overlay "Ganaste" con el botón "Siguiente Nivel". Al hacer click, tap o Enter, se avanza al siguiente nivel: se reconstruye el grid con el patrón y velocidad correspondientes, y la bola vuelve a estar pegada al paddle en pausa (`status: 'ready'`). El score y las vidas se conservan.
- Al destruir todos los bloques del nivel 3 (el último), se muestra el mismo overlay "Ganaste" con el botón "Reiniciar". Al hacer click, tap o Enter, se reinicia el juego completo desde el nivel 1 (mismo comportamiento que el reinicio actual tras derrota).
- El HUD muestra el nivel actual (ej. "Nivel 1 / 3") además del score y las vidas ya existentes.
- Al perder todas las vidas (derrota) en cualquier nivel, se mantiene el comportamiento actual: overlay "Perdiste" con botón "Reiniciar", que reinicia el juego completo desde el nivel 1.

**Out of scope (para futuros specs):**

- Patrones de bloques configurables o generados aleatoriamente.
- Cambios de tamaño de paddle u otras variables de dificultad además de la velocidad de la bola y el patrón de bloques.
- Persistencia del nivel alcanzado o high scores entre sesiones.
- Mensaje distinto a "Ganaste" al completar el nivel 3.

## Data model

Se agrega el nivel actual al `state`, tablas de velocidad por nivel, y una función que determina qué celdas del grid tienen bloque según el nivel:

```js
const state = {
  score: 0,
  lives: 3,
  status: "ready", // 'ready' | 'playing' | 'won' | 'lost'
  level: 1, // 1 | 2 | 3
};

// Velocidad de bola por nivel (índice = level - 1)
const LEVEL_SPEEDS = [6, 7, 8.3];
const MAX_LEVEL = LEVEL_SPEEDS.length; // 3

// Determina si la celda (row, col) tiene bloque en el nivel dado
function isCellActive(level, row, col) {
  if (level === 1) return true; // grid completo
  if (level === 2) return (row + col) % 2 === 0; // tablero de ajedrez
  if (level === 3) {
    // pirámide invertida: ancho creciente hacia abajo, centrado
    const width = Math.min(COLS, 2 * (row + 1));
    const startCol = (COLS - width) / 2;
    return col >= startCol && col < startCol + width;
  }
  return true;
}
```

Convenciones:

- `BALL_SPEED` (constante actual) se reemplaza como fuente de velocidad por `LEVEL_SPEEDS[state.level - 1]`, usado en `launchBall()`.
- `buildBlocks()` usa `isCellActive(state.level, row, col)` para decidir si crea el objeto de bloque o dejar `null` esa celda, en vez de llenar siempre el grid completo.
- `blocks[row][col].color` sigue viniendo de `blockColors[row]`, sin cambios por el patrón.
- `state.level === MAX_LEVEL` determina si el nivel actual es el último, para decidir si el overlay "Ganaste" avanza de nivel o reinicia el juego completo (y qué texto muestra el botón).

## Implementation plan

1. En `js/game.js`, agregar `state.level = 1`, `LEVEL_SPEEDS = [6, 7, 8.3]`, `MAX_LEVEL = LEVEL_SPEEDS.length`, y la función `isCellActive(level, row, col)`. Modificar `launchBall()` para usar `LEVEL_SPEEDS[state.level - 1]` en vez de `BALL_SPEED`. Prueba manual: jugar el nivel 1 y confirmar que la velocidad y el grid completo son idénticos a los actuales.
2. Modificar `buildBlocks()` para que, al construir cada celda, solo agregue el objeto de bloque si `isCellActive(state.level, row, col)` es `true`; si no, deja `null` en esa celda. Prueba manual: cambiar temporalmente `state.level` a 2 o 3 desde la consola y llamar `buildBlocks()` + recargar el dibujo, confirmando que aparece el patrón de tablero de ajedrez o pirámide según corresponda.
3. Modificar `drawHUD()` para mostrar el nivel actual (ej. `Nivel 1 / 3`) junto al score. Prueba manual: recargar el juego y ver el indicador de nivel en el HUD desde el arranque.
4. Agregar la función `nextLevel()`: incrementa `state.level`, reconstruye `blocks` (`buildBlocks()`, que ya usará el patrón del nuevo nivel), vacía `explosions`, reposiciona la bola pegada al paddle (`ball.attached = true`, `vx`/`vy` en 0, `attachBallToPaddle()`), y pone `state.status = 'ready'`. No toca `state.score` ni `state.lives`. Prueba manual: llamar `nextLevel()` desde la consola y confirmar que el grid se reconstruye con el patrón del nivel siguiente, la bola queda pegada al paddle, y el score/vidas no cambian.
5. Modificar `checkWin()` para, al detectar todos los bloques destruidos, mostrar el overlay "Ganaste" con el texto del botón condicional: `restartBtn.textContent = 'Siguiente Nivel'` si `state.level < MAX_LEVEL`, o `'Reiniciar'` si no. El overlay de derrota (`loseLife()`) sigue mostrando siempre `'Reiniciar'`. Prueba manual: ganar el nivel 1 y ver el botón decir "Siguiente Nivel"; perder una partida y ver el botón decir "Reiniciar".
6. Modificar el handler de click de `restartBtn` y el de la tecla Enter para decidir la acción según el estado: si `state.status === 'won'` y `state.level < MAX_LEVEL`, llamar `nextLevel()` y ocultar el overlay; en cualquier otro caso (`lost`, o `won` en el nivel 3), llamar `resetGame()`. Prueba manual: completar el nivel 1 con click en el botón y confirmar que pasa al nivel 2 con velocidad mayor y patrón de tablero de ajedrez; repetir con la tecla Enter para pasar del nivel 2 al 3.
7. Modificar `resetGame()` para reiniciar `state.level = 1` además del resto del estado. Prueba manual: completar los 3 niveles, ganar el nivel 3 (patrón pirámide), y confirmar que al hacer click/tap/Enter el juego vuelve por completo al nivel 1 con la velocidad y el grid completo originales.
8. Prueba manual final de punta a punta: jugar los 3 niveles en secuencia, confirmar que la velocidad de la bola aumenta perceptiblemente en cada nivel, que el patrón de bloques de cada nivel es el correcto (completo → ajedrez → pirámide), que el HUD muestra el nivel correcto en todo momento, que el score y las vidas se conservan entre niveles, y que perder todas las vidas en cualquier nivel reinicia todo desde el nivel 1.

## Acceptance criteria

- [ ] El HUD muestra el nivel actual (ej. "Nivel 1 / 3") desde el arranque del juego y en todo momento durante la partida.
- [ ] El nivel 1 usa el grid completo de bloques (10×6) y la misma velocidad de bola que hoy (BALL_SPEED = 6).
- [ ] El nivel 2 usa un patrón de tablero de ajedrez (celdas alternadas según `(fila + columna) % 2`) y una velocidad de bola mayor a la del nivel 1 (~7).
- [ ] El nivel 3 usa un patrón de pirámide invertida (ancho de bloques creciente hacia abajo, centrado) y una velocidad de bola mayor a la del nivel 2 (~8.3).
- [ ] En los 3 niveles, cada bloque conserva el color correspondiente a su fila (`blockColors[row]`).
- [ ] Al destruir todos los bloques del nivel 1 o 2, aparece el overlay "Ganaste" con el botón "Siguiente Nivel".
- [ ] Al hacer click, tap o Enter sobre el botón "Siguiente Nivel", el juego avanza al siguiente nivel: se reconstruye el grid con su patrón y velocidad correspondientes, y la bola vuelve a estar pegada al paddle en pausa.
- [ ] El score y las vidas se conservan al pasar de un nivel al siguiente (no se resetean).
- [ ] Al destruir todos los bloques del nivel 3, aparece el overlay "Ganaste" con el botón "Reiniciar".
- [ ] Al hacer click, tap o Enter sobre ese botón "Reiniciar" tras ganar el nivel 3, el juego vuelve completamente al nivel 1 (grid completo, velocidad original, score y vidas reiniciados).
- [ ] Al perder todas las vidas en cualquier nivel, aparece el overlay "Perdiste" con el botón "Reiniciar", que reinicia el juego completo desde el nivel 1.
- [ ] El juego sigue funcionando sin errores en consola con esta funcionalidad activa.

## Decisions

- **Yes:** 3 niveles fijos con velocidades 6 / 7 / 8.3 (incremento moderado del ~15-20% por nivel), sobre el mismo grid base de 10×6. Progresión perceptible pero jugable.
- **Yes:** cada nivel además tiene un patrón de bloques distinto (nivel 1: completo, nivel 2: tablero de ajedrez, nivel 3: pirámide invertida), a pedido explícito del usuario, en vez de solo variar la velocidad.
- **Yes:** el color de cada bloque sigue determinado por su fila (`blockColors[row]`), sin importar el patrón. Mantiene consistencia visual entre niveles.
- **No:** cambios de tamaño de paddle entre niveles. Se decidió escalar la dificultad solo con velocidad y patrón de bloques, sin tocar el paddle.
- **Yes:** score y vidas se conservan al pasar de nivel; solo se resetean al perder o al completar el nivel 3. Es el comportamiento típico de Arkanoid y evita penalizar el progreso del jugador.
- **Yes:** al ganar el nivel 3 se muestra el mismo mensaje "Ganaste" (no uno distinto), pero el botón dice "Reiniciar" en vez de "Siguiente Nivel" y reinicia el juego completo. Reutiliza el overlay existente sin agregar un estado nuevo.
- **Yes:** el texto del botón del overlay cambia dinámicamente ("Siguiente Nivel" vs "Reiniciar") según si es la victoria de un nivel intermedio o la final. Más claro para el jugador que un texto fijo.
- **Yes:** el click/tap/Enter para avanzar de nivel funciona solo sobre el botón del overlay, igual que el flujo de reinicio ya existente. Consistencia con el comportamiento actual, sin agregar listeners nuevos sobre el overlay completo.
- **No:** patrones de bloques configurables, aleatorios, o distintos a los 3 definidos. Fuera de alcance; si se necesitan más patrones o niveles, es un spec futuro.

## Risks

| Risk                                                                                                                                                                                                                    | Mitigation                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| La fórmula de la pirámide (`width = min(COLS, 2 * (row + 1))`) depende de que `COLS` sea par para poder centrar el ancho exactamente; si en el futuro `COLS` cambia a un valor impar, el centrado quedaría desalineado. | `COLS` es una constante fija en 10 en este spec y no se modifica; documentar la dependencia en el comentario de `isCellActive()`.                                                                                           |
| Al reducir la cantidad de bloques en los niveles 2 y 3 (tablero de ajedrez y pirámide), el nivel podría completarse muy rápido pese a la mayor velocidad de bola, sintiéndose menos "nivel completo" que el 1.          | Aceptado como parte del diseño: la dificultad de los niveles 2 y 3 viene de la mayor velocidad y los ángulos de rebote entre huecos, no de la cantidad de bloques. Se valida en la prueba manual de punta a punta del plan. |
| `checkWin()` y la transición a `nextLevel()` dependen de que `restartBtn` sea el único punto de entrada para avanzar; si en el futuro se agrega otro control de reinicio, debe replicar la misma lógica condicional.    | Centralizar la decisión (avanzar vs. reiniciar) en una sola función auxiliar en vez de duplicarla entre el handler de click y el de Enter.                                                                                  |

## What is **not** in this spec

- Patrones de bloques configurables o generados aleatoriamente.
- Cambios de tamaño de paddle u otras variables de dificultad además de la velocidad de la bola y el patrón de bloques.
- Persistencia del nivel alcanzado o high scores entre sesiones.
- Mensaje distinto a "Ganaste" al completar el nivel 3.

Cada uno de estos, si se implementa, va en su propio spec.
