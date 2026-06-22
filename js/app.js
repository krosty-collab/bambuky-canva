/* app.js - Core logic for Bambuky Content Studio
   Vanilla JS, Canvas-based renderer, local-only
*/
const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');

// Production mode: no draggable element boxes — composition fixed.

// UI elements
const templateSelect = document.getElementById('templateSelect');
const slidesList = document.getElementById('slidesList');
const addSlideBtn = document.getElementById('addSlide');
const projectNameInput = document.getElementById('projectName');
const projectTitle = document.getElementById('projectTitle');
const slideIndicator = document.getElementById('slideIndicator');

const fieldEyebrow = document.getElementById('fieldEyebrow');
const fieldTitle = document.getElementById('fieldTitle');
const fieldSubtitle = document.getElementById('fieldSubtitle');
const fieldNumber = document.getElementById('fieldNumber');
const fieldCreds = document.getElementById('fieldCreds');
const fieldBody = document.getElementById('fieldBody');

const imgUpload = document.getElementById('imgUpload');

const exportSlideBtn = document.getElementById('exportSlide');
const exportCarouselBtn = document.getElementById('exportCarousel');

let project = {
  name: 'Los primeros días', slides: [], current: 0
};

// Vista activa del preview ('clean' | 'ig'). Debe declararse ANTES de la
// primera llamada a render(), porque render() la lee en su hook final;
// con `let` el acceso anticipado lanzaría ReferenceError (TDZ).
let currentView = 'clean';

// initial templates in select
Object.keys(window.TEMPLATES).forEach(key => {
  const opt = document.createElement('option'); opt.value = key; opt.textContent = key; templateSelect.appendChild(opt);
});

// create a slide object with defaults
function createSlide(templateKey){
  return {
    template: templateKey || Object.keys(window.TEMPLATES)[0],
    eyebrow: '', title: '', subtitle: '', body: '', number: '', handle:'', cta:'',
    steps: [], creds: [], philosophy:'',
      image: null
  };
}

// Demo content: 7 slides — "Bambuky · Los primeros días"
function loadDemo(){
  project.name = 'Bambuky · Los primeros días';
  const demo = [
    // 1 · Portada
    {template:'Portada', eyebrow:'Fotografía Newborn Querétaro', title:'Los primeros días de tu bebé son únicos e irrepetibles.', subtitle:'Te contamos cuándo y cómo fotografiarlos.'},

    // 2 · Problema
    {template:'Problema', eyebrow:'Algo que pocas familias saben', title:'Entre el día 5 y el día 15.', body:'Esa es la etapa ideal. Después, las poses más delicadas ya no son posibles de forma segura.'},

    // 3 · Urgencia biológica
    {template:'Urgencia biológica', eyebrow:'Nuestra experiencia', number:'+830', subtitle:'recién nacidos fotografiados en Querétaro', body:'Aprendimos que reservar con tiempo hace toda la diferencia.'},

    // 4 · Solución
    {template:'Solución', eyebrow:'Así funciona en Bambuky', title:'Sencillo y a tu ritmo.', body:'Apartas tu lugar durante el embarazo. Cuando nace tu bebé, coordinamos la fecha juntos.'},

    // 5 · Objeción
    {template:'Objeción', eyebrow:'La pregunta más frecuente', title:'¿Y si mi bebé llega en fecha diferente?', body:'No pasa nada. La fecha exacta la confirmamos cuando nace. Siempre nos adaptamos.'},

    // 6 · Autoridad
    {template:'Autoridad', eyebrow:'Bambuky · Estudio Newborn · Querétaro', title:'Aquí siempre gana el bebé.', creds:['Más de 10 años especializados','Seguridad neonatal en cada sesión','Gemelos, prematuros y situaciones especiales'], subtitle:'La fotografía es la consecuencia de una buena experiencia.'},

    // 7 · CTA
    {template:'CTA', eyebrow:'Querétaro · México', title:'¿Cuándo llega tu bebé?', subtitle:'Cuéntanos tu fecha aproximada. Con gusto te orientamos, sin compromiso.', cta:'Escríbenos por DM'}
  ];
  project.slides = demo.map(d=>Object.assign(createSlide(d.template), d));
  project.caption = 'Cuando nace un bebé, hay una etapa muy corta que suele pasar demasiado rápido.\n\nEntre el día 5 y el día 15 de vida, los recién nacidos duermen de una manera diferente. Sus reflejos todavía los llevan a posiciones que muy pronto dejarán de poder hacer. Y su cuerpo aún recuerda el espacio donde vivió los últimos nueve meses.\n\nEsa es la etapa ideal para una sesión newborn.\n\nEn Bambuky hemos fotografiado más de 830 recién nacidos en Querétaro en más de 10 años. Y lo que aprendimos es que cuando las familias reservan con tiempo, la sesión ocurre con mucha más tranquilidad para todos.\n\n¿Cómo funciona? Apartas tu lugar durante el embarazo. Cuando nace tu bebé, coordinamos juntos la fecha exacta. Nos adaptamos a lo que necesite tu familia.\n\nSi tienes dudas o quieres saber si hay lugar disponible para tu fecha, escríbenos por DM. Con gusto te orientamos. 🍃';
  project.hashtags = '#fotografianewborn #newbornqueretaro #sesionnewborn #fotografíanewbornquerétaro #estudionewbornqueretaro #bambuky #fotografoqueretaro #bebereciennacido #maternidadqueretaro #embarazoqueretaro #fotografiadenacimiento #newbornphotography #primeroshijos #queretaromx #bebequeretaro';
}

