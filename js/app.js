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
const fieldCta = document.getElementById('fieldCta');

const imgUpload = document.getElementById('imgUpload');
const imgFileRow = document.getElementById('imgFileRow');
const imgFileName = document.getElementById('imgFileName');
const imgRemove = document.getElementById('imgRemove');
const variantSelect = document.getElementById('variantSelect');
const modeSelect = document.getElementById('modeSelect');
const modeSuggestion = document.getElementById('modeSuggestion');

// Rellena los selects de variante y modo según la plantilla activa.
function populateVariantOptions(tpl, current){
  if(!variantSelect) return;
  const list = (window.VARIANTS && window.VARIANTS[tpl]) || [];
  variantSelect.innerHTML = '';
  list.forEach(v=>{ const o = document.createElement('option'); o.value = v.id; o.textContent = v.label; variantSelect.appendChild(o); });
  variantSelect.value = window.normalizeVariant ? window.normalizeVariant(tpl, current) : (list[0] && list[0].id);
}
function populateModeOptions(tpl, current){
  if(!modeSelect) return;
  const list = (window.MODES && window.MODES[tpl]) || ['light'];
  const labels = window.MODE_LABELS || {};
  modeSelect.innerHTML = '';
  list.forEach(m=>{ const o = document.createElement('option'); o.value = m; o.textContent = labels[m] || m; modeSelect.appendChild(o); });
  modeSelect.value = window.normalizeMode ? window.normalizeMode(tpl, current) : list[0];
}

// Campos que usa cada plantilla (para mostrar solo lo relevante en "Contenido").
const TEMPLATE_FIELDS = {
  'Portada':            ['eyebrow','title','subtitle'],
  'Problema':           ['eyebrow','title','body'],
  'Urgencia biológica': ['eyebrow','number','subtitle','body'],
  'Solución':           ['eyebrow','title','body'],
  'Objeción':           ['eyebrow','title','body'],
  'Autoridad':          ['eyebrow','title','creds','subtitle'],
  'CTA':                ['eyebrow','title','subtitle','cta']
};
function updateFieldVisibility(tplKey){
  const fields = TEMPLATE_FIELDS[tplKey] || ['eyebrow','title','subtitle','number','creds','body','cta'];
  ['eyebrow','title','subtitle','number','creds','body','cta'].forEach(f=>{
    const grp = document.getElementById('grp-' + f);
    if(grp) grp.style.display = fields.includes(f) ? '' : 'none';
  });
}

const exportSlideBtn = document.getElementById('exportSlide');
const exportCarouselBtn = document.getElementById('exportCarousel');

let project = {
  name: 'Los primeros días', slides: [], current: 0
};

// Vista única: mockup de Instagram. Debe declararse ANTES de la primera
// llamada a render(), porque render() la lee en su hook final.
let currentView = 'ig';

// initial templates in select
Object.keys(window.TEMPLATES).forEach(key => {
  const opt = document.createElement('option'); opt.value = key; opt.textContent = key; templateSelect.appendChild(opt);
});

