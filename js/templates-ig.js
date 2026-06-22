/* Bambuky — Premium Editorial Carousel Templates
   3 color themes  ×  3 layout variants  ×  7 slide types
   Typography: Cormorant Garamond (headlines) + Manrope (UI/body)

   Reuses helpers from templates.js: frame, coverRect, drawWrapped,
   roundRect, diamond, ruleCentered, W, H, MX.
*/

/* ============================================================
   COLOR THEMES
   ============================================================ */
const COLOR_THEMES = {
  'heritage-blue': {
    name:'Heritage Blue',
    bg:'#4D5D70', bgLight:'#647589',
    textPrimary:'#F5F3EF', textSecondary:'#D7E0EA',
    accent:'#B9CBDD', line:'rgba(245,243,239,0.35)',
    isDark:true, overlayRgb:'50,60,75',
    onPhoto:{primary:'#F5F3EF', secondary:'#D7E0EA'},
    inkDark:'#2A3544', inkSoft:'#4D5D70'
  },
  'sage-garden': {
    name:'Sage Garden',
    bg:'#D9DDD1', bgLight:'#EEF0EA', bgDark:'#AEB5A1',
    textPrimary:'#3F4A3C', textSecondary:'#6E7768',
    accent:'#87947E', line:'rgba(63,74,60,0.22)',
    isDark:false, overlayRgb:'50,56,48',
    onPhoto:{primary:'#F5F3EF', secondary:'#DDE0D8'},
    inkDark:'#2E3A2B', inkSoft:'#4A5845'
  },
  'blush-editorial': {
    name:'Blush Editorial',
    bg:'#F3E6E2', bgLight:'#FBF5F2', bgDark:'#D8B8AF',
    textPrimary:'#54433F', textSecondary:'#A97F74',
    accent:'#C89B91', line:'rgba(84,67,63,0.22)',
    isDark:false, overlayRgb:'65,52,48',
    onPhoto:{primary:'#FBF5F2', secondary:'#F3E6E2'},
    inkDark:'#3E2E2A', inkSoft:'#5E4A44'
  }
};

function getTheme(mode){
  return COLOR_THEMES[mode] || COLOR_THEMES['sage-garden'];
}

/* ============================================================
   VARIANTS & MODES
   ============================================================ */
/* Eje principal = FAMILIA editorial (cover · moderna · minima).
   Elegir una familia y aplicarla a todo el carrusel = un lenguaje coherente.
   Las variantes antiguas quedan como legacy/hidden (código intacto). */
const FAMILIES = [
  {id:'cover',  label:'Editorial Cover'},
  {id:'moderna',label:'Editorial Moderna'},
  {id:'minima', label:'Editorial Mínima'}
];
const VARIANTS = {
  'Portada':            FAMILIES.concat([{id:'ed-classic',label:'Clásica',legacy:true},{id:'split',label:'Split',legacy:true},{id:'magazine',label:'Magazine',legacy:true},{id:'hero',label:'Photo Hero',legacy:true}]),
  'Problema':           FAMILIES.concat([{id:'foto-frase',label:'Foto + Frase',legacy:true},{id:'antes',label:'Antes',hidden:true},{id:'quote',label:'Quote',legacy:true}]),
  'Urgencia biológica': FAMILIES.concat([{id:'tiempo',label:'Tiempo',legacy:true},{id:'linea',label:'Línea',hidden:true},{id:'detalle',label:'Detalle',legacy:true}]),
  'Solución':           FAMILIES.concat([{id:'metodo',label:'Método',legacy:true},{id:'guia',label:'Guía',legacy:true},{id:'checklist',label:'Checklist',hidden:true}]),
  'Objeción':           FAMILIES.concat([{id:'pregunta',label:'Pregunta',legacy:true},{id:'mito',label:'Mito / Realidad',legacy:true},{id:'calma',label:'Calma',legacy:true}]),
  'Autoridad':          FAMILIES.concat([{id:'emocional',label:'Emocional',legacy:true},{id:'discreta',label:'Discreta',legacy:true},{id:'filosofia',label:'Filosofía',legacy:true}]),
  'CTA':                FAMILIES.concat([{id:'reserva',label:'Reserva',legacy:true},{id:'whatsapp',label:'WhatsApp',hidden:true},{id:'cierre',label:'Cierre',legacy:true}])
};

const MODES = {
  'Portada':            ['sage-garden','heritage-blue','blush-editorial'],
  'Problema':           ['sage-garden','heritage-blue','blush-editorial'],
  'Urgencia biológica': ['sage-garden','heritage-blue','blush-editorial'],
  'Solución':           ['sage-garden','heritage-blue','blush-editorial'],
  'Objeción':           ['sage-garden','heritage-blue','blush-editorial'],
  'Autoridad':          ['sage-garden','heritage-blue','blush-editorial'],
  'CTA':                ['sage-garden','heritage-blue','blush-editorial']
};

const MODE_LABELS = {
  'heritage-blue':'Heritage Blue',
  'sage-garden':'Sage Garden',
  'blush-editorial':'Blush Editorial'
};

function defaultVariant(tpl){ const v = VARIANTS[tpl]; return v && v[0] ? v[0].id : ''; }
function normalizeVariant(tpl, id){
  const list = VARIANTS[tpl] || [];
  if(!id) return defaultVariant(tpl);
  const k = String(id).toLowerCase();
  const f = list.find(x => x.id === k || x.label.toLowerCase() === k);
  return f ? f.id : defaultVariant(tpl);
}
function defaultMode(){ return 'sage-garden'; }
function normalizeMode(tpl, m){
  const list = MODES[tpl] || ['sage-garden'];
  if(!m) return list[0];
  m = String(m).toLowerCase();
  return list.includes(m) ? m : list[0];
}

/* ============================================================
   TEXT COLOR HELPERS
   ============================================================ */
function txtSolid(t){ return {h:t.textPrimary, p:t.textSecondary, a:t.accent}; }
function txtPhoto(t){
  if(t.isDark) return {h:t.textPrimary, p:t.textSecondary, a:t.accent};
  return {h:t.onPhoto.primary, p:t.onPhoto.secondary, a:t.accent};
}

/* ============================================================
   ACCENT TEXT SUPPORT  — {word} → colored span
   ============================================================ */
function drawAccent(ctx, text, x, y, maxW, lh, maxLines, align, baseColor, accentColor){
  if(!text) return y - lh;
  if(!text.includes('{')){
    ctx.fillStyle = baseColor;
    return drawWrapped(ctx, text, x, y, maxW, lh, maxLines, align);
  }
  var tokens = [];
  var inAcc = false, buf = '';
  for(var i=0;i<text.length;i++){
    if(text[i]==='{'){
      if(buf.trim()) buf.trim().split(/\s+/).forEach(function(w){tokens.push({t:w,a:false});});
      buf=''; inAcc=true;
    } else if(text[i]==='}'){
      if(buf.trim()) buf.trim().split(/\s+/).forEach(function(w){tokens.push({t:w,a:true});});
      buf=''; inAcc=false;
    } else buf+=text[i];
  }
  if(buf.trim()) buf.trim().split(/\s+/).forEach(function(w){tokens.push({t:w,a:inAcc});});
  if(!tokens.length) return y-lh;

  align = align||'left';
  var lines=[], cur=[], curText='';
  for(var j=0;j<tokens.length;j++){
    var tok=tokens[j];
    var test = curText ? curText+' '+tok.t : tok.t;
    if(curText && ctx.measureText(test).width>maxW){ lines.push(cur); cur=[tok]; curText=tok.t; }
    else { cur.push(tok); curText=test; }
  }
  if(cur.length) lines.push(cur);

  var spW = ctx.measureText(' ').width;
  var ty=y, lastY=y;
  for(var li=0;li<lines.length;li++){
    if(maxLines && li>=maxLines) break;
    lastY=ty;
    var line=lines[li];
    var fullText=line.map(function(w){return w.t;}).join(' ');
    var lineW=ctx.measureText(fullText).width;
    var dx;
    if(align==='center') dx=x-lineW/2;
    else if(align==='right') dx=x-lineW;
    else dx=x;
    ctx.textAlign='left';
    for(var wi=0;wi<line.length;wi++){
      ctx.fillStyle = line[wi].a ? accentColor : baseColor;
      ctx.fillText(line[wi].t, dx, ty);
      dx += ctx.measureText(line[wi].t).width;
      if(wi<line.length-1) dx+=spW;
    }
    ty+=lh;
  }
  ctx.textAlign = align;
  return lastY;
}

