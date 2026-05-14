# Prompts para generar sprites de Hermes — Flappy Hermes

## Contexto del proyecto

Este es un mini-juego tipo Flappy Bird para la plataforma **PROJECT HERMES**, una plataforma SaaS enterprise de facturación electrónica. El personaje jugable es una versión chibi/mascota del dios griego Hermes, alineada visualmente con la identidad de marca del proyecto.

---

## Especificaciones técnicas obligatorias

| Propiedad | Valor |
|-----------|-------|
| Tamaño exacto | 1290 x 1567 px |
| Formato | PNG con transparencia (canal alfa / RGBA) |
| Fondo | 100% transparente, sin color de fondo |
| Estilo | Chibi / 2D flat game sprite, minimalista y geométrico |
| Vista | Lateral (perfil, mirando a la derecha) |
| Centrado | Personaje centrado en el canvas |
| Bordes | Líneas limpias, sin anti-aliasing borroso, edges definidos |
| Uso | Sprite de videojuego 2D, debe ser legible a tamaños pequeños (escalado a ~50-80px en pantalla) |

---

## Paleta de colores (alineada con la marca PROJECT HERMES)

| Color | Hex | Uso en el personaje |
|-------|-----|---------------------|
| Azul corporativo profundo | #003B8E | Color principal del cuerpo/toga del personaje |
| Azul eléctrico | #0562E8 | Detalles, brillos, acentos en alas y casco |
| Naranja energético | #FF7A00 | Alas del casco y sandalias (talaria), caduceo, detalles de energía/velocidad |
| Verde tecnológico | #38B26D | Destellos sutiles, efectos de automatización/tech |
| Blanco puro | #FFFFFF | Toga interior, ojos, highlights |
| Gris premium | #E5E7EB | Sombras suaves, profundidad |

