/* Bambuky Content Studio — Sistema visual editorial premium
   Adaptado del "Sistema Visual Instagram" a la paleta salvia.

   Principios (heredados del HTML premium):
   - Fotografía primero · overlays cálidos suaves · mucho aire.
   - Cormorant Garamond para emoción (títulos, citas) · DM Sans para estructura.
   - Logo discreto arriba-derecha · numeración discreta abajo-izquierda.
   - Eyebrow en mayúsculas + regla decorativa de 38×1.5px.
   - Layout fijo: el usuario pega texto, sube foto y ajusta su encuadre.
   - Funciona con foto y sin foto (variante oscura sobre foto / clara sobre crema).

   Todo se dibuja en coordenadas lógicas 1080×1350 vía frame(); las miniaturas
   del picker se escalan automáticamente al tamaño real del canvas.
*/

const W = 1080, H = 1350;          // lienzo lógico 4:5
const MX = 96;                     // margen horizontal (~9%)

const PAL = {
  cream:    '#FAF8F5',
  linen:    '#F1EBE2',
  sageLight:'#D8E2DC',
  sageMid:  '#84A59D',
  sageDeep: '#5B736B',
  textMain: '#3D4A46',
  textMuted:'#6C7A76',
  charcoal: '#2F3A37'   // fondo "oscuro" cálido (nunca negro puro)
};

/* Roles de color según fondo claro u oscuro */
function roles(dark){
  return dark ? {
    title:'#FAF8F5', eyebrow:'#D8E2DC', body:'#EDE6DB',
    rule:'#84A59D', deco:'rgba(216,226,220,0.85)', big:'#FAF8F5',
    logo:'#D8E2DC', page:'#9DB3AB', btnText:'#FAF8F5', btnBorder:'#84A59D'
  } : {
    title:'#3D4A46', eyebrow:'#84A59D', body:'#6C7A76',
    rule:'#84A59D', deco:'#D8E2DC', big:'#5B736B',
    logo:'#84A59D', page:'#A6B7B0', btnText:'#3D4A46', btnBorder:'#84A59D'
  };
}

/* ---------- helpers ---------- */

function frame(ctx, draw){
  const cw = ctx.canvas.width, ch = ctx.canvas.height;
  ctx.save();
  ctx.setTransform(cw / W, 0, 0, ch / H, 0, 0);  // mapea 1080×1350 → píxeles reales
  ctx.textBaseline = 'alphabetic';
  draw(ctx);
  ctx.restore();
}

function coverRect(ctx, img, dx, dy, dw, dh){
  const source = img && img.img ? img.img : img;
  if(!source) return;
  const frame = img && img.img ? img : {};
  const userScale = Math.max(0.8, Math.min(2, Number(frame.imageScale) || 1));
  const userX = Number.isFinite(frame.imageX) ? frame.imageX : 0;
  const userY = Number.isFinite(frame.imageY) ? frame.imageY : 0;
  const s = Math.max(dw / source.width, dh / source.height) * userScale;
  const iw = source.width * s, ih = source.height * s;
  ctx.save();
  ctx.beginPath(); ctx.rect(dx, dy, dw, dh); ctx.clip();
  ctx.drawImage(source, dx + (dw - iw) / 2 + userX, dy + (dh - ih) / 2 + userY, iw, ih);
  ctx.restore();
}

/* Fondo de foto a sangre completa con tinte salvia + gradiente cálido.
   mode: 'bottom' (ancla texto abajo) | 'full' (oscurece todo) | 'soft' */
