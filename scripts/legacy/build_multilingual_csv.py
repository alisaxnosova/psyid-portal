"""
Builds a multilingual CSV of ReNo/TestPersonal questions.
Translations (RU → EN, ES, FR, AR) are done by Claude inline.
"""

import csv
import json
import urllib.request

API_URL = "http://159.194.222.35:3010/api/methodologies/testpersonal"
OUTPUT  = "/Users/alisanosova/Desktop/reno_questions_multilingual.csv"

# ── All translations (Russian → EN / ES / FR / AR) ────────────────────────

T = {
    # ── Question texts ──────────────────────────────────────────────────────
    "Обычно Вы:": {
        "en": "You are usually:",
        "es": "Normalmente usted es:",
        "fr": "Habituellement, vous êtes :",
        "ar": "عادةً أنت:",
    },
    "Если бы Вы были преподавателем, какой курс Вы бы предпочли:": {
        "en": "If you were a teacher, which course would you prefer:",
        "es": "Si fuera profesor, ¿qué tipo de curso preferiría:",
        "fr": "Si vous étiez enseignant, quel type de cours préféreriez-vous :",
        "ar": "لو كنت معلماً، أي نوع من الدورات تفضل:",
    },
    "Вы чаще позволяете:": {
        "en": "You more often let:",
        "es": "Con más frecuencia usted permite que:",
        "fr": "Le plus souvent, vous laissez :",
        "ar": "في أغلب الأحيان تسمح لـ:",
    },
    "Когда Вы отправляетесь куда-то на весь день, Вы:": {
        "en": "When you go somewhere for the whole day, you:",
        "es": "Cuando sale a algún lugar por todo el día, usted:",
        "fr": "Quand vous partez quelque part pour toute la journée, vous :",
        "ar": "عندما تذهب إلى مكان ما لليوم بأكمله، أنت:",
    },
    "Находясь в компании, Вы обычно:": {
        "en": "When in a group, you usually:",
        "es": "Cuando está en compañía, usted generalmente:",
        "fr": "En groupe, vous avez tendance à :",
        "ar": "عند وجودك في مجموعة، عادةً أنت:",
    },
    "Вам легче поладить с людьми:": {
        "en": "It is easier for you to get along with people who are:",
        "es": "Le resulta más fácil llevarse bien con personas que son:",
        "fr": "Il vous est plus facile de vous entendre avec des personnes qui sont :",
        "ar": "من الأسهل لك التعامل مع الأشخاص الذين:",
    },
    "Более высокой похвалой Вы считаете слова:": {
        "en": "You consider a greater compliment the words:",
        "es": "Considera un mayor cumplido las palabras:",
        "fr": "Vous considérez comme un plus grand compliment les mots :",
        "ar": "تعتبر أعلى مديح الكلمات:",
    },
    "Вы предпочитаете:": {
        "en": "You prefer:",
        "es": "Usted prefiere:",
        "fr": "Vous préférez :",
        "ar": "أنت تفضل:",
    },
    "В большой компании чаще:": {
        "en": "In a large group, more often:",
        "es": "En un grupo grande, con más frecuencia:",
        "fr": "Dans un grand groupe, le plus souvent :",
        "ar": "في مجموعة كبيرة، في الغالب:",
    },
    "Вас скорее можно назвать:": {
        "en": "You would more likely be called:",
        "es": "Más bien se le podría llamar:",
        "fr": "On vous qualifierait plutôt de :",
        "ar": "يمكن وصفك بأنك:",
    },
    "Вы чаще добиваетесь успеха:": {
        "en": "You more often succeed:",
        "es": "Con más frecuencia tiene éxito:",
        "fr": "Vous réussissez le plus souvent :",
        "ar": "في أغلب الأحيان تنجح:",
    },
    "Вам больше нравятся люди, которые:": {
        "en": "You like people who:",
        "es": "Le gustan más las personas que:",
        "fr": "Vous préférez les personnes qui :",
        "ar": "تفضل الأشخاص الذين:",
    },
    "На Ваш взгляд самый большой недостаток – быть:": {
        "en": "In your opinion, the greatest flaw is to be:",
        "es": "En su opinión, el mayor defecto es ser:",
        "fr": "À votre avis, le plus grand défaut est d'être :",
        "ar": "في رأيك، أكبر عيب هو أن تكون:",
    },
    "Следование какому-либо расписанию:": {
        "en": "Following a schedule:",
        "es": "Seguir un horario:",
        "fr": "Suivre un planning :",
        "ar": "اتباع جدول زمني:",
    },
    "Среди своих друзей Вы:": {
        "en": "Among your friends, you:",
        "es": "Entre sus amigos, usted:",
        "fr": "Parmi vos amis, vous :",
        "ar": "بين أصدقائك، أنت:",
    },
    "Вы бы предпочли иметь среди своих друзей человека, который:": {
        "en": "You would prefer to have among your friends someone who:",
        "es": "Preferiría tener entre sus amigos a alguien que:",
        "fr": "Vous préféreriez avoir parmi vos amis quelqu'un qui :",
        "ar": "تفضل أن يكون من بين أصدقائك شخص:",
    },
    "Вы предпочли бы работать под началом человека, который:": {
        "en": "You would prefer to work under someone who:",
        "es": "Preferiría trabajar bajo la dirección de alguien que:",
        "fr": "Vous préféreriez travailler sous la direction de quelqu'un qui :",
        "ar": "تفضل العمل تحت إشراف شخص:",
    },
    "Мысль о том, чтобы составить список дел на выходные:": {
        "en": "The idea of making a to-do list for the weekend:",
        "es": "La idea de hacer una lista de tareas para el fin de semana:",
        "fr": "L'idée de faire une liste de tâches pour le week-end :",
        "ar": "فكرة إعداد قائمة مهام لعطلة نهاية الأسبوع:",
    },
    "Вы обычно:": {
        "en": "You usually:",
        "es": "Usted generalmente:",
        "fr": "Vous généralement :",
        "ar": "عادةً أنت:",
    },
    "Когда Вы читаете для своего удовольствия, Вам нравится:": {
        "en": "When you read for pleasure, you like:",
        "es": "Cuando lee por placer, le gusta:",
        "fr": "Quand vous lisez pour le plaisir, vous aimez :",
        "ar": "عندما تقرأ للمتعة، تحب:",
    },
    "Вы считаете, что более серьезный недостаток:": {
        "en": "You think a more serious flaw is:",
        "es": "Usted cree que un defecto más grave es:",
        "fr": "Vous pensez qu'un défaut plus grave est :",
        "ar": "تعتقد أن العيب الأشد خطورة هو:",
    },
    "В своей повседневной работе:": {
        "en": "In your daily work:",
        "es": "En su trabajo diario:",
        "fr": "Dans votre travail quotidien :",
        "ar": "في عملك اليومي:",
    },
    "Люди могут определить область Ваших интересов:": {
        "en": "People can identify your areas of interest:",
        "es": "Las personas pueden identificar sus áreas de interés:",
        "fr": "Les gens peuvent identifier vos centres d'intérêt :",
        "ar": "يمكن للناس تحديد مجالات اهتمامك:",
    },
    "Выполняя ту же работу, что и многие другие люди, Вы предпочитаете:": {
        "en": "When doing the same work as many others, you prefer:",
        "es": "Al hacer el mismo trabajo que muchos otros, usted prefiere:",
        "fr": "Quand vous faites le même travail que beaucoup d'autres, vous préférez :",
        "ar": "عند القيام بنفس العمل الذي يقوم به الآخرون، تفضل:",
    },
    "Вас больше волнуют:": {
        "en": "You are more concerned with:",
        "es": "Le preocupan más:",
        "fr": "Vous vous souciez davantage de :",
        "ar": "أنت أكثر اهتماماً بـ:",
    },
    "Когда Вам нужно выполнить определенную работу, Вы обычно:": {
        "en": "When you need to complete a task, you usually:",
        "es": "Cuando necesita completar una tarea, usted generalmente:",
        "fr": "Quand vous devez accomplir une tâche, vous avez généralement tendance à :",
        "ar": "عندما تحتاج إلى إنجاز مهمة معينة، عادةً أنت:",
    },
    "Когда Вам необходимо что-то сделать в определенное время, Вы считаете, что:": {
        "en": "When you need to do something at a specific time, you feel that:",
        "es": "Cuando necesita hacer algo en un momento determinado, usted cree que:",
        "fr": "Quand vous devez faire quelque chose à un moment précis, vous estimez que :",
        "ar": "عندما تحتاج إلى القيام بشيء في وقت محدد، تشعر أن:",
    },
    "Можно сказать, что Вы:": {
        "en": "It can be said that you:",
        "es": "Se puede decir que usted:",
        "fr": "On peut dire que vous :",
        "ar": "يمكن القول أنك:",
    },
    "Более высокой похвалой человеку будет признание:": {
        "en": "A higher compliment for a person would be recognition of:",
        "es": "Un mayor cumplido para una persona sería reconocer:",
        "fr": "Un plus grand compliment pour une personne serait de reconnaître :",
        "ar": "أعلى مديح للشخص هو الاعتراف بـ:",
    },
    "Обычно:": {
        "en": "Usually:",
        "es": "Normalmente:",
        "fr": "Habituellement :",
        "ar": "عادةً:",
    },
    "На вечеринках Вам:": {
        "en": "At parties, you:",
        "es": "En las fiestas, usted:",
        "fr": "Lors des soirées, vous :",
        "ar": "في الحفلات، أنت:",
    },
    "Вы считаете, что более важно:": {
        "en": "You think it is more important to:",
        "es": "Usted cree que es más importante:",
        "fr": "Vous pensez qu'il est plus important de :",
        "ar": "تعتقد أن الأهم هو:",
    },
    "Считаете ли Вы, что наличие стабильного повседневного распорядка:": {
        "en": "Do you think that having a stable daily routine:",
        "es": "¿Cree usted que tener una rutina diaria estable:",
        "fr": "Pensez-vous qu'avoir une routine quotidienne stable :",
        "ar": "هل تعتقد أن وجود روتين يومي ثابت:",
    },
    "Когда что-то входит в моду, Вы обычно:": {
        "en": "When something becomes fashionable, you usually:",
        "es": "Cuando algo se pone de moda, usted generalmente:",
        "fr": "Quand quelque chose devient à la mode, vous avez généralement tendance à :",
        "ar": "عندما يصبح شيء ما رائجاً، عادةً أنت:",
    },
    "Вы скорее:": {
        "en": "You would rather:",
        "es": "Usted más bien:",
        "fr": "Vous avez plutôt tendance à :",
        "ar": "أنت أميل إلى:",
    },
    "Когда Вы думаете о том, что надо сделать какое-то не очень важное дело или купить какую-то мелкую вещь, Вы:": {
        "en": "When you think about a minor task you need to do or a small thing to buy, you:",
        "es": "Cuando piensa en una tarea menor que debe hacer o en algo pequeño que comprar, usted:",
        "fr": "Quand vous pensez à une tâche mineure à accomplir ou à un petit achat à faire, vous :",
        "ar": "عندما تفكر في مهمة بسيطة تحتاج إلى إنجازها أو شيء صغير للشراء، أنت:",
    },
    "Узнать, что Вы за человек:": {
        "en": "Finding out what kind of person you are:",
        "es": "Descubrir qué tipo de persona es usted:",
        "fr": "Découvrir quel type de personne vous êtes :",
        "ar": "معرفة نوع الشخص الذي أنت عليه:",
    },
    "Вам труднее приспособиться:": {
        "en": "It is harder for you to adapt to:",
        "es": "Le resulta más difícil adaptarse:",
        "fr": "Il vous est plus difficile de vous adapter :",
        "ar": "من الصعب عليك التأقلم مع:",
    },
    "Оказавшись в затруднительной ситуации, Вы обычно:": {
        "en": "When you find yourself in an awkward situation, you usually:",
        "es": "Cuando se encuentra en una situación difícil, usted generalmente:",
        "fr": "Quand vous vous trouvez dans une situation embarrassante, vous avez généralement tendance à :",
        "ar": "عند وجودك في موقف محرج، عادةً أنت:",
    },
    "Вы считаете, что Вашим близким известны Ваши мысли:": {
        "en": "You think your close ones know your thoughts:",
        "es": "Cree que sus seres queridos conocen sus pensamientos:",
        "fr": "Vous pensez que vos proches connaissent vos pensées :",
        "ar": "تعتقد أن المقربين منك يعرفون أفكارك:",
    },
    "Выполняя какую-либо работу, Вы обычно:": {
        "en": "When doing a job, you usually:",
        "es": "Al realizar un trabajo, usted generalmente:",
        "fr": "Quand vous effectuez un travail, vous avez généralement tendance à :",
        "ar": "عند القيام بعمل ما، عادةً أنت:",
    },
    "Будучи на вечеринке, Вы предпочитаете:": {
        "en": "At a party, you prefer:",
        "es": "En una fiesta, usted prefiere:",
        "fr": "À une soirée, vous préférez :",
        "ar": "في حفلة، تفضل:",
    },
    "Если в выходной утром Вас спросят, что Вы собираетесь сделать в течение дня, Вы:": {
        "en": "If asked on a weekend morning what you plan to do during the day, you:",
        "es": "Si le preguntan por la mañana de un día libre qué planea hacer durante el día, usted:",
        "fr": "Si on vous demande un matin de week-end ce que vous comptez faire dans la journée, vous :",
        "ar": "إذا سُئلت صباح يوم عطلة عما تخطط للقيام به خلال اليوم، أنت:",
    },
    "Однообразие повседневных дел кажется Вам:": {
        "en": "The monotony of daily tasks seems to you:",
        "es": "La monotonía de las tareas diarias le parece:",
        "fr": "La monotonie des tâches quotidiennes vous semble :",
        "ar": "يبدو لك رتابة المهام اليومية:",
    },
    "Когда Вам нужно выполнить определенную работу, Вы обычно:": {
        "en": "When you need to complete a certain task, you usually:",
        "es": "Cuando necesita completar una tarea específica, usted generalmente:",
        "fr": "Quand vous devez accomplir une tâche précise, vous avez généralement tendance à :",
        "ar": "عندما تحتاج إلى إنجاز مهمة معينة، عادةً أنت:",
    },
    "Когда Вы начинаете какое-то большое дело, которое займет у Вас неделю, Вы:": {
        "en": "When you start a big project that will take a week, you:",
        "es": "Cuando comienza un gran proyecto que le llevará una semana, usted:",
        "fr": "Quand vous commencez un grand projet qui vous prendra une semaine, vous :",
        "ar": "عند بدء مشروع كبير سيستغرق منك أسبوعاً، أنت:",
    },
    "Какое слово из пары (А или Б) Вам больше нравится:": {
        "en": "Which word from the pair (A or B) do you prefer:",
        "es": "¿Cuál de las palabras del par (A o B) prefiere:",
        "fr": "Quel mot de la paire (A ou B) préférez-vous :",
        "ar": "أي كلمة من الزوج (أ أو ب) تفضل:",
    },

    # ── Option texts ────────────────────────────────────────────────────────
    "общительны": {"en": "sociable", "es": "sociable", "fr": "sociable", "ar": "اجتماعي"},
    "довольно сдержанны и спокойны.": {"en": "quite reserved and calm", "es": "bastante reservado y tranquilo", "fr": "plutôt réservé et calme", "ar": "هادئ ومتحفظ إلى حد ما"},
    "построенный на изложении фактов": {"en": "based on presenting facts", "es": "basado en la presentación de hechos", "fr": "basé sur l'exposé des faits", "ar": "يقوم على عرض الحقائق"},
    "включающий в себя изложение теорий.": {"en": "that includes presenting theories", "es": "que incluye la presentación de teorías", "fr": "qui inclut l'exposé des théories", "ar": "يتضمن عرض النظريات"},
    "своему сердцу управлять разумом": {"en": "your heart guide your mind", "es": "su corazón guíe su mente", "fr": "votre cœur guider votre raison", "ar": "قلبك يوجه عقلك"},
    "своему разуму управлять сердцем.": {"en": "your mind guide your heart", "es": "su mente guíe su corazón", "fr": "votre raison guider votre cœur", "ar": "عقلك يوجه قلبك"},
    "планируете, что и когда будете делать": {"en": "plan what and when you will do things", "es": "planifica qué y cuándo hará las cosas", "fr": "planifiez ce que vous ferez et quand", "ar": "تخطط لما ستفعله ومتى"},
    "уходите без определенного плана.": {"en": "go without a specific plan", "es": "sale sin un plan específico", "fr": "partez sans plan précis", "ar": "تغادر بدون خطة محددة"},
    "присоединяетесь к общему разговору": {"en": "join the general conversation", "es": "se une a la conversación general", "fr": "vous joignez à la conversation générale", "ar": "تنضم إلى الحديث العام"},
    "беседуете время от времени с кем-то одним.": {"en": "chat one-on-one with someone from time to time", "es": "conversa de vez en cuando con alguien en particular", "fr": "discutez de temps en temps avec une seule personne", "ar": "تتحدث من وقت لآخر مع شخص واحد"},
    "имеющими богатое воображение": {"en": "have a rich imagination", "es": "tienen una imaginación rica", "fr": "ont une riche imagination", "ar": "يمتلكون خيالاً خصباً"},
    "реалистичными.": {"en": "realistic", "es": "realistas", "fr": "réalistes", "ar": "واقعيين"},
    "душевный человек": {"en": "a warm-hearted person", "es": "una persona cálida", "fr": "une personne chaleureuse", "ar": "شخص دافئ القلب"},
    "последовательно рассуждающий человек.": {"en": "a consistently logical person", "es": "una persona que razona de manera consistente", "fr": "une personne qui raisonne de façon cohérente", "ar": "شخص منطقي ومتسق"},
    "заранее договариваться о встречах, вечеринках и т.п.": {"en": "arranging meetings, parties, etc. in advance", "es": "organizar reuniones, fiestas, etc. con antelación", "fr": "organiser à l'avance les réunions, soirées, etc.", "ar": "الترتيب المسبق للاجتماعات والحفلات وما شابه"},
    "иметь возможность в последний момент решать, как развлечься.": {"en": "having the option to decide at the last moment how to have fun", "es": "tener la posibilidad de decidir en el último momento cómo divertirse", "fr": "avoir la possibilité de décider au dernier moment comment s'amuser", "ar": "أن تقرر في اللحظة الأخيرة كيف تقضي وقتك"},
    "Вы представляете людей друг другу": {"en": "you introduce people to each other", "es": "usted presenta a las personas entre sí", "fr": "vous présentez les gens les uns aux autres", "ar": "أنت تعرّف الناس ببعضهم"},
    "Вас знакомят с другими.": {"en": "you are introduced to others", "es": "le presentan a otras personas", "fr": "on vous présente aux autres", "ar": "يتم تعريفك بالآخرين"},
    "человеком практичным": {"en": "a practical person", "es": "una persona práctica", "fr": "une personne pratique", "ar": "شخصاً عملياً"},
    "выдумщиком.": {"en": "an imaginative dreamer", "es": "un soñador imaginativo", "fr": "un imaginatif", "ar": "شخصاً خيالياً مبتكراً"},
    "цените чувства больше, чем логику": {"en": "value feelings more than logic", "es": "valora los sentimientos más que la lógica", "fr": "accordez plus de valeur aux sentiments qu'à la logique", "ar": "تُقدّر المشاعر أكثر من المنطق"},
    "цените логику больше, чем чувства.": {"en": "value logic more than feelings", "es": "valora la lógica más que los sentimientos", "fr": "accordez plus de valeur à la logique qu'aux sentiments", "ar": "تُقدّر المنطق أكثر من المشاعر"},
    "действуя в непредсказуемой ситуации, когда нужно быстро принимать решения": {"en": "acting in unpredictable situations requiring quick decisions", "es": "actuando en situaciones impredecibles que requieren decisiones rápidas", "fr": "en agissant dans des situations imprévisibles où il faut prendre des décisions rapidement", "ar": "بالتصرف في مواقف غير متوقعة تتطلب قرارات سريعة"},
    "следуя тщательно разработанному плану.": {"en": "following a carefully developed plan", "es": "siguiendo un plan cuidadosamente elaborado", "fr": "en suivant un plan soigneusement élaboré", "ar": "باتباع خطة مدروسة بعناية"},
    "иметь несколько близких, верных друзей": {"en": "having a few close, loyal friends", "es": "tener unos pocos amigos cercanos y leales", "fr": "avoir quelques amis proches et fidèles", "ar": "وجود عدد قليل من الأصدقاء المقربين الأوفياء"},
    "иметь дружеские связи с самыми разными людьми.": {"en": "having friendly connections with a wide variety of people", "es": "tener relaciones amistosas con una gran variedad de personas", "fr": "avoir des liens d'amitié avec des personnes très diverses", "ar": "وجود علاقات ودية مع أشخاص متنوعين"},
    "следуют общепринятым нормам и не привлекают к себе внимания": {"en": "follow established norms and do not draw attention to themselves", "es": "siguen las normas establecidas y no llaman la atención", "fr": "suivent les normes établies et n'attirent pas l'attention sur eux", "ar": "يتبعون المعايير المقبولة ولا يلفتون الانتباه إليهم"},
    "настолько оригинальны, что им все равно, обращают на них внимание или нет.": {"en": "are so original that they do not care whether they attract attention or not", "es": "son tan originales que no les importa si atraen atención o no", "fr": "sont tellement originaux qu'il leur est égal d'attirer l'attention ou non", "ar": "أصيلون لدرجة أنه لا يهمهم إن كانوا يلفتون الانتباه أم لا"},
    "бесчувственным": {"en": "insensitive", "es": "insensible", "fr": "insensible", "ar": "عديم الإحساس"},
    "неблагоразумным.": {"en": "imprudent", "es": "imprudente", "fr": "imprudent", "ar": "متهور"},
    "привлекает Вас": {"en": "appeals to you", "es": "le atrae", "fr": "vous attire", "ar": "يجذبك"},
    "сковывает Вас.": {"en": "constrains you", "es": "le coarta", "fr": "vous contraint", "ar": "يقيّدك"},
    "позже других узнаете о событиях в их жизни": {"en": "learn about events in their lives later than others", "es": "se entera de los eventos en sus vidas más tarde que los demás", "fr": "apprenez les événements de leur vie plus tard que les autres", "ar": "تعرف عن أحداث حياتهم متأخراً عن الآخرين"},
    "обычно знаете массу новостей о них.": {"en": "usually know a lot of news about them", "es": "generalmente sabe muchas noticias sobre ellos", "fr": "savez généralement beaucoup de nouvelles sur eux", "ar": "عادةً تعرف الكثير من الأخبار عنهم"},
    "всегда полон новых идей": {"en": "is always full of new ideas", "es": "siempre está lleno de nuevas ideas", "fr": "est toujours plein de nouvelles idées", "ar": "دائماً مليء بالأفكار الجديدة"},
    "трезво и реалистично смотрит на мир.": {"en": "has a sober and realistic view of the world", "es": "tiene una visión sobria y realista del mundo", "fr": "a une vision sobre et réaliste du monde", "ar": "لديه نظرة رصينة وواقعية للعالم"},
    "всегда добр": {"en": "is always kind", "es": "siempre es amable", "fr": "est toujours bienveillant", "ar": "دائماً طيب"},
    "всегда справедлив.": {"en": "is always fair", "es": "siempre es justo", "fr": "est toujours juste", "ar": "دائماً عادل"},
    "Вас привлекает": {"en": "appeals to you", "es": "le atrae", "fr": "vous attire", "ar": "يجذبك"},
    "оставляет Вас равнодушным": {"en": "leaves you indifferent", "es": "le deja indiferente", "fr": "vous laisse indifférent", "ar": "يتركك غير مبالٍ"},
    "угнетает Вас.": {"en": "depresses you", "es": "le deprime", "fr": "vous déprime", "ar": "يُحبطك"},
    "можете легко разговаривать практически с любым человеком в течение любого времени": {"en": "can easily talk to almost anyone for any amount of time", "es": "puede conversar fácilmente con casi cualquier persona durante cualquier tiempo", "fr": "pouvez facilement parler avec presque n'importe qui pendant n'importe combien de temps", "ar": "يمكنك التحدث بسهولة مع أي شخص تقريباً لأي مدة"},
    "можете найти тему для разговора только с немногими людьми и только в определенных ситуациях.": {"en": "can find a topic to talk about only with a few people and only in certain situations", "es": "solo puede encontrar tema de conversación con pocas personas y solo en ciertas situaciones", "fr": "ne pouvez trouver un sujet de conversation qu'avec peu de personnes et seulement dans certaines situations", "ar": "لا تجد موضوعاً للحديث إلا مع قلة من الناس وفي مواقف معينة فقط"},
    "необычная, оригинальная манера изложения": {"en": "an unusual, original style of writing", "es": "un estilo de escritura inusual y original", "fr": "un style d'écriture inhabituel et original", "ar": "أسلوب كتابة غير معتاد وأصيل"},
    "когда писатели четко выражают свои мысли.": {"en": "when writers express their thoughts clearly", "es": "cuando los escritores expresan sus pensamientos con claridad", "fr": "quand les écrivains expriment clairement leurs pensées", "ar": "عندما يعبر الكتّاب عن أفكارهم بوضوح"},
    "быть слишком сердечным": {"en": "being too warm-hearted", "es": "ser demasiado afectuoso", "fr": "être trop chaleureux", "ar": "أن تكون محباً للغاية"},
    "быть недостаточно сердечным.": {"en": "being not warm-hearted enough", "es": "no ser suficientemente afectuoso", "fr": "ne pas être assez chaleureux", "ar": "أن لا تكون محباً بما يكفي"},
    "Вам больше нравятся критические ситуации, когда Вам приходится работать в условиях дефицита времени": {"en": "you prefer critical situations where you have to work under time pressure", "es": "prefiere situaciones críticas en las que debe trabajar bajo presión de tiempo", "fr": "vous préférez les situations critiques où vous devez travailler sous pression temporelle", "ar": "تفضل المواقف الحرجة التي تعمل فيها تحت ضغط الوقت"},
    "ненавидите работать в жестких временных рамках": {"en": "hate working within strict time limits", "es": "detesta trabajar dentro de plazos estrictos", "fr": "détestez travailler dans des délais stricts", "ar": "تكره العمل ضمن قيود زمنية صارمة"},
    "обычно планируете свою работу так, чтобы Вам хватило времени.": {"en": "usually plan your work so that you have enough time", "es": "generalmente planifica su trabajo para tener suficiente tiempo", "fr": "planifiez généralement votre travail pour avoir suffisamment de temps", "ar": "عادةً تخطط لعملك بحيث يكون لديك وقت كافٍ"},
    "при первом знакомстве с Вами": {"en": "upon first meeting you", "es": "al conocerle por primera vez", "fr": "dès la première rencontre", "ar": "عند لقائك لأول مرة"},
    "лишь тогда, когда узнают Вас поближе.": {"en": "only when they get to know you better", "es": "solo cuando le conocen mejor", "fr": "seulement quand ils apprennent à mieux vous connaître", "ar": "فقط عندما يتعرفون عليك بشكل أفضل"},
    "делать это традиционным способом": {"en": "do it the traditional way", "es": "hacerlo de la manera tradicional", "fr": "le faire de la manière traditionnelle", "ar": "القيام به بالطريقة التقليدية"},
    "изобретать свой собственный способ.": {"en": "invent your own way", "es": "inventar su propio método", "fr": "inventer votre propre méthode", "ar": "ابتكار طريقتك الخاصة"},
    "чувства людей": {"en": "people's feelings", "es": "los sentimientos de las personas", "fr": "les sentiments des gens", "ar": "مشاعر الناس"},
    "их права.": {"en": "their rights", "es": "sus derechos", "fr": "leurs droits", "ar": "حقوقهم"},
    "тщательно организовываете все перед началом работы": {"en": "carefully organize everything before starting", "es": "organiza todo cuidadosamente antes de comenzar", "fr": "organisez soigneusement tout avant de commencer", "ar": "تنظم كل شيء بعناية قبل البدء"},
    "предпочитаете выяснять все необходимое в процессе работы.": {"en": "prefer to figure out everything needed as you go", "es": "prefiere descubrir todo lo necesario mientras trabaja", "fr": "préférez découvrir tout ce dont vous avez besoin au fur et à mesure", "ar": "تفضل معرفة ما تحتاجه أثناء العمل"},
    "свободно выражаете свои чувства": {"en": "freely express your feelings", "es": "expresa libremente sus sentimientos", "fr": "exprimez librement vos sentiments", "ar": "تعبّر بحرية عن مشاعرك"},
    "держите свои чувства при себе.": {"en": "keep your feelings to yourself", "es": "guarda sus sentimientos para sí mismo", "fr": "gardez vos sentiments pour vous", "ar": "تحتفظ بمشاعرك لنفسك"},
    "быть оригинальным": {"en": "being original", "es": "ser original", "fr": "être original", "ar": "أن تكون مبتكراً"},
    "следовать общепринятым нормам.": {"en": "following established norms", "es": "seguir las normas establecidas", "fr": "suivre les normes établies", "ar": "اتباع المعايير المقبولة"},
    "кроткий": {"en": "gentle", "es": "manso", "fr": "doux", "ar": "وديع"},
    "настойчивый.": {"en": "persistent", "es": "persistente", "fr": "persévérant", "ar": "مثابر"},
    "лучше планировать все заранее": {"en": "it is better to plan everything in advance", "es": "es mejor planificar todo con antelación", "fr": "il vaut mieux tout planifier à l'avance", "ar": "من الأفضل التخطيط لكل شيء مسبقاً"},
    "несколько неприятно быть связанным этими планами.": {"en": "it is somewhat unpleasant to be bound by these plans", "es": "es algo desagradable estar atado a estos planes", "fr": "il est quelque peu désagréable d'être lié par ces plans", "ar": "من غير المريح أن تكون مقيداً بهذه الخطط"},
    "более восторженны по сравнению с другими людьми": {"en": "more enthusiastic than other people", "es": "más entusiasta que otras personas", "fr": "plus enthousiaste que les autres", "ar": "أكثر حماساً مقارنةً بالآخرين"},
    "менее восторженны, чем большинство людей.": {"en": "less enthusiastic than most people", "es": "menos entusiasta que la mayoría de las personas", "fr": "moins enthousiaste que la plupart des gens", "ar": "أقل حماساً من معظم الناس"},
    "его способности к предвидению": {"en": "their ability to foresee things", "es": "su capacidad de previsión", "fr": "leur capacité de prévision", "ar": "قدرتهم على استشراف الأمور"},
    "его здравого смысла.": {"en": "their common sense", "es": "su sentido común", "fr": "leur bon sens", "ar": "حسن تقديرهم"},
    "мысли": {"en": "thoughts", "es": "pensamientos", "fr": "pensées", "ar": "أفكار"},
    "чувства.": {"en": "feelings", "es": "sentimientos", "fr": "sentiments", "ar": "مشاعر"},
    "Вы предпочитаете все делать в последнюю минуту": {"en": "you prefer to do everything at the last minute", "es": "prefiere hacer todo en el último momento", "fr": "vous préférez tout faire à la dernière minute", "ar": "تفضل القيام بكل شيء في اللحظة الأخيرة"},
    "для Вас откладывать все до последней минуты – это слишком большая нервотрепка.": {"en": "putting everything off until the last minute is too stressful for you", "es": "dejar todo para el último momento le genera demasiado estrés", "fr": "tout remettre à la dernière minute est trop stressant pour vous", "ar": "تأجيل كل شيء إلى اللحظة الأخيرة مرهق جداً بالنسبة لك"},
    "иногда становится скучно": {"en": "you sometimes get bored", "es": "a veces se aburre", "fr": "vous vous ennuyez parfois", "ar": "تشعر أحياناً بالملل"},
    "всегда весело.": {"en": "you always have fun", "es": "siempre se divierte", "fr": "vous vous amusez toujours", "ar": "دائماً تستمتع"},
    "видеть различные возможности в какой-либо ситуации": {"en": "to see various possibilities in a situation", "es": "ver diversas posibilidades en una situación", "fr": "voir diverses possibilités dans une situation", "ar": "رؤية الإمكانيات المتعددة في الموقف"},
    "воспринимать факты такими, какие они есть.": {"en": "to perceive facts as they are", "es": "percibir los hechos tal como son", "fr": "percevoir les faits tels qu'ils sont", "ar": "رؤية الحقائق كما هي"},
    "убедительный": {"en": "convincing", "es": "convincente", "fr": "convaincant", "ar": "مقنع"},
    "трогательный.": {"en": "touching", "es": "conmovedor", "fr": "touchant", "ar": "مؤثر"},
    "очень удобно для выполнения многих дел": {"en": "is very convenient for getting many things done", "es": "es muy conveniente para realizar muchas tareas", "fr": "est très pratique pour accomplir beaucoup de choses", "ar": "مريح جداً لإنجاز الكثير من الأمور"},
    "тягостно, даже когда это необходимо.": {"en": "is burdensome, even when necessary", "es": "es pesado, incluso cuando es necesario", "fr": "est pénible, même quand c'est nécessaire", "ar": "مرهق حتى عندما يكون ضرورياً"},
    "одним из первых испробуете это": {"en": "are among the first to try it", "es": "es uno de los primeros en probarlo", "fr": "êtes parmi les premiers à l'essayer", "ar": "تكون من أوائل من يجربه"},
    "мало этим интересуетесь.": {"en": "have little interest in it", "es": "tiene poco interés en ello", "fr": "vous y intéressez peu", "ar": "اهتمامك به ضئيل"},
    "придерживаетесь общепринятых методов в работе": {"en": "stick to established methods in your work", "es": "se adhiere a los métodos establecidos en su trabajo", "fr": "vous en tenez aux méthodes établies dans votre travail", "ar": "تلتزم بالأساليب المعتمدة في عملك"},
    "ищете, что еще неверно, и беретесь за неразрешенные проблемы.": {"en": "look for what is still wrong and tackle unresolved problems", "es": "busca qué está mal aún y se ocupa de los problemas sin resolver", "fr": "cherchez ce qui ne va pas encore et vous attaquez aux problèmes non résolus", "ar": "تبحث عما هو خاطئ وتتعامل مع المشكلات غير المحلولة"},
    "анализировать": {"en": "to analyze", "es": "analizar", "fr": "analyser", "ar": "تحليل"},
    "сопереживать.": {"en": "to empathize", "es": "empatizar", "fr": "empathiser", "ar": "التعاطف"},
    "часто забываете об этом и вспоминаете слишком поздно": {"en": "often forget about it and remember too late", "es": "a menudo lo olvida y lo recuerda demasiado tarde", "fr": "l'oubliez souvent et vous en souvenez trop tard", "ar": "كثيراً ما تنساه وتتذكره في وقت متأخر"},
    "записываете это на бумаге, чтобы не забыть": {"en": "write it down on paper so as not to forget", "es": "lo anota en papel para no olvidarlo", "fr": "le notez sur papier pour ne pas l'oublier", "ar": "تكتبه على ورقة حتى لا تنساه"},
    "всегда выполняете это без дополнительных напоминаний.": {"en": "always do it without additional reminders", "es": "siempre lo hace sin recordatorios adicionales", "fr": "le faites toujours sans rappels supplémentaires", "ar": "دائماً تنجزه دون تذكيرات إضافية"},
    "довольно легко": {"en": "quite easily", "es": "con bastante facilidad", "fr": "assez facilement", "ar": "بسهولة كافية"},
    "довольно трудно.": {"en": "quite difficult", "es": "bastante difícil", "fr": "assez difficile", "ar": "صعب إلى حد ما"},
    "факты": {"en": "facts", "es": "hechos", "fr": "faits", "ar": "حقائق"},
    "идеи.": {"en": "ideas", "es": "ideas", "fr": "idées", "ar": "أفكار"},
    "справедливость": {"en": "justice", "es": "justicia", "fr": "justice", "ar": "عدالة"},
    "сочувствие.": {"en": "compassion", "es": "compasión", "fr": "compassion", "ar": "تعاطف"},
    "к однообразию": {"en": "to monotony", "es": "a la monotonía", "fr": "à la monotonie", "ar": "الرتابة"},
    "к постоянным переменам.": {"en": "to constant change", "es": "a los cambios constantes", "fr": "aux changements constants", "ar": "التغيير المستمر"},
    "переводите разговор на другое": {"en": "change the subject", "es": "cambia el tema de conversación", "fr": "détournez la conversation", "ar": "تحوّل الحديث إلى موضوع آخر"},
    "обращаете все в шутку": {"en": "turn everything into a joke", "es": "convierte todo en una broma", "fr": "tournez tout en plaisanterie", "ar": "تحوّل كل شيء إلى نكتة"},
    "спустя несколько дней думаете, что Вам следовало сказать.": {"en": "think a few days later about what you should have said", "es": "piensa unos días después en lo que debería haber dicho", "fr": "pensez quelques jours plus tard à ce que vous auriez dû dire", "ar": "تفكر بعد أيام فيما كان ينبغي لك قوله"},
    "утверждение": {"en": "statement", "es": "afirmación", "fr": "affirmation", "ar": "تأكيد"},
    "идея.": {"en": "idea", "es": "idea", "fr": "idée", "ar": "فكرة"},
    "сочувствие": {"en": "compassion", "es": "compasión", "fr": "compassion", "ar": "تعاطف"},
    "расчетливость.": {"en": "calculation", "es": "cálculo", "fr": "calcul", "ar": "حسابية"},
    "составляете сначала список того, что нужно сделать и в каком порядке": {"en": "first make a list of what needs to be done and in what order", "es": "primero hace una lista de lo que hay que hacer y en qué orden", "fr": "commencez par faire une liste de ce qui doit être fait et dans quel ordre", "ar": "أولاً تضع قائمة بما يجب القيام به وبأي ترتيب"},
    "сразу беретесь за работу.": {"en": "get straight to work", "es": "se pone a trabajar de inmediato", "fr": "vous mettez immédiatement au travail", "ar": "تبدأ العمل فوراً"},
    "достаточно хорошо": {"en": "well enough", "es": "bastante bien", "fr": "assez bien", "ar": "جيداً بما يكفي"},
    "лишь тогда, когда Вы намеренно сообщаете о них.": {"en": "only when you deliberately tell them", "es": "solo cuando usted se los comunica deliberadamente", "fr": "seulement quand vous le leur dites délibérément", "ar": "فقط عندما تخبرهم بها عن قصد"},
    "теория": {"en": "theory", "es": "teoría", "fr": "théorie", "ar": "نظرية"},
    "факт.": {"en": "fact", "es": "hecho", "fr": "fait", "ar": "حقيقة"},
    "выгода": {"en": "benefit", "es": "beneficio", "fr": "bénéfice", "ar": "فائدة"},
    "благодеяние.": {"en": "good deed", "es": "buena acción", "fr": "bonne action", "ar": "عمل خير"},
    "планируете работу таким образом, чтобы закончить с запасом времени": {"en": "plan your work so as to finish with time to spare", "es": "planifica su trabajo para terminar con tiempo de sobra", "fr": "planifiez votre travail de façon à terminer avec du temps en avance", "ar": "تخطط لعملك لإنهائه قبل الموعد المحدد"},
    "в последний момент работаете с наивысшей производительностью.": {"en": "work at your highest productivity at the last moment", "es": "trabaja con su mayor productividad en el último momento", "fr": "travaillez avec votre plus haute productivité au dernier moment", "ar": "تعمل بأعلى إنتاجية في اللحظة الأخيرة"},
    "активно участвовать в развитии событий": {"en": "actively participate in how things unfold", "es": "participar activamente en el desarrollo de los eventos", "fr": "participer activement au déroulement des événements", "ar": "المشاركة الفعّالة في تطور الأحداث"},
    "предоставляете другим развлекаться, как им хочется.": {"en": "let others have fun in their own way", "es": "deja que los demás se diviertan como quieran", "fr": "laissez les autres s'amuser comme ils le souhaitent", "ar": "تترك للآخرين حرية الاستمتاع كما يشاؤون"},
    "буквальный": {"en": "literal", "es": "literal", "fr": "littéral", "ar": "حرفي"},
    "фигуральный.": {"en": "figurative", "es": "figurado", "fr": "figuré", "ar": "مجازي"},
    "решительный": {"en": "decisive", "es": "decidido", "fr": "décisif", "ar": "حازم"},
    "преданный.": {"en": "devoted", "es": "leal", "fr": "dévoué", "ar": "مخلص"},
    "сможете довольно точно ответить": {"en": "can answer fairly accurately", "es": "puede responder con bastante precisión", "fr": "pouvez répondre assez précisément", "ar": "يمكنك الإجابة بدقة معقولة"},
    "перечислите вдвое больше дел, чем сможете сделать": {"en": "will list twice as many things as you can actually do", "es": "enumerará el doble de cosas de las que realmente puede hacer", "fr": "enumérerez deux fois plus de choses que vous ne pouvez en faire", "ar": "ستعدد ضعف ما يمكنك القيام به فعلاً"},
    "предпочтете не загадывать заранее.": {"en": "prefer not to plan in advance", "es": "prefiere no planificar con antelación", "fr": "préférez ne pas planifier à l'avance", "ar": "تفضل عدم التخطيط مسبقاً"},
    "энергичный": {"en": "energetic", "es": "enérgico", "fr": "énergique", "ar": "نشيط"},
    "спокойный.": {"en": "calm", "es": "tranquilo", "fr": "calme", "ar": "هادئ"},
    "образный": {"en": "figurative", "es": "figurativo", "fr": "imagé", "ar": "مجازي"},
    "прозаичный.": {"en": "prosaic", "es": "prosaico", "fr": "prosaïque", "ar": "مباشر"},
    "неуступчивый": {"en": "unyielding", "es": "inflexible", "fr": "inflexible", "ar": "متصلب"},
    "добросердечный.": {"en": "kindhearted", "es": "bondadoso", "fr": "bienveillant", "ar": "طيب القلب"},
    "спокойным": {"en": "calm", "es": "tranquilo", "fr": "calme", "ar": "هادئاً"},
    "утомительным.": {"en": "tiring", "es": "agotador", "fr": "épuisant", "ar": "مُرهقاً"},
    "сдержанный": {"en": "reserved", "es": "reservado", "fr": "réservé", "ar": "متحفظ"},
    "разговорчивый.": {"en": "talkative", "es": "hablador", "fr": "bavard", "ar": "ثرثار"},
    "производить": {"en": "to produce", "es": "producir", "fr": "produire", "ar": "إنتاج"},
    "создавать.": {"en": "to create", "es": "crear", "fr": "créer", "ar": "خلق"},
    "миротворец": {"en": "peacemaker", "es": "pacificador", "fr": "pacificateur", "ar": "صانع سلام"},
    "судья.": {"en": "judge", "es": "juez", "fr": "juge", "ar": "قاضٍ"},
    "запланированный": {"en": "scheduled", "es": "planificado", "fr": "planifié", "ar": "مخطط له"},
    "внеплановый.": {"en": "unplanned", "es": "no planificado", "fr": "imprévu", "ar": "غير مخطط له"},
    "спокойный": {"en": "calm", "es": "tranquilo", "fr": "calme", "ar": "هادئ"},
    "оживленный.": {"en": "lively", "es": "animado", "fr": "animé", "ar": "نشيط"},
    "благоразумный": {"en": "prudent", "es": "prudente", "fr": "prudent", "ar": "حكيم"},
    "очаровательный.": {"en": "charming", "es": "encantador", "fr": "charmant", "ar": "ساحر"},
    "мягкий": {"en": "gentle", "es": "suave", "fr": "doux", "ar": "لطيف"},
    "твердый.": {"en": "firm", "es": "firme", "fr": "ferme", "ar": "صارم"},
    "методичный": {"en": "methodical", "es": "metódico", "fr": "méthodique", "ar": "منهجي"},
    "спонтанный.": {"en": "spontaneous", "es": "espontáneo", "fr": "spontané", "ar": "عفوي"},
    "говорить": {"en": "to speak", "es": "hablar", "fr": "parler", "ar": "التحدث"},
    "писать.": {"en": "to write", "es": "escribir", "fr": "écrire", "ar": "الكتابة"},
    "производство": {"en": "production", "es": "producción", "fr": "production", "ar": "إنتاج"},
    "планирование.": {"en": "planning", "es": "planificación", "fr": "planification", "ar": "تخطيط"},
    "прощать": {"en": "to forgive", "es": "perdonar", "fr": "pardonner", "ar": "المسامحة"},
    "дозволять.": {"en": "to permit", "es": "permitir", "fr": "permettre", "ar": "السماح"},
    "систематический": {"en": "systematic", "es": "sistemático", "fr": "systématique", "ar": "منهجي"},
    "случайный.": {"en": "random", "es": "aleatorio", "fr": "aléatoire", "ar": "عشوائي"},
    "общительный": {"en": "sociable", "es": "sociable", "fr": "sociable", "ar": "اجتماعي"},
    "замкнутый.": {"en": "withdrawn", "es": "introvertido", "fr": "renfermé", "ar": "منطوٍ"},
    "конкретный": {"en": "concrete", "es": "concreto", "fr": "concret", "ar": "ملموس"},
    "абстрактный.": {"en": "abstract", "es": "abstracto", "fr": "abstrait", "ar": "مجرد"},
    "кто": {"en": "who", "es": "quién", "fr": "qui", "ar": "من"},
    "что.": {"en": "what", "es": "qué", "fr": "quoi", "ar": "ماذا"},
    "импульс": {"en": "impulse", "es": "impulso", "fr": "impulsion", "ar": "دافع"},
    "решение.": {"en": "decision", "es": "decisión", "fr": "décision", "ar": "قرار"},
    "вечеринка": {"en": "party", "es": "fiesta", "fr": "soirée", "ar": "حفلة"},
    "театр.": {"en": "theater", "es": "teatro", "fr": "théâtre", "ar": "مسرح"},
    "сооружать": {"en": "to build", "es": "construir", "fr": "construire", "ar": "بناء"},
    "изобретать.": {"en": "to invent", "es": "inventar", "fr": "inventer", "ar": "اختراع"},
    "некритичный": {"en": "uncritical", "es": "no crítico", "fr": "non critique", "ar": "غير ناقد"},
    "критичный.": {"en": "critical", "es": "crítico", "fr": "critique", "ar": "ناقد"},
    "пунктуальный": {"en": "punctual", "es": "puntual", "fr": "ponctuel", "ar": "دقيق في المواعيد"},
    "свободный.": {"en": "free", "es": "libre", "fr": "libre", "ar": "حر"},
    "основание": {"en": "foundation", "es": "base", "fr": "base", "ar": "قاعدة"},
    "вершина.": {"en": "peak", "es": "cima", "fr": "sommet", "ar": "قمة"},
    "осторожный": {"en": "cautious", "es": "cauteloso", "fr": "prudent", "ar": "حذر"},
    "доверчивый.": {"en": "trusting", "es": "confiado", "fr": "confiant", "ar": "ساذج"},
    "переменчивый": {"en": "changeable", "es": "variable", "fr": "changeant", "ar": "متقلب"},
    "неизменный.": {"en": "unchanging", "es": "inmutable", "fr": "immuable", "ar": "ثابت"},
    "практика.": {"en": "practice", "es": "práctica", "fr": "pratique", "ar": "تطبيق"},
    "соглашаться": {"en": "to agree", "es": "estar de acuerdo", "fr": "être d'accord", "ar": "الموافقة"},
    "дискутировать.": {"en": "to debate", "es": "debatir", "fr": "débattre", "ar": "النقاش"},
    "дисциплинированный": {"en": "disciplined", "es": "disciplinado", "fr": "discipliné", "ar": "منضبط"},
    "беспечный.": {"en": "carefree", "es": "despreocupado", "fr": "insouciant", "ar": "لامبالٍ"},
    "знак": {"en": "sign", "es": "señal", "fr": "signe", "ar": "إشارة"},
    "символ.": {"en": "symbol", "es": "símbolo", "fr": "symbole", "ar": "رمز"},
    "стремительный": {"en": "swift", "es": "veloz", "fr": "rapide", "ar": "سريع"},
    "тщательный.": {"en": "thorough", "es": "minucioso", "fr": "minutieux", "ar": "دقيق"},
    "принимать": {"en": "to accept", "es": "aceptar", "fr": "accepter", "ar": "القبول"},
    "изменять.": {"en": "to change", "es": "cambiar", "fr": "changer", "ar": "التغيير"},
    "известный": {"en": "known", "es": "conocido", "fr": "connu", "ar": "معروف"},
    "неизвестный.": {"en": "unknown", "es": "desconocido", "fr": "inconnu", "ar": "مجهول"},
    # Q74 duplicate options already covered by Q8 / Q30 "Вы предпочитаете:"
    "теории.": {"en": "theories", "es": "teorías", "fr": "théories", "ar": "نظريات"},
    "фактов.": {"en": "facts", "es": "hechos", "fr": "faits", "ar": "حقائق"},
    "чувства людей.": {"en": "people's feelings", "es": "los sentimientos de las personas", "fr": "les sentiments des gens", "ar": "مشاعر الناس"},
}