loadDemo();

function refreshSlidesList(){
  slidesList.innerHTML='';
  project.slides.forEach((s,idx)=>{
    const item = document.createElement('div'); item.className='slide-item';
    const btn = document.createElement('button'); btn.textContent = `Slide ${idx+1}: ${s.template}`; btn.className='slide-btn';
    if(idx===project.current) btn.classList.add('active');
    btn.addEventListener('click', ()=>{ project.current=idx; refreshSlidesList(); loadSlideToUI(); render(); });
    const del = document.createElement('button'); del.className='slide-delete'; del.textContent='✕'; del.title='Eliminar slide';
    del.addEventListener('click', (ev)=>{ ev.stopPropagation(); if(confirm('Eliminar slide?')){ project.slides.splice(idx,1); if(project.current>=project.slides.length) project.current = Math.max(0, project.slides.length-1); refreshSlidesList(); loadSlideToUI(); render(); } });
    item.appendChild(btn); item.appendChild(del); slidesList.appendChild(item);
  });
  slideIndicator.textContent = `Slide ${project.current+1} / ${project.slides.length}`;
  projectTitle.textContent = project.name || 'Sin título';
}

function loadSlideToUI(){
  const s = project.slides[project.current];
  templateSelect.value = s.template;
  fieldEyebrow.value = s.eyebrow||'';
  fieldTitle.value = s.title||'';
  fieldSubtitle.value = s.subtitle||'';
  fieldNumber.value = s.number||'';
  fieldCreds.value = Array.isArray(s.creds) ? s.creds.join('\n') : (s.creds||'');
  fieldBody.value = s.body||'';
  updateWordCounter();
  // image transform controls removed in production mode (fixed composition)
}

// Contador en vivo del presupuesto de 25 palabras por slide.
const wordCounter = document.getElementById('wordCounter');
function countWordsUI(t){ return t ? t.trim().split(/\s+/).filter(Boolean).length : 0; }
function updateWordCounter(){
  if(!wordCounter) return;
  const n = countWordsUI(fieldEyebrow.value) + countWordsUI(fieldTitle.value)
          + countWordsUI(fieldSubtitle.value) + countWordsUI(fieldBody.value)
          + countWordsUI((fieldCreds.value || '').replace(/\n/g, ' '));
  wordCounter.textContent = n + ' / 25 palabras visibles';
  wordCounter.style.color = (n > 25) ? '#8B0000' : 'var(--text-muted)';
}

function saveUIToSlide(){
  const s = project.slides[project.current];
  s.template = templateSelect.value;
  s.eyebrow = fieldEyebrow.value;
  s.title = fieldTitle.value;
  s.subtitle = fieldSubtitle.value;
  s.number = fieldNumber.value;
  s.creds = fieldCreds.value.split('\n').map(x=>x.trim()).filter(Boolean);
  s.body = fieldBody.value;
  // image transform controls removed in production mode (fixed composition)
}

// image loader
imgUpload.addEventListener('change', async (e)=>{
  const file = e.target.files[0]; if(!file) return;
  const img = new Image();
  img.onload = ()=>{ const obj = {img}; project.slides[project.current].image = obj; render(); };
  img.src = URL.createObjectURL(file);
});