/* ============================================================
   DRAWING HELPERS
   ============================================================ */
var FONT_TITLE  = '"Cormorant Garamond", Georgia, serif';
var FONT_BODY   = '"Manrope", system-ui, sans-serif';

var SX = MX;
var ST = 80;
var SB = 80;

function titleSize(text){
  var clean = (text||'').replace(/\{|\}/g,'');
  var words = clean.trim().split(/\s+/).filter(Boolean).length;
  var s=_scales.title;
  if(words <= 5) return {fs:Math.round(88*s), lh:Math.round(94*s)};
  if(words <= 8) return {fs:Math.round(78*s), lh:Math.round(86*s)};
  return {fs:Math.round(68*s), lh:Math.round(76*s)};
}

function solidBg(ctx, t){
  ctx.fillStyle = t.bg; ctx.fillRect(0,0,W,H);
}

function contrastBg(ctx, state, t, overlayDir, overlayStrength){
  var cm = state.contrast || 'light';
  var photo = hasPhoto(state);
  var colors;
  if(cm==='overlay' && photo){
    fullPhoto(ctx,state.image);
    overlay(ctx,t,overlayDir||'bottom',overlayStrength||0.7);
    colors = txtPhoto(t);
  } else if(cm==='dark'){
    if(photo){ fullPhoto(ctx,state.image); overlay(ctx,t,'full',0.62); }
    else solidBg(ctx,t);
    colors = photo ? txtPhoto(t) : txtSolid(t);
  } else {
    if(photo){
      gradientBg(ctx,t);
    } else {
      ctx.fillStyle=t.bgLight||t.bg; ctx.fillRect(0,0,W,H);
    }
    colors = txtSolid(t);
  }
  return textColors(colors, t, state);
}

function hexAlpha(hex, alpha){
  var r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return 'rgba('+r+','+g+','+b+','+alpha+')';
}

function textColors(c, t, state){
  var mode = state.textColorMode || 'base-accent';
  if(mode==='white-accent') return {h:'#F5F3EF', p:'rgba(245,243,239,0.78)', a:t.accent};
  if(mode==='accent-white') return {h:t.accent, p:hexAlpha(t.accent,0.72), a:'#F5F3EF'};
  if(mode==='dark-accent') return {h:t.inkDark||t.textPrimary, p:t.inkSoft||t.textSecondary, a:t.accent};
  return {h:c.h, p:c.p, a:t.accent};
}

var _scales={title:1,subtitle:1,body:1,cta:1,eyebrow:1};
function setScales(state){
  _scales={
    title:state.fontScaleTitle||1,
    subtitle:state.fontScaleSubtitle||1,
    body:state.fontScaleBody||1,
    cta:state.fontScaleCta||1,
    eyebrow:state.fontScaleEyebrow||1
  };
  _showLogo=(state.showLogo!==false);
}

function gradientBg(ctx, t){
  var g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0, t.bgLight||t.bg);
  g.addColorStop(1, t.bg);
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
}

function hasPhoto(state){ return !!(state.image && state.image.img); }

function fullPhoto(ctx, image){
  if(!image||!image.img) return false;
  coverRect(ctx, image, 0,0,W,H); return true;
}

function overlay(ctx, t, direction, strength){
  var rgb=t.overlayRgb, a=strength||0.6;
  var g;
  if(direction==='bottom'){
    g=ctx.createLinearGradient(0,H*0.45,0,H);
    g.addColorStop(0,'rgba('+rgb+',0)');
    g.addColorStop(0.55,'rgba('+rgb+','+(a*0.35)+')');
    g.addColorStop(1,'rgba('+rgb+','+a+')');
  } else if(direction==='top'){
    g=ctx.createLinearGradient(0,0,0,H*0.55);
    g.addColorStop(0,'rgba('+rgb+','+a+')');
    g.addColorStop(0.45,'rgba('+rgb+','+(a*0.35)+')');
    g.addColorStop(1,'rgba('+rgb+',0)');
  } else {
    ctx.fillStyle='rgba('+rgb+','+a+')'; ctx.fillRect(0,0,W,H); return;
  }
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
}

var _showLogo=true;
function bambukyLogo(ctx, color, centered){
  if(!_showLogo) return;
  ctx.save();
  ctx.font='500 18px '+FONT_BODY;
  if('letterSpacing' in ctx) ctx.letterSpacing='4px';
  ctx.fillStyle=color; ctx.globalAlpha=0.85;
  ctx.textAlign=centered?'center':'right';
  ctx.fillText('BAMBUKY', centered ? W/2 : W-SX, ST+20);
  ctx.restore();
}

function fotograma(ctx, state, color){
  var p=state._page, total=state._total;
  if(!p) return;
  ctx.save();
  ctx.font='400 14px '+FONT_BODY;
  if('letterSpacing' in ctx) ctx.letterSpacing='2px';
  ctx.fillStyle=color; ctx.globalAlpha=0.5;
  ctx.textAlign='center';
  var txt=String(p).padStart(2,'0')+' / '+String(total||7).padStart(2,'0');
  ctx.fillText(txt, W/2, H-SB-8);
  ctx.restore();
}

function eb(ctx, text, x, y, color, align){
  if(!text) return y;
  align=align||'left';
  var fs=Math.round(16*_scales.eyebrow);
  ctx.save();
  ctx.font='500 '+fs+'px '+FONT_BODY;
  if('letterSpacing' in ctx) ctx.letterSpacing='3.5px';
  ctx.fillStyle=color; ctx.globalAlpha=0.9; ctx.textAlign=align;
  ctx.fillText(text.toUpperCase(), align==='center'?W/2:x, y);
  ctx.restore();
  return y;
}

function fineRule(ctx, x, y, w, color){
  ctx.fillStyle=color; ctx.fillRect(x, y, w, 2);
}

function ctaPill(ctx, label, y, fillColor, textColor, borderColor){
  label=(label||'Escríbenos por DM').toUpperCase();
  ctx.save();
  ctx.font='500 '+Math.round(24*_scales.cta)+'px '+FONT_BODY;
  if('letterSpacing' in ctx) ctx.letterSpacing='3px';
  var bw=Math.min(W-SX*2, ctx.measureText(label).width+90), bh=64, bx=(W-bw)/2;
  ctx.strokeStyle=borderColor||fillColor||'#fff'; ctx.lineWidth=1.5;
  roundRect(ctx,bx,y,bw,bh,3,false,true);
  ctx.fillStyle=textColor; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(label, W/2, y+bh/2+1);
  ctx.restore();
  ctx.textBaseline='alphabetic';
}

function checkMark(ctx, x, y, size, color){
  ctx.save(); ctx.strokeStyle=color; ctx.lineWidth=3;
  ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+size*0.4,y+size*0.4); ctx.lineTo(x+size,y-size*0.25);
  ctx.stroke(); ctx.restore();
}