def tr(text: str, lang: str) -> str:
    entry = T.get(text)
    if entry:
        return entry.get(lang, text)
    # Fallback: return original if not found (shouldn't happen)
    return f"[{text}]"


# ── Fetch data ─────────────────────────────────────────────────────────────

print("Fetching questions from API...")
with urllib.request.urlopen(API_URL) as resp:
    data = json.loads(resp.read().decode())

questions = data["versions"][0]["questions"]
print(f"  {len(questions)} questions.")

# ── Build rows ─────────────────────────────────────────────────────────────

LANGS = [("en", "English"), ("es", "Spanish"), ("fr", "French"), ("ar", "Arabic")]
max_opts = max(len(q["options"]) for q in questions)

def opt_headers(i: int) -> list:
    letter = chr(ord("A") + i)
    h = [f"Option {letter} Code", f"Option {letter} Text (RU)"]
    for _, ln in LANGS:
        h.append(f"Option {letter} ({ln})")
    h += [f"Option {letter} Key", f"Option {letter} Score"]
    return h

headers = ["#", "Question Code", "Question Text (RU)"]
for _, ln in LANGS:
    headers.append(f"Question ({ln})")
for i in range(max_opts):
    headers += opt_headers(i)

rows = [headers]
missing = set()

for q in questions:
    row = [q["order"], q["code"], q["text"]]
    for lc, _ in LANGS:
        t = tr(q["text"], lc)
        if t.startswith("["):
            missing.add(q["text"])
        row.append(t)
    for opt in q["options"]:
        key_scores = opt.get("keyScores", [])
        key_code = key_scores[0]["key"]["code"] if key_scores else ""
        score    = key_scores[0]["score"]       if key_scores else ""
        row.append(opt["code"])
        row.append(opt["text"])
        for lc, _ in LANGS:
            t = tr(opt["text"], lc)
            if t.startswith("["):
                missing.add(opt["text"])
            row.append(t)
        row += [key_code, score]
    while len(row) < len(headers):
        row.append("")
    rows.append(row)

# ── Write CSV ──────────────────────────────────────────────────────────────

with open(OUTPUT, "w", newline="", encoding="utf-8-sig") as f:
    csv.writer(f).writerows(rows)

print(f"Saved → {OUTPUT}")
print(f"  {len(rows)-1} question rows × {len(headers)} columns")
if missing:
    print(f"\nWARNING: {len(missing)} texts had no translation entry:")
    for m in sorted(missing):
        print(f"  • {m!r}")
else:
    print("  All texts translated successfully.")
