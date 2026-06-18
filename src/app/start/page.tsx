'use client';

import { useState, useEffect, useRef } from 'react';

/* ─── Types ─── */
type Lang = 'en' | 'ru' | 'es' | 'fr' | 'ar';
type Stage = 'access' | 'demo' | 'instructions' | 'ready';

/* ─── Palette ─── */
const C = {
  ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8',
  line: '#E5DED2', bone: '#F6F1EA',
  orange: '#FF7A3D', orangeHot: '#FF9540', blue: '#2244E0',
  grad: 'linear-gradient(95deg, #FF6EA5 0%, #E6337C 35%, #7A2FBF 75%, #4B1E8E 100%)',
};

/* ─── Translations ─── */
const T = {
  en: {
    lang_label: 'Language',
    s1_heading: 'Welcome to Your Assessment',
    s1_sub: 'Enter your access code to begin',
    s1_code_label: 'Access Code',
    s1_code_ph: '123456',
    s1_tc_pre: 'I have read and agree to the',
    s1_tc_link: 'Terms & Conditions',
    s1_research: 'I consent to my anonymized responses being used for research purposes. Please refer to our',
    s1_research_policy: 'Data Retention Policy',
    s1_research_note: 'You may opt out — this will not affect your results',
    s1_continue: 'Continue',
    s2_heading: 'Optional: About You',
    s2_sub: 'Collected anonymously for research purposes only. All fields are optional — skip any or all.',
    s2_age: 'Age', s2_edu: 'Highest Education Completed',
    s2_country: 'Country of Residence', s2_country_ph: 'Search countries…',
    s2_occ: 'Current Occupation / Field', s2_occ_ph: 'e.g. Student, Healthcare, Engineering',
    s2_lang: 'Primary Language', s2_lang_ph: 'e.g. English, Spanish…',
    s2_age_default: 'Select age…', s2_edu_default: 'Select education…',
    s2_skip: 'Skip All & Continue', s2_continue: 'Continue',
    pref_not_say: 'Prefer not to say',
    edu: ['Elementary Education','Secondary Education','High school diploma or equivalent','Some college or university',"Bachelor's degree","Graduate degree (Master's or higher)",'Trade or vocational certificate','Prefer not to say'],
    instructions: [
      'Find a quiet place where you won\'t be interrupted.',
      'Answer honestly — there are no right or wrong answers.',
      'Take your time. This assessment typically takes 15–20 minutes.',
    ],
    s4_heading: 'You\'re all set.',
    s4_sub: 'When you\'re ready, press Start to begin your assessment.',
    s4_start: 'Start Assessment',
    footer: 'Your responses are private and secure.',
  },
  ru: {
    lang_label: 'Язык',
    s1_heading: 'Добро пожаловать в ваш тест',
    s1_sub: 'Введите код доступа, чтобы начать',
    s1_code_label: 'Код доступа',
    s1_code_ph: '123456',
    s1_tc_pre: 'Я прочитал(а) и согласен(а) с',
    s1_tc_link: 'Условиями использования',
    s1_research: 'Я даю согласие на использование моих анонимных ответов в исследовательских целях. Ознакомьтесь с нашей',
    s1_research_policy: 'Политикой хранения данных',
    s1_research_note: 'Вы можете отказаться — это не повлияет на ваши результаты',
    s1_continue: 'Продолжить',
    s2_heading: 'Необязательно: О вас',
    s2_sub: 'Собирается анонимно исключительно в исследовательских целях. Все поля необязательны.',
    s2_age: 'Возраст', s2_edu: 'Уровень образования',
    s2_country: 'Страна проживания', s2_country_ph: 'Поиск страны…',
    s2_occ: 'Профессия / сфера', s2_occ_ph: 'Напр.: Студент, Медицина, Инженерия',
    s2_lang: 'Основной язык', s2_lang_ph: 'Напр.: Русский, Английский…',
    s2_age_default: 'Выберите возраст…', s2_edu_default: 'Выберите образование…',
    s2_skip: 'Пропустить всё и продолжить', s2_continue: 'Продолжить',
    pref_not_say: 'Предпочитаю не указывать',
    edu: ['Начальное образование','Среднее образование','Диплом о среднем образовании','Неполное высшее','Степень бакалавра','Степень магистра или выше','Профессиональное / техническое образование','Предпочитаю не указывать'],
    instructions: [
      'Найдите тихое место, где вас не побеспокоят.',
      'Отвечайте честно — здесь нет правильных или неправильных ответов.',
      'Не торопитесь. Тест обычно занимает 15–20 минут.',
    ],
    s4_heading: 'Всё готово.',
    s4_sub: 'Когда будете готовы, нажмите «Начать», чтобы приступить к тесту.',
    s4_start: 'Начать тест',
    footer: 'Ваши ответы конфиденциальны и защищены.',
  },
  es: {
    lang_label: 'Idioma',
    s1_heading: 'Bienvenido a tu evaluación',
    s1_sub: 'Introduce tu código de acceso para comenzar',
    s1_code_label: 'Código de acceso',
    s1_code_ph: '123456',
    s1_tc_pre: 'He leído y acepto los',
    s1_tc_link: 'Términos y Condiciones',
    s1_research: 'Consiento el uso de mis respuestas anonimizadas con fines de investigación. Consulte nuestra',
    s1_research_policy: 'Política de retención de datos',
    s1_research_note: 'Puede optar por no participar — esto no afectará sus resultados',
    s1_continue: 'Continuar',
    s2_heading: 'Opcional: Sobre ti',
    s2_sub: 'Información recogida de forma anónima con fines de investigación. Todos los campos son opcionales.',
    s2_age: 'Edad', s2_edu: 'Nivel de estudios más alto',
    s2_country: 'País de residencia', s2_country_ph: 'Buscar país…',
    s2_occ: 'Ocupación / sector actual', s2_occ_ph: 'p. ej. Estudiante, Salud, Ingeniería',
    s2_lang: 'Idioma principal', s2_lang_ph: 'p. ej. Español, Inglés…',
    s2_age_default: 'Seleccionar edad…', s2_edu_default: 'Seleccionar educación…',
    s2_skip: 'Omitir todo y continuar', s2_continue: 'Continuar',
    pref_not_say: 'Prefiero no decirlo',
    edu: ['Educación primaria','Educación secundaria','Bachillerato o equivalente','Estudios universitarios parciales','Licenciatura','Máster o superior','Certificado técnico o vocacional','Prefiero no decirlo'],
    instructions: [
      'Busca un lugar tranquilo donde no te interrumpan.',
      'Responde con honestidad — no hay respuestas correctas ni incorrectas.',
      'Tómate tu tiempo. Esta evaluación suele durar entre 15 y 20 minutos.',
    ],
    s4_heading: '¡Todo listo!',
    s4_sub: 'Cuando estés listo, pulsa Iniciar para comenzar tu evaluación.',
    s4_start: 'Iniciar evaluación',
    footer: 'Sus respuestas son privadas y seguras.',
  },
  fr: {
    lang_label: 'Langue',
    s1_heading: 'Bienvenue dans votre évaluation',
    s1_sub: "Entrez votre code d'accès pour commencer",
    s1_code_label: "Code d'accès",
    s1_code_ph: '123456',
    s1_tc_pre: "J'ai lu et j'accepte les",
    s1_tc_link: "Conditions d'utilisation",
    s1_research: "Je consens à ce que mes réponses anonymisées soient utilisées à des fins de recherche. Veuillez consulter notre",
    s1_research_policy: 'Politique de conservation des données',
    s1_research_note: "Vous pouvez vous désinscrire — cela n'affectera pas vos résultats",
    s1_continue: 'Continuer',
    s2_heading: 'Optionnel : À votre sujet',
    s2_sub: "Informations collectées de façon anonyme à des fins de recherche uniquement. Tous les champs sont facultatifs.",
    s2_age: 'Âge', s2_edu: "Niveau d'études le plus élevé",
    s2_country: 'Pays de résidence', s2_country_ph: 'Rechercher un pays…',
    s2_occ: 'Profession / Domaine actuel', s2_occ_ph: 'p. ex. Étudiant, Santé, Ingénierie',
    s2_lang: 'Langue principale', s2_lang_ph: 'p. ex. Français, Anglais…',
    s2_age_default: 'Sélectionner un âge…', s2_edu_default: "Sélectionner un niveau…",
    s2_skip: 'Tout ignorer et continuer', s2_continue: 'Continuer',
    pref_not_say: 'Je préfère ne pas répondre',
    edu: ['Enseignement primaire','Enseignement secondaire','Baccalauréat ou équivalent','Études universitaires partielles','Licence','Master ou équivalent supérieur','Certificat professionnel ou technique','Je préfère ne pas répondre'],
    instructions: [
      "Trouvez un endroit calme où vous ne serez pas interrompu.",
      "Répondez honnêtement — il n'y a pas de bonne ou de mauvaise réponse.",
      "Prenez votre temps. Cette évaluation dure généralement 15 à 20 minutes.",
    ],
    s4_heading: 'Vous êtes prêt.',
    s4_sub: 'Quand vous êtes prêt, appuyez sur Démarrer pour commencer.',
    s4_start: "Démarrer l'évaluation",
    footer: 'Vos réponses sont privées et sécurisées.',
  },
  ar: {
    lang_label: 'اللغة',
    s1_heading: 'مرحباً بك في تقييمك',
    s1_sub: 'أدخل رمز الوصول للبدء',
    s1_code_label: 'رمز الوصول',
    s1_code_ph: '123456',
    s1_tc_pre: 'لقد قرأت وأوافق على',
    s1_tc_link: 'الشروط والأحكام',
    s1_research: 'أوافق على استخدام ردودي المجهولة الهوية لأغراض البحث العلمي. يُرجى مراجعة',
    s1_research_policy: 'سياسة الاحتفاظ بالبيانات',
    s1_research_note: 'يمكنك الانسحاب — لن يؤثر ذلك على نتائجك',
    s1_continue: 'متابعة',
    s2_heading: 'اختياري: معلومات عنك',
    s2_sub: 'تُجمع هذه المعلومات بشكل مجهول لأغراض البحث فقط. جميع الحقول اختيارية.',
    s2_age: 'العمر', s2_edu: 'أعلى مستوى تعليمي',
    s2_country: 'بلد الإقامة', s2_country_ph: 'ابحث عن البلد…',
    s2_occ: 'المهنة / المجال الحالي', s2_occ_ph: 'مثلاً: طالب، رعاية صحية، هندسة',
    s2_lang: 'اللغة الأساسية', s2_lang_ph: 'مثلاً: العربية، الإنجليزية…',
    s2_age_default: 'اختر العمر…', s2_edu_default: 'اختر المستوى…',
    s2_skip: 'تخطي الكل والمتابعة', s2_continue: 'متابعة',
    pref_not_say: 'أفضل عدم الإفصاح',
    edu: ['التعليم الابتدائي','التعليم الثانوي','شهادة الثانوية العامة أو ما يعادلها','بعض التعليم الجامعي','درجة البكالوريوس','درجة الدراسات العليا (ماجستير أو أعلى)','شهادة مهنية أو حرفية','أفضل عدم الإفصاح'],
    instructions: [
      'ابحث عن مكان هادئ بعيداً عن المقاطعات.',
      'أجب بصدق — لا توجد إجابات صحيحة أو خاطئة.',
      'خذ وقتك. يستغرق هذا التقييم عادةً من 15 إلى 20 دقيقة.',
    ],
    s4_heading: 'أنت جاهز تماماً.',
    s4_sub: 'عندما تكون مستعداً، اضغط على بدء لتبدأ تقييمك.',
    s4_start: 'بدء التقييم',
    footer: 'إجاباتك خاصة وآمنة.',
  },
} as const;