// control change events (minimal inputs only)
[templateSelect, fieldEyebrow, fieldTitle, fieldSubtitle, fieldNumber, fieldCreds, fieldBody, projectNameInput].forEach(el=>{
  el && el.addEventListener('input', ()=>{ saveUIToSlide(); if(el===projectNameInput) project.name = projectNameInput.value; updateWordCounter(); refreshSlidesList(); render(); });
});

// will open template picker to choose template when adding
// (template picker UI defined in index.html)
const templatePicker = document.getElementById('templatePicker');
const templateOptions = document.getElementById('templateOptions');
const closePicker = document.getElementById('closePicker');

function openTemplatePicker(){
  templateOptions.innerHTML = '';
  Object.keys(window.TEMPLATES).forEach(key=>{
    const card = document.createElement('div'); card.className='template-card';
    // thumbnail canvas
    const thumb = document.createElement('canvas');
    // display size and backing store for crispness
    const displayW = 180, displayH = 225;
    const dpr = window.devicePixelRatio || 1;
    thumb.width = displayW * dpr; thumb.height = displayH * dpr;
    thumb.style.width = displayW + 'px'; thumb.style.height = displayH + 'px';
    const thCtx = thumb.getContext('2d'); thCtx.scale(dpr, dpr);
    // sample state for preview
    const sample = createSlide(key);
    // populate realistic sample texts per template for better previews
    if(key.toLowerCase().includes('texto editorial') || key.toLowerCase().includes('editorial')){
      sample.decor = 'Entre'; sample.title = 'el día 5 y el día 15.'; sample.body = 'Esa es la ventana ideal para una sesión newborn. Después, los bebés duermen menos profundo, sus reflejos cambian y las poses más delicadas ya no son posibles de forma segura.'; sample.number='02'; sample.total='07'; sample.handle='BAMBUKY';
    } else if(key.toLowerCase().includes('portada') || key.toLowerCase().includes('cover')){
      sample.eyebrow = 'SESIÓN NEWBORN · QUERÉTARO'; sample.title = 'Los primeros días'; sample.subtitle = 'Qué hacer en la primera semana';
    } else if(key.toLowerCase().includes('dato')){
      sample.number = '75'; sample.title = 'Dato importante'; sample.body = 'Breve explicación del dato y por qué importa.';
    } else {
      sample.title = 'Título ejemplo'; sample.subtitle = 'Subtítulo'; sample.eyebrow = 'Ej.'; sample.body = '';
    }
    try{ const tplFn = window.TEMPLATES[key]; tplFn(thCtx, sample); } catch(e){ thCtx.fillStyle = '#F1EBE2'; thCtx.fillRect(0,0,displayW,displayH); }
    card.appendChild(thumb);
    const h = document.createElement('h4'); h.textContent = key; card.appendChild(h);
    const p = document.createElement('p'); p.textContent = 'Vista previa de la plantilla'; card.appendChild(p);
    card.addEventListener('click', ()=>{ chooseTemplateForNewSlide(key); });
    templateOptions.appendChild(card);
  });
  templatePicker && templatePicker.classList.remove('hidden');
}

function closeTemplatePicker(){ templatePicker && templatePicker.classList.add('hidden'); }

function chooseTemplateForNewSlide(templateKey){
  const newSlide = createSlide(templateKey);
  newSlide.template = templateKey;
  const insertAt = project.current + 1;
  project.slides.splice(insertAt, 0, newSlide);
  project.current = insertAt;
  refreshSlidesList(); loadSlideToUI(); render();
  closeTemplatePicker();
}

addSlideBtn.addEventListener('click', ()=> openTemplatePicker());
closePicker && closePicker.addEventListener('click', ()=> closeTemplatePicker());

// Position editing has been disabled for the production mode — fixed compositions.

// palette controls removed in production mode

// Initialize on page load (moved to end after function definitions)

function clearCanvas(){ ctx.clearRect(0,0,canvas.width, canvas.height); ctx.fillStyle='#FAF8F5'; ctx.fillRect(0,0,canvas.width, canvas.height); }