/* ============================================================
   SISTEMA DE FAMILIAS EDITORIALES
   3 lenguajes visuales aplicados a todo el sistema:
     · cover   — marco interior, masthead centrado, dateline, foto+velos
     · moderna — asimétrica, masthead arriba-izq, dateline vertical, tinta
     · minima  — masthead centrado, máximo aire, tinta, texto mínimo
   Cada slide comparte el MISMO chrome que su portada → coherencia total.
   ============================================================ */

// Masthead "BAMBUKY" reutilizable (idéntico en portada e interiores).
function fMasthead(ctx, color, align, size, tracking, y, alpha){
  if(!_showLogo) return;
  ctx.save();
  ctx.font='400 '+size+'px '+FONT_TITLE;
  if('letterSpacing' in ctx) ctx.letterSpacing=tracking+'px';
  ctx.fillStyle=color; if(alpha!=null) ctx.globalAlpha=alpha;
  ctx.textAlign=align; ctx.textBaseline='alphabetic';
  var x = align==='center' ? W/2+tracking/2 : (align==='right' ? W-SX : SX);
  ctx.fillText('BAMBUKY', x, y);
  ctx.restore();
}

// Tinta oscura para familias moderna/minima (pensadas para foto clara).
// Respeta el selector de color de texto (blanco para fotos oscuras).
function fInk(t, state){
  var mode=state.textColorMode||'';
  if(mode==='white-accent') return {h:'#F5F3EF', p:'rgba(245,243,239,0.82)', a:t.accent};
  if(mode==='accent-white') return {h:t.accent, p:hexAlpha(t.accent,0.72), a:'#F5F3EF'};
  return {h:t.inkDark||t.textPrimary, p:t.inkSoft||t.textSecondary, a:t.accent};
}

// CHROME COVER — foto + velos suaves + marco + masthead + dateline con filetes.
// veilBottom controla el velo inferior (0.60 portada · 0.66 interiores con texto).
function fCoverChrome(ctx, state, t, veilBottom){
  var photo=hasPhoto(state), c;
  if(photo){
    fullPhoto(ctx,state.image);
    ctx.fillStyle='rgba('+t.overlayRgb+',0.10)'; ctx.fillRect(0,0,W,H);
    var gT=ctx.createLinearGradient(0,0,0,H*0.30);
    gT.addColorStop(0,'rgba('+t.overlayRgb+',0.52)');
    gT.addColorStop(0.6,'rgba('+t.overlayRgb+',0.12)');
    gT.addColorStop(1,'rgba('+t.overlayRgb+',0)');
    ctx.fillStyle=gT; ctx.fillRect(0,0,W,H*0.30);
    var vb=(veilBottom==null?0.60:veilBottom);
    var gB=ctx.createLinearGradient(0,H*0.46,0,H);
    gB.addColorStop(0,'rgba('+t.overlayRgb+',0)');
    gB.addColorStop(0.6,'rgba('+t.overlayRgb+','+(vb*0.3).toFixed(3)+')');
    gB.addColorStop(1,'rgba('+t.overlayRgb+','+vb+')');
    ctx.fillStyle=gB; ctx.fillRect(0,H*0.42,W,H*0.58);
    c=txtPhoto(t);
  } else { gradientBg(ctx,t); c=txtSolid(t); }
  c=textColors(c,t,state);
  ctx.save(); ctx.globalAlpha=0.30; ctx.strokeStyle=c.h; ctx.lineWidth=1.5;
  ctx.strokeRect(50,50,W-100,H-100); ctx.restore();
  fMasthead(ctx,c.h,'center',60,12,154,null);
  var dl=(state.eyebrow||'Fotografía Newborn · Querétaro').toUpperCase();
  ctx.save(); ctx.font='500 14px '+FONT_BODY;
  if('letterSpacing' in ctx) ctx.letterSpacing='5px';
  ctx.fillStyle=c.h; ctx.globalAlpha=0.88; ctx.textAlign='center'; ctx.textBaseline='alphabetic';
  ctx.fillText(dl,W/2,198);
  var dlW=ctx.measureText(dl).width; ctx.restore();
  ctx.save(); ctx.globalAlpha=0.5; ctx.fillStyle=c.h;
  if(W/2-dlW/2-66>40){ ctx.fillRect(W/2-dlW/2-66,192,40,1.5); ctx.fillRect(W/2+dlW/2+26,192,40,1.5); }
  ctx.restore();
  return c;
}

// CHROME MODERNA — foto + tinte mínimo + masthead arriba-izq + dateline vertical.
// Velo direccional inferior: garantiza legibilidad del bloque inferior-izquierdo
// sin tapar al sujeto (la cara queda intacta). Claro para texto oscuro (foto
// high-key), oscuro para texto claro (foto oscura). Conserva la asimetría.
function fModernaChrome(ctx, state, t){
  var photo=hasPhoto(state), c;
  if(photo){
    fullPhoto(ctx,state.image);
    ctx.fillStyle='rgba('+t.overlayRgb+',0.06)'; ctx.fillRect(0,0,W,H);
    c=fInk(t,state);
    var lightText=(state.textColorMode==='white-accent');
    var g=ctx.createLinearGradient(0,H*0.40,0,H);
    if(lightText){
      g.addColorStop(0,'rgba('+t.overlayRgb+',0)');
      g.addColorStop(0.45,'rgba('+t.overlayRgb+',0.30)');
      g.addColorStop(1,'rgba('+t.overlayRgb+',0.62)');
    } else {
      g.addColorStop(0,'rgba(247,245,240,0)');
      g.addColorStop(0.45,'rgba(247,245,240,0.48)');
      g.addColorStop(1,'rgba(247,245,240,0.80)');
    }
    ctx.fillStyle=g; ctx.fillRect(0,H*0.38,W,H*0.62);
  } else { gradientBg(ctx,t); c={h:t.textPrimary,p:t.textSecondary,a:t.accent}; }
  fMasthead(ctx,c.h,'left',32,8,118,0.95);
  var dl=(state.eyebrow||'Bambuky · Querétaro').toUpperCase();
  ctx.save(); ctx.translate(W-68,H/2); ctx.rotate(-Math.PI/2);
  ctx.font='500 14px '+FONT_BODY;
  if('letterSpacing' in ctx) ctx.letterSpacing='5px';
  ctx.fillStyle=c.p; ctx.globalAlpha=0.9; ctx.textAlign='center'; ctx.textBaseline='alphabetic';
  ctx.fillText(dl,0,0); ctx.restore();
  return c;
}

// CHROME MINIMA — foto + tinte mínimo + masthead centrado. Máximo aire.
function fMinimaChrome(ctx, state, t){
  var photo=hasPhoto(state);
  if(photo){ fullPhoto(ctx,state.image); ctx.fillStyle='rgba('+t.overlayRgb+',0.05)'; ctx.fillRect(0,0,W,H); }
  else gradientBg(ctx,t);
  var c = photo ? fInk(t,state) : {h:t.textPrimary,p:t.textSecondary,a:t.accent};
  fMasthead(ctx,c.h,'center',40,10,122,null);
  return c;
}

/* ============================================================
   TEMPLATES
   ============================================================ */
