'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Logo } from '@/components/shared/Logo';
import questionsData from './data/questions.json';

/* ─── Questions ─── */
type QuestionType = 'yesno' | 'wordselect';
interface Question {
  id: string;
  axis: string;
  type: QuestionType;
  text: string;
  options?: string[];
}
const QUESTIONS = questionsData as Question[];
const TOTAL = QUESTIONS.length; // 94

/* ─── Lang ─── */
type Lang = 'en' | 'ru' | 'es' | 'fr' | 'ar';

const LANG_NAMES: Record<Lang, string> = {
  en: 'English', ru: 'Русский', es: 'Español', fr: 'Français', ar: 'العربية',
};

const T = {
  en: {
    eyebrow: 'ReNo Assessment',
    heading: 'Welcome',
    subtitle: 'Enter the access code you received to begin your child\'s psychological assessment.',
    code_label: 'Access Code',
    code_ph: '000000',
    btn_begin: 'Begin →',
    btn_loading: 'Checking…',
    err_not_found: 'Code not found. Please check your entry.',
    err_already_used: 'This code has already been used. Please contact your administrator.',
    err_expired: 'This code has expired.',
    err_network: 'Something went wrong. Please try again.',
    footer: 'Your answers are confidential and secure.',

    disclaimer_eyebrow: 'Step 1 of 3',
    disclaimer_heading: 'Before you begin',
    disclaimer_body: 'This assessment evaluates your child\'s psychological profile across several dimensions. It takes approximately 15–20 minutes. Please answer based on your observations of your child over the past 3–6 months.',
    btn_continue: 'Continue →',

    consent_eyebrow: 'Step 2 of 3',
    consent_heading: 'Data consent',
    consent_body: 'Your child\'s results will be shared only with the specialist who issued the access code. Anonymous, aggregated data may be used for research purposes.',
    consent_check: 'I consent to the processing of personal data.',
    consent_err: 'Please give your consent to continue.',

    intake_eyebrow: 'Step 3 of 3',
    intake_heading: 'A few details',
    intake_parent: 'Parent / guardian name',
    intake_child: 'Child\'s name',
    intake_age: 'Child\'s age',
    intake_age_ph: '6–16',
    intake_gender: 'Child\'s gender',
    intake_gender_m: 'Boy',
    intake_gender_f: 'Girl',
    intake_email: 'Your email',
    intake_email_ph: 'name@example.com',
    intake_err_required: 'This field is required.',
    intake_err_age: 'Age must be between 6 and 16.',
    intake_err_email: 'Please enter a valid email address.',
    intake_err_save: 'Could not save. Please try again.',

    test_question: 'Question {n} of 94',
    test_yes: 'Yes',
    test_no: 'No',
    test_saving_err: 'Could not save answer. Retrying…',
    test_offline: 'Please check your internet connection.',
    test_finish: 'Finish test',

    complete_heading: 'Thank you!',
    complete_body: 'You have completed the assessment. The results will be sent to your specialist.',
    complete_btn: 'Return',

    resume_note: 'Your previous session was found. Continuing from where you left off.',
  },
  ru: {
    eyebrow: 'Тестирование ReNo',
    heading: 'Добро пожаловать',
    subtitle: 'Введите код доступа, который вы получили, чтобы начать психологическое тестирование вашего ребёнка.',
    code_label: 'Код доступа',
    code_ph: '000000',
    btn_begin: 'Начать →',
    btn_loading: 'Проверяем…',
    err_not_found: 'Код не найден. Проверьте правильность ввода.',
    err_already_used: 'Этот код уже был использован. Свяжитесь с администратором.',
    err_expired: 'Срок действия кода истёк.',
    err_network: 'Что-то пошло не так. Попробуйте ещё раз.',
    footer: 'Ваши ответы конфиденциальны и защищены.',

    disclaimer_eyebrow: 'Шаг 1 из 3',
    disclaimer_heading: 'Перед началом',
    disclaimer_body: 'Этот тест оценивает психологический профиль вашего ребёнка по нескольким параметрам. Он занимает около 15–20 минут. Отвечайте, исходя из наблюдений за ребёнком за последние 3–6 месяцев.',
    btn_continue: 'Продолжить →',

    consent_eyebrow: 'Шаг 2 из 3',
    consent_heading: 'Согласие на обработку данных',
    consent_body: 'Результаты тестирования будут переданы только специалисту, выдавшему код доступа. Обезличенные данные могут использоваться в исследовательских целях.',
    consent_check: 'Я согласен(на) с обработкой персональных данных.',
    consent_err: 'Необходимо согласие для продолжения.',

    intake_eyebrow: 'Шаг 3 из 3',
    intake_heading: 'Несколько деталей',
    intake_parent: 'Имя родителя / опекуна',
    intake_child: 'Имя ребёнка',
    intake_age: 'Возраст ребёнка',
    intake_age_ph: '6–16',
    intake_gender: 'Пол ребёнка',
    intake_gender_m: 'Мальчик',
    intake_gender_f: 'Девочка',
    intake_email: 'Ваш email',
    intake_email_ph: 'name@example.com',
    intake_err_required: 'Это поле обязательно.',
    intake_err_age: 'Возраст должен быть от 6 до 16 лет.',
    intake_err_email: 'Введите корректный email.',
    intake_err_save: 'Не удалось сохранить данные. Попробуйте ещё раз.',

    test_question: 'Вопрос {n} из 94',
    test_yes: 'Да',
    test_no: 'Нет',
    test_saving_err: 'Не удалось сохранить ответ. Повторяем…',
    test_offline: 'Проверьте интернет-соединение.',
    test_finish: 'Завершить тест',

    complete_heading: 'Спасибо!',
    complete_body: 'Вы завершили тест. Результаты будут отправлены вашему специалисту.',
    complete_btn: 'Вернуться',

    resume_note: 'Найдена предыдущая сессия. Продолжаем с того места, где вы остановились.',
  },
  es: {
    eyebrow: 'Evaluación ReNo',
    heading: 'Bienvenido',
    subtitle: 'Ingrese el código de acceso que recibió para comenzar la evaluación psicológica de su hijo.',
    code_label: 'Código de acceso',
    code_ph: '000000',
    btn_begin: 'Comenzar →',
    btn_loading: 'Verificando…',
    err_not_found: 'Código no encontrado. Por favor, verifique su ingreso.',
    err_already_used: 'Este código ya fue utilizado. Contacte a su administrador.',
    err_expired: 'Este código ha expirado.',
    err_network: 'Algo salió mal. Por favor, inténtelo de nuevo.',
    footer: 'Sus respuestas son confidenciales y seguras.',

    disclaimer_eyebrow: 'Paso 1 de 3',
    disclaimer_heading: 'Antes de comenzar',
    disclaimer_body: 'Esta evaluación valora el perfil psicológico de su hijo en varias dimensiones. Toma aproximadamente 15–20 minutos. Responda basándose en sus observaciones de los últimos 3–6 meses.',
    btn_continue: 'Continuar →',

    consent_eyebrow: 'Paso 2 de 3',
    consent_heading: 'Consentimiento de datos',
    consent_body: 'Los resultados de su hijo solo se compartirán con el especialista que emitió el código de acceso. Los datos anónimos pueden utilizarse con fines de investigación.',
    consent_check: 'Doy mi consentimiento para el procesamiento de datos personales.',
    consent_err: 'Es necesario su consentimiento para continuar.',

    intake_eyebrow: 'Paso 3 de 3',
    intake_heading: 'Algunos detalles',
    intake_parent: 'Nombre del padre / tutor',
    intake_child: 'Nombre del niño',
    intake_age: 'Edad del niño',
    intake_age_ph: '6–16',
    intake_gender: 'Género del niño',
    intake_gender_m: 'Niño',
    intake_gender_f: 'Niña',
    intake_email: 'Su correo electrónico',
    intake_email_ph: 'nombre@ejemplo.com',
    intake_err_required: 'Este campo es obligatorio.',
    intake_err_age: 'La edad debe estar entre 6 y 16 años.',
    intake_err_email: 'Ingrese un correo electrónico válido.',
    intake_err_save: 'No se pudieron guardar los datos. Inténtelo de nuevo.',

    test_question: 'Pregunta {n} de 94',
    test_yes: 'Sí',
    test_no: 'No',
    test_saving_err: 'No se pudo guardar la respuesta. Reintentando…',
    test_offline: 'Por favor, verifique su conexión a internet.',
    test_finish: 'Finalizar prueba',

    complete_heading: '¡Gracias!',
    complete_body: 'Ha completado la evaluación. Los resultados serán enviados a su especialista.',
    complete_btn: 'Volver',

    resume_note: 'Se encontró su sesión anterior. Continuando desde donde lo dejó.',
  },
  fr: {
    eyebrow: 'Évaluation ReNo',
    heading: 'Bienvenue',
    subtitle: 'Entrez le code d\'accès que vous avez reçu pour commencer l\'évaluation psychologique de votre enfant.',
    code_label: 'Code d\'accès',
    code_ph: '000000',
    btn_begin: 'Commencer →',
    btn_loading: 'Vérification…',
    err_not_found: 'Code introuvable. Veuillez vérifier votre saisie.',
    err_already_used: 'Ce code a déjà été utilisé. Veuillez contacter votre administrateur.',
    err_expired: 'Ce code a expiré.',
    err_network: 'Quelque chose s\'est mal passé. Veuillez réessayer.',
    footer: 'Vos réponses sont confidentielles et sécurisées.',

    disclaimer_eyebrow: 'Étape 1 sur 3',
    disclaimer_heading: 'Avant de commencer',
    disclaimer_body: 'Cette évaluation mesure le profil psychologique de votre enfant selon plusieurs dimensions. Elle prend environ 15 à 20 minutes. Répondez en vous basant sur vos observations des 3 à 6 derniers mois.',
    btn_continue: 'Continuer →',

    consent_eyebrow: 'Étape 2 sur 3',
    consent_heading: 'Consentement aux données',
    consent_body: 'Les résultats de votre enfant seront partagés uniquement avec le spécialiste qui a émis le code d\'accès. Des données anonymisées peuvent être utilisées à des fins de recherche.',
    consent_check: 'Je consens au traitement des données personnelles.',
    consent_err: 'Votre consentement est requis pour continuer.',

    intake_eyebrow: 'Étape 3 sur 3',
    intake_heading: 'Quelques détails',
    intake_parent: 'Nom du parent / tuteur',
    intake_child: 'Prénom de l\'enfant',
    intake_age: 'Âge de l\'enfant',
    intake_age_ph: '6–16',
    intake_gender: 'Sexe de l\'enfant',
    intake_gender_m: 'Garçon',
    intake_gender_f: 'Fille',
    intake_email: 'Votre e-mail',
    intake_email_ph: 'nom@exemple.com',
    intake_err_required: 'Ce champ est obligatoire.',
    intake_err_age: 'L\'âge doit être compris entre 6 et 16 ans.',
    intake_err_email: 'Veuillez entrer une adresse e-mail valide.',
    intake_err_save: 'Impossible de sauvegarder. Veuillez réessayer.',

    test_question: 'Question {n} sur 94',
    test_yes: 'Oui',
    test_no: 'Non',
    test_saving_err: 'Impossible de sauvegarder la réponse. Nouvelle tentative…',
    test_offline: 'Veuillez vérifier votre connexion internet.',
    test_finish: 'Terminer le test',

    complete_heading: 'Merci !',
    complete_body: 'Vous avez terminé l\'évaluation. Les résultats seront envoyés à votre spécialiste.',
    complete_btn: 'Retour',

    resume_note: 'Votre session précédente a été trouvée. Reprise en cours.',
  },
  ar: {
    eyebrow: 'تقييم ReNo',
    heading: 'مرحباً بك',
    subtitle: 'أدخل رمز الوصول الذي تلقيته لبدء التقييم النفسي لطفلك.',
    code_label: 'رمز الوصول',
    code_ph: '000000',
    btn_begin: '← ابدأ',
    btn_loading: 'جارٍ التحقق…',
    err_not_found: 'الرمز غير موجود. يرجى التحقق من المدخلات.',
    err_already_used: 'هذا الرمز مستخدم بالفعل. يرجى التواصل مع المسؤول.',
    err_expired: 'انتهت صلاحية هذا الرمز.',
    err_network: 'حدث خطأ ما. يرجى المحاولة مجدداً.',
    footer: 'إجاباتك سرية ومحمية.',

    disclaimer_eyebrow: 'الخطوة 1 من 3',
    disclaimer_heading: 'قبل البدء',
    disclaimer_body: 'يقيّم هذا الاختبار الملف النفسي لطفلك عبر عدة أبعاد. يستغرق نحو 15–20 دقيقة. أجب بناءً على ملاحظاتك لطفلك خلال الأشهر الثلاثة إلى الستة الماضية.',
    btn_continue: '← متابعة',

    consent_eyebrow: 'الخطوة 2 من 3',
    consent_heading: 'الموافقة على البيانات',
    consent_body: 'لن تُشارَك نتائج طفلك إلا مع المتخصص الذي أصدر رمز الوصول. قد تُستخدم البيانات المجهولة لأغراض بحثية.',
    consent_check: 'أوافق على معالجة البيانات الشخصية.',
    consent_err: 'موافقتك مطلوبة للمتابعة.',

    intake_eyebrow: 'الخطوة 3 من 3',
    intake_heading: 'بعض التفاصيل',
    intake_parent: 'اسم الوالد / الوصي',
    intake_child: 'اسم الطفل',
    intake_age: 'عمر الطفل',
    intake_age_ph: '٦–١٦',
    intake_gender: 'جنس الطفل',
    intake_gender_m: 'ولد',
    intake_gender_f: 'بنت',
    intake_email: 'بريدك الإلكتروني',
    intake_email_ph: 'الاسم@مثال.com',
    intake_err_required: 'هذا الحقل مطلوب.',
    intake_err_age: 'يجب أن يكون العمر بين 6 و16 سنة.',
    intake_err_email: 'يرجى إدخال بريد إلكتروني صحيح.',
    intake_err_save: 'تعذّر حفظ البيانات. يرجى المحاولة مجدداً.',

    test_question: 'سؤال {n} من 94',
    test_yes: 'نعم',
    test_no: 'لا',
    test_saving_err: 'تعذّر حفظ الإجابة. إعادة المحاولة…',
    test_offline: 'يرجى التحقق من اتصالك بالإنترنت.',
    test_finish: 'إنهاء الاختبار',

    complete_heading: 'شكراً لك!',
    complete_body: 'لقد أكملت الاختبار. ستُرسَل النتائج إلى متخصصك.',
    complete_btn: 'العودة',

    resume_note: 'تم العثور على جلستك السابقة. نستأنف من حيث توقفت.',
  },
} as const;