/* ─── Country list ─── */
const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bangladesh','Belarus','Belgium','Bolivia','Brazil','Bulgaria','Canada','Chile','China',
  'Colombia','Croatia','Czech Republic','Denmark','Ecuador','Egypt','Estonia','Ethiopia',
  'Finland','France','Georgia','Germany','Ghana','Greece','Hungary','India','Indonesia',
  'Iran','Iraq','Ireland','Israel','Italy','Japan','Jordan','Kazakhstan','Kenya','Kuwait',
  'Latvia','Lebanon','Libya','Lithuania','Malaysia','Mexico','Morocco','Netherlands',
  'New Zealand','Nigeria','Norway','Pakistan','Peru','Philippines','Poland','Portugal',
  'Qatar','Romania','Russia','Saudi Arabia','Serbia','Singapore','Slovakia','South Africa',
  'South Korea','Spain','Sri Lanka','Sudan','Sweden','Switzerland','Syria','Taiwan',
  'Thailand','Tunisia','Turkey','Ukraine','United Arab Emirates','United Kingdom',
  'United States','Uruguay','Uzbekistan','Venezuela','Vietnam','Yemen','Other',
];

const LANG_NAMES: Record<Lang, string> = { en: 'English', ru: 'Русский', es: 'Español', fr: 'Français', ar: 'العربية' };