const TEMPLATES_V = {

/* -------- 1 · PORTADA -------- */
'Portada': function(ctx, state){
  frame(ctx, function(ctx){
    setScales(state);
    var v=normalizeVariant('Portada',state.variant);
    var t=getTheme(state.mode);
    var photo=hasPhoto(state);
    var ts=titleSize(state.title);

    if(v==='cover'){
      /* EDITORIAL COVER — usa el chrome compartido (fCoverChrome)
         para que el masthead, marco, dateline y toggle de logo sean
         idénticos a los de las slides interiores de la misma familia. */
      var c=fCoverChrome(ctx,state,t,0.60);
      var yTitle=876;
      fineRule(ctx,SX,yTitle-66,54,t.accent);
      ctx.font='300 '+ts.fs+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'Los primeros días',SX,yTitle,W-SX*2,ts.lh,3,'left',c.h,c.a);
      if(state.subtitle){
        ctx.font='italic 300 40px '+FONT_TITLE;
        drawAccent(ctx,state.subtitle,SX,end+52,W-SX*2-30,50,2,'left',c.p,c.a);
      }

    } else if(v==='ed-classic'){
      /* ----------------------------------------------------------------
         A · EDITORIAL CLÁSICA — simetría de revista. Sin overlay.
         Masthead arriba + titular centrado abajo, sobre el suelo claro.
         ---------------------------------------------------------------- */
      var photo=hasPhoto(state);
      if(photo) fullPhoto(ctx,state.image); else gradientBg(ctx,t);
      var ink, inkSoft;
      if(photo){ ink=t.isDark?t.bg:t.textPrimary; inkSoft=t.isDark?t.bgLight:t.textSecondary; }
      else { ink=t.textPrimary; inkSoft=t.textSecondary; }

      ctx.save();
      ctx.font='400 58px '+FONT_TITLE;
      if('letterSpacing' in ctx) ctx.letterSpacing='12px';
      ctx.fillStyle=ink; ctx.textAlign='center'; ctx.textBaseline='alphabetic';
      ctx.fillText('BAMBUKY', W/2+6, 112);
      ctx.restore();

      var dlA=(state.eyebrow||'Fotografía Newborn · Querétaro').toUpperCase();
      ctx.save();
      ctx.font='500 14px '+FONT_BODY;
      if('letterSpacing' in ctx) ctx.letterSpacing='5px';
      ctx.fillStyle=ink; ctx.globalAlpha=0.9; ctx.textAlign='center';
      ctx.fillText(dlA, W/2, 156);
      var dlAW=ctx.measureText(dlA).width;
      ctx.restore();
      ctx.save(); ctx.globalAlpha=0.55; ctx.fillStyle=ink;
      if(W/2-dlAW/2-66 > 40){ ctx.fillRect(W/2-dlAW/2-66,150,40,1.5); ctx.fillRect(W/2+dlAW/2+26,150,40,1.5); }
      ctx.restore();

      ruleCentered(ctx,1168,ink,46);
      ctx.font='300 60px '+FONT_TITLE; ctx.fillStyle=ink;
      var endA=drawWrapped(ctx,state.title||'Los primeros días',W/2,1238,W-SX*2,66,1,'center');
      if(state.subtitle){
        ctx.font='italic 300 28px '+FONT_TITLE; ctx.fillStyle=inkSoft;
        drawWrapped(ctx,state.subtitle,W/2,endA+40,W-SX*2-60,36,1,'center');
      }

    } else if(v==='moderna'){
      /* FAMILIA MODERNA — asimetría, masthead arriba-izq, dateline vertical,
         titular grande abajo-izquierda en tinta. */
      var c=fModernaChrome(ctx,state,t);
      fineRule(ctx,SX,1150,54,c.a);
      ctx.font='300 '+Math.round(ts.fs*0.96)+'px '+FONT_TITLE; ctx.textAlign='left';
      var end=drawAccent(ctx,state.title||'Los primeros días',SX,1232,W-SX*2,Math.round(ts.lh*0.96),1,'left',c.h,c.a);
      if(state.subtitle){
        ctx.font='italic 300 30px '+FONT_TITLE;
        drawAccent(ctx,state.subtitle,SX,end+44,Math.round(W*0.70),40,1,'left',c.p,c.a);
      }

    } else if(v==='minima'){
      /* FAMILIA MÍNIMA — masthead centrado y un titular susurrado abajo.
         Máximo aire; la foto manda casi sola. */
      var c=fMinimaChrome(ctx,state,t);
      ctx.font='italic 300 30px '+FONT_TITLE;
      drawAccent(ctx,state.title||'Los primeros días',W/2,1288,W-SX*2,40,1,'center',c.h,c.a);

    } else if(v==='split'){
      var cm=state.contrast||'light';
      var splitY=Math.round(H*0.45);
      var c;
      if(cm==='overlay' && photo){
        fullPhoto(ctx,state.image); overlay(ctx,t,'top',0.48);
        c=txtPhoto(t);
      } else if(cm==='dark'){
        ctx.fillStyle=t.bg; ctx.fillRect(0,0,W,H);
        if(photo){ coverRect(ctx,state.image,0,splitY,W,H-splitY); overlay(ctx,t,'full',0.3); }
        c=txtSolid(t);
      } else {
        ctx.fillStyle=t.bg; ctx.fillRect(0,0,W,splitY);
        if(photo) coverRect(ctx,state.image,0,splitY,W,H-splitY);
        else { ctx.fillStyle=t.bgLight||t.bg; ctx.fillRect(0,splitY,W,H-splitY); }
        c=txtSolid(t);
      }
      c=textColors(c,t,state);
      bambukyLogo(ctx,c.p);
      eb(ctx,state.eyebrow||'Fotografía Newborn Querétaro',SX,180,c.p);
      ctx.font='300 '+ts.fs+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'Los primeros días',SX,268,W-SX*2,ts.lh,4,'left',c.h,c.a);
      if(state.subtitle){
        ctx.font='400 '+Math.round(34*_scales.subtitle)+'px '+FONT_BODY;
        drawAccent(ctx,state.subtitle,SX,end+48,W-SX*2-20,42,2,'left',c.p,c.a);
      }
      fotograma(ctx,state,c.p);

    } else if(v==='magazine'){
      var c=contrastBg(ctx,state,t,'top',0.78);
      bambukyLogo(ctx,c.p);
      eb(ctx,state.eyebrow||'Fotografía Newborn Querétaro',SX,210,c.p);
      ctx.font='300 '+ts.fs+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'Los primeros días',SX,300,W-SX*2,ts.lh,4,'left',c.h,c.a);
      if(state.subtitle){
        ctx.font='400 '+Math.round(34*_scales.subtitle)+'px '+FONT_BODY;
        drawAccent(ctx,state.subtitle,SX,end+48,W-SX*2-30,42,2,'left',c.p,c.a);
      }
      fotograma(ctx,state,c.p);

    } else {
      var c=contrastBg(ctx,state,t,'bottom',0.45);
      bambukyLogo(ctx,c.p);
      eb(ctx,state.eyebrow||'Fotografía Newborn Querétaro',SX,980,c.p);
      ctx.font='300 '+ts.fs+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'Los primeros días',SX,1080,W-SX*2,ts.lh,3,'left',c.h,c.a);
      if(state.subtitle){
        ctx.font='400 '+Math.round(34*_scales.subtitle)+'px '+FONT_BODY;
        drawAccent(ctx,state.subtitle,SX,end+44,W-SX*2-40,42,2,'left',c.p,c.a);
      }
      fotograma(ctx,state,c.p);
    }
  });
},