type TKeys = keyof typeof T.en;

/* ─── Stage type ─── */
type Stage = 'code' | 'disclaimer' | 'consent' | 'intake' | 'test' | 'complete';

/* ─── Shared helpers ─── */
function PrimaryBtn({
  onClick, disabled, loading, children, fullWidth,
}: {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="btn-primary"
      style={{
        width: fullWidth ? '100%' : undefined,
        padding: '14px 28px',
        justifyContent: fullWidth ? 'center' : undefined,
      }}
    >
      {children}
    </button>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{ display: 'block', fontWeight: 600, fontSize: 13, color: 'var(--ink-2)', marginBottom: 7 }}
    >
      {children}
    </label>
  );
}

function InlineError({ message, id }: { message: string; id?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" style={{ color: 'var(--magenta)', fontSize: 13, marginTop: 7, lineHeight: 1.5 }}>
      {message}
    </p>
  );
}

const inputStyle = (hasError: boolean, highlight?: boolean): React.CSSProperties => ({
  display: 'block',
  width: '100%',
  padding: '13px 16px',
  fontSize: 15,
  border: `2px solid ${hasError ? 'var(--magenta)' : highlight ? 'var(--violet)' : 'var(--line)'}`,
  borderRadius: 12,
  outline: 'none',
  background: 'white',
  color: 'var(--ink)',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
  fontFamily: 'inherit',
});