/* ─── Sub-components ─── */
function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.inkMute, textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 7 }}>
      {children}
    </label>
  );
}

function Checkbox({ id, checked, onChange, children }: { id: string; checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label htmlFor={id} style={{ display: 'flex', gap: 12, cursor: 'pointer', alignItems: 'flex-start', userSelect: 'none' as const }}>
      <input type="checkbox" id={id} checked={checked} onChange={e => onChange(e.target.checked)} style={{ display: 'none' }}/>
      <span aria-hidden="true" style={{
        flexShrink: 0, width: 20, height: 20, borderRadius: 6, marginTop: 1,
        border: `2px solid ${checked ? C.orangeHot : C.line}`,
        background: checked ? C.orangeHot : 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .15s',
      }}>
        {checked && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      <span style={{ fontSize: 13.5, color: C.inkSoft, lineHeight: 1.6 }}>{children}</span>
    </label>
  );
}

const inputBase: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 12,
  border: `1.5px solid ${C.line}`, fontSize: 14, color: C.ink,
  background: 'white', fontFamily: 'inherit', outline: 'none',
  transition: 'border-color .15s', boxSizing: 'border-box',
};

const chevronBg = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238A8FA8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E\")";

function PrimaryBtn({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      style={{
        width: '100%', padding: '16px 0', borderRadius: 14, border: 'none',
        fontSize: 15, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', letterSpacing: '-0.01em',
        background: disabled ? C.line : C.grad,
        color: disabled ? C.inkMute : 'white',
        transition: 'background .2s, transform .15s, box-shadow .15s',
        boxShadow: disabled ? 'none' : '0 8px 24px -8px rgba(230,51,124,0.40)',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {children}
    </button>
  );
}

/* ═══ Main Component ═══ */
export default function StartPage() {
  const [lang, setLang] = useState<Lang>('en');
  const [langOpen, setLangOpen] = useState(false);
  const [stage, setStage] = useState<Stage>('access');
  const [fading, setFading] = useState(false);

  /* Stage 1 */
  const [code, setCode] = useState('');
  const [tcChecked, setTcChecked] = useState(false);
  const [researchChecked, setResearchChecked] = useState(false);
  const [codeStatus, setCodeStatus] = useState<'idle' | 'checking' | 'valid' | 'not_found' | 'already_used'>('idle');
  const [validCodeId, setValidCodeId] = useState<string | null>(null);

  /* Stage 2 */
  const [age, setAge] = useState('');
  const [edu, setEdu] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [countryVal, setCountryVal] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const [occ, setOcc] = useState('');
  const [pLang, setPLang] = useState('');

  /* Stage 3 */
  const [instrIdx, setInstrIdx] = useState(0);
  const [instrVisible, setInstrVisible] = useState(true);

  const codeRef = useRef<HTMLInputElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (stage === 'access') codeRef.current?.focus(); }, [stage]);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) setCountryOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  /* Instruction auto-advance */
  useEffect(() => {
    if (stage !== 'instructions') return;
    setInstrVisible(true);
    const hide = setTimeout(() => setInstrVisible(false), 3200);
    const next = setTimeout(() => {
      const total = T[lang].instructions.length;
      if (instrIdx < total - 1) { setInstrIdx(i => i + 1); }
      else { goToStage('ready'); }
    }, 3700);
    return () => { clearTimeout(hide); clearTimeout(next); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, instrIdx]);

  function goToStage(next: Stage) {
    setFading(true);
    setTimeout(() => {
      setStage(next);
      if (next === 'instructions') { setInstrIdx(0); setInstrVisible(true); }
      setFading(false);
    }, 250);
  }

  // Validate code when it reaches 6 digits
  useEffect(() => {
    if (!/^\d{6}$/.test(code)) {
      setCodeStatus('idle');
      setValidCodeId(null);
      return;
    }
    setCodeStatus('checking');
    setValidCodeId(null);

    let cancelled = false;

    async function validate() {
      // Try API first (KV — cross-device)
      try {
        const res = await fetch('/api/codes/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        if (!cancelled && res.ok) {
          const data = await res.json() as { valid: boolean; reason?: string; id?: string };
          if (data.valid) {
            setCodeStatus('valid');
            setValidCodeId(data.id ?? null);
          } else if (data.reason === 'already_used') {
            setCodeStatus('already_used');
          } else {
            setCodeStatus('not_found');
          }
          return;
        }
      } catch { /* API unavailable */ }

      // Fallback: check localStorage
      if (cancelled) return;
      try {
        const raw = localStorage.getItem('psyid_admin_codes');
        const all = raw ? (JSON.parse(raw) as { id: string; code: string; status: string }[]) : [];
        const found = all.find(c => c.code === code);
        if (!found) { setCodeStatus('not_found'); return; }
        if (found.status === 'USED') { setCodeStatus('already_used'); return; }
        setCodeStatus('valid');
        setValidCodeId(found.id);
      } catch {
        setCodeStatus('not_found');
      }
    }

    validate();
    return () => { cancelled = true; };
  }, [code]);

  const t = T[lang];
  const isRtl = lang === 'ar';
  const canContinue1 = codeStatus === 'valid' && tcChecked;
  const filteredCountries = COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()));
  const selectStyle: React.CSSProperties = { ...inputBase, appearance: 'none', backgroundImage: chevronBg, backgroundRepeat: 'no-repeat', backgroundPosition: isRtl ? '12px 50%' : 'calc(100% - 12px) 50%', paddingRight: isRtl ? '11px' : '36px', paddingLeft: isRtl ? '36px' : '11px' };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh', background: `linear-gradient(155deg, ${C.bone} 0%, #EAE7EE 100%)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '24px 16px 56px',
        fontFamily: "'Geist', 'Onest', system-ui, sans-serif",
      }}
    >
      {/* ── Top bar ── */}
      <div style={{ width: '100%', maxWidth: 480, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, background: C.ink, position: 'relative', display: 'inline-block', flexShrink: 0, overflow: 'hidden' }}>
            <span style={{ position: 'absolute', left: 5, top: 5, width: 8, height: 8, borderRadius: '50%', background: C.blue }}/>
            <span style={{ position: 'absolute', right: 5, bottom: 5, width: 8, height: 8, borderRadius: 3, background: C.orangeHot }}/>
          </span>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.03em', color: C.ink }}>
            Psy<span style={{ color: C.orangeHot }}>ID</span>
          </span>
        </div>

        {/* Language picker */}
        <div ref={langRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setLangOpen(v => !v)}
            aria-haspopup="listbox"
            aria-expanded={langOpen}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 13px', borderRadius: 10, cursor: 'pointer',
              border: `1.5px solid ${C.line}`, background: 'white',
              fontSize: 13, fontWeight: 600, color: C.inkSoft, fontFamily: 'inherit',
            }}
          >
            {LANG_NAMES[lang]}
            <svg width="11" height="7" viewBox="0 0 12 8" fill="none" style={{ transform: langOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s', color: C.inkMute }}>
              <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {langOpen && (
            <div role="listbox" style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: isRtl ? 'auto' : 0, left: isRtl ? 0 : 'auto', zIndex: 200,
              background: 'white', border: `1.5px solid ${C.line}`, borderRadius: 12,
              overflow: 'hidden', boxShadow: '0 8px 24px rgba(14,18,48,0.10)', minWidth: 130,
            }}>
              {(Object.entries(LANG_NAMES) as [Lang, string][]).map(([l, name]) => (
                <button key={l} role="option" aria-selected={l === lang}
                  onClick={() => { setLang(l); setLangOpen(false); }}
                  style={{
                    width: '100%', padding: '10px 14px', textAlign: isRtl ? 'right' : 'left',
                    fontSize: 13, fontWeight: l === lang ? 700 : 400,
                    color: l === lang ? C.orangeHot : C.ink,
                    background: l === lang ? 'rgba(255,149,64,0.07)' : 'transparent',
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Card ── */}
      <div style={{
        width: '100%', maxWidth: 480,
        background: 'white', borderRadius: 24, padding: '40px 36px',
        border: `1px solid ${C.line}`,
        boxShadow: '0 20px 60px -16px rgba(14,18,48,0.10)',
        opacity: fading ? 0 : 1,
        transform: fading ? 'translateY(8px)' : 'translateY(0)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
      }}>

        {/* ── STAGE 1: Access Gate ── */}
        {stage === 'access' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: '-0.025em', margin: '0 0 8px' }}>
                {t.s1_heading}
              </h1>
              <p style={{ fontSize: 14, color: C.inkMute, margin: 0 }}>{t.s1_sub}</p>
            </div>

            <div style={{ marginBottom: 28 }}>
              <FieldLabel htmlFor="access-code">{t.s1_code_label}</FieldLabel>
              <input
                ref={codeRef}
                id="access-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                placeholder={t.s1_code_ph}
                autoComplete="one-time-code"
                dir="ltr"
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onFocus={e => (e.currentTarget.style.borderColor = C.orangeHot)}
                onBlur={e => (e.currentTarget.style.borderColor = code.length === 6 ? C.orangeHot : C.line)}
                style={{
                  ...inputBase, height: 68,
                  fontSize: 28, fontFamily: "'Geist Mono', monospace",
                  fontWeight: 800, letterSpacing: '0.45em', textAlign: 'center',
                  borderColor: code.length === 6 ? C.orangeHot : C.line,
                  background: C.bone,
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
              <Checkbox id="tc" checked={tcChecked} onChange={setTcChecked}>
                <span>
                  {t.s1_tc_pre}{' '}
                  <a href="#" style={{ color: C.blue, fontWeight: 600, textUnderlineOffset: 3, textDecoration: 'underline' }}>
                    {t.s1_tc_link}
                  </a>
                </span>
              </Checkbox>
              <Checkbox id="research" checked={researchChecked} onChange={setResearchChecked}>
                <span>
                  {t.s1_research}{' '}
                  <a href="#" style={{ color: C.blue, fontWeight: 600, textUnderlineOffset: 3, textDecoration: 'underline' }}>
                    {t.s1_research_policy}
                  </a>.
                  <span style={{ display: 'block', marginTop: 4, fontSize: 12, color: C.inkMute, fontStyle: 'italic' }}>
                    ({t.s1_research_note})
                  </span>
                </span>
              </Checkbox>
            </div>

            <PrimaryBtn onClick={() => goToStage('demo')} disabled={!canContinue1}>
              {t.s1_continue}
            </PrimaryBtn>
          </div>
        )}

        {/* ── STAGE 2: Demographics ── */}
        {stage === 'demo' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
                {t.s2_heading}
              </h1>
              <p style={{ fontSize: 13, color: C.inkMute, lineHeight: 1.6, margin: 0 }}>{t.s2_sub}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Age */}
              <div>
                <FieldLabel htmlFor="s2-age">{t.s2_age}</FieldLabel>
                <select id="s2-age" value={age} onChange={e => setAge(e.target.value)} style={selectStyle}>
                  <option value="">{t.s2_age_default}</option>
                  {Array.from({ length: 90 }, (_, i) => i + 11).map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                  <option value="prefer">{t.pref_not_say}</option>
                </select>
              </div>

              {/* Education */}
              <div>
                <FieldLabel htmlFor="s2-edu">{t.s2_edu}</FieldLabel>
                <select id="s2-edu" value={edu} onChange={e => setEdu(e.target.value)} style={selectStyle}>
                  <option value="">{t.s2_edu_default}</option>
                  {t.edu.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              {/* Country — searchable */}
              <div ref={countryRef}>
                <FieldLabel htmlFor="s2-country">{t.s2_country}</FieldLabel>
                <div style={{ position: 'relative' }}>
                  <input
                    id="s2-country"
                    value={countrySearch}
                    placeholder={t.s2_country_ph}
                    autoComplete="off"
                    onChange={e => { setCountrySearch(e.target.value); setCountryVal(''); setCountryOpen(true); }}
                    onFocus={() => setCountryOpen(true)}
                    style={inputBase}
                  />
                  {countryOpen && countrySearch.length > 0 && filteredCountries.length > 0 && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 100,
                      background: 'white', border: `1.5px solid ${C.line}`, borderRadius: 12,
                      maxHeight: 200, overflowY: 'auto',
                      boxShadow: '0 8px 24px rgba(14,18,48,0.08)',
                    }}>
                      {filteredCountries.map(c => (
                        <button key={c}
                          onClick={() => { setCountryVal(c); setCountrySearch(c); setCountryOpen(false); }}
                          style={{
                            width: '100%', padding: '10px 14px', textAlign: isRtl ? 'right' : 'left',
                            fontSize: 14, color: C.ink, background: 'none', border: 'none',
                            cursor: 'pointer', fontFamily: 'inherit',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = C.bone)}
                          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                        >{c}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Occupation */}
              <div>
                <FieldLabel htmlFor="s2-occ">{t.s2_occ}</FieldLabel>
                <input id="s2-occ" value={occ} placeholder={t.s2_occ_ph} onChange={e => setOcc(e.target.value)} style={inputBase}/>
              </div>

              {/* Primary language */}
              <div>
                <FieldLabel htmlFor="s2-lang">{t.s2_lang}</FieldLabel>
                <input id="s2-lang" value={pLang} placeholder={t.s2_lang_ph} onChange={e => setPLang(e.target.value)} style={inputBase}/>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
              <PrimaryBtn onClick={() => goToStage('instructions')}>{t.s2_continue}</PrimaryBtn>
              <button
                onClick={() => goToStage('instructions')}
                style={{
                  width: '100%', padding: '13px 0', borderRadius: 14,
                  border: `1.5px solid ${C.line}`, fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'inherit',
                  background: 'transparent', color: C.inkSoft, transition: 'border-color .15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = C.ink)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = C.line)}
              >
                {t.s2_skip}
              </button>
            </div>
          </div>
        )}

        {/* ── STAGE 3: Instructions ── */}
        {stage === 'instructions' && (
          <div style={{ minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 8px' }}>
              <p style={{
                fontSize: 19, fontWeight: 600, color: C.ink, textAlign: 'center',
                lineHeight: 1.6, margin: 0, maxWidth: 340, letterSpacing: '-0.01em',
                opacity: instrVisible ? 1 : 0,
                transition: 'opacity 0.45s ease',
              }}>
                {T[lang].instructions[instrIdx]}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 7, paddingBottom: 4 }}>
              {T[lang].instructions.map((_, i) => (
                <span key={i} style={{
                  width: i === instrIdx ? 22 : 8, height: 8, borderRadius: 4,
                  background: i === instrIdx ? C.orangeHot : C.line,
                  transition: 'all 0.35s ease',
                  display: 'block',
                }}/>
              ))}
            </div>
          </div>
        )}

        {/* ── STAGE 4: Ready ── */}
        {stage === 'ready' && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', margin: '0 auto 24px',
              background: 'rgba(255,149,64,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M5 14L11 20L23 8" stroke={C.orangeHot} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <h1 style={{ fontSize: 26, fontWeight: 800, color: C.ink, letterSpacing: '-0.025em', margin: '0 0 12px' }}>
              {t.s4_heading}
            </h1>
            <p style={{ fontSize: 15, color: C.inkMute, margin: '0 0 36px', lineHeight: 1.6 }}>
              {t.s4_sub}
            </p>

            <button
              onClick={() => {
                const startTs = Date.now();
                sessionStorage.setItem('test_start_timestamp', String(startTs));
                sessionStorage.setItem('research_consent', String(researchChecked));
                // Store code so /test can bypass registration
                sessionStorage.setItem('access_code', code);
                // Generate anonymous session ID for this test run
                const anonId = 'anon_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now();
                sessionStorage.setItem('anon_session_id', anonId);
                // Mark code as used in admin localStorage (works when same browser)
                try {
                  const raw = localStorage.getItem('psyid_admin_codes');
                  if (raw) {
                    const allCodes = JSON.parse(raw) as { id: string; code: string; status: string; used_at: string | null }[];
                    const idx = allCodes.findIndex(c => c.code === code);
                    if (idx >= 0) {
                      allCodes[idx].status = 'USED';
                      allCodes[idx].used_at = new Date().toISOString();
                      localStorage.setItem('psyid_admin_codes', JSON.stringify(allCodes));
                    }
                  }
                } catch { /* ignore */ }
                window.location.href = '/test';
              }}
              style={{
                width: '100%', padding: '18px 0', borderRadius: 14, border: 'none',
                fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
                background: C.grad, color: 'white', letterSpacing: '-0.01em',
                boxShadow: '0 12px 32px -8px rgba(230,51,124,0.45)',
                transition: 'transform .15s, box-shadow .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 18px 40px -8px rgba(230,51,124,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 12px 32px -8px rgba(230,51,124,0.45)'; }}
            >
              {t.s4_start}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <p style={{ marginTop: 22, fontSize: 12, color: C.inkMute, textAlign: 'center' }}>
        {t.footer}
      </p>
    </div>
  );
}