/* -------- 2 · PROBLEMA -------- */
'Problema': function(ctx, state){
  frame(ctx, function(ctx){
    setScales(state);
    var v=normalizeVariant('Problema',state.variant);
    var t=getTheme(state.mode);
    var ts=titleSize(state.title);

    if(v==='cover'){
      var c=fCoverChrome(ctx,state,t,0.66);
      ctx.font='300 '+Math.min(ts.fs,58)+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'Lo que nadie te dice.',SX,902,W-SX*2,Math.min(ts.lh,66),3,'left',c.h,c.a);
      fineRule(ctx,SX,838,54,t.accent);
      if(state.body){ ctx.font='400 '+Math.round(31*_scales.body)+'px '+FONT_BODY;
        drawAccent(ctx,state.body,SX,end+48,W-SX*2-20,42,4,'left',c.p,c.a); }

    } else if(v==='moderna'){
      var c=fModernaChrome(ctx,state,t);
      fineRule(ctx,SX,792,54,c.a);
      ctx.font='300 '+Math.min(ts.fs,64)+'px '+FONT_TITLE; ctx.textAlign='left';
      var end=drawAccent(ctx,state.title||'Lo que nadie te dice.',SX,860,Math.round(W*0.82),Math.min(ts.lh,72),3,'left',c.h,c.a);
      if(state.body){ ctx.font='400 '+Math.round(29*_scales.body)+'px '+FONT_BODY;
        drawAccent(ctx,state.body,SX,end+44,Math.round(W*0.80),40,4,'left',c.p,c.a); }

    } else if(v==='minima'){
      var c=fMinimaChrome(ctx,state,t);
      ctx.font='italic 300 '+Math.min(ts.fs,38)+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'Lo que nadie te dice.',W/2,1176,W-SX*2-40,Math.min(ts.lh,46),2,'center',c.h,c.a);
      if(state.body){ ctx.font='400 20px '+FONT_BODY;
        drawAccent(ctx,state.body,W/2,end+44,W-SX*2-80,28,1,'center',c.p,c.a); }

    } else if(v==='foto-frase'){
      var c=contrastBg(ctx,state,t,'bottom',0.48);
      bambukyLogo(ctx,c.p);
      eb(ctx,state.eyebrow||'El problema',SX,860,c.p);
      ctx.font='300 '+ts.fs+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'Lo que nadie te dice.',SX,940,W-SX*2,ts.lh,3,'left',c.h,c.a);
      if(state.body){
        ctx.font='400 '+Math.round(34*_scales.body)+'px '+FONT_BODY;
        drawAccent(ctx,state.body,SX,end+50,W-SX*2-20,42,3,'left',c.p,c.a);
      }
      fotograma(ctx,state,c.p);

    } else if(v==='antes'){
      var c=contrastBg(ctx,state,t,'bottom',0.45);
      bambukyLogo(ctx,c.p);
      eb(ctx,state.eyebrow||'Antes de saberlo',SX,830,c.p);
      ctx.font='300 '+ts.fs+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'Lo que nadie te dice.',SX,910,W-SX*2,ts.lh,3,'left',c.h,c.a);
      if(state.body){
        ctx.font='400 '+Math.round(34*_scales.body)+'px '+FONT_BODY;
        drawAccent(ctx,state.body,SX,end+50,W-SX*2-20,42,3,'left',c.p,c.a);
      }
      fotograma(ctx,state,c.p);

    } else {
      var c=contrastBg(ctx,state,t,'full',0.38);
      bambukyLogo(ctx,c.p,true);
      var cy=H/2;
      ctx.font='italic 300 '+Math.min(ts.fs,72)+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'Lo que nadie te dice.',W/2,cy-60,W-SX*2-40,ts.lh,3,'center',c.h,c.a);
      if(state.body){
        ctx.font='400 '+Math.round(34*_scales.body)+'px '+FONT_BODY;
        drawAccent(ctx,state.body,W/2,end+88,W-SX*2-60,42,2,'center',c.p,c.a);
      }
      fotograma(ctx,state,c.p);
    }
  });
},

/* -------- 3 · URGENCIA BIOLÓGICA -------- */
'Urgencia biológica': function(ctx, state){
  frame(ctx, function(ctx){
    setScales(state);
    var v=normalizeVariant('Urgencia biológica',state.variant);
    var t=getTheme(state.mode);
    var ts=titleSize(state.title);

    if(v==='cover'){
      var c=fCoverChrome(ctx,state,t,0.66);
      ctx.font='300 '+Math.min(ts.fs,58)+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'Estos días no vuelven.',SX,902,W-SX*2,Math.min(ts.lh,66),3,'left',c.h,c.a);
      fineRule(ctx,SX,838,54,t.accent);
      if(state.body){ ctx.font='400 '+Math.round(31*_scales.body)+'px '+FONT_BODY;
        drawAccent(ctx,state.body,SX,end+48,W-SX*2-20,42,4,'left',c.p,c.a); }

    } else if(v==='moderna'){
      var c=fModernaChrome(ctx,state,t);
      fineRule(ctx,SX,792,54,c.a);
      ctx.font='300 '+Math.min(ts.fs,64)+'px '+FONT_TITLE; ctx.textAlign='left';
      var end=drawAccent(ctx,state.title||'Estos días no vuelven.',SX,860,Math.round(W*0.82),Math.min(ts.lh,72),3,'left',c.h,c.a);
      if(state.body){ ctx.font='400 '+Math.round(29*_scales.body)+'px '+FONT_BODY;
        drawAccent(ctx,state.body,SX,end+44,Math.round(W*0.80),40,4,'left',c.p,c.a); }

    } else if(v==='minima'){
      var c=fMinimaChrome(ctx,state,t);
      ctx.font='italic 300 '+Math.min(ts.fs,38)+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'Estos días no vuelven.',W/2,1176,W-SX*2-40,Math.min(ts.lh,46),2,'center',c.h,c.a);
      if(state.body){ ctx.font='400 20px '+FONT_BODY;
        drawAccent(ctx,state.body,W/2,end+44,W-SX*2-80,28,1,'center',c.p,c.a); }

    } else if(v==='tiempo'){
      var c=contrastBg(ctx,state,t,'full',0.38);
      bambukyLogo(ctx,c.p,true);
      var cy=H/2;
      eb(ctx,state.eyebrow||'El tiempo pasa',W/2,cy-220,c.p,'center');
      ctx.font='300 '+ts.fs+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'Estos días no vuelven.',W/2,cy-100,W-SX*2-40,ts.lh,3,'center',c.h,c.a);
      if(state.body){
        ctx.font='400 '+Math.round(34*_scales.body)+'px '+FONT_BODY;
        drawAccent(ctx,state.body,W/2,end+56,W-SX*2-60,42,3,'center',c.p,c.a);
      }
      fotograma(ctx,state,c.p);

    } else if(v==='linea'){
      var c=contrastBg(ctx,state,t,'bottom',0.48);
      bambukyLogo(ctx,c.p);
      eb(ctx,state.eyebrow||'Los primeros días',SX,780,c.p);
      var tlY=870, tlX1=SX+40, tlX3=W-SX-40, tlX2=(tlX1+tlX3)/2;
      fineRule(ctx,tlX1,tlY,tlX3-tlX1,t.line);
      ctx.font='300 34px '+FONT_TITLE;
      [[tlX1,'Día 5'],[tlX2,'Día 10'],[tlX3,'Día 15']].forEach(function(pt){
        ctx.beginPath(); ctx.arc(pt[0],tlY,7,0,Math.PI*2); ctx.fillStyle=t.accent; ctx.fill();
        ctx.fillStyle=c.h; ctx.textAlign='center'; ctx.fillText(pt[1],pt[0],tlY-24);
      });
      if(state.body){
        ctx.font='400 '+Math.round(34*_scales.body)+'px '+FONT_BODY;
        drawAccent(ctx,state.body,SX,tlY+60,W-SX*2-20,42,3,'left',c.p,c.a);
      }
      fotograma(ctx,state,c.p);

    } else {
      var c=contrastBg(ctx,state,t,'bottom',0.42);
      bambukyLogo(ctx,c.p);
      eb(ctx,state.eyebrow||'Irrepetible',SX,1000,c.p);
      ctx.font='italic 300 '+Math.min(ts.fs,72)+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'Irrepetible.',W/2,1070,W-SX*2-40,ts.lh,2,'center',c.h,c.a);
      if(state.body){
        ctx.font='400 '+Math.round(34*_scales.body)+'px '+FONT_BODY;
        drawAccent(ctx,state.body,W/2,end+48,W-SX*2-60,42,2,'center',c.p,c.a);
      }
      fotograma(ctx,state,c.p);
    }
  });
},