/* ─── Language picker ─── */
function LangPicker({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 12px', borderRadius: 10,
          border: '1.5px solid var(--line)', background: 'white',
          fontSize: 13, fontWeight: 600, color: 'var(--ink-2)',
          cursor: 'pointer',
        }}
      >
        {LANG_NAMES[lang]}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute', top: '110%', right: 0,
            background: 'white', border: '1.5px solid var(--line)',
            borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            zIndex: 99, minWidth: 130,
          }}
        >
          {(Object.keys(LANG_NAMES) as Lang[]).map(l => (
            <button
              key={l}
              role="option"
              aria-selected={lang === l}
              onClick={() => { onChange(l); setOpen(false); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '10px 16px', fontSize: 13, fontWeight: lang === l ? 700 : 500,
                color: lang === l ? 'var(--violet)' : 'var(--ink-2)',
                background: lang === l ? 'var(--bg-2)' : 'white',
                border: 'none', cursor: 'pointer',
              }}
            >
              {LANG_NAMES[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Stage 1: Code Entry ─── */
function CodeStage({
  t,
  onSuccess,
}: {
  t: (typeof T)[Lang];
  onSuccess: (sessionId: string, resumable: boolean) => void;
}) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = useCallback(async () => {
    if (code.length !== 6 || loading) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/reno/sessions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) throw new Error('network');
      const data = (await res.json()) as {
        valid: boolean;
        reason?: 'not_found' | 'already_used' | 'expired' | 'server_error';
        sessionId?: string;
        resumable?: boolean;
      };

      if (data.valid && data.sessionId) {
        sessionStorage.setItem('reno_session_id', data.sessionId);
        onSuccess(data.sessionId, !!data.resumable);
      } else {
        const msgs: Partial<Record<string, string>> = {
          not_found:    t.err_not_found,
          already_used: t.err_already_used,
          expired:      t.err_expired,
        };
        setError(msgs[data.reason ?? ''] ?? t.err_network);
      }
    } catch {
      setError(t.err_network);
    } finally {
      setLoading(false);
    }
  }, [code, loading, onSuccess, t]);

  const isReady = code.length === 6;

  return (
    <div>
      <div className="card" style={{ padding: '40px 40px 36px' }}>
        <p className="eyebrow" style={{ marginBottom: 12 }}>{t.eyebrow}</p>
        <h1 className="serif" style={{ fontSize: 30, letterSpacing: '-0.02em', marginBottom: 12, lineHeight: 1.2 }}>
          {t.heading}
        </h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 15, lineHeight: 1.65, marginBottom: 32 }}>
          {t.subtitle}
        </p>

        <FieldLabel htmlFor="reno-code">{t.code_label}</FieldLabel>
        <input
          ref={inputRef}
          id="reno-code"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          value={code}
          placeholder={t.code_ph}
          aria-label={t.code_label}
          aria-describedby={error ? 'code-error' : undefined}
          onChange={e => {
            setCode(e.target.value.replace(/\D/g, ''));
            setError('');
          }}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
          style={{
            ...inputStyle(!!error, isReady),
            fontSize: 28,
            fontFamily: '"JetBrains Mono", monospace',
            letterSpacing: '0.25em',
            padding: '14px 18px',
          }}
        />
        <InlineError message={error} id="code-error" />

        <div style={{ marginTop: 28 }}>
          <PrimaryBtn onClick={handleSubmit} disabled={!isReady} loading={loading} fullWidth>
            {loading ? t.btn_loading : t.btn_begin}
          </PrimaryBtn>
        </div>
      </div>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6 }}>
        {t.footer}
      </p>
    </div>
  );
}