function render(){
  clearCanvas(); const s = project.slides[project.current];
  const state = Object.assign({}, s);
  state.image = s.image;
  // numeración discreta de página para las plantillas
  state._page = project.current + 1;
  state._total = project.slides.length;

  // Enforce max 25 visible words per slide. Strategy: keep eyebrow and title, then fit body/creds/steps into remaining.
  function countWords(t){ if(!t) return 0; return t.toString().trim().split(/\s+/).filter(Boolean).length; }
  function truncateWordsLocal(t, max){ if(!t) return ''; const words = t.trim().split(/\s+/); if(words.length<=max) return t; return words.slice(0,max).join(' ') + '…'; }

  let reserved = 0;
  reserved += countWords(state.eyebrow);
  reserved += countWords(state.title);
  // count minimal mandatory fields
  let remaining = 25 - reserved;
  if(remaining < 0){ // truncate title first
    const allowedTitle = Math.max(0,25 - countWords(state.eyebrow));
    state.title = truncateWordsLocal(state.title, allowedTitle);
    remaining = 25 - (countWords(state.eyebrow) + countWords(state.title));
  }

  // Now allocate remaining to subtitle then body then creds/steps
  if(remaining > 0 && state.subtitle){ const use = Math.min(remaining, countWords(state.subtitle)); state.subtitle = truncateWordsLocal(state.subtitle, use); remaining -= use; }
  if(remaining > 0 && state.body){ const use = Math.min(remaining, countWords(state.body)); state.body = truncateWordsLocal(state.body, use); remaining -= use; }
  if(remaining > 0 && Array.isArray(state.creds)){
    for(let i=0;i<state.creds.length && remaining>0;i++){ const cw = countWords(state.creds[i]); const use = Math.min(remaining, cw); state.creds[i] = truncateWordsLocal(state.creds[i], use); remaining -= use; }
  }
  if(remaining > 0 && Array.isArray(state.steps)){
    for(let i=0;i<state.steps.length && remaining>0;i++){ const st = state.steps[i]; const cw = countWords(st.title||'') + countWords(st.body||''); const use = Math.min(remaining, cw);
      // prefer to keep title then body
      if(countWords(st.title) > 0){ const ut = Math.min(use, countWords(st.title)); state.steps[i].title = truncateWordsLocal(st.title, ut); remaining -= ut; }
      if(remaining>0 && countWords(st.body)>0){ const ub = Math.min(remaining, countWords(st.body)); state.steps[i].body = truncateWordsLocal(st.body, ub); remaining -= ub; }
    }
  }

  const tpl = window.TEMPLATES[s.template] || (()=>{});
  tpl(ctx, state);

  // Sincroniza el mockup de Instagram si está activo (no afecta export)
  if(typeof currentView !== 'undefined' && currentView === 'ig') syncIGPreview();
}

// Export single slide as JPG
exportSlideBtn.addEventListener('click', async ()=>{
  saveUIToSlide(); render();
  canvas.toBlob(async (blob)=>{
    const a = document.createElement('a'); const url = URL.createObjectURL(blob);
    a.href = url; a.download = `slide-${String(project.current+1).padStart(2,'0')}.jpg`; a.click(); URL.revokeObjectURL(url);
  }, 'image/jpeg', 1.0);
});

// top export buttons
const exportSlideTop = document.getElementById('exportSlideTop');
const exportCarouselTop = document.getElementById('exportCarouselTop');
if(exportSlideTop) exportSlideTop.addEventListener('click', ()=> exportSlideBtn.click());
if(exportCarouselTop) exportCarouselTop.addEventListener('click', ()=> exportCarouselBtn.click());

// Import UI elements
const importTextarea = document.getElementById('importTextarea');
const importApply = document.getElementById('importApply');
const importMessage = document.getElementById('importMessage');

// store caption/hashtags in project
project.caption = project.caption || '';
project.hashtags = project.hashtags || '';

function mapTemplateKey(key){
  if(!key) return Object.keys(window.TEMPLATES)[0];
  const k = key.toString().toLowerCase();
  const map = {
    'cover':'Portada', 'portada':'Portada',
    'problema':'Problema', 'problem':'Problema',
    'urgencia':'Urgencia biológica', 'urgencia biológica':'Urgencia biológica',
    'urgency':'Urgencia biológica', 'dato':'Urgencia biológica', 'editorial':'Problema',
    'solucion':'Solución', 'solución':'Solución', 'solution':'Solución', 'timeline':'Solución',
    'objecion':'Objeción', 'objeción':'Objeción', 'objection':'Objeción',
    'qa':'Objeción', 'pregunta':'Objeción',
    'autoridad':'Autoridad', 'authority':'Autoridad', 'auth':'Autoridad',
    'cta':'CTA', 'cierre':'CTA'
  };
  if(map[k]) return map[k];
  // try to find by similarity
  for(const t of Object.keys(window.TEMPLATES)) if(t.toLowerCase().includes(k)) return t;
  return Object.keys(window.TEMPLATES)[0];
}

