# Juego de Arkanoid

Un juego de Arkanoid/Breakout hecho con HTML, CSS y JS puro — **cero dependencias**. Se juega abriendo `index.html` directamente en el navegador (o sirviéndolo con un servidor estático simple).

## Estado actual

El juego ya es jugable de principio a fin:

- Paddle controlable con teclado (flechas), mouse y touch.
- Física de rebote de la bola contra paredes, techo y paddle.
- Grid de bloques de 10×6 con puntaje.
- Animación de explosión al destruir bloques.
- Efectos de sonido de rebote y rotura.
- 3 niveles en secuencia con velocidad de bola creciente y patrones de bloques distintos.
- Botón de pausa y overlay de reinicio (vuelve siempre al nivel 1).

## Estructura

- `index.html` — shell de la página y canvas del juego.
- `js/game.js` — toda la lógica del juego.
- `css/style.css` — estilos.
- `assets/` — spritesheet (`spritesheet-breakout.png`, `spritesheet.js`) y sonidos (`sounds/*.mp3`).
- `specs/` — specs del proyecto, seguidas por el flujo de desarrollo guiado por specs (ver abajo).

## Desarrollo guiado por specs

Este repo sigue un método de desarrollo guiado por specs, mediante dos skills en `.agents/skills/`:

- **`/spec <descripción>`** — Diseña una spec de forma conversacional: hace preguntas de aclaración antes de escribir nada, y luego arma la spec sección por sección con confirmación en cada paso. Solo escribe un archivo `specs/NN-slug.md`, nunca toca código. Las specs nuevas quedan en estado `Draft`.
- **`/spec-impl <NN-spec-name>`** — Implementa una spec ya aprobada (estado `Approved`/`Aprobado`). Crea y cambia a una rama `spec-NN-slug`, muestra el objetivo/alcance/plan/criterios de aceptación de la spec, y luego implementa el plan paso a paso, pausando para revisión después de cada paso.

Las specs existentes (`specs/01-mvp-arkanoid.md` a `specs/04-levels-and-progression.md`) sirven como ejemplo del formato y nivel de detalle esperado. No se debe implementar una feature grande sin pasar antes por `/spec`.