/* ─── Stage 2: Disclaimer (stub — built in step c) ─── */
function DisclaimerStage({ t, onContinue }: { t: (typeof T)[Lang]; onContinue: () => void }) {
  return (
    <div className="card" style={{ padding: 40 }}>
      <p className="eyebrow" style={{ marginBottom: 12 }}>{t.disclaimer_eyebrow}</p>
      <h2 className="serif" style={{ fontSize: 26, letterSpacing: '-0.02em', marginBottom: 20 }}>{t.disclaimer_heading}</h2>
      <p style={{ color: 'var(--ink-2)', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>{t.disclaimer_body}</p>
      <PrimaryBtn onClick={onContinue} fullWidth>{t.btn_continue}</PrimaryBtn>
    </div>
  );
}

/* ─── Stage 3: Consent (stub — built in step c) ─── */
function ConsentStage({ t, onContinue }: { t: (typeof T)[Lang]; onContinue: () => void }) {
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');

  function handleContinue() {
    if (!checked) { setError(t.consent_err); return; }
    onContinue();
  }

  return (
    <div className="card" style={{ padding: 40 }}>
      <p className="eyebrow" style={{ marginBottom: 12 }}>{t.consent_eyebrow}</p>
      <h2 className="serif" style={{ fontSize: 26, letterSpacing: '-0.02em', marginBottom: 20 }}>{t.consent_heading}</h2>
      <p style={{ color: 'var(--ink-2)', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>{t.consent_body}</p>

      <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', marginBottom: 8 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={e => { setChecked(e.target.checked); setError(''); }}
          aria-describedby={error ? 'consent-error' : undefined}
          style={{ marginTop: 3, width: 18, height: 18, accentColor: 'var(--violet)', flexShrink: 0, cursor: 'pointer' }}
        />
        <span style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>{t.consent_check}</span>
      </label>
      <InlineError message={error} id="consent-error" />

      <div style={{ marginTop: 28 }}>
        <PrimaryBtn onClick={handleContinue} fullWidth>{t.btn_continue}</PrimaryBtn>
      </div>
    </div>
  );
}

/* ─── Stage 4: Intake form ─── */
function IntakeStage({
  t, sessionId, onContinue,
}: {
  t: (typeof T)[Lang];
  sessionId: string;
  onContinue: () => void;
}) {
  const [parentName, setParentName] = useState('');
  const [childName, setChildName]   = useState('');
  const [childAge, setChildAge]     = useState('');
  const [childGender, setChildGender] = useState('');
  const [email, setEmail]           = useState('');
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [apiError, setApiError]     = useState('');
  const [loading, setLoading]       = useState(false);

  function clearErr(field: string) {
    setErrors(e => { const n = { ...e }; delete n[field]; return n; });
  }

  async function handleSubmit() {
    const errs: Record<string, string> = {};
    if (!parentName.trim())  errs.parentName  = t.intake_err_required;
    if (!childName.trim())   errs.childName   = t.intake_err_required;
    if (!childAge) {
      errs.childAge = t.intake_err_required;
    } else {
      const age = parseInt(childAge, 10);
      if (isNaN(age) || age < 6 || age > 16) errs.childAge = t.intake_err_age;
    }
    if (!childGender) errs.childGender = t.intake_err_required;
    if (!email.trim()) {
      errs.email = t.intake_err_required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = t.intake_err_email;
    }

    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    try {
      const res = await fetch(`/api/reno/sessions/${sessionId}/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent: true,
          parentName: parentName.trim(),
          childName: childName.trim(),
          childAge: parseInt(childAge, 10),
          childGender,
          email: email.trim(),
        }),
      });
      if (!res.ok) throw new Error('api');
      onContinue();
    } catch {
      setApiError(t.intake_err_save);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ padding: 40 }}>
      <p className="eyebrow" style={{ marginBottom: 12 }}>{t.intake_eyebrow}</p>
      <h2 className="serif" style={{ fontSize: 26, letterSpacing: '-0.02em', marginBottom: 28 }}>
        {t.intake_heading}
      </h2>

      {/* API error banner */}
      {apiError && (
        <div style={{
          background: '#FFF0F3', border: '1px solid var(--magenta)',
          borderRadius: 10, padding: '11px 16px', marginBottom: 22,
        }}>
          <p style={{ color: 'var(--magenta)', fontSize: 14, margin: 0 }}>{apiError}</p>
        </div>
      )}

      {/* Parent name */}
      <div style={{ marginBottom: 20 }}>
        <FieldLabel htmlFor="intake-parent">{t.intake_parent}</FieldLabel>
        <input
          id="intake-parent"
          type="text"
          autoComplete="name"
          value={parentName}
          onChange={e => { setParentName(e.target.value); clearErr('parentName'); }}
          aria-describedby={errors.parentName ? 'err-parent' : undefined}
          style={inputStyle(!!errors.parentName)}
        />
        <InlineError message={errors.parentName ?? ''} id="err-parent" />
      </div>

      {/* Child name */}
      <div style={{ marginBottom: 20 }}>
        <FieldLabel htmlFor="intake-child">{t.intake_child}</FieldLabel>
        <input
          id="intake-child"
          type="text"
          value={childName}
          onChange={e => { setChildName(e.target.value); clearErr('childName'); }}
          aria-describedby={errors.childName ? 'err-child' : undefined}
          style={inputStyle(!!errors.childName)}
        />
        <InlineError message={errors.childName ?? ''} id="err-child" />
      </div>

      {/* Child age */}
      <div style={{ marginBottom: 20 }}>
        <FieldLabel htmlFor="intake-age">{t.intake_age}</FieldLabel>
        <input
          id="intake-age"
          type="number"
          inputMode="numeric"
          min={6}
          max={16}
          placeholder={t.intake_age_ph}
          value={childAge}
          onChange={e => { setChildAge(e.target.value); clearErr('childAge'); }}
          aria-describedby={errors.childAge ? 'err-age' : undefined}
          style={{ ...inputStyle(!!errors.childAge), maxWidth: 140 }}
        />
        <InlineError message={errors.childAge ?? ''} id="err-age" />
      </div>

      {/* Child gender */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink-2)', marginBottom: 10 }}>
          {t.intake_gender}
        </p>
        <div style={{ display: 'flex', gap: 12 }} role="radiogroup" aria-label={t.intake_gender}>
          {([
            { value: 'male',   label: t.intake_gender_m },
            { value: 'female', label: t.intake_gender_f },
          ] as const).map(opt => (
            <label
              key={opt.value}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '12px 20px', borderRadius: 12, cursor: 'pointer',
                border: `2px solid ${
                  childGender === opt.value ? 'var(--violet)'
                  : errors.childGender ? 'var(--magenta)'
                  : 'var(--line)'
                }`,
                background: childGender === opt.value ? 'var(--bg-2)' : 'white',
                flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--ink)',
                transition: 'all 0.2s',
              }}
            >
              <input
                type="radio"
                name="child-gender"
                value={opt.value}
                checked={childGender === opt.value}
                onChange={() => { setChildGender(opt.value); clearErr('childGender'); }}
                style={{ accentColor: 'var(--violet)', cursor: 'pointer', width: 16, height: 16 }}
              />
              {opt.label}
            </label>
          ))}
        </div>
        <InlineError message={errors.childGender ?? ''} id="err-gender" />
      </div>

      {/* Email */}
      <div style={{ marginBottom: 32 }}>
        <FieldLabel htmlFor="intake-email">{t.intake_email}</FieldLabel>
        <input
          id="intake-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={t.intake_email_ph}
          value={email}
          onChange={e => { setEmail(e.target.value); clearErr('email'); }}
          aria-describedby={errors.email ? 'err-email' : undefined}
          style={inputStyle(!!errors.email)}
        />
        <InlineError message={errors.email ?? ''} id="err-email" />
      </div>

      <PrimaryBtn onClick={handleSubmit} loading={loading} fullWidth>
        {loading ? '…' : t.btn_continue}
      </PrimaryBtn>
    </div>
  );
}

/* ─── Answer components ─── */
function YesNoAnswer({
  t, selected, locked, onSelect,
}: {
  t: (typeof T)[Lang];
  selected: string | null;
  locked: boolean;
  onSelect: (v: string) => void;
}) {
  const [hovered, setHovered] = useState<'yes' | 'no' | null>(null);

  return (
    <div style={{ display: 'flex', gap: 14 }}>
      {(['yes', 'no'] as const).map(v => {
        const active = selected === v;
        const isHov = hovered === v && !locked;
        return (
          <button
            key={v}
            onClick={() => !locked && onSelect(v)}
            onMouseEnter={() => !locked && setHovered(v)}
            onMouseLeave={() => setHovered(null)}
            aria-pressed={active}
            style={{
              flex: 1,
              padding: '26px 16px',
              borderRadius: 18,
              border: `2px solid ${active ? 'var(--violet)' : isHov ? 'var(--violet)' : 'var(--line)'}`,
              background: active ? 'var(--violet)' : isHov ? 'var(--bg-2)' : 'white',
              color: active ? 'white' : 'var(--ink)',
              fontSize: 18,
              fontWeight: 700,
              cursor: locked ? 'default' : 'pointer',
              transition: 'all 0.18s',
              transform: active ? 'translateY(-3px)' : isHov ? 'translateY(-1px)' : 'none',
              boxShadow: active
                ? '0 8px 20px rgba(75,30,142,0.28)'
                : isHov ? '0 4px 12px rgba(75,30,142,0.10)' : 'none',
            }}
          >
            {v === 'yes' ? t.test_yes : t.test_no}
          </button>
        );
      })}
    </div>
  );
}

function WordSelectAnswer({
  options, selected, locked, onSelect,
}: {
  options: string[];
  selected: string | null;
  locked: boolean;
  onSelect: (v: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
      {options.map(opt => {
        const active = selected === opt;
        const isHov = hovered === opt && !locked;
        return (
          <button
            key={opt}
            onClick={() => !locked && onSelect(opt)}
            onMouseEnter={() => !locked && setHovered(opt)}
            onMouseLeave={() => setHovered(null)}
            aria-pressed={active}
            style={{
              padding: '12px 24px',
              borderRadius: 100,
              border: `2px solid ${active ? 'var(--violet)' : isHov ? 'var(--violet)' : 'var(--line)'}`,
              background: active ? 'var(--violet)' : isHov ? 'var(--bg-2)' : 'white',
              color: active ? 'white' : 'var(--ink)',
              fontSize: 15,
              fontWeight: 600,
              cursor: locked ? 'default' : 'pointer',
              transition: 'all 0.18s',
              transform: active ? 'translateY(-2px)' : isHov ? 'translateY(-1px)' : 'none',
              boxShadow: active
                ? '0 6px 14px rgba(75,30,142,0.22)'
                : isHov ? '0 3px 8px rgba(75,30,142,0.08)' : 'none',
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Stage 5: Test engine ─── */
function TestStage({
  t, sessionId, onComplete,
}: {
  t: (typeof T)[Lang];
  sessionId: string;
  onComplete: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer]   = useState<string | null>(null);
  const [locked, setLocked]                   = useState(false);
  const [questionFading, setQuestionFading]   = useState(false);
  const [offline, setOffline]                 = useState(false);

  // Load progress on mount → resume from last saved index
  useEffect(() => {
    fetch(`/api/reno/sessions/${sessionId}/progress`)
      .then(r => r.json())
      .then((data: { answers?: { questionId: string; answerId: string }[] }) => {
        const answered = data.answers?.length ?? 0;
        setCurrentIndex(Math.min(answered, TOTAL - 1));
      })
      .catch(() => setCurrentIndex(0));
  }, [sessionId]);

  async function saveAnswer(questionId: string, answerId: string, index: number): Promise<boolean> {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(`/api/reno/sessions/${sessionId}/answers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId,
            answerId,
            answeredAt: new Date().toISOString(),
            questionIndex: index,
          }),
        });
        if (res.ok) return true;
      } catch { /* retry */ }
      if (attempt < 2) await new Promise(r => setTimeout(r, 600 * (attempt + 1)));
    }
    return false;
  }

  async function handleAnswer(answerId: string) {
    if (locked || currentIndex === null) return;
    const question = QUESTIONS[currentIndex];

    setSelectedAnswer(answerId);
    setLocked(true);
    setOffline(false);

    const saved = await saveAnswer(question.id, answerId, currentIndex);
    if (!saved) {
      // All 3 retries failed — show error, let user try again
      setOffline(true);
      setSelectedAnswer(null);
      setLocked(false);
      return;
    }

    // 380ms confirmation flash, then advance or complete
    await new Promise(r => setTimeout(r, 380));

    if (currentIndex >= TOTAL - 1) {
      onComplete();
    } else {
      setQuestionFading(true);
      await new Promise(r => setTimeout(r, 250));
      setCurrentIndex(i => (i ?? 0) + 1);
      setSelectedAnswer(null);
      setLocked(false);
      setQuestionFading(false);
    }
  }

  if (currentIndex === null) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>…</p>
      </div>
    );
  }

  const question = QUESTIONS[currentIndex];
  const progress  = (currentIndex / TOTAL) * 100;
  const label     = t.test_question.replace('{n}', String(currentIndex + 1));

  return (
    <div style={{ width: '100%' }}>
      {/* Progress bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginBottom: 8, fontSize: 13, color: 'var(--ink-3)',
        }}>
          <span className="mono">{label}</span>
          <span className="mono">{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 5, background: 'var(--bg-3)', borderRadius: 100, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'var(--grad)',
            transition: 'width 0.5s cubic-bezier(0.22,1,0.36,1)',
            borderRadius: 100,
          }} />
        </div>
      </div>

      {/* Offline / retry error */}
      {offline && (
        <div style={{
          background: '#FFF0F3', border: '1px solid var(--magenta)',
          borderRadius: 10, padding: '10px 16px', marginBottom: 14,
        }}>
          <p style={{ color: 'var(--magenta)', fontSize: 13, margin: 0 }}>{t.test_offline}</p>
        </div>
      )}

      {/* Question card with slide-fade transition */}
      <div style={{
        opacity: questionFading ? 0 : 1,
        transform: questionFading ? 'translateX(20px)' : 'translateX(0)',
        transition: 'opacity 250ms ease, transform 250ms ease',
      }}>
        <div className="card" style={{ padding: '40px 36px 44px' }}>
          <p style={{
            fontSize: 18, lineHeight: 1.7, fontWeight: 500,
            color: 'var(--ink)', marginBottom: 36,
            fontFamily: 'Onest, sans-serif',
          }}>
            {question.text}
          </p>

          {question.type === 'yesno' ? (
            <YesNoAnswer
              t={t}
              selected={selectedAnswer}
              locked={locked}
              onSelect={handleAnswer}
            />
          ) : (
            <WordSelectAnswer
              options={question.options ?? []}
              selected={selectedAnswer}
              locked={locked}
              onSelect={handleAnswer}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Stage 6: Complete ─── */
function CompleteStage({ t, sessionId }: { t: (typeof T)[Lang]; sessionId: string | null }) {
  const [redirectUrl, setRedirectUrl] = useState('https://psyid.com');
  const [apiErr, setApiErr]           = useState(false);
  const [retrying, setRetrying]       = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    callComplete();

    async function callComplete() {
      try {
        const res = await fetch(`/api/reno/sessions/${sessionId}/complete`, { method: 'POST' });
        if (res.ok) {
          const data = (await res.json()) as { redirectUrl?: string };
          if (data.redirectUrl) setRedirectUrl(data.redirectUrl);
        } else {
          setApiErr(true);
        }
      } catch {
        setApiErr(true);
      }
    }
  }, [sessionId]);

  async function handleRetry() {
    setRetrying(true);
    setApiErr(false);
    try {
      const res = await fetch(`/api/reno/sessions/${sessionId}/complete`, { method: 'POST' });
      if (res.ok) {
        const data = (await res.json()) as { redirectUrl?: string };
        if (data.redirectUrl) setRedirectUrl(data.redirectUrl);
      } else {
        setApiErr(true);
      }
    } catch {
      setApiErr(true);
    } finally {
      setRetrying(false);
    }
  }

  // Clear stage from sessionStorage so a revisit starts fresh
  useEffect(() => {
    sessionStorage.removeItem('reno_stage');
    sessionStorage.removeItem('reno_session_id');
  }, []);

  return (
    <div className="card" style={{ padding: '48px 40px', textAlign: 'center' }}>
      {/* Check icon */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'var(--grad)',
        boxShadow: '0 12px 28px rgba(75,30,142,0.30)',
        margin: '0 auto 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <path d="M7 15l6 6 10-12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h2 className="serif" style={{ fontSize: 28, letterSpacing: '-0.02em', marginBottom: 14 }}>
        {t.complete_heading}
      </h2>
      <p style={{ color: 'var(--ink-3)', fontSize: 15, lineHeight: 1.7, marginBottom: 32, maxWidth: 360, margin: '0 auto 32px' }}>
        {t.complete_body}
      </p>

      {apiErr && (
        <div style={{ marginBottom: 20 }}>
          <PrimaryBtn onClick={handleRetry} loading={retrying}>
            {t.complete_btn}
          </PrimaryBtn>
        </div>
      )}

      {!apiErr && (
        <a
          href={redirectUrl}
          className="btn-primary"
          style={{ padding: '14px 32px', fontSize: 15, display: 'inline-block', textDecoration: 'none' }}
        >
          {t.complete_btn}
        </a>
      )}
    </div>
  );
}

/* ═══ Main Page ═══ */
export default function RenoPage() {
  const [lang, setLang] = useState<Lang>('en');
  const [stage, setStage] = useState<Stage>('code');
  const [fading, setFading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [resumeNote, setResumeNote] = useState('');

  const t = T[lang];
  const isRtl = lang === 'ar';

  // Restore in-progress session from sessionStorage (same-tab navigation)
  useEffect(() => {
    const sid = sessionStorage.getItem('reno_session_id');
    const savedStage = sessionStorage.getItem('reno_stage') as Stage | null;
    if (sid && savedStage && savedStage !== 'code') {
      setSessionId(sid);
      setStage(savedStage);
    }
  }, []);

  // Persist stage so same-tab refreshes don't reset to code entry
  useEffect(() => {
    if (stage !== 'code') sessionStorage.setItem('reno_stage', stage);
  }, [stage]);

  function goToStage(next: Stage) {
    setFading(true);
    setTimeout(() => {
      setStage(next);
      setFading(false);
    }, 250);
  }

  function handleCodeSuccess(sid: string, resumable: boolean) {
    setSessionId(sid);
    if (resumable) {
      setResumeNote(t.resume_note);
      goToStage('test');
    } else {
      goToStage('disclaimer');
    }
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: 'var(--bg-2)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{
        padding: '16px 28px',
        background: 'rgba(255,255,255,0.90)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <Logo />
        <LangPicker lang={lang} onChange={setLang} />
      </div>

      {/* Resume banner */}
      {resumeNote && (
        <div style={{
          background: 'var(--violet)', color: 'white',
          padding: '10px 28px', fontSize: 13, fontWeight: 500,
          textAlign: 'center',
        }}>
          {resumeNote}
        </div>
      )}

      {/* Centered content with fade transition */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: stage === 'test' ? 560 : 480,
          opacity: fading ? 0 : 1,
          transform: fading ? 'translateY(10px)' : 'translateY(0)',
          transition: 'opacity 250ms ease, transform 250ms ease, max-width 300ms ease',
        }}>
          {stage === 'code'       && <CodeStage t={t} onSuccess={handleCodeSuccess} />}
          {stage === 'disclaimer' && <DisclaimerStage t={t} onContinue={() => goToStage('consent')} />}
          {stage === 'consent'    && <ConsentStage t={t} onContinue={() => goToStage('intake')} />}
          {stage === 'intake'     && <IntakeStage t={t} sessionId={sessionId!} onContinue={() => goToStage('test')} />}
          {stage === 'test'       && <TestStage t={t} sessionId={sessionId!} onComplete={() => goToStage('complete')} />}
          {stage === 'complete'   && <CompleteStage t={t} sessionId={sessionId} />}
        </div>
      </div>
    </div>
  );
}
