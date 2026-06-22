/* Bambuky — Sistema de variantes editoriales + modos de contraste.

   7 categorías (sin añadir nuevas) · 3 variantes de LAYOUT por categoría ·
   modos de CONTRASTE (Light / Dark / Split / Overlay / Highlight).

   - La VARIANTE cambia la composición (alineación, énfasis, decoración) para
     que no todos los carruseles se vean iguales.
   - El MODO solo cambia fondo, overlay, color de texto y contraste — misma
     composición — para que cualquier fotografía funcione sin rediseñar.

   Reutiliza helpers globales de templates.js: frame, coverRect, bgCream,
   bgCharcoal, drawWrapped, logo, pageNum, diamond, ruleCentered, roundRect,
   PAL, W, H, MX.
*/

/* ---- Catálogo de variantes (la primera es la principal por defecto) ---- */
const VARIANTS = {
  'Portada':            [{id:'hero',label:'Hero'},{id:'editorial',label:'Editorial'},{id:'statement',label:'Statement'}],
  'Problema':           [{id:'pregunta',label:'Pregunta'},{id:'mito',label:'Mito'},{id:'error',label:'Error'}],
  'Urgencia biológica': [{id:'ventana',label:'Ventana'},{id:'cronologia',label:'Cronología'},{id:'oportunidad',label:'Oportunidad'}],
  'Solución':           [{id:'proceso',label:'Proceso'},{id:'acompanamiento',label:'Acompañamiento'},{id:'experiencia',label:'Experiencia'}],
  'Objeción':           [{id:'pregunta',label:'Pregunta'},{id:'tranquilidad',label:'Tranquilidad'},{id:'caso',label:'Caso real'}],
  'Autoridad':          [{id:'estadistica',label:'Estadística'},{id:'filosofia',label:'Filosofía'},{id:'experiencia',label:'Experiencia'}],
  'CTA':                [{id:'pregunta',label:'Pregunta'},{id:'conversacion',label:'Conversación'},{id:'accion',label:'Acción'}]
};

/* ---- Modos de contraste disponibles por categoría (la primera por defecto) ---- */
const MODE_LABELS = {light:'Light', dark:'Dark', split:'Split', overlay:'Overlay', highlight:'Highlight'};
const MODES = {
  'Portada':            ['light','dark','split','overlay'],
  'Problema':           ['light','dark','split'],
  'Urgencia biológica': ['light','dark','overlay'],
  'Solución':           ['light','dark','split'],
  'Objeción':           ['light','dark','overlay'],
  'Autoridad':          ['light','dark','highlight'],
  'CTA':                ['light','dark','overlay']
};

function defaultVariant(tpl){ const v = VARIANTS[tpl]; return v && v[0] ? v[0].id : ''; }
function normalizeVariant(tpl, id){
  const list = VARIANTS[tpl] || [];
  if(!id) return defaultVariant(tpl);
  const k = String(id).toLowerCase();
  const f = list.find(x => x.id === k || x.label.toLowerCase() === k);
  return f ? f.id : defaultVariant(tpl);
}
function defaultMode(tpl){ const m = MODES[tpl]; return m && m[0] ? m[0] : 'light'; }
function normalizeMode(tpl, m){
  const list = MODES[tpl] || ['light'];
  if(!m) return list[0];
  m = String(m).toLowerCase();
  return list.includes(m) ? m : list[0];
}

/* ---- Tema de color según el modo ---- */
function theme(mode){
  const dark = (mode === 'dark' || mode === 'overlay');
  if(dark) return {dark:true, title:'#FAF8F5', eyebrow:'#D8E2DC', body:'#EDE6DB', rule:'#9DB8B0', accent:'#C8B89A', logo:'#D8E2DC', page:'#9DB3AB'};
  return {dark:false, title:'#2F3A37', eyebrow:'#5B736B', body:'#3D4A46', rule:'#5B736B', accent:'#84A59D', logo:'#5B736B', page:'#84A59D'};
}