**Reglas de color:**
- El azul (#003B8E y #0562E8) debe dominar el personaje (toga, cuerpo)
- El naranja (#FF7A00) se usa para las alas (casco y sandalias) y el caduceo — transmite velocidad y energía
- El verde (#38B26D) es un acento sutil (gemas, destellos tech)
- NO usar colores infantiles, pasteles ni saturación excesiva
- El personaje debe sentirse premium, tecnológico y enterprise incluso siendo chibi

---

## Características del personaje Hermes

**Elementos obligatorios:**
- Casco alado (petasos) — dorado/naranja con alas pequeñas
- Sandalias aladas (talaria) — con alitas naranjas visibles
- Caduceo (bastón con serpientes) — versión simplificada y minimalista
- Toga/túnica corta — en azul corporativo profundo
- Cuerpo compacto chibi — proporción cabeza grande, cuerpo pequeño
- Ojos expresivos y simples

**Estilo visual:**
- Geométrico y limpio (inspirado en el branding de Linear, Stripe, Vercel)
- Minimalista pero reconocible
- Sin texturas complejas ni degradados excesivos
- Flat design con sombras sutiles
- Debe verse como una mascota tech premium, no como un personaje de juego infantil

---

## Imagen 1 — hermes_idle.png (Estado neutral / cayendo suave)

**Nombre de archivo:** hermes_idle.png

**Prompt para generación:**

Create a 2D game sprite of a cute chibi-style character based on Hermes, the Greek god, in side-view profile facing right. The character has a compact round body with a large head and short legs (chibi proportions). He wears a short toga in deep corporate blue (#003B8E) with white (#FFFFFF) accents. On his head he wears a winged helmet (petasos) with small wings in energetic orange (#FF7A00). His sandals have small folded wings also in orange (#FF7A00). He holds a simplified minimalist caduceus staff with electric blue (#0562E8) and orange details. His expression is calm and focused with simple dot eyes. The wings on his helmet and sandals are RELAXED and slightly folded downward — he is in a neutral falling state. The overall color palette is dominated by deep blue (#003B8E), electric blue (#0562E8), energetic orange (#FF7A00), with subtle green (#38B26D) tech accents. Style: flat 2D, geometric, clean vector-like edges, minimalist premium game sprite. NO gradients, NO complex textures. The character must feel like a tech company mascot — premium, modern, enterprise. Transparent background (PNG RGBA). Canvas size exactly 1290x1567 pixels with the character centered.

---

## Imagen 2 — hermes_jump.png (Saltando / alas extendidas)

**Nombre de archivo:** hermes_jump.png

**Prompt para generación:**

Create a 2D game sprite of a cute chibi-style character based on Hermes, the Greek god, in side-view profile facing right, in a MID-JUMP upward pose. The character has a compact round body with a large head and short legs (chibi proportions). He wears a short toga in deep corporate blue (#003B8E) with white (#FFFFFF) accents. On his head he wears a winged helmet (petasos) with wings FULLY SPREAD and flapping upward in energetic orange (#FF7A00). His sandals have wings FULLY EXTENDED upward also in orange (#FF7A00), creating a sense of lift. He holds a simplified minimalist caduceus staff with electric blue (#0562E8) and orange details. His expression is determined and excited with slightly open mouth. His body is tilted slightly upward. The wings are the KEY DIFFERENCE from the idle pose — they are fully open and pushing upward. The overall color palette is dominated by deep blue (#003B8E), electric blue (#0562E8), energetic orange (#FF7A00), with subtle green (#38B26D) tech accents as small energy particles near the wings. Style: flat 2D, geometric, clean vector-like edges, minimalist premium game sprite. NO gradients, NO complex textures. The character must feel like a tech company mascot — premium, modern, enterprise. Transparent background (PNG RGBA). Canvas size exactly 1290x1567 pixels with the character centered.

---

## Imagen 3 — hermes_fall.png (Cayendo rápido / preocupado)

**Nombre de archivo:** hermes_fall.png

**Prompt para generación:**

Create a 2D game sprite of a cute chibi-style character based on Hermes, the Greek god, in side-view profile facing right, in a FALLING FAST downward pose. The character has a compact round body with a large head and short legs (chibi proportions). He wears a short toga in deep corporate blue (#003B8E) with white (#FFFFFF) accents fluttering upward due to the fall. On his head he wears a winged helmet (petasos) with wings FOLDED BACK and pointing upward in energetic orange (#FF7A00) — pressed by air resistance. His sandals have wings also FOLDED BACK in orange (#FF7A00). He holds a simplified minimalist caduceus staff with electric blue (#0562E8) and orange details. His expression is worried/surprised with wide circular eyes. His body is tilted slightly downward. The toga flutters upward from the descent speed. The wings are the KEY DIFFERENCE — they are completely folded back, pressed upward by the fall. The overall color palette is dominated by deep blue (#003B8E), electric blue (#0562E8), energetic orange (#FF7A00), with subtle green (#38B26D) tech accents. Style: flat 2D, geometric, clean vector-like edges, minimalist premium game sprite. NO gradients, NO complex textures. The character must feel like a tech company mascot — premium, modern, enterprise. Transparent background (PNG RGBA). Canvas size exactly 1290x1567 pixels with the character centered.

---

## Resumen de animación en el juego

| Estado del juego | Imagen | Diferencia visual clave |
|------------------|--------|------------------------|
| Neutral / cayendo suave | hermes_idle.png | Alas relajadas/plegadas, expresión calmada |
| Salto (tap/click) | hermes_jump.png | Alas completamente extendidas hacia arriba, cuerpo inclinado arriba |
| Caída rápida | hermes_fall.png | Alas plegadas hacia atrás, toga flotando, expresión preocupada |

**Mínimo viable:** Con 2 imágenes (idle + jump) el juego funciona correctamente.
**Versión completa:** Con 3 imágenes se logra mayor expresividad y feedback visual al jugador.

---

## Notas para la IA generadora

1. Las 3 imágenes deben ser **consistentes entre sí** — mismo personaje, mismas proporciones, mismos colores exactos.
2. La ÚNICA diferencia entre frames es la **posición de las alas** y la **expresión facial**.
3. El personaje debe ser **reconocible a tamaño pequeño** (~50-80px en pantalla).
4. **NO agregar fondo** de ningún tipo — debe ser 100% transparente.
5. **NO agregar sombra proyectada** en el suelo.
6. Mantener el personaje **centrado vertical y horizontalmente** en el canvas de 1290x1567.
7. El estilo debe ser coherente con una marca enterprise tech (PROJECT HERMES) — premium, no infantil.