function photoFull(ctx, imgObj, mode){
  if(!imgObj || !imgObj.img) return false;
  coverRect(ctx, imgObj, 0, 0, W, H);
  // tinte salvia muy suave (unifica temperatura)
  ctx.fillStyle = 'rgba(61,74,70,0.20)'; ctx.fillRect(0, 0, W, H);
  if(mode === 'bottom'){
    const g = ctx.createLinearGradient(0, H * 0.32, 0, H);
    g.addColorStop(0, 'rgba(40,49,46,0)');
    g.addColorStop(1, 'rgba(40,49,46,0.92)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // leve oscurecido superior para el logo
    const gt = ctx.createLinearGradient(0, 0, 0, H * 0.22);
    gt.addColorStop(0, 'rgba(40,49,46,0.35)');
    gt.addColorStop(1, 'rgba(40,49,46,0)');
    ctx.fillStyle = gt; ctx.fillRect(0, 0, W, H);
  } else if(mode === 'full'){
    ctx.fillStyle = 'rgba(40,49,46,0.58)'; ctx.fillRect(0, 0, W, H);
  } else { // soft
    ctx.fillStyle = 'rgba(40,49,46,0.28)'; ctx.fillRect(0, 0, W, H);
  }
  return true;
}

/* Fondo crema editorial (sin foto). topBand: bloque salvia degradado arriba */
function bgCream(ctx, topBand){
  ctx.fillStyle = PAL.cream; ctx.fillRect(0, 0, W, H);
  if(topBand){
    const g = ctx.createLinearGradient(0, 0, 0, H * 0.56);
    g.addColorStop(0, '#D8E2DC');
    g.addColorStop(1, 'rgba(241,235,226,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H * 0.56);
  }
}

function bgCharcoal(ctx){ ctx.fillStyle = PAL.charcoal; ctx.fillRect(0, 0, W, H); }

/* Logo discreto "BAMBUKY" */
function logo(ctx, color, centered){
  ctx.save();
  ctx.font = '500 16px "Manrope", system-ui, sans-serif';
  if('letterSpacing' in ctx) ctx.letterSpacing = '4px';
  ctx.fillStyle = color;
  ctx.textAlign = centered ? 'center' : 'right';
  ctx.fillText('BAMBUKY', centered ? W / 2 : W - MX, 100);
  ctx.restore();
}

/* Numeración discreta "02 / 07" abajo-izquierda */
function pageNum(ctx, state, color){
  const p = state._page, t = state._total;
  if(!p) return;
  const txt = String(p).padStart(2, '0') + (t ? '  /  ' + String(t).padStart(2, '0') : '');
  ctx.save();
  ctx.font = '500 13px "Manrope", system-ui, sans-serif';
  if('letterSpacing' in ctx) ctx.letterSpacing = '3px';
  ctx.fillStyle = color; ctx.textAlign = 'left';
  ctx.fillText(txt, MX, H - 74);
  ctx.restore();
}

/* Eyebrow en mayúsculas + regla decorativa */
function eyebrow(ctx, text, x, y, color, align){
  if(!text) return y;
  align = align || 'left';
  ctx.save();
  ctx.font = '500 14px "Manrope", system-ui, sans-serif';
  if('letterSpacing' in ctx) ctx.letterSpacing = '3.5px';
  ctx.fillStyle = color; ctx.textAlign = align;
  ctx.fillText(text.toUpperCase(), align === 'center' ? W / 2 : x, y);
  ctx.restore();
  ctx.fillStyle = color;
  if(align === 'center') ctx.fillRect(W / 2 - 19, y + 18, 38, 1.5);
  else ctx.fillRect(x, y + 18, 38, 1.5);
  return y + 18;
}

function ruleCentered(ctx, y, color, width){
  width = width || 38;
  ctx.fillStyle = color;
  ctx.fillRect(W / 2 - width / 2, y, width, 1.5);
}

/* Texto multilínea. Devuelve la baseline de la última línea dibujada. */
function drawWrapped(ctx, text, x, y, maxW, lh, maxLines, align){
  if(!text) return y - lh;
  ctx.textAlign = align || 'left';
  const words = text.trim().split(/\s+/);
  let line = '', ty = y, count = 0;
  for(let n = 0; n < words.length; n++){
    const test = line ? line + ' ' + words[n] : words[n];
    if(ctx.measureText(test).width > maxW && line){
      ctx.fillText(line, x, ty); count++;
      if(maxLines && count >= maxLines) return ty;
      ty += lh; line = words[n];
    } else line = test;
  }
  if(line) ctx.fillText(line, x, ty);
  return ty;
}

/* Pequeño marcador en forma de diamante (viñeta de credenciales) */
function diamond(ctx, cx, cy, r, color){
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r, cy);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke){
  if(typeof stroke === 'undefined') stroke = true;
  if(typeof radius === 'undefined') radius = 5;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  if(fill) ctx.fill(); if(stroke) ctx.stroke();
}

/* ============================================================
   PLANTILLAS DEFINITIVAS (7)
   ============================================================ */

const TEMPLATES = {

  /* 1 · PORTADA — detiene el scroll. Foto a sangre, texto anclado abajo. */
  'Portada': function(ctx, state){
    frame(ctx, (ctx) => {
      const hasImg = photoFull(ctx, state.image, 'bottom');
      if(!hasImg) bgCream(ctx, true);
      const c = roles(hasImg);

      logo(ctx, c.logo);

      const ey = 858;
      eyebrow(ctx, state.eyebrow || 'Fotografía Newborn', MX, ey, c.eyebrow);

      ctx.fillStyle = c.title;
      ctx.font = '300 72px "Cormorant Garamond", Georgia, serif';
      const end = drawWrapped(ctx, state.title || 'Los primeros días', MX, ey + 92, W - MX * 2, 78, 3);

      if(state.subtitle){
        ctx.fillStyle = c.body;
        ctx.font = '300 19px "Manrope", system-ui, sans-serif';
        drawWrapped(ctx, state.subtitle, MX, end + 48, W - MX * 2 - 40, 28, 2);
      }
      pageNum(ctx, state, c.page);
    });
  },

  /* 2 · PROBLEMA — afirmación editorial fuerte + cuerpo de apoyo. */
  'Problema': function(ctx, state){
    frame(ctx, (ctx) => {
      const hasImg = photoFull(ctx, state.image, 'bottom');
      if(!hasImg) bgCream(ctx, false);
      const c = roles(hasImg);

      logo(ctx, c.logo);

      const top = hasImg ? 690 : 320;
      eyebrow(ctx, state.eyebrow || 'El problema', MX, top, c.eyebrow);

      ctx.fillStyle = c.title;
      ctx.font = '300 60px "Cormorant Garamond", Georgia, serif';
      const end = drawWrapped(ctx, state.title || 'Lo que nadie te dice.', MX, top + 86, W - MX * 2, 68, 3);

      if(state.body){
        ctx.fillStyle = c.body;
        ctx.font = '300 20px "Manrope", system-ui, sans-serif';
        drawWrapped(ctx, state.body, MX, end + 52, W - MX * 2 - 30, 32, 6);
      }
      pageNum(ctx, state, c.page);
    });
  },

  /* 3 · URGENCIA BIOLÓGICA — dato/número grande centrado + frase emocional. */
  'Urgencia biológica': function(ctx, state){
    frame(ctx, (ctx) => {
      const hasImg = photoFull(ctx, state.image, 'full');
      if(!hasImg) bgCream(ctx, false);
      const c = roles(hasImg);

      logo(ctx, c.logo, true);

      const cy = H / 2;
      eyebrow(ctx, state.eyebrow || 'Urgencia biológica', W / 2, cy - 232, c.eyebrow, 'center');

      const big = state.number || state.title || '10';
      ctx.fillStyle = hasImg ? c.big : PAL.sageDeep;
      ctx.font = '300 200px "Cormorant Garamond", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(big, W / 2, cy + 36);

      if(state.subtitle){
        ctx.save();
        ctx.font = '500 13px "Manrope", system-ui, sans-serif';
        if('letterSpacing' in ctx) ctx.letterSpacing = '3px';
        ctx.fillStyle = c.eyebrow; ctx.textAlign = 'center';
        ctx.fillText(state.subtitle.toUpperCase(), W / 2, cy + 86);
        ctx.restore();
      }
      ruleCentered(ctx, cy + 120, c.rule, 40);

      const phrase = state.body || (state.number ? state.title : '');
      if(phrase){
        ctx.fillStyle = c.title;
        ctx.font = 'italic 300 30px "Cormorant Garamond", Georgia, serif';
        drawWrapped(ctx, phrase, W / 2, cy + 176, W - MX * 2 - 60, 40, 3, 'center');
      }
      pageNum(ctx, state, c.page);
    });
  },

  /* 4 · SOLUCIÓN — foto lateral izquierda + columna de texto a la derecha. */
  'Solución': function(ctx, state){
    frame(ctx, (ctx) => {
      bgCream(ctx, false);
      const col = Math.round(W * 0.46);
      const hasImg = !!(state.image && state.image.img);

      if(hasImg){
        coverRect(ctx, state.image, 0, 0, col, H);
        ctx.fillStyle = 'rgba(61,74,70,0.12)'; ctx.fillRect(0, 0, col, H);
      } else {
        const g = ctx.createLinearGradient(0, 0, col, H);
        g.addColorStop(0, '#D8E2DC'); g.addColorStop(1, '#84A59D');
        ctx.fillStyle = g; ctx.fillRect(0, 0, col, H);
      }

      const c = roles(false);
      const tx = col + 56;
      const tw = W - tx - MX;

      logo(ctx, c.logo);

      const top = 470;
      eyebrow(ctx, state.eyebrow || 'La solución', tx, top, c.eyebrow);

      ctx.fillStyle = c.title;
      ctx.font = '400 38px "Cormorant Garamond", Georgia, serif';
      const end = drawWrapped(ctx, state.title || 'Una sesión segura.', tx, top + 70, tw, 46, 4);

      if(state.body){
        ctx.fillStyle = c.body;
        ctx.font = '300 18px "Manrope", system-ui, sans-serif';
        drawWrapped(ctx, state.body, tx, end + 44, tw, 30, 6);
      }
      pageNum(ctx, state, hasImg ? '#D8E2DC' : c.page);
    });
  },

  /* 5 · OBJECIÓN — pregunta/objeción en itálica + respuesta de apoyo. */
  'Objeción': function(ctx, state){
    frame(ctx, (ctx) => {
      const hasImg = photoFull(ctx, state.image, 'full');
      if(!hasImg) bgCream(ctx, false);
      const c = roles(hasImg);

      logo(ctx, c.logo);

      const top = hasImg ? 560 : 360;
      eyebrow(ctx, state.eyebrow || '¿Te preocupa?', MX, top, c.eyebrow);

      ctx.fillStyle = c.title;
      ctx.font = 'italic 300 46px "Cormorant Garamond", Georgia, serif';
      const end = drawWrapped(ctx, state.title || '¿Y si mi bebé llora durante la sesión?', MX, top + 80, W - MX * 2, 58, 4);

      if(state.body){
        ctx.fillStyle = c.rule; ctx.fillRect(MX, end + 36, 38, 1.5);
        ctx.fillStyle = c.body;
        ctx.font = '300 19px "Manrope", system-ui, sans-serif';
        drawWrapped(ctx, state.body, MX, end + 80, W - MX * 2 - 30, 30, 5);
      }
      pageNum(ctx, state, c.page);
    });
  },

  /* 6 · AUTORIDAD — fondo oscuro, encabezado serif cálido, credenciales con
     viñeta de diamante y cierre en itálica. El "salto visual" de la serie. */
  'Autoridad': function(ctx, state){
    frame(ctx, (ctx) => {
      const hasImg = photoFull(ctx, state.image, 'full');
      if(!hasImg) bgCharcoal(ctx);          // siempre oscuro
      const c = roles(true);
      const gold = '#C8B89A';               // acento cálido (arena)

      logo(ctx, gold);

      let top = hasImg ? 420 : 380;
      if(state.eyebrow){ eyebrow(ctx, state.eyebrow, MX, top, c.eyebrow); top += 56; }

      ctx.fillStyle = gold;
      ctx.font = '400 40px "Cormorant Garamond", Georgia, serif';
      const end = drawWrapped(ctx, state.title || 'Bambuky · Estudio Newborn · Querétaro', MX, top, W - MX * 2, 48, 2);

      // credenciales: array creds o body separado por saltos / "·"
      let lines = [];
      if(Array.isArray(state.creds) && state.creds.length) lines = state.creds.slice();
      else if(state.body) lines = state.body.split(/\n|·|•/).map(s => s.trim()).filter(Boolean);
      lines = lines.slice(0, 4);

      let ly = end + 70;
      ctx.font = '300 19px "Manrope", system-ui, sans-serif';
      for(let i = 0; i < lines.length; i++){
        diamond(ctx, MX + 6, ly - 7, 6, 'rgba(200,184,154,0.75)');
        ctx.fillStyle = c.body; ctx.textAlign = 'left';
        const lend = drawWrapped(ctx, lines[i], MX + 30, ly, W - MX * 2 - 30, 27, 2);
        ly = lend + 34;
      }

      if(state.subtitle){
        ctx.fillStyle = '#9DB3AB';
        ctx.font = 'italic 300 24px "Cormorant Garamond", Georgia, serif';
        drawWrapped(ctx, state.subtitle, MX, Math.max(ly + 22, H - 320), W - MX * 2 - 40, 32, 2);
      }
      pageNum(ctx, state, c.page);
    });
  },

  /* 7 · CTA — cierre centrado, logo centrado, título en itálica, botón borde. */
  'CTA': function(ctx, state){
    frame(ctx, (ctx) => {
      const hasImg = photoFull(ctx, state.image, 'full');
      if(!hasImg) bgCharcoal(ctx);
      const c = roles(true); // CTA siempre sobre fondo oscuro/cálido

      logo(ctx, c.logo, true);

      const cy = H / 2;
      if(state.eyebrow){
        ctx.save();
        ctx.font = '500 13px "Manrope", system-ui, sans-serif';
        if('letterSpacing' in ctx) ctx.letterSpacing = '3.5px';
        ctx.fillStyle = c.eyebrow; ctx.textAlign = 'center';
        ctx.fillText(state.eyebrow.toUpperCase(), W / 2, cy - 150);
        ctx.restore();
      }

      ctx.fillStyle = c.title;
      ctx.font = 'italic 300 46px "Cormorant Garamond", Georgia, serif';
      const end = drawWrapped(ctx, state.title || '¿Lista para reservar tu sesión?', W / 2, cy - 60, W - MX * 2 - 40, 58, 3, 'center');

      ruleCentered(ctx, end + 40, c.rule, 40);

      if(state.subtitle){
        ctx.save();
        ctx.font = '500 13px "Manrope", system-ui, sans-serif';
        if('letterSpacing' in ctx) ctx.letterSpacing = '3px';
        ctx.fillStyle = c.eyebrow; ctx.textAlign = 'center';
        ctx.fillText(state.subtitle.toUpperCase(), W / 2, end + 90);
        ctx.restore();
      }

      // botón sólo borde, sin relleno
      const label = (state.cta || 'Agenda tu fecha').toUpperCase();
      ctx.font = '500 14px "Manrope", system-ui, sans-serif';
      if('letterSpacing' in ctx) ctx.letterSpacing = '3px';
      const bw = Math.min(W - MX * 2, ctx.measureText(label).width + 80);
      const bh = 58, bx = (W - bw) / 2, by = end + 130;
      ctx.strokeStyle = c.btnBorder; ctx.lineWidth = 1.5;
      roundRect(ctx, bx, by, bw, bh, 2, false, true);
      ctx.fillStyle = c.btnText; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(label, W / 2, by + bh / 2 + 1);
      ctx.textBaseline = 'alphabetic';
      if('letterSpacing' in ctx) ctx.letterSpacing = '0px';

      pageNum(ctx, state, c.page);
    });
  }
};

// expose
window.TEMPLATES = TEMPLATES;
window.TEMPLATES_EDITORIAL = TEMPLATES;