/* ---- Scrim (degradado de legibilidad) en la zona del texto ---- */
function scrim(ctx, anchor, kind){
  const rgb = kind === 'light' ? '250,248,245' : '40,49,46';
  let g;
  if(anchor === 'center'){
    g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, `rgba(${rgb},0.12)`);
    g.addColorStop(0.42, `rgba(${rgb},0.92)`);
    g.addColorStop(0.58, `rgba(${rgb},0.92)`);
    g.addColorStop(1, `rgba(${rgb},0.12)`);
  } else if(anchor === 'top'){
    g = ctx.createLinearGradient(0, 0, 0, H * 0.7);
    g.addColorStop(0, `rgba(${rgb},0.94)`);
    g.addColorStop(1, `rgba(${rgb},0)`);
  } else { // bottom
    g = ctx.createLinearGradient(0, H * 0.30, 0, H);
    g.addColorStop(0, `rgba(${rgb},0)`);
    g.addColorStop(1, `rgba(${rgb},0.95)`);
  }
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

/* ---- Pinta el fondo según el modo (misma composición; cambia tratamiento) ---- */
function paintBg(ctx, mode, image, anchor){
  const hasImg = !!(image && image.img);
  anchor = anchor || 'bottom';
  if(mode === 'split'){
    const splitY = Math.round(H * 0.52);
    if(hasImg){ coverRect(ctx, image.img, 0, 0, W, splitY); ctx.fillStyle = 'rgba(40,49,46,0.10)'; ctx.fillRect(0,0,W,splitY); }
    else { const g = ctx.createLinearGradient(0,0,W,splitY); g.addColorStop(0,'#D8E2DC'); g.addColorStop(1,'#84A59D'); ctx.fillStyle = g; ctx.fillRect(0,0,W,splitY); }
    ctx.fillStyle = PAL.cream; ctx.fillRect(0, splitY, W, H - splitY);
    return;
  }
  if(mode === 'overlay'){
    if(hasImg){ coverRect(ctx, image.img, 0, 0, W, H); ctx.fillStyle = 'rgba(35,43,40,0.62)'; ctx.fillRect(0,0,W,H); }
    else bgCharcoal(ctx);
    return;
  }
  if(mode === 'dark'){
    if(hasImg){ coverRect(ctx, image.img, 0, 0, W, H); ctx.fillStyle = 'rgba(40,49,46,0.28)'; ctx.fillRect(0,0,W,H); scrim(ctx, anchor, 'dark'); }
    else bgCharcoal(ctx);
    return;
  }
  // light & highlight
  if(hasImg){ coverRect(ctx, image.img, 0, 0, W, H); scrim(ctx, anchor, 'light'); }
  else bgCream(ctx, false);
}

/* ---- Eyebrow + regla decorativa ---- */
function eb(ctx, text, x, y, color, align){
  if(!text) return y;
  align = align || 'left';
  ctx.save();
  ctx.font = '600 20px "DM Sans", system-ui, sans-serif';
  if('letterSpacing' in ctx) ctx.letterSpacing = '3px';
  ctx.fillStyle = color; ctx.textAlign = align;
  ctx.fillText(text.toUpperCase(), align === 'center' ? W/2 : x, y);
  ctx.restore();
  ctx.fillStyle = color;
  if(align === 'center') ctx.fillRect(W/2 - 22, y + 24, 44, 2);
  else ctx.fillRect(x, y + 24, 44, 2);
  return y + 24;
}

/* ---- Botón CTA (solo borde) ---- */
function ctaButton(ctx, label, y, t){
  label = (label || 'Escríbenos por DM').toUpperCase();
  ctx.save();
  ctx.font = '600 20px "DM Sans", system-ui, sans-serif';
  if('letterSpacing' in ctx) ctx.letterSpacing = '3px';
  const bw = Math.min(W - MX*2, ctx.measureText(label).width + 90), bh = 68, bx = (W - bw)/2;
  ctx.strokeStyle = t.accent; ctx.lineWidth = 2; roundRect(ctx, bx, y, bw, bh, 2, false, true);
  ctx.fillStyle = t.title; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(label, W/2, y + bh/2 + 1);
  ctx.restore();
  ctx.textBaseline = 'alphabetic';
}