function applyImportedContent(parsed, mode){
  // mode: 'replace' | 'texts' | 'apply'
  if(parsed.projectName) project.name = parsed.projectName;
  if(parsed.caption) project.caption = parsed.caption;
  if(parsed.hashtags) project.hashtags = parsed.hashtags;

  const oldSlides = project.slides || [];
  let incoming = [];
  if(Array.isArray(parsed)) incoming = parsed;
  else if(Array.isArray(parsed.slides)) incoming = parsed.slides;
  else incoming = [];
  const newSlides = [];
  for(let i=0;i<incoming.length;i++){
    const inc = incoming[i];
    const base = (oldSlides[i] && (mode!=='replace')) ? Object.assign({}, oldSlides[i]) : createSlide();
    // preserve image if exists at same index
    if(oldSlides[i] && oldSlides[i].image) base.image = oldSlides[i].image;

    // common mapping (texts import or full replace)
    base.template = mapTemplateKey(inc.template || inc.type || inc.layout || inc.style || base.template);
    base.eyebrow = inc.eyebrow || inc.eyelash || base.eyebrow || '';
    base.title = inc.title || inc.heading || inc.headline || base.title || '';
    base.subtitle = inc.subtitle || inc.subheading || base.subtitle || '';
    base.body = inc.body || inc.text || inc.description || base.body || '';
    base.cta = inc.cta || inc.call_to_action || base.cta || '';
    base.handle = inc.handle || inc.author || inc.brand || base.handle || '';
    base.number = inc.number || inc.count || base.number || '';
    base.total = inc.total || inc.totalSlides || base.total || '';
    base.creds = Array.isArray(inc.creds)? inc.creds : (inc.creds? [inc.creds] : (Array.isArray(inc.credits)?inc.credits: base.creds));
    base.steps = Array.isArray(inc.steps)? inc.steps : base.steps;
    base.philosophy = inc.philosophy || inc.note || base.philosophy || '';

    // image: accept inline data URLs (user selection still preferred)
    if(inc.image && typeof inc.image === 'string'){
      if(inc.image.indexOf('data:')===0){ const img = new Image(); img.onload = ()=>{ base.image = {img}; render(); }; img.src = inc.image; }
      // external URLs are noted but not auto-fetched to avoid CORS issues; user should upload photo manually
    }

    // if mode is 'texts', keep other fields from base (we already merged above)
    newSlides.push(base);
  }
  // if incoming is empty but mode is replace, clear slides
  if(incoming.length===0 && mode==='replace') project.slides = [];
  else project.slides = newSlides.length? newSlides : project.slides;
  project.current = 0;
  refreshSlidesList(); loadSlideToUI(); render();
}

function showImportMessage(msg, isError=true){ importMessage.textContent = msg; importMessage.style.color = isError ? '#8B0000' : '#2E7D32'; }

/* ===== IA asistida: copiar prompts (sin APIs externas) ===== */
const promptTopic = document.getElementById('promptTopic');
const promptGoal = document.getElementById('promptGoal');
const copyPromptClaude = document.getElementById('copyPromptClaude');
const copyPromptOptimize = document.getElementById('copyPromptOptimize');
const promptMessage = document.getElementById('promptMessage');