/* -------- 4 · SOLUCIÓN -------- */
'Solución': function(ctx, state){
  frame(ctx, function(ctx){
    setScales(state);
    var v=normalizeVariant('Solución',state.variant);
    var t=getTheme(state.mode);
    var ts=titleSize(state.title);

    if(v==='cover'){
      var c=fCoverChrome(ctx,state,t,0.66);
      fineRule(ctx,SX,792,54,t.accent);
      ctx.font='300 '+Math.min(ts.fs,54)+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'Una sesión segura.',SX,856,W-SX*2,Math.min(ts.lh,62),2,'left',c.h,c.a);
      var items=(state.body||'').split(/\n/).map(function(s){return s.trim();}).filter(Boolean).slice(0,3);
      var iy=end+58; ctx.font='400 '+Math.round(30*_scales.body)+'px '+FONT_BODY;
      items.forEach(function(it){ diamond(ctx,SX+8,iy-9,6,t.accent); ctx.fillStyle=c.p; ctx.textAlign='left';
        var ie=drawWrapped(ctx,it,SX+34,iy,W-SX*2-48,40,2); iy=ie+42; });

    } else if(v==='moderna'){
      var c=fModernaChrome(ctx,state,t);
      fineRule(ctx,SX,760,54,c.a);
      ctx.font='300 '+Math.min(ts.fs,58)+'px '+FONT_TITLE; ctx.textAlign='left';
      var end=drawAccent(ctx,state.title||'Una sesión segura.',SX,828,Math.round(W*0.82),Math.min(ts.lh,66),2,'left',c.h,c.a);
      var items=(state.body||'').split(/\n/).map(function(s){return s.trim();}).filter(Boolean).slice(0,3);
      var iy=end+52; ctx.font='400 '+Math.round(28*_scales.body)+'px '+FONT_BODY;
      items.forEach(function(it){ diamond(ctx,SX+8,iy-9,6,c.a); ctx.fillStyle=c.p; ctx.textAlign='left';
        var ie=drawWrapped(ctx,it,SX+34,iy,Math.round(W*0.78),38,2); iy=ie+40; });

    } else if(v==='minima'){
      var c=fMinimaChrome(ctx,state,t);
      ctx.font='italic 300 '+Math.min(ts.fs,38)+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'Una sesión segura.',W/2,1176,W-SX*2-40,Math.min(ts.lh,46),2,'center',c.h,c.a);
      var items=(state.body||'').split(/\n/).map(function(s){return s.trim();}).filter(Boolean).slice(0,3);
      if(items.length){ ctx.font='400 19px '+FONT_BODY;
        drawAccent(ctx,items.join('   ·   '),W/2,end+44,W-SX*2-60,28,1,'center',c.p,c.a); }

    } else if(v==='metodo'){
      var c=contrastBg(ctx,state,t,'bottom',0.48);
      bambukyLogo(ctx,c.p);
      eb(ctx,state.eyebrow||'Método Bambuky',SX,820,c.p);
      ctx.font='300 '+ts.fs+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'Una sesión segura.',SX,900,W-SX*2,ts.lh,3,'left',c.h,c.a);
      if(state.body){
        ctx.font='400 '+Math.round(34*_scales.body)+'px '+FONT_BODY;
        drawAccent(ctx,state.body,SX,end+52,W-SX*2-20,42,3,'left',c.p,c.a);
      }
      fotograma(ctx,state,c.p);

    } else if(v==='guia'){
      var c=contrastBg(ctx,state,t,'bottom',0.50);
      bambukyLogo(ctx,c.p);
      eb(ctx,state.eyebrow||'Tu guía',SX,790,c.p);
      ctx.font='300 '+Math.min(ts.fs,72)+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'Sencillo y a tu ritmo.',SX,870,W-SX*2,ts.lh,2,'left',c.h,c.a);
      if(state.body){
        var items=state.body.split(/\n/).map(function(s){return s.trim();}).filter(Boolean);
        var iy=end+56;
        ctx.font='400 '+Math.round(32*_scales.body)+'px '+FONT_BODY;
        items.slice(0,3).forEach(function(item){
          diamond(ctx,SX+8,iy-8,6,t.accent);
          ctx.fillStyle=c.p; ctx.textAlign='left';
          var ie=drawWrapped(ctx,item,SX+34,iy,W-SX*2-48,40,2);
          iy=ie+42;
        });
      }
      fotograma(ctx,state,c.p);

    } else {
      var c=contrastBg(ctx,state,t,'bottom',0.48);
      bambukyLogo(ctx,c.p);
      eb(ctx,state.eyebrow||'Qué preparar',SX,800,c.p);
      ctx.font='300 '+Math.min(ts.fs,72)+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'Todo listo.',SX,880,W-SX*2,ts.lh,2,'left',c.h,c.a);
      if(state.body){
        var items=state.body.split(/\n/).map(function(s){return s.trim();}).filter(Boolean);
        var iy=end+52;
        ctx.font='400 '+Math.round(32*_scales.body)+'px '+FONT_BODY;
        items.slice(0,3).forEach(function(item){
          checkMark(ctx,SX,iy-4,18,t.accent);
          ctx.fillStyle=c.p; ctx.textAlign='left';
          var ie=drawWrapped(ctx,item,SX+36,iy,W-SX*2-50,40,2);
          iy=ie+42;
        });
      }
      fotograma(ctx,state,c.p);
    }
  });
},

