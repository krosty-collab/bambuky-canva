/* Bambuky Content Studio — Set "Instagram First"
   Optimizado para LECTURA en móvil (<2s desde un teléfono).

   Mantiene identidad visual (Cormorant + DM Sans, paleta salvia, composición),
   pero:
   - Títulos +15–30%.
   - Cuerpos con menos líneas/peso, subidos al piso legible (~32–34px).
   - Mayor contraste (eyebrow y body más oscuros sobre crema).
   - Interlineado más compacto para bloques de lectura rápida.

   Reutiliza los helpers globales de templates.js:
   frame, photoFull, coverRect, bgCream, bgCharcoal, drawWrapped,
   ruleCentered, roundRect, logo, pageNum, PAL, W, H, MX.
*/

/* Roles de color con MÁS contraste para móvil */
function rolesIG(dark){
  return dark ? {
    title:'#FAF8F5', eyebrow:'#E3EAE5', body:'#F1EBE2',
    rule:'#9DB8B0', deco:'#FAF8F5', big:'#FAF8F5',
    logo:'#D8E2DC', page:'#9DB3AB', btnText:'#FAF8F5', btnBorder:'#9DB8B0'
  } : {
    title:'#2F3A37', eyebrow:'#5B736B', body:'#3D4A46',
    rule:'#5B736B', deco:'#3D4A46', big:'#3D4A46',
    logo:'#5B736B', page:'#84A59D', btnText:'#2F3A37', btnBorder:'#5B736B'
  };
}

/* Eyebrow más grande y legible + regla decorativa más marcada */
function eyebrowIG(ctx, text, x, y, color, align){
  if(!text) return y;
  align = align || 'left';
  ctx.save();
  ctx.font = '600 20px "DM Sans", system-ui, sans-serif';
  if('letterSpacing' in ctx) ctx.letterSpacing = '3px';
  ctx.fillStyle = color; ctx.textAlign = align;
  ctx.fillText(text.toUpperCase(), align === 'center' ? W / 2 : x, y);
  ctx.restore();
  ctx.fillStyle = color;
  if(align === 'center') ctx.fillRect(W / 2 - 22, y + 24, 44, 2);
  else ctx.fillRect(x, y + 24, 44, 2);
  return y + 24;
}