/* helper: ¿hay foto? */
function hasPhoto(state){ return !!(state.image && state.image.img); }

/* ============================================================
   CATEGORÍAS  (cada una despacha por variante; el modo da el tratamiento)
   ============================================================ */

const TEMPLATES_V = {

  /* 1 · PORTADA — hero · editorial · statement */
  'Portada': function(ctx, state){
    frame(ctx, (ctx) => {
      const v = normalizeVariant('Portada', state.variant);
      const m = normalizeMode('Portada', state.mode);
      const anchor = v === 'hero' ? 'bottom' : 'center';
      paintBg(ctx, m, state.image, anchor);
      const t = theme(m); logo(ctx, t.logo);
      const ey = state.eyebrow || 'Fotografía Newborn Querétaro';
      const title = state.title || 'Los primeros días';

      if(v === 'hero'){
        const y = 858;
        eb(ctx, ey, MX, y, t.eyebrow);
        ctx.fillStyle = t.title; ctx.font = '400 90px "Cormorant Garamond", Georgia, serif';
        const end = drawWrapped(ctx, title, MX, y + 108, W - MX*2, 94, 3);
        if(state.subtitle){ ctx.fillStyle = t.body; ctx.font = '400 24px "DM Sans", system-ui, sans-serif'; drawWrapped(ctx, state.subtitle, MX, end + 54, W - MX*2 - 30, 33, 3); }
      } else if(v === 'editorial'){
        const cy = H/2;
        eb(ctx, ey, W/2, cy - 170, t.eyebrow, 'center');
        ctx.fillStyle = t.title; ctx.font = 'italic 400 64px "Cormorant Garamond", Georgia, serif';
        const end = drawWrapped(ctx, title, W/2, cy - 40, W - MX*2 - 10, 72, 3, 'center');
        ruleCentered(ctx, end + 34, t.rule, 44);
        if(state.subtitle){ ctx.fillStyle = t.body; ctx.font = '400 22px "DM Sans", system-ui, sans-serif'; drawWrapped(ctx, state.subtitle, W/2, end + 90, W - MX*2 - 40, 32, 2, 'center'); }
      } else { // statement
        const cy = H/2;
        ctx.fillStyle = t.title; ctx.font = '400 104px "Cormorant Garamond", Georgia, serif';
        const end = drawWrapped(ctx, title, MX, cy - 60, W - MX*2, 102, 3);
        if(state.subtitle){ ctx.fillStyle = t.body; ctx.font = '400 22px "DM Sans", system-ui, sans-serif'; drawWrapped(ctx, state.subtitle, MX, end + 56, W - MX*2 - 40, 32, 2); }
      }
      pageNum(ctx, state, t.page);
    });
  },

  /* 2 · PROBLEMA — pregunta · mito · error */
  'Problema': function(ctx, state){
    frame(ctx, (ctx) => {
      const v = normalizeVariant('Problema', state.variant);
      const m = normalizeMode('Problema', state.mode);
      paintBg(ctx, m, state.image, 'bottom');
      const t = theme(m); logo(ctx, t.logo);

      const top = (m === 'split') ? 770 : (hasPhoto(state) ? 650 : 330);
      const defEy = v === 'mito' ? 'Mito' : (v === 'error' ? 'El error' : 'La pregunta');
      eb(ctx, state.eyebrow || defEy, MX, top, t.eyebrow);

      ctx.fillStyle = t.title;
      ctx.font = (v === 'pregunta')
        ? 'italic 400 70px "Cormorant Garamond", Georgia, serif'
        : '400 74px "Cormorant Garamond", Georgia, serif';
      const end = drawWrapped(ctx, state.title || 'Lo que nadie te dice.', MX, top + 100, W - MX*2, 80, 3);

      if(state.body){
        ctx.fillStyle = t.body; ctx.font = '400 34px "DM Sans", system-ui, sans-serif';
        drawWrapped(ctx, state.body, MX, end + 56, W - MX*2 - 20, 46, 3);
      }
      pageNum(ctx, state, t.page);
    });
  },

  /* 3 · URGENCIA — ventana · cronologia · oportunidad */
  'Urgencia biológica': function(ctx, state){
    frame(ctx, (ctx) => {
      const v = normalizeVariant('Urgencia biológica', state.variant);
      const m = normalizeMode('Urgencia biológica', state.mode);
      const anchor = (v === 'cronologia') ? 'bottom' : 'center';
      paintBg(ctx, m, state.image, anchor);
      const t = theme(m);
      const big = state.number || state.title || '10';

      if(v === 'ventana'){
        logo(ctx, t.logo, true);
        const cy = H/2;
        eb(ctx, state.eyebrow || 'Urgencia biológica', W/2, cy - 252, t.eyebrow, 'center');
        ctx.fillStyle = t.title; ctx.font = '400 230px "Cormorant Garamond", Georgia, serif'; ctx.textAlign = 'center';
        ctx.fillText(big, W/2, cy + 48);
        if(state.subtitle){ ctx.save(); ctx.font = '600 20px "DM Sans", system-ui, sans-serif'; if('letterSpacing' in ctx) ctx.letterSpacing = '3px'; ctx.fillStyle = t.eyebrow; ctx.textAlign = 'center'; ctx.fillText(state.subtitle.toUpperCase(), W/2, cy + 108); ctx.restore(); }
        ruleCentered(ctx, cy + 148, t.rule, 44);
        const phrase = state.body || (state.number ? state.title : '');
        if(phrase){ ctx.fillStyle = t.title; ctx.font = 'italic 400 38px "Cormorant Garamond", Georgia, serif'; drawWrapped(ctx, phrase, W/2, cy + 212, W - MX*2 - 40, 48, 2, 'center'); }
      } else if(v === 'cronologia'){
        logo(ctx, t.logo);
        const top = hasPhoto(state) || m==='split' ? 700 : 420;
        eb(ctx, state.eyebrow || 'Cronología', MX, top, t.eyebrow);
        ctx.fillStyle = t.title; ctx.font = '400 150px "Cormorant Garamond", Georgia, serif';
        ctx.textAlign = 'left'; ctx.fillText(big, MX, top + 150);
        if(state.subtitle){ ctx.save(); ctx.font = '600 18px "DM Sans", system-ui, sans-serif'; if('letterSpacing' in ctx) ctx.letterSpacing = '3px'; ctx.fillStyle = t.eyebrow; ctx.textAlign = 'left'; ctx.fillText(state.subtitle.toUpperCase(), MX, top + 196); ctx.restore(); }
        if(state.body){ ctx.fillStyle = t.body; ctx.font = '400 30px "DM Sans", system-ui, sans-serif'; drawWrapped(ctx, state.body, MX, top + 252, W - MX*2 - 20, 42, 3); }
      } else { // oportunidad
        logo(ctx, t.logo, true);
        const cy = H/2;
        eb(ctx, state.eyebrow || 'La oportunidad', W/2, cy - 180, t.eyebrow, 'center');
        ctx.fillStyle = t.title; ctx.font = '400 60px "Cormorant Garamond", Georgia, serif';
        const end = drawWrapped(ctx, state.title || big, W/2, cy - 60, W - MX*2 - 20, 66, 3, 'center');
        ruleCentered(ctx, end + 36, t.rule, 44);
        if(state.body){ ctx.fillStyle = t.body; ctx.font = '400 26px "DM Sans", system-ui, sans-serif'; drawWrapped(ctx, state.body, W/2, end + 92, W - MX*2 - 40, 36, 3, 'center'); }
      }
      pageNum(ctx, state, t.page);
    });
  },

  /* 4 · SOLUCIÓN — proceso · acompanamiento · experiencia */
  'Solución': function(ctx, state){
    frame(ctx, (ctx) => {
      const v = normalizeVariant('Solución', state.variant);
      const m = normalizeMode('Solución', state.mode);
      const centered = (v === 'acompanamiento');
      const anchor = centered ? 'center' : 'bottom';
      paintBg(ctx, m, state.image, anchor);
      const t = theme(m); logo(ctx, t.logo, centered);

      const defEy = v === 'acompanamiento' ? 'Acompañamiento' : (v === 'experiencia' ? 'La experiencia' : 'El proceso');

      if(centered){
        const cy = H/2;
        eb(ctx, state.eyebrow || defEy, W/2, cy - 160, t.eyebrow, 'center');
        ctx.fillStyle = t.title; ctx.font = '500 50px "Cormorant Garamond", Georgia, serif';
        const end = drawWrapped(ctx, state.title || 'Te acompañamos.', W/2, cy - 40, W - MX*2 - 20, 58, 3, 'center');
        if(state.body){ ctx.fillStyle = t.body; ctx.font = '400 28px "DM Sans", system-ui, sans-serif'; drawWrapped(ctx, state.body, W/2, end + 60, W - MX*2 - 40, 40, 3, 'center'); }
      } else {
        const top = (m === 'split') ? 760 : (hasPhoto(state) ? 640 : 420);
        eb(ctx, state.eyebrow || defEy, MX, top, t.eyebrow);
        ctx.fillStyle = t.title;
        ctx.font = (v === 'experiencia')
          ? 'italic 400 56px "Cormorant Garamond", Georgia, serif'
          : '500 54px "Cormorant Garamond", Georgia, serif';
        const end = drawWrapped(ctx, state.title || 'Una sesión segura.', MX, top + 86, W - MX*2, 62, 3);
        if(state.body){ ctx.fillStyle = t.body; ctx.font = '400 32px "DM Sans", system-ui, sans-serif'; drawWrapped(ctx, state.body, MX, end + 52, W - MX*2 - 20, 44, 3); }
      }
      pageNum(ctx, state, t.page);
    });
  },

  /* 5 · OBJECIÓN — pregunta · tranquilidad · caso real */
  'Objeción': function(ctx, state){
    frame(ctx, (ctx) => {
      const v = normalizeVariant('Objeción', state.variant);
      const m = normalizeMode('Objeción', state.mode);
      const anchor = (v === 'caso') ? 'bottom' : 'center';
      paintBg(ctx, m, state.image, anchor);
      const t = theme(m);

      if(v === 'tranquilidad'){
        logo(ctx, t.logo, true);
        const cy = H/2;
        eb(ctx, state.eyebrow || 'Tranquilidad', W/2, cy - 170, t.eyebrow, 'center');
        ctx.fillStyle = t.title; ctx.font = '400 52px "Cormorant Garamond", Georgia, serif';
        const end = drawWrapped(ctx, state.title || 'Todo va a estar bien.', W/2, cy - 50, W - MX*2 - 20, 60, 3, 'center');
        if(state.body){ ctx.fillStyle = t.body; ctx.font = '400 27px "DM Sans", system-ui, sans-serif'; drawWrapped(ctx, state.body, W/2, end + 64, W - MX*2 - 40, 38, 3, 'center'); }
      } else if(v === 'caso'){
        logo(ctx, t.logo);
        const top = hasPhoto(state) || m==='overlay' ? 600 : 380;
        ctx.fillStyle = t.accent; ctx.font = '400 110px "Cormorant Garamond", Georgia, serif'; ctx.textAlign = 'left';
        ctx.fillText('“', MX - 6, top);
        ctx.fillStyle = t.title; ctx.font = 'italic 400 46px "Cormorant Garamond", Georgia, serif';
        const end = drawWrapped(ctx, state.title || 'Llegué agotada y salí acompañada.', MX, top + 60, W - MX*2, 58, 4);
        if(state.subtitle){ ctx.save(); ctx.font = '600 18px "DM Sans", system-ui, sans-serif'; if('letterSpacing' in ctx) ctx.letterSpacing = '2.5px'; ctx.fillStyle = t.eyebrow; ctx.textAlign = 'left'; ctx.fillText(state.subtitle.toUpperCase(), MX, end + 56); ctx.restore(); }
      } else { // pregunta
        logo(ctx, t.logo);
        const top = hasPhoto(state) || m==='overlay' ? 560 : 380;
        eb(ctx, state.eyebrow || '¿Te preocupa?', MX, top, t.eyebrow);
        ctx.fillStyle = t.title; ctx.font = 'italic 400 50px "Cormorant Garamond", Georgia, serif';
        const end = drawWrapped(ctx, state.title || '¿Y si mi bebé llora?', MX, top + 84, W - MX*2, 60, 4);
        if(state.body){ ctx.fillStyle = t.rule; ctx.fillRect(MX, end + 40, 44, 2); ctx.fillStyle = t.body; ctx.font = '400 30px "DM Sans", system-ui, sans-serif'; drawWrapped(ctx, state.body, MX, end + 92, W - MX*2 - 20, 42, 3); }
      }
      pageNum(ctx, state, t.page);
    });
  },

  /* 6 · AUTORIDAD — estadistica · filosofia · experiencia */
  'Autoridad': function(ctx, state){
    frame(ctx, (ctx) => {
      const v = normalizeVariant('Autoridad', state.variant);
      const m = normalizeMode('Autoridad', state.mode);
      paintBg(ctx, m, state.image, v === 'filosofia' ? 'center' : 'bottom');
      const t = theme(m);
      const accent = t.accent;
      logo(ctx, accent);

      let lines = [];
      if(Array.isArray(state.creds) && state.creds.length) lines = state.creds.slice();
      else if(state.body) lines = state.body.split(/\n|·|•/).map(s => s.trim()).filter(Boolean);
      lines = lines.slice(0, 4);

      if(v === 'filosofia'){
        const cy = H/2;
        eb(ctx, state.eyebrow || 'Filosofía', W/2, cy - 150, t.eyebrow, 'center');
        ctx.fillStyle = t.title; ctx.font = 'italic 400 46px "Cormorant Garamond", Georgia, serif';
        const end = drawWrapped(ctx, state.subtitle || state.title || 'Aquí siempre gana el bebé.', W/2, cy - 30, W - MX*2 - 30, 56, 3, 'center');
        ruleCentered(ctx, end + 36, accent, 44);
        if(lines.length){ ctx.fillStyle = t.body; ctx.font = '400 22px "DM Sans", system-ui, sans-serif'; drawWrapped(ctx, lines.join('  ·  '), W/2, end + 92, W - MX*2 - 30, 32, 2, 'center'); }
      } else if(v === 'estadistica'){
        const top = hasPhoto(state) ? 360 : 300;
        eb(ctx, state.eyebrow || 'Autoridad', MX, top, t.eyebrow);
        const stat = state.number || '+830';
        ctx.fillStyle = accent; ctx.font = '400 130px "Cormorant Garamond", Georgia, serif'; ctx.textAlign = 'left';
        ctx.fillText(stat, MX, top + 150);
        ctx.fillStyle = t.title; ctx.font = '400 38px "Cormorant Garamond", Georgia, serif';
        const end = drawWrapped(ctx, state.title || 'recién nacidos en Querétaro.', MX, top + 210, W - MX*2, 46, 2);
        let ly = end + 58;
        ctx.font = '400 26px "DM Sans", system-ui, sans-serif';
        for(let i=0;i<lines.length;i++){ diamond(ctx, MX + 7, ly - 8, 7, accent); ctx.fillStyle = t.body; ctx.textAlign='left'; const le = drawWrapped(ctx, lines[i], MX + 34, ly, W - MX*2 - 34, 34, 1); ly = le + 40; }
      } else { // experiencia
        const top = hasPhoto(state) ? 430 : 360;
        if(m === 'highlight'){ ctx.fillStyle = 'rgba(132,165,157,0.18)'; ctx.fillRect(0, top - 78, W, 150); }
        eb(ctx, state.eyebrow || '', MX, top, t.eyebrow);
        ctx.fillStyle = accent; ctx.font = '400 46px "Cormorant Garamond", Georgia, serif';
        const end = drawWrapped(ctx, state.title || 'Bambuky · Estudio Newborn · Querétaro', MX, top + (state.eyebrow ? 70 : 8), W - MX*2, 54, 2);
        let ly = end + 84;
        ctx.font = '400 28px "DM Sans", system-ui, sans-serif';
        for(let i=0;i<lines.length;i++){ diamond(ctx, MX + 8, ly - 9, 8, accent); ctx.fillStyle = t.body; ctx.textAlign='left'; const le = drawWrapped(ctx, lines[i], MX + 38, ly, W - MX*2 - 38, 36, 2); ly = le + 42; }
        if(state.subtitle){ ctx.fillStyle = t.dark ? '#9DB3AB' : t.body; ctx.font = 'italic 400 28px "Cormorant Garamond", Georgia, serif'; drawWrapped(ctx, state.subtitle, MX, Math.max(ly + 24, H - 330), W - MX*2 - 30, 38, 2); }
      }
      pageNum(ctx, state, t.page);
    });
  },

  /* 7 · CTA — pregunta · conversacion · accion */
  'CTA': function(ctx, state){
    frame(ctx, (ctx) => {
      const v = normalizeVariant('CTA', state.variant);
      const m = normalizeMode('CTA', state.mode);
      paintBg(ctx, m, state.image, 'center');
      const t = theme(m); logo(ctx, t.logo, true);

      const cy = H/2;
      const defEy = v === 'conversacion' ? 'Hablemos' : (v === 'accion' ? 'Reserva tu fecha' : 'Querétaro · México');
      ctx.save();
      ctx.font = '600 20px "DM Sans", system-ui, sans-serif';
      if('letterSpacing' in ctx) ctx.letterSpacing = '3px';
      ctx.fillStyle = t.eyebrow; ctx.textAlign = 'center';
      ctx.fillText((state.eyebrow || defEy).toUpperCase(), W/2, cy - 170);
      ctx.restore();

      ctx.fillStyle = t.title;
      ctx.font = (v === 'accion')
        ? '400 58px "Cormorant Garamond", Georgia, serif'
        : 'italic 400 56px "Cormorant Garamond", Georgia, serif';
      const end = drawWrapped(ctx, state.title || '¿Lista para reservar?', W/2, cy - 60, W - MX*2 - 20, 66, 3, 'center');

      ruleCentered(ctx, end + 44, t.rule, 44);

      if(state.subtitle){ ctx.fillStyle = t.body; ctx.font = '400 24px "DM Sans", system-ui, sans-serif'; drawWrapped(ctx, state.subtitle, W/2, end + 96, W - MX*2 - 50, 34, 2, 'center'); }

      ctaButton(ctx, state.cta || 'Escríbenos por DM', end + (state.subtitle ? 168 : 100), t);
      pageNum(ctx, state, t.page);
    });
  }
};

/* expose */
window.TEMPLATES = TEMPLATES_V;
window.VARIANTS = VARIANTS;
window.MODES = MODES;
window.MODE_LABELS = MODE_LABELS;
window.normalizeVariant = normalizeVariant;
window.normalizeMode = normalizeMode;
window.defaultVariant = defaultVariant;
window.defaultMode = defaultMode;