/* -------- 5 · OBJECIÓN -------- */
'Objeción': function(ctx, state){
  frame(ctx, function(ctx){
    setScales(state);
    var v=normalizeVariant('Objeción',state.variant);
    var t=getTheme(state.mode);
    var ts=titleSize(state.title);

    if(v==='cover'){
      var c=fCoverChrome(ctx,state,t,0.66);
      fineRule(ctx,SX,838,54,t.accent);
      ctx.font='italic 300 '+Math.min(ts.fs,56)+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'¿Y si mi bebé no se duerme?',SX,902,W-SX*2,Math.min(ts.lh,64),3,'left',c.h,c.a);
      if(state.body){ ctx.font='400 '+Math.round(31*_scales.body)+'px '+FONT_BODY;
        drawAccent(ctx,state.body,SX,end+48,W-SX*2-20,42,4,'left',c.p,c.a); }

    } else if(v==='moderna'){
      var c=fModernaChrome(ctx,state,t);
      fineRule(ctx,SX,792,54,c.a);
      ctx.font='italic 300 '+Math.min(ts.fs,60)+'px '+FONT_TITLE; ctx.textAlign='left';
      var end=drawAccent(ctx,state.title||'¿Y si mi bebé no se duerme?',SX,860,Math.round(W*0.82),Math.min(ts.lh,68),3,'left',c.h,c.a);
      if(state.body){ ctx.font='400 '+Math.round(29*_scales.body)+'px '+FONT_BODY;
        drawAccent(ctx,state.body,SX,end+44,Math.round(W*0.80),40,4,'left',c.p,c.a); }

    } else if(v==='minima'){
      var c=fMinimaChrome(ctx,state,t);
      ctx.font='italic 300 '+Math.min(ts.fs,38)+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'¿Y si mi bebé no se duerme?',W/2,1176,W-SX*2-40,Math.min(ts.lh,46),2,'center',c.h,c.a);
      if(state.body){ ctx.font='400 20px '+FONT_BODY;
        drawAccent(ctx,state.body,W/2,end+44,W-SX*2-80,28,1,'center',c.p,c.a); }

    } else if(v==='pregunta'){
      var c=contrastBg(ctx,state,t,'bottom',0.48);
      bambukyLogo(ctx,c.p);
      eb(ctx,state.eyebrow||'Te preocupa',SX,810,c.p);
      ctx.font='italic 300 '+ts.fs+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'¿Y si mi bebé no se duerme?',SX,890,W-SX*2,ts.lh,3,'left',c.h,c.a);
      if(state.body){
        ctx.font='400 '+Math.round(34*_scales.body)+'px '+FONT_BODY;
        drawAccent(ctx,state.body,SX,end+56,W-SX*2-20,42,3,'left',c.p,c.a);
      }
      fotograma(ctx,state,c.p);

    } else if(v==='mito'){
      var c=contrastBg(ctx,state,t,'bottom',0.50);
      bambukyLogo(ctx,c.p);
      var baseY=780;
      ctx.save(); ctx.font='600 20px '+FONT_BODY;
      if('letterSpacing' in ctx) ctx.letterSpacing='4px';
      ctx.fillStyle=t.accent; ctx.textAlign='left';
      ctx.fillText('MITO',SX,baseY); ctx.restore();
      ctx.font='italic 300 '+Math.round(52*_scales.title)+'px '+FONT_TITLE; ctx.fillStyle=c.h; ctx.textAlign='left';
      var endM=drawWrapped(ctx,state.title||'Los bebés deben estar despiertos.',SX,baseY+42,W-SX*2,60,2);
      var rY=endM+48;
      ctx.save(); ctx.font='600 20px '+FONT_BODY;
      if('letterSpacing' in ctx) ctx.letterSpacing='4px';
      ctx.fillStyle=t.accent; ctx.textAlign='left';
      ctx.fillText('REALIDAD',SX,rY); ctx.restore();
      if(state.body){
        ctx.font='400 '+Math.round(34*_scales.body)+'px '+FONT_BODY;
        drawAccent(ctx,state.body,SX,rY+42,W-SX*2-20,42,3,'left',c.p,c.a);
      }
      fotograma(ctx,state,c.p);

    } else {
      var c=contrastBg(ctx,state,t,'full',0.35);
      bambukyLogo(ctx,c.p,true);
      var cy=H/2;
      ctx.font='300 '+Math.min(ts.fs,72)+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'No necesitas saber posar. Nosotros te guiamos.',W/2,cy-40,W-SX*2-40,ts.lh,3,'center',c.h,c.a);
      if(state.body){
        ctx.font='400 '+Math.round(34*_scales.body)+'px '+FONT_BODY;
        drawAccent(ctx,state.body,W/2,end+56,W-SX*2-60,42,2,'center',c.p,c.a);
      }
      fotograma(ctx,state,c.p);
    }
  });
},

/* -------- 6 · AUTORIDAD -------- */
'Autoridad': function(ctx, state){
  frame(ctx, function(ctx){
    setScales(state);
    var v=normalizeVariant('Autoridad',state.variant);
    var t=getTheme(state.mode);
    var ts=titleSize(state.title);

    var lines=[];
    if(Array.isArray(state.creds)&&state.creds.length) lines=state.creds.slice();
    else if(state.body) lines=state.body.split(/\n|·|•/).map(function(s){return s.trim();}).filter(Boolean);
    lines=lines.slice(0,4);

    if(v==='cover'){
      var c=fCoverChrome(ctx,state,t,0.66);
      fineRule(ctx,SX,790,54,t.accent);
      ctx.font='italic 300 '+Math.min(ts.fs,50)+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'Llegamos nerviosos y salimos emocionados.',SX,852,W-SX*2,Math.min(ts.lh,58),3,'left',c.h,c.a);
      if(lines.length){ var ly=end+52; ctx.font='400 '+Math.round(29*_scales.body)+'px '+FONT_BODY;
        lines.forEach(function(it){ diamond(ctx,SX+8,ly-9,6,t.accent); ctx.fillStyle=c.p; ctx.textAlign='left';
          var le=drawWrapped(ctx,it,SX+34,ly,W-SX*2-48,38,2); ly=le+40; });
      } else if(state.subtitle){ ctx.save(); ctx.font='600 20px '+FONT_BODY;
        if('letterSpacing' in ctx) ctx.letterSpacing='3px';
        ctx.fillStyle=c.p; ctx.textAlign='left'; ctx.fillText(state.subtitle.toUpperCase(),SX,end+52); ctx.restore(); }

    } else if(v==='moderna'){
      var c=fModernaChrome(ctx,state,t);
      fineRule(ctx,SX,758,54,c.a);
      ctx.font='italic 300 '+Math.min(ts.fs,54)+'px '+FONT_TITLE; ctx.textAlign='left';
      var end=drawAccent(ctx,state.title||'Llegamos nerviosos y salimos emocionados.',SX,826,Math.round(W*0.82),Math.min(ts.lh,62),3,'left',c.h,c.a);
      if(lines.length){ var ly=end+50; ctx.font='400 '+Math.round(28*_scales.body)+'px '+FONT_BODY;
        lines.forEach(function(it){ diamond(ctx,SX+8,ly-9,6,c.a); ctx.fillStyle=c.p; ctx.textAlign='left';
          var le=drawWrapped(ctx,it,SX+34,ly,Math.round(W*0.78),38,2); ly=le+40; });
      } else if(state.subtitle){ ctx.save(); ctx.font='600 20px '+FONT_BODY;
        if('letterSpacing' in ctx) ctx.letterSpacing='3px';
        ctx.fillStyle=c.p; ctx.textAlign='left'; ctx.fillText(state.subtitle.toUpperCase(),SX,end+50); ctx.restore(); }

    } else if(v==='minima'){
      var c=fMinimaChrome(ctx,state,t);
      ctx.font='italic 300 '+Math.min(ts.fs,36)+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'Llegamos nerviosos y salimos emocionados.',W/2,1166,W-SX*2-40,Math.min(ts.lh,44),2,'center',c.h,c.a);
      var sec = state.subtitle || (lines.length ? lines.join('   ·   ') : '');
      if(sec){ ctx.font='400 19px '+FONT_BODY;
        drawAccent(ctx,sec,W/2,end+42,W-SX*2-60,28,1,'center',c.p,c.a); }

    } else if(v==='emocional'){
      var c=contrastBg(ctx,state,t,'bottom',0.45);
      bambukyLogo(ctx,c.p);
      ctx.font='italic 300 '+Math.min(ts.fs,68)+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'Llegamos nerviosos y salimos emocionados.',SX,960,W-SX*2,Math.min(ts.lh,76),3,'left',c.h,c.a);
      if(state.subtitle){
        ctx.save(); ctx.font='600 22px '+FONT_BODY;
        if('letterSpacing' in ctx) ctx.letterSpacing='3px';
        ctx.fillStyle=c.p; ctx.textAlign='left';
        ctx.fillText((state.subtitle).toUpperCase(),SX,end+54);
        ctx.restore();
      }
      fotograma(ctx,state,c.p);

    } else if(v==='discreta'){
      var c=contrastBg(ctx,state,t,'bottom',0.48);
      bambukyLogo(ctx,c.p);
      if(state.eyebrow) eb(ctx,state.eyebrow,SX,790,c.p);
      var ty=state.eyebrow?870:830;
      ctx.font='300 '+Math.min(ts.fs,68)+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'Más de 830 recién nacidos fotografiados.',SX,ty,W-SX*2,Math.min(ts.lh,76),3,'left',c.h,c.a);
      if(lines.length){
        var ly=end+56;
        ctx.font='400 '+Math.round(32*_scales.body)+'px '+FONT_BODY;
        lines.forEach(function(item){
          diamond(ctx,SX+8,ly-8,7,t.accent);
          ctx.fillStyle=c.p; ctx.textAlign='left';
          var le=drawWrapped(ctx,item,SX+34,ly,W-SX*2-34,40,2);
          ly=le+40;
        });
      }
      fotograma(ctx,state,c.p);

    } else {
      var c=contrastBg(ctx,state,t,'full',0.38);
      bambukyLogo(ctx,c.p,true);
      var cy=H/2;
      ctx.font='italic 300 '+Math.min(ts.fs,68)+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'Ninguna fotografía vale más que la seguridad de un bebé.',W/2,cy-30,W-SX*2-50,Math.min(ts.lh,76),3,'center',c.h,c.a);
      if(state.subtitle){
        ctx.font='400 '+Math.round(34*_scales.subtitle)+'px '+FONT_BODY;
        drawAccent(ctx,state.subtitle,W/2,end+84,W-SX*2-60,42,2,'center',c.p,c.a);
      }
      fotograma(ctx,state,c.p);
    }
  });
},