const TEMPLATES_IG = {

  /* 1 · PORTADA */
  'Portada': function(ctx, state){
    frame(ctx, (ctx) => {
      const hasImg = photoFull(ctx, state.image, 'bottom');
      if(!hasImg) bgCream(ctx, true);
      const c = rolesIG(hasImg);
      logo(ctx, c.logo);

      const ey = 792;
      eyebrowIG(ctx, state.eyebrow || 'Fotografía Newborn', MX, ey, c.eyebrow);

      ctx.fillStyle = c.title;
      ctx.font = '400 90px "Cormorant Garamond", Georgia, serif';
      const end = drawWrapped(ctx, state.title || 'Los primeros días', MX, ey + 108, W - MX * 2, 94, 3);

      if(state.subtitle){
        ctx.fillStyle = c.body;
        ctx.font = '400 24px "DM Sans", system-ui, sans-serif';
        drawWrapped(ctx, state.subtitle, MX, end + 54, W - MX * 2 - 30, 33, 3);
      }
      pageNum(ctx, state, c.page);
    });
  },

  /* 2 · PROBLEMA */
  'Problema': function(ctx, state){
    frame(ctx, (ctx) => {
      const hasImg = photoFull(ctx, state.image, 'bottom');
      if(!hasImg) bgCream(ctx, false);
      const c = rolesIG(hasImg);
      logo(ctx, c.logo);

      const top = hasImg ? 640 : 300;
      eyebrowIG(ctx, state.eyebrow || 'El problema', MX, top, c.eyebrow);

      ctx.fillStyle = c.title;
      ctx.font = '400 78px "Cormorant Garamond", Georgia, serif';
      const end = drawWrapped(ctx, state.title || 'Lo que nadie te dice.', MX, top + 100, W - MX * 2, 84, 3);

      if(state.body){
        ctx.fillStyle = c.body;
        ctx.font = '400 34px "DM Sans", system-ui, sans-serif';
        drawWrapped(ctx, state.body, MX, end + 58, W - MX * 2 - 20, 46, 5);
      }
      pageNum(ctx, state, c.page);
    });
  },

  /* 3 · URGENCIA BIOLÓGICA */
  'Urgencia biológica': function(ctx, state){
    frame(ctx, (ctx) => {
      const hasImg = photoFull(ctx, state.image, 'full');
      if(!hasImg) bgCream(ctx, false);
      const c = rolesIG(hasImg);
      logo(ctx, c.logo, true);

      const cy = H / 2;
      eyebrowIG(ctx, state.eyebrow || 'Urgencia biológica', W / 2, cy - 252, c.eyebrow, 'center');

      const big = state.number || state.title || '10';
      ctx.fillStyle = c.big;
      ctx.font = '400 230px "Cormorant Garamond", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(big, W / 2, cy + 48);

      if(state.subtitle){
        ctx.save();
        ctx.font = '600 20px "DM Sans", system-ui, sans-serif';
        if('letterSpacing' in ctx) ctx.letterSpacing = '3px';
        ctx.fillStyle = c.eyebrow; ctx.textAlign = 'center';
        ctx.fillText(state.subtitle.toUpperCase(), W / 2, cy + 108);
        ctx.restore();
      }
      ruleCentered(ctx, cy + 148, c.rule, 44);

      const phrase = state.body || (state.number ? state.title : '');
      if(phrase){
        ctx.fillStyle = c.title;
        ctx.font = 'italic 400 38px "Cormorant Garamond", Georgia, serif';
        drawWrapped(ctx, phrase, W / 2, cy + 212, W - MX * 2 - 40, 48, 2, 'center');
      }
      pageNum(ctx, state, c.page);
    });
  },

  /* 4 · SOLUCIÓN */
  'Solución': function(ctx, state){
    frame(ctx, (ctx) => {
      bgCream(ctx, false);
      const col = Math.round(W * 0.46);
      const hasImg = !!(state.image && state.image.img);

      if(hasImg){
        coverRect(ctx, state.image.img, 0, 0, col, H);
        ctx.fillStyle = 'rgba(61,74,70,0.12)'; ctx.fillRect(0, 0, col, H);
      } else {
        const g = ctx.createLinearGradient(0, 0, col, H);
        g.addColorStop(0, '#D8E2DC'); g.addColorStop(1, '#84A59D');
        ctx.fillStyle = g; ctx.fillRect(0, 0, col, H);
      }

      const c = rolesIG(false);
      const tx = col + 52;
      const tw = W - tx - MX;
      logo(ctx, c.logo);

      const top = 430;
      eyebrowIG(ctx, state.eyebrow || 'La solución', tx, top, c.eyebrow);

      ctx.fillStyle = c.title;
      ctx.font = '500 54px "Cormorant Garamond", Georgia, serif';
      const end = drawWrapped(ctx, state.title || 'Una sesión segura.', tx, top + 88, tw, 62, 4);

      if(state.body){
        ctx.fillStyle = c.body;
        ctx.font = '400 32px "DM Sans", system-ui, sans-serif';
        drawWrapped(ctx, state.body, tx, end + 52, tw, 44, 6);
      }
      pageNum(ctx, state, hasImg ? '#E3EAE5' : c.page);
    });
  },

  /* 5 · OBJECIÓN */
  'Objeción': function(ctx, state){
    frame(ctx, (ctx) => {
      const hasImg = photoFull(ctx, state.image, 'full');
      if(!hasImg) bgCream(ctx, false);
      const c = rolesIG(hasImg);
      logo(ctx, c.logo);

      const top = hasImg ? 500 : 320;
      eyebrowIG(ctx, state.eyebrow || '¿Te preocupa?', MX, top, c.eyebrow);

      ctx.fillStyle = c.title;
      ctx.font = 'italic 400 58px "Cormorant Garamond", Georgia, serif';
      const end = drawWrapped(ctx, state.title || '¿Y si mi bebé llora?', MX, top + 96, W - MX * 2, 68, 4);

      if(state.body){
        ctx.fillStyle = c.rule; ctx.fillRect(MX, end + 44, 44, 2);
        ctx.fillStyle = c.body;
        ctx.font = '400 32px "DM Sans", system-ui, sans-serif';
        drawWrapped(ctx, state.body, MX, end + 96, W - MX * 2 - 20, 44, 5);
      }
      pageNum(ctx, state, c.page);
    });
  },

  /* 6 · AUTORIDAD */
  'Autoridad': function(ctx, state){
    frame(ctx, (ctx) => {
      const hasImg = photoFull(ctx, state.image, 'full');
      if(!hasImg) bgCream(ctx, false);
      const c = rolesIG(hasImg);
      logo(ctx, c.logo);

      const top = hasImg ? 420 : 280;
      eyebrowIG(ctx, state.eyebrow || 'Autoridad', MX, top, c.eyebrow);

      ctx.fillStyle = c.title;
      ctx.font = '500 52px "Cormorant Garamond", Georgia, serif';
      const end = drawWrapped(ctx, state.title || 'Más de 830 recién nacidos.', MX, top + 90, W - MX * 2, 62, 3);

      let lines = [];
      if(Array.isArray(state.creds) && state.creds.length) lines = state.creds.slice();
      else if(state.body) lines = state.body.split(/\n|·|•/).map(s => s.trim()).filter(Boolean);
      lines = lines.slice(0, 4);

      let ly = end + 78;
      ctx.font = '400 30px "DM Sans", system-ui, sans-serif';
      for(let i = 0; i < lines.length; i++){
        ctx.fillStyle = c.rule; ctx.fillRect(MX, ly - 24, 24, 2);
        ctx.fillStyle = c.body; ctx.textAlign = 'left';
        const lend = drawWrapped(ctx, lines[i], MX + 42, ly, W - MX * 2 - 42, 38, 2);
        ly = lend + 50;
      }

      if(state.subtitle){
        ctx.fillStyle = c.title;
        ctx.font = 'italic 400 30px "Cormorant Garamond", Georgia, serif';
        drawWrapped(ctx, state.subtitle, MX, Math.max(ly + 10, H - 220), W - MX * 2 - 30, 40, 2);
      }
      pageNum(ctx, state, c.page);
    });
  },

  /* 7 · CTA */
  'CTA': function(ctx, state){
    frame(ctx, (ctx) => {
      const hasImg = photoFull(ctx, state.image, 'full');
      if(!hasImg) bgCharcoal(ctx);
      const c = rolesIG(true);
      logo(ctx, c.logo, true);

      const cy = H / 2;
      if(state.eyebrow){
        ctx.save();
        ctx.font = '600 20px "DM Sans", system-ui, sans-serif';
        if('letterSpacing' in ctx) ctx.letterSpacing = '3px';
        ctx.fillStyle = c.eyebrow; ctx.textAlign = 'center';
        ctx.fillText(state.eyebrow.toUpperCase(), W / 2, cy - 180);
        ctx.restore();
      }

      ctx.fillStyle = c.title;
      ctx.font = 'italic 400 58px "Cormorant Garamond", Georgia, serif';
      const end = drawWrapped(ctx, state.title || '¿Lista para reservar?', W / 2, cy - 70, W - MX * 2 - 20, 68, 3, 'center');

      ruleCentered(ctx, end + 46, c.rule, 44);

      if(state.subtitle){
        ctx.save();
        ctx.font = '600 18px "DM Sans", system-ui, sans-serif';
        if('letterSpacing' in ctx) ctx.letterSpacing = '3px';
        ctx.fillStyle = c.eyebrow; ctx.textAlign = 'center';
        ctx.fillText(state.subtitle.toUpperCase(), W / 2, end + 100);
        ctx.restore();
      }

      const label = (state.cta || 'Agenda tu fecha').toUpperCase();
      ctx.font = '600 20px "DM Sans", system-ui, sans-serif';
      if('letterSpacing' in ctx) ctx.letterSpacing = '3px';
      const bw = Math.min(W - MX * 2, ctx.measureText(label).width + 90);
      const bh = 68, bx = (W - bw) / 2, by = end + 142;
      ctx.strokeStyle = c.btnBorder; ctx.lineWidth = 2;
      roundRect(ctx, bx, by, bw, bh, 2, false, true);
      ctx.fillStyle = c.btnText; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(label, W / 2, by + bh / 2 + 1);
      ctx.textBaseline = 'alphabetic';
      if('letterSpacing' in ctx) ctx.letterSpacing = '0px';

      pageNum(ctx, state, c.page);
    });
  }
};

// exponer y fijar Instagram First como modo por defecto (prioridad: lectura móvil)
window.TEMPLATES_IG = TEMPLATES_IG;
window.TEMPLATES = TEMPLATES_IG;