function buildClaudePrompt(){
  const topic = (promptTopic && promptTopic.value.trim()) || '';
  const goal = (promptGoal && promptGoal.value.trim()) || '';
  const topicLine = topic ? `Tema del carrusel: ${topic}` : 'Tema del carrusel: (elige uno relevante para fotografía newborn)';
  const goalLine = goal ? `Objetivo del carrusel: ${goal}` : 'Objetivo del carrusel: que la mamá reserve su sesión por DM.';
  return `Eres el redactor de Bambuky, un estudio de fotografía newborn en Querétaro, México.

Genera un carrusel de Instagram compatible con Bambuky Content Studio.

${topicLine}
${goalLine}

REGLAS OBLIGATORIAS:
- Responde ÚNICAMENTE con JSON válido.
- NO uses markdown. NO uses bloques de código. NO añadas explicaciones ni texto antes o después.
- Exactamente 7 slides, en este orden y con estos templates:
  1. "portada"
  2. "problema"
  3. "urgencia"
  4. "solucion"
  5. "objecion"
  6. "autoridad"
  7. "cta"
- Máximo 25 palabras VISIBLES por slide (suma de eyebrow + title + subtitle + body).
- Voz Bambuky: cálida, humana, tranquila y experta. Nunca agresiva ni de oferta barata.
- SEO local: menciona de forma natural "Querétaro" y "fotografía newborn Querétaro" donde encaje.
- El CTA invita a escribir por DM.
- Incluye "caption" (pie de publicación) y "hashtags".

ESTRUCTURA EXACTA DEL JSON (usa estas llaves):
{
  "projectName": "string",
  "slides": [
    { "template": "portada",   "eyebrow": "", "title": "", "subtitle": "" },
    { "template": "problema",  "eyebrow": "", "title": "", "body": "" },
    { "template": "urgencia",  "eyebrow": "", "number": "", "subtitle": "", "body": "" },
    { "template": "solucion",  "eyebrow": "", "title": "", "body": "" },
    { "template": "objecion",  "eyebrow": "", "title": "", "body": "" },
    { "template": "autoridad", "eyebrow": "", "title": "", "creds": ["", "", ""], "subtitle": "" },
    { "template": "cta",       "eyebrow": "Querétaro · México", "title": "", "subtitle": "", "cta": "Escríbenos por DM" }
  ],
  "caption": "string",
  "hashtags": "string"
}

Devuelve solo el JSON.`;
}

function buildOptimizePrompt(){
  return `Te voy a pegar un JSON de Bambuky Content Studio. Regrésame el mismo JSON válido, sin markdown, optimizando títulos y textos para legibilidad móvil en Instagram. No cambies templates ni estructura. Reduce texto, mejora titulares, conserva voz Bambuky.

REGLAS:
- Responde ÚNICAMENTE con JSON válido. Sin markdown, sin explicaciones.
- Conserva exactamente los mismos templates y las mismas llaves de cada slide.
- Máximo 25 palabras visibles por slide; prioriza titulares cortos y potentes.
- Mantén la voz Bambuky: cálida, humana, tranquila y experta.
- Conserva el SEO local (Querétaro / fotografía newborn Querétaro) si ya estaba.

JSON a optimizar:
`;
}

function flashPromptMessage(msg){
  if(!promptMessage) return;
  promptMessage.textContent = msg;
  promptMessage.style.color = '#2E7D32';
  setTimeout(()=>{ promptMessage.textContent = ''; }, 2600);
}

async function copyToClipboard(text){
  try{
    if(navigator.clipboard && navigator.clipboard.writeText){
      await navigator.clipboard.writeText(text); return true;
    }
  }catch(e){ /* fallback abajo */ }
  // Fallback para contexto local sin permiso de clipboard
  try{
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.focus(); ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }catch(e){ return false; }
}

if(copyPromptClaude) copyPromptClaude.addEventListener('click', async ()=>{
  const ok = await copyToClipboard(buildClaudePrompt());
  flashPromptMessage(ok ? 'Prompt copiado' : 'No se pudo copiar (copia manual)');
});
if(copyPromptOptimize) copyPromptOptimize.addEventListener('click', async ()=>{
  const ok = await copyToClipboard(buildOptimizePrompt());
  flashPromptMessage(ok ? 'Prompt de optimización copiado' : 'No se pudo copiar (copia manual)');
});

importApply && importApply.addEventListener('click', ()=>{
  const raw = importTextarea.value.trim(); if(!raw){ showImportMessage('Pega un JSON válido antes de importar.'); return; }
  try{
    const parsed = JSON.parse(raw);
    // allow array or object with slides
    applyImportedContent(parsed, 'replace');
    showImportMessage('Contenido importado correctamente.', false);
  } catch(e){ showImportMessage('No pude leer este contenido. Revisa que sea JSON válido.'); }
});