/* -------- 7 · CTA -------- */
'CTA': function(ctx, state){
  frame(ctx, function(ctx){
    setScales(state);
    var v=normalizeVariant('CTA',state.variant);
    var t=getTheme(state.mode);
    var ts=titleSize(state.title);

    if(v==='cover'){
      var c=fCoverChrome(ctx,state,t,0.62);
      ctx.font='italic 300 '+Math.min(ts.fs,62)+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'¿Quieres recordar esta etapa?',W/2,930,W-SX*2-30,Math.min(ts.lh,70),3,'center',c.h,c.a);
      if(state.subtitle){ ctx.font='400 '+Math.round(30*_scales.subtitle)+'px '+FONT_BODY;
        end=drawAccent(ctx,state.subtitle,W/2,end+50,W-SX*2-50,40,2,'center',c.p,c.a); }
      ctaPill(ctx,state.cta||'Reserva tu sesión newborn',end+64,null,c.h,t.accent);

    } else if(v==='moderna'){
      var c=fModernaChrome(ctx,state,t);
      fineRule(ctx,SX,820,54,c.a);
      ctx.font='italic 300 '+Math.min(ts.fs,60)+'px '+FONT_TITLE; ctx.textAlign='left';
      var end=drawAccent(ctx,state.title||'¿Lista para reservar?',SX,888,Math.round(W*0.82),Math.min(ts.lh,68),2,'left',c.h,c.a);
      if(state.subtitle){ ctx.font='400 '+Math.round(28*_scales.subtitle)+'px '+FONT_BODY;
        end=drawAccent(ctx,state.subtitle,SX,end+42,Math.round(W*0.78),38,2,'left',c.p,c.a); }
      var labelM=(state.cta||'Reserva tu sesión').toUpperCase();
      ctx.save(); ctx.font='500 '+Math.round(22*_scales.cta)+'px '+FONT_BODY;
      if('letterSpacing' in ctx) ctx.letterSpacing='3px';
      var bwM=ctx.measureText(labelM).width+64, bhM=58, byM=end+46;
      ctx.strokeStyle=c.a; ctx.lineWidth=1.5; roundRect(ctx,SX,byM,bwM,bhM,3,false,true);
      ctx.fillStyle=c.h; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(labelM,SX+bwM/2,byM+bhM/2+1);
      ctx.restore(); ctx.textBaseline='alphabetic';

    } else if(v==='minima'){
      var c=fMinimaChrome(ctx,state,t);
      ctx.font='italic 300 '+Math.min(ts.fs,38)+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'¿Quieres recordar esta etapa?',W/2,1156,W-SX*2-40,Math.min(ts.lh,46),2,'center',c.h,c.a);
      if(state.subtitle){ ctx.font='400 20px '+FONT_BODY;
        end=drawAccent(ctx,state.subtitle,W/2,end+40,W-SX*2-80,28,1,'center',c.p,c.a); }
      ctx.save(); ctx.font='500 18px '+FONT_BODY;
      if('letterSpacing' in ctx) ctx.letterSpacing='3px';
      ctx.fillStyle=c.a; ctx.textAlign='center'; ctx.fillText((state.cta||'Escríbenos por DM').toUpperCase(),W/2,end+56); ctx.restore();

    } else if(v==='reserva'){
      var c=contrastBg(ctx,state,t,'full',0.38);
      bambukyLogo(ctx,c.p,true);
      var cy=H/2;
      eb(ctx,state.eyebrow||'Querétaro · México',W/2,cy-200,c.p,'center');
      ctx.font='italic 300 '+ts.fs+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'¿Quieres recordar esta etapa?',W/2,cy-80,W-SX*2-30,ts.lh,3,'center',c.h,c.a);
      if(state.subtitle){
        ctx.font='400 '+Math.round(34*_scales.subtitle)+'px '+FONT_BODY;
        drawAccent(ctx,state.subtitle,W/2,end+52,W-SX*2-50,42,2,'center',c.p,c.a);
      }
      var btnY=state.subtitle?end+140:end+80;
      ctaPill(ctx,state.cta||'Reserva tu sesión newborn',btnY,null,c.h,t.accent);
      fotograma(ctx,state,c.p);

    } else if(v==='whatsapp'){
      var c=contrastBg(ctx,state,t,'bottom',0.48);
      bambukyLogo(ctx,c.p);
      eb(ctx,state.eyebrow||'Querétaro · México',SX,870,c.p);
      ctx.font='300 '+ts.fs+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'¿Lista para reservar?',SX,950,W-SX*2,ts.lh,2,'left',c.h,c.a);
      if(state.subtitle){
        ctx.font='400 '+Math.round(34*_scales.subtitle)+'px '+FONT_BODY;
        drawAccent(ctx,state.subtitle,SX,end+48,W-SX*2-20,42,2,'left',c.p,c.a);
      }
      var btnY=state.subtitle?end+120:end+70;
      ctaPill(ctx,state.cta||'Escríbenos por WhatsApp',btnY,null,c.h,t.accent);
      fotograma(ctx,state,c.p);

    } else {
      var c=contrastBg(ctx,state,t,'full',0.35);
      bambukyLogo(ctx,c.p,true);
      var cy=H/2;
      ctx.font='300 '+ts.fs+'px '+FONT_TITLE;
      var end=drawAccent(ctx,state.title||'Tu bebé solo será así una vez.',W/2,cy-30,W-SX*2-40,ts.lh,3,'center',c.h,c.a);
      ctx.font='400 '+Math.round(34*_scales.cta)+'px '+FONT_BODY;
      drawAccent(ctx,state.cta||'Agenda tu sesión',W/2,end+96,W-SX*2,42,1,'center',c.p,c.a);
      fotograma(ctx,state,c.p);
    }
  });
}

};

/* ============================================================
   EXPOSE
   ============================================================ */
window.TEMPLATES = TEMPLATES_V;
window.VARIANTS = VARIANTS;
window.MODES = MODES;
window.MODE_LABELS = MODE_LABELS;
window.normalizeVariant = normalizeVariant;
window.normalizeMode = normalizeMode;
window.defaultVariant = defaultVariant;
window.defaultMode = defaultMode;
window.COLOR_THEMES = COLOR_THEMES;