// create a slide object with defaults
function createSlide(templateKey){
  const tpl = templateKey || Object.keys(window.TEMPLATES)[0];
  return {
    template: tpl,
    variant: window.defaultVariant ? window.defaultVariant(tpl) : '',
    mode: window.defaultMode ? window.defaultMode(tpl) : 'light',
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
    {template:'Autoridad', variant:'experiencia', mode:'dark', eyebrow:'', title:'Bambuky · Estudio Newborn · Querétaro', creds:['Más de 10 años especializados','Más de 830 recién nacidos fotografiados','Protocolo de seguridad neonatal en cada sesión','Gemelos, prematuros y partos especiales'], subtitle:'Aquí siempre gana el bebé.'},

    // 7 · CTA
    {template:'CTA', variant:'pregunta', mode:'dark', eyebrow:'Querétaro · México', title:'¿Cuándo llega tu bebé?', subtitle:'Cuéntanos tu fecha aproximada. Con gusto te orientamos, sin compromiso.', cta:'Escríbenos por DM'}
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
    const btn = document.createElement('button'); btn.textContent = `${String(idx+1).padStart(2,'0')} · ${s.template}`; btn.className='slide-btn';
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
  fieldCta.value = s.cta||'';
  populateVariantOptions(s.template, s.variant);
  populateModeOptions(s.template, s.mode);
  if(modeSuggestion) modeSuggestion.textContent = '';
  updateFieldVisibility(s.template);
  updateImageUI();
  updateWordCounter();
  // image transform controls removed in production mode (fixed composition)
}

// Refleja en la UI si el slide actual tiene imagen (nombre + botón quitar).
function updateImageUI(){
  if(!imgFileRow) return;
  const img = project.slides[project.current] && project.slides[project.current].image;
  if(img){
    imgFileName.textContent = img.name || 'Imagen cargada';
    imgFileRow.style.display = '';
  } else {
    imgFileRow.style.display = 'none';
  }
}

// Contador en vivo del presupuesto de 25 palabras por slide.
const wordCounter = document.getElementById('wordCounter');
function countWordsUI(t){ return t ? t.trim().split(/\s+/).filter(Boolean).length : 0; }
function updateWordCounter(){
  if(!wordCounter) return;
  const isAutoridad = templateSelect && templateSelect.value === 'Autoridad';
  let n = countWordsUI(fieldEyebrow.value) + countWordsUI(fieldTitle.value)
        + countWordsUI(fieldSubtitle.value) + countWordsUI(fieldBody.value);
  if(!isAutoridad) n += countWordsUI((fieldCreds.value || '').replace(/\n/g, ' '));
  wordCounter.textContent = n + ' / 25 palabras visibles' + (isAutoridad ? ' (credenciales sin límite)' : '');
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
  s.cta = fieldCta.value;
  if(variantSelect && variantSelect.value) s.variant = variantSelect.value;
  if(modeSelect && modeSelect.value) s.mode = modeSelect.value;
  // image transform controls removed in production mode (fixed composition)
}

// image loader
imgUpload.addEventListener('change', async (e)=>{
  const file = e.target.files[0]; if(!file) return;
  const img = new Image();
  img.onload = ()=>{
    const obj = {img, name: file.name};
    project.slides[project.current].image = obj;
    autoContrast(img);           // sugerir y aplicar modo según la foto
    updateImageUI(); render();
  };
  img.src = URL.createObjectURL(file);
});

// Quitar imagen del slide actual
if(imgRemove) imgRemove.addEventListener('click', ()=>{
  project.slides[project.current].image = null;
  if(imgUpload) imgUpload.value = '';
  if(modeSuggestion) modeSuggestion.textContent = '';
  updateImageUI(); render();
});

// Analiza luminosidad/contraste de la foto y devuelve {avg, sd} (0–255).
function analyzePhoto(img){
  try{
    const c = document.createElement('canvas'); const w = 40, h = 50;
    c.width = w; c.height = h;
    const cx = c.getContext('2d'); cx.drawImage(img, 0, 0, w, h);
    const d = cx.getImageData(0, 0, w, h).data;
    let sum = 0; const lum = [];
    for(let i=0;i<d.length;i+=4){ const l = 0.2126*d[i] + 0.7152*d[i+1] + 0.0722*d[i+2]; lum.push(l); sum += l; }
    const avg = sum / lum.length;
    let varc = 0; for(const l of lum) varc += (l-avg)*(l-avg);
    return { avg, sd: Math.sqrt(varc / lum.length) };
  }catch(e){ return null; }
}

// Sugiere un modo disponible para la plantilla según la foto.
function suggestMode(tpl, stats){
  const avail = (window.MODES && window.MODES[tpl]) || ['light'];
  let want, reason;
  if(stats.sd > 68 && avail.includes('overlay')){ want = 'overlay'; reason = 'foto con mucho contraste'; }
  else if(stats.avg >= 165){ want = 'light'; reason = 'foto clara'; }
  else if(stats.avg <= 95){ want = 'dark'; reason = 'foto oscura'; }
  else { want = (stats.avg >= 130) ? 'light' : 'dark'; reason = (stats.avg >= 130) ? 'foto clara' : 'foto oscura'; }
  if(!avail.includes(want)) want = avail.includes('dark') ? 'dark' : avail[0];
  return { mode: want, reason };
}

// Aplica la sugerencia (el usuario puede cambiarla manualmente después).
function autoContrast(img){
  const s = project.slides[project.current];
  const stats = analyzePhoto(img);
  if(!stats){ if(modeSuggestion) modeSuggestion.textContent = ''; return; }
  const sug = suggestMode(s.template, stats);
  s.mode = sug.mode;
  populateModeOptions(s.template, s.mode);
  if(modeSuggestion){
    const label = (window.MODE_LABELS && window.MODE_LABELS[sug.mode]) || sug.mode;
    modeSuggestion.innerHTML = `Sugerencia automática: <span class="sg-strong">${label}</span> (${sug.reason}). Puedes cambiarla.`;
  }
}

// Campos de texto + nombre de proyecto
[fieldEyebrow, fieldTitle, fieldSubtitle, fieldNumber, fieldCreds, fieldBody, fieldCta, projectNameInput].forEach(el=>{
  el && el.addEventListener('input', ()=>{ saveUIToSlide(); if(el===projectNameInput) project.name = projectNameInput.value; updateWordCounter(); refreshSlidesList(); render(); });
});

// Cambio de plantilla: resetea variante y modo a los de la nueva plantilla.
if(templateSelect) templateSelect.addEventListener('change', ()=>{
  const s = project.slides[project.current];
  s.template = templateSelect.value;
  s.variant = window.defaultVariant ? window.defaultVariant(s.template) : '';
  s.mode = window.defaultMode ? window.defaultMode(s.template) : 'light';
  populateVariantOptions(s.template, s.variant);
  populateModeOptions(s.template, s.mode);
  updateFieldVisibility(s.template);
  updateWordCounter(); refreshSlidesList(); render();
});

// Cambio de variante o modo
if(variantSelect) variantSelect.addEventListener('change', ()=>{ saveUIToSlide(); render(); });
if(modeSelect) modeSelect.addEventListener('change', ()=>{ saveUIToSlide(); render(); });

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
  // La plantilla Autoridad es una lista de credenciales: se exime del recorte
  // de 25 palabras para no mutilar las viñetas.
  if(remaining > 0 && Array.isArray(state.creds) && s.template !== 'Autoridad'){
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
    // variante y modo (con defaults si no se especifican)
    base.variant = window.normalizeVariant ? window.normalizeVariant(base.template, inc.variant) : (inc.variant || base.variant || '');
    base.mode = window.normalizeMode ? window.normalizeMode(base.template, inc.mode || inc.contrast) : (inc.mode || base.mode || 'light');
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
  refreshSlidesList(); loadSlideToUI(); render(); updateCaptionUI();
}

function showImportMessage(msg, isError=true){ importMessage.textContent = msg; importMessage.style.color = isError ? '#8B0000' : '#2E7D32'; }

/* ===== Copiar caption para Instagram ===== */
const captionRow = document.getElementById('captionRow');
const copyCaption = document.getElementById('copyCaption');
const captionMessage = document.getElementById('captionMessage');

// Muestra el botón solo si hay caption disponible.
function updateCaptionUI(){
  if(!captionRow) return;
  captionRow.style.display = (project.caption && project.caption.trim()) ? '' : 'none';
}

if(copyCaption) copyCaption.addEventListener('click', async ()=>{
  let text = (project.caption || '').trim();
  if(project.hashtags && project.hashtags.trim()) text += '\n\n' + project.hashtags.trim();
  if(!text){ if(captionMessage) captionMessage.textContent = 'No hay caption todavía. Importa el JSON de Claude primero.'; return; }
  const ok = await copyToClipboard(text);
  if(captionMessage){
    captionMessage.textContent = ok ? 'Caption copiado (con hashtags)' : 'No se pudo copiar (copia manual)';
    setTimeout(()=>{ captionMessage.textContent = ''; }, 2600);
  }
});

/* ===== IA asistida: copiar prompts (sin APIs externas) ===== */
const promptTopic = document.getElementById('promptTopic');
const promptGoal = document.getElementById('promptGoal');
const promptAudience = document.getElementById('promptAudience');
const copyPromptClaude = document.getElementById('copyPromptClaude');
const copyPromptOptimize = document.getElementById('copyPromptOptimize');
const promptMessage = document.getElementById('promptMessage');

function buildClaudePrompt(){
  const topic = (promptTopic && promptTopic.value.trim()) || '';
  const goal = (promptGoal && promptGoal.value.trim()) || '';
  const audience = (promptAudience && promptAudience.value.trim()) || '';
  const topicLine = topic ? `Tema del carrusel: ${topic}` : 'Tema del carrusel: (elige uno relevante para fotografía newborn)';
  const goalLine = goal ? `Objetivo del carrusel: ${goal}` : 'Objetivo del carrusel: que la mamá reserve su sesión por DM.';
  const audienceLine = audience ? `Público objetivo: ${audience}` : 'Público objetivo: mamás y familias esperando un bebé en Querétaro.';

  // Mapa nombre interno -> llave JSON
  const JSON_KEYS = {'Portada':'portada','Problema':'problema','Urgencia biológica':'urgencia','Solución':'solucion','Objeción':'objecion','Autoridad':'autoridad','CTA':'cta'};
  // Referencia de plantillas (variantes, modos y campos) generada desde la app
  const ref = Object.keys(JSON_KEYS).map(name=>{
    const key = JSON_KEYS[name];
    const vs = ((window.VARIANTS && window.VARIANTS[name]) || []).map(v=>v.id).join(' | ');
    const ms = ((window.MODES && window.MODES[name]) || []).join(' | ');
    const fs = (TEMPLATE_FIELDS[name] || []).join(', ');
    return `- "${key}"  · variantes: ${vs}  · modos: ${ms}  · campos: ${fs}`;
  }).join('\n');

  return `Eres el redactor de Bambuky, un estudio de fotografía newborn en Querétaro, México.

Antes de escribir, revisa el sitio web del negocio para captar tono, servicios y datos reales:
https://www.bambuky.com

Genera un carrusel de Instagram compatible con Bambuky Content Studio.

${topicLine}
${goalLine}
${audienceLine}

REGLAS OBLIGATORIAS
- Responde ÚNICAMENTE con JSON válido. NADA de markdown, bloques de código, comentarios ni texto antes o después.
- Exactamente 7 slides, en este orden de templates: portada, problema, urgencia, solucion, objecion, autoridad, cta.
- Voz Bambuky: cálida, humana, tranquila y experta. Nunca agresiva ni de oferta barata.
- SEO local: integra de forma natural "Querétaro" y "fotografía newborn Querétaro".
- El CTA invita a escribir por DM (sin precios en el diseño).
- Entrega también "caption" (pie de publicación) y "hashtags".

LÍMITES DE PALABRAS POR CAMPO (por diseño; respétalos para que el JSON quede listo para usar)
- eyebrow: máximo 5 palabras.
- title: máximo 9 palabras.
- subtitle: máximo 12 palabras.
- body: máximo 3 líneas ≈ máximo 18 palabras.
- number: 1 dato muy corto (ej. "+830", "10", "5–15").
- creds (solo "autoridad"): 3 a 4 items, cada uno máximo 6 palabras.
- cta: máximo 5 palabras.
- REGLA GLOBAL: máximo 25 palabras VISIBLES por slide sumando eyebrow + title + subtitle + body. (Las credenciales de "autoridad" no cuentan en ese límite.)

CAMPOS, VARIANTES Y MODOS DISPONIBLES (usa solo los campos listados para cada template)
${ref}

CÓMO ELEGIR
- variant: define la composición. Si no estás seguro, omítela (se usa la principal) o elige la más adecuada al mensaje.
- mode: contraste visual de la slide. Si la slide llevará foto clara usa "light"; foto oscura "dark"; foto con mucho contraste "overlay"; "split" muestra foto + bloque de color; "highlight" resalta (solo autoridad). Si no estás seguro, usa "light".

ESTRUCTURA EXACTA DEL JSON
{
  "projectName": "string",
  "slides": [
    { "template": "portada",   "variant": "hero",        "mode": "light", "eyebrow": "", "title": "", "subtitle": "" },
    { "template": "problema",  "variant": "pregunta",    "mode": "light", "eyebrow": "", "title": "", "body": "" },
    { "template": "urgencia",  "variant": "ventana",     "mode": "light", "eyebrow": "", "number": "", "subtitle": "", "body": "" },
    { "template": "solucion",  "variant": "proceso",     "mode": "light", "eyebrow": "", "title": "", "body": "" },
    { "template": "objecion",  "variant": "pregunta",    "mode": "light", "eyebrow": "", "title": "", "body": "" },
    { "template": "autoridad", "variant": "experiencia", "mode": "dark",  "eyebrow": "", "title": "", "creds": ["", "", ""], "subtitle": "" },
    { "template": "cta",       "variant": "pregunta",    "mode": "dark",  "eyebrow": "Querétaro · México", "title": "", "subtitle": "", "cta": "Escríbenos por DM" }
  ],
  "caption": "Pie de publicación de 3 a 6 párrafos cortos, tono Bambuky, con un llamado final a escribir por DM.",
  "hashtags": "10 a 15 hashtags en una sola cadena separada por espacios, incluyendo fotografía newborn y Querétaro."
}

Devuelve solo el JSON.`;
}

function buildOptimizePrompt(){
  return `Te voy a pegar un JSON de Bambuky Content Studio. Regrésame el mismo JSON válido, sin markdown, optimizando títulos y textos para legibilidad móvil en Instagram. No cambies templates ni estructura. Reduce texto, mejora titulares, conserva voz Bambuky.

REGLAS:
- Responde ÚNICAMENTE con JSON válido. Sin markdown, sin explicaciones.
- Conserva exactamente los mismos templates, variant, mode y las mismas llaves de cada slide.
- Respeta los límites de diseño: eyebrow ≤ 5 palabras, title ≤ 9, subtitle ≤ 12, body ≤ 3 líneas (≈18 palabras), cta ≤ 5, credenciales ≤ 6 palabras c/u.
- Máximo 25 palabras visibles por slide (eyebrow + title + subtitle + body); prioriza titulares cortos y potentes.
- Mantén la voz Bambuky: cálida, humana, tranquila y experta.
- Conserva el SEO local (Querétaro / fotografía newborn Querétaro) y el caption/hashtags si ya estaban.

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
// (La inicialización ocurre al final del archivo, una vez declarados los
//  elementos del mockup de Instagram, para evitar TDZ en syncIGPreview.)

// Estilo visual único: Instagram First (ya fijado como window.TEMPLATES por
// templates-ig.js). Se mantiene cargado templates.js solo por sus helpers.

/* ===== Preview Instagram (mockup, única vista) ===== */
const igMockup = document.getElementById('igMockup');
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

function igGo(delta){
  const total = project.slides.length;
  const next = project.current + delta;
  if(next < 0 || next >= total) return;
  project.current = next;
  refreshSlidesList(); loadSlideToUI(); render();
}
if(igPrev) igPrev.addEventListener('click', ()=> igGo(-1));
if(igNext) igNext.addEventListener('click', ()=> igGo(1));

// Inicialización (al final: ya están declarados los elementos del mockup que
// usa syncIGPreview, llamado desde render()).
if(projectNameInput) projectNameInput.value = project.name || '';
refreshSlidesList(); loadSlideToUI(); render(); updateCaptionUI();

// Re-render once the editorial fonts have loaded (Cormorant / DM Sans),
// so the canvas uses the real typefaces instead of the serif/sans fallback.
if(document.fonts && document.fonts.ready){
  document.fonts.ready.then(()=>render());
}