// Export carousel as ZIP using makeZip
exportCarouselBtn.addEventListener('click', async ()=>{
  saveUIToSlide();
  const files = [];
  for(let i=0;i<project.slides.length;i++){
    project.current = i; loadSlideToUI(); render();
    /* capture sync via toDataURL then to Uint8Array */
    const dataUrl = canvas.toDataURL('image/jpeg',1.0);
    const bin = atob(dataUrl.split(',')[1]);
    const arr = new Uint8Array(bin.length);
    for(let j=0;j<bin.length;j++) arr[j]=bin.charCodeAt(j);
    files.push({name:`slide-${String(i+1).padStart(2,'0')}.jpg`, data:arr});
  }
  const zipArr = makeZip(files);
  const blob = new Blob([zipArr], {type:'application/zip'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = (project.name||'carousel') + '.zip'; a.click(); URL.revokeObjectURL(url);
  refreshSlidesList(); loadSlideToUI(); render();
});

// Interaction simplified: dragging and manual positioning disabled in production mode.

// Initialize all on page load — after all functions are defined
if(projectNameInput) projectNameInput.value = project.name || '';
refreshSlidesList(); loadSlideToUI(); render();

// Toggle de estilo visual: Instagram First (lectura móvil) vs Editorial.
// Ambos sets comparten las mismas 7 claves, así que cambiar no afecta
// los datos de los slides ni el import/export.
const styleMode = document.getElementById('styleMode');
if(styleMode){
  styleMode.addEventListener('change', ()=>{
    window.TEMPLATES = (styleMode.value === 'editorial')
      ? window.TEMPLATES_EDITORIAL
      : window.TEMPLATES_IG;
    render();
  });
}

/* ===== Preview Instagram (mockup, no se exporta) ===== */
const viewClean = document.getElementById('viewClean');
const viewIG = document.getElementById('viewIG');
const igMockup = document.getElementById('igMockup');
const previewWrap = document.querySelector('.preview-wrap');
const igImage = document.getElementById('igImage');
const igPrev = document.getElementById('igPrev');
const igNext = document.getElementById('igNext');
const igCount = document.getElementById('igCount');
const igDots = document.getElementById('igDots');
const igCaption = document.getElementById('igCaption');
// `currentView` ya está declarada arriba (antes del primer render()).

function captionFirstLine(){
  const cap = (project.caption || '').trim();
  if(cap) return cap.split(/\r?\n/)[0];
  return (project.name || 'Los primeros días') + ' de tu bebé…';
}

function syncIGPreview(){
  if(!igImage) return;
  const total = project.slides.length;
  const cur = project.current;
  try{ igImage.src = canvas.toDataURL('image/jpeg', 0.9); }catch(e){}
  if(igCount) igCount.textContent = (cur + 1) + ' / ' + total;
  if(igCaption) igCaption.textContent = captionFirstLine();
  if(igPrev) igPrev.disabled = cur <= 0;
  if(igNext) igNext.disabled = cur >= total - 1;
  if(igDots){
    igDots.innerHTML = '';
    for(let i = 0; i < total; i++){
      const d = document.createElement('div');
      d.className = 'ig-dot' + (i === cur ? ' active' : '');
      igDots.appendChild(d);
    }
  }
}

function setView(v){
  currentView = v;
  if(previewWrap) previewWrap.style.display = (v === 'clean') ? '' : 'none';
  if(igMockup) igMockup.classList.toggle('hidden', v !== 'ig');
  if(viewClean) viewClean.classList.toggle('active', v === 'clean');
  if(viewIG) viewIG.classList.toggle('active', v === 'ig');
  if(v === 'ig') render(); // render() llama a syncIGPreview al final
}

if(viewClean) viewClean.addEventListener('click', ()=> setView('clean'));
if(viewIG) viewIG.addEventListener('click', ()=> setView('ig'));

function igGo(delta){
  const total = project.slides.length;
  const next = project.current + delta;
  if(next < 0 || next >= total) return;
  project.current = next;
  refreshSlidesList(); loadSlideToUI(); render();
}
if(igPrev) igPrev.addEventListener('click', ()=> igGo(-1));
if(igNext) igNext.addEventListener('click', ()=> igGo(1));

// Re-render once the editorial fonts have loaded (Cormorant / DM Sans),
// so the canvas uses the real typefaces instead of the serif/sans fallback.
if(document.fonts && document.fonts.ready){
  document.fonts.ready.then(()=>render());
}
