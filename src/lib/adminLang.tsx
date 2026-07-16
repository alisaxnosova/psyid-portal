'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import CATALOG from '@/content/admin.json';

export type AdminLang = 'en' | 'ru';

// Sheet-editable overrides (regenerated from admin.tsv by scripts/sync-content.mjs).
const OVERRIDE = CATALOG as Record<string, Record<string, string>>;
const tr = (k: string, lang: AdminLang): string => OVERRIDE[k]?.[lang] || (T as Record<string, Record<string, string>>)[k]?.[lang] || k;

export const T = {
  // Sidebar nav
  nav_section:      { en: 'Navigation',           ru: 'Навигация'           },
  nav_dashboard:    { en: 'Dashboard',            ru: 'Обзор'               },
  nav_assessments:  { en: 'Cognitive Profiles',    ru: 'Когнитивные профили' },
  nav_answer_key:   { en: 'Answer Key',           ru: 'Ключ ответов'        },
  nav_questions:    { en: 'Questions',            ru: 'Вопросы'             },
  nav_report_tmpls: { en: 'Report Templates',     ru: 'Шаблоны отчётов'     },
  nav_users:        { en: 'Users',                ru: 'Пользователи'        },
  nav_results:      { en: 'Results',              ru: 'Результаты'          },
  nav_career_vault: { en: 'Career Vault',         ru: 'Хранилище профессий' },
  nav_orders:       { en: 'Third Party Orders',   ru: 'Сторонние заказы'    },
  nav_billing:      { en: 'Billing',              ru: 'Финансы'             },
  nav_analytics:    { en: 'Analytics',            ru: 'Аналитика'           },
  nav_assess_ana:   { en: 'Assessment Analytics', ru: 'Аналитика теста'     },
  nav_test:         { en: 'Access Codes',          ru: 'Коды доступа'        },
  nav_to_site:      { en: 'Go to site',           ru: 'На сайт'             },
  nav_logout:       { en: 'Log out',              ru: 'Выйти'               },
  // Common
  loading:       { en: 'Loading...',    ru: 'Загрузка...'        },
  nothing_found: { en: 'Nothing found', ru: 'Ничего не найдено'  },
  coming_soon:   { en: 'Coming soon',   ru: 'В разработке'       },
  in_dev:        { en: 'This section is being built', ru: 'Этот раздел находится в разработке' },
  search:        { en: 'Search...',    ru: 'Поиск...'            },
  all:           { en: 'All',          ru: 'Все'                 },
  filter_compl:  { en: 'Completed',    ru: 'Завершённые'         },
  filter_prog:   { en: 'In Progress',  ru: 'В процессе'          },
  // Dashboard
  dash_title:    { en: 'Dashboard',        ru: 'Обзор'                  },
  dash_sub:      { en: 'Overview · PsyID', ru: 'Общая картина · PsyID'  },
  dash_users:    { en: 'Total Users',      ru: 'Всего пользователей'    },
  dash_started:  { en: 'Tests Started',    ru: 'Тестов начато'          },
  dash_compl:    { en: 'Tests Completed',  ru: 'Тестов завершено'       },
  dash_funnel:   { en: 'Funnel',           ru: 'Воронка'                },
  dash_today:    { en: 'Today',            ru: 'Сегодня'                },
  dash_reg:      { en: 'Registered',       ru: 'Зарегистрировались'     },
  dash_started2: { en: 'Started test',     ru: 'Начали тест'            },
  dash_compl2:   { en: 'Completed test',   ru: 'Завершили тест'         },
  dash_new_u:    { en: 'New users',        ru: 'Новых пользователей'    },
  dash_t_start:  { en: 'Tests started',    ru: 'Тестов начато'          },
  dash_t_compl:  { en: 'Tests completed',  ru: 'Тестов завершено'       },
  // Users
  users_title:  { en: 'Users',                       ru: 'Пользователи'              },
  users_count:  { en: 'accounts',                    ru: 'аккаунтов'                 },
  users_ph:     { en: 'Search by email or name...', ru: 'Поиск по email или имени...' },
  users_none:   { en: 'No users found',              ru: 'Пользователи не найдены'   },
  users_user:   { en: 'User',                        ru: 'Пользователь'              },
  users_tests:  { en: 'Tests',                       ru: 'Тестов'                    },
  users_done:   { en: 'Completed',                   ru: 'Завершено'                 },
  users_joined: { en: 'Joined',                      ru: 'Регистрация'               },
  // Results
  res_title:   { en: 'Results',      ru: 'Результаты'       },
  res_total:   { en: 'total',        ru: 'всего'            },
  res_compl:   { en: 'completed',    ru: 'завершено'        },
  res_prog:    { en: 'in progress',  ru: 'в процессе'       },
  res_user:    { en: 'User',         ru: 'Пользователь'     },
  res_profile: { en: 'Profile',      ru: 'Профиль'          },
  res_status:  { en: 'Status',       ru: 'Статус'           },
  res_date:    { en: 'Date',         ru: 'Дата'             },
  res_anon:    { en: 'Anonymous',    ru: 'Анонимный'        },
  res_done:    { en: 'Completed',    ru: 'Завершён'         },
  res_inprog:  { en: 'In Progress',  ru: 'В процессе'       },
  res_created: { en: 'Created',      ru: 'Создан'           },
  // Assessments / Questions
  ass_title:   { en: 'Test Questions',            ru: 'Вопросы теста'             },
  ass_sub:     { en: 'questions · ReNo v1.2', ru: 'вопросов · ReNo v1.2' },
  ass_search:  { en: 'Search...',                 ru: 'Поиск...'                  },
  ass_save:    { en: 'Save',                      ru: 'Сохранить'                 },
  ass_saved:   { en: 'Saved',                     ru: 'Сохранено'                 },
  ass_edit:    { en: 'Edit',                      ru: 'Редактировать'             },
  ass_cancel:  { en: 'Cancel',                    ru: 'Отмена'                    },
  // Users page
  users_tab_ext:    { en: 'External Users',    ru: 'Внешние пользователи'   },
  users_tab_portal: { en: 'Portal Users',      ru: 'Пользователи портала'   },
  users_tab_admins: { en: 'Admins',            ru: 'Администраторы'          },
  users_ext_none:   { en: 'No external users yet. Assign a name when generating an access code to track them here.', ru: 'Внешних пользователей нет. Укажите имя при создании кода доступа.' },
  users_ext_name:   { en: 'Name',              ru: 'Имя'                     },
  users_ext_codes:  { en: 'Codes',             ru: 'Кодов'                   },
  users_ext_used:   { en: 'Tests Taken',       ru: 'Тестов пройдено'         },
  users_ext_refs:   { en: 'References',        ru: 'Источники'               },
  users_ext_first:  { en: 'First Seen',        ru: 'Первый раз'              },
  users_ext_last:   { en: 'Last Active',       ru: 'Последняя активность'    },
  users_ext_type:   { en: 'Type',              ru: 'Тип'                     },
  users_ext_expand: { en: 'History',           ru: 'История'                 },
  users_ext_code:   { en: 'Code',              ru: 'Код'                     },
  users_ext_result: { en: 'Result',            ru: 'Результат'               },
  users_ext_notest: { en: 'Not taken',         ru: 'Не пройден'              },
  codes_user:       { en: 'User (Optional)',   ru: 'Пользователь (необязательно)' },
  codes_user_ph:    { en: 'e.g. Alisa from Etsy', ru: 'напр. Алиса с Etsy'  },
  codes_col_user:   { en: 'User',              ru: 'Пользователь'            },
  // Answer Key page
  ak_title:    { en: 'Answer Key',                ru: 'Ключ ответов'              },
  ak_sub:      { en: 'Reference grid for all profile descriptions', ru: 'Справочная таблица описаний профилей' },
  // Assessments (slider) page
  sliders_title:  { en: 'Cognitive Profiles',      ru: 'Когнитивные профили'       },
  sliders_sub:    { en: 'Preview cognitive profile report with custom scores', ru: 'Предпросмотр когнитивного профиля' },
  sliders_gen:    { en: 'Generate Report Preview', ru: 'Сгенерировать отчёт'      },
  sliders_regen:  { en: 'Regenerate',             ru: 'Перегенерировать'          },
  sliders_lang:   { en: 'Report Language',        ru: 'Язык отчёта'              },
  sliders_preview:{ en: 'Report Preview',         ru: 'Предпросмотр отчёта'       },
  sliders_gen_report: { en: 'Generate Report',    ru: 'Создать отчёт'             },
  sliders_dl_pdf: { en: 'Download PDF',           ru: 'Скачать PDF'               },
  // Access Codes page
  codes_title:       { en: 'Access Codes',                       ru: 'Коды доступа'                        },
  codes_sub:         { en: 'Generate single-use test access codes', ru: 'Создание одноразовых кодов доступа'  },
  codes_gen_heading: { en: 'Generate a Code',                    ru: 'Создать код'                         },
  codes_invoice:     { en: 'Invoice / Reference',                ru: 'Счёт / Источник'                     },
  codes_invoice_ph:  { en: 'e.g. Etsy Order #12345',             ru: 'напр. Etsy Заказ #12345'             },
  codes_note:        { en: 'Note',                               ru: 'Заметка'                             },
  codes_note_ph:     { en: 'Optional note',                      ru: 'Необязательная заметка'              },
  codes_gen_btn:     { en: 'Generate Code',                      ru: 'Создать код'                         },
  codes_open_test:   { en: 'Open Test Page ↗',                   ru: 'Открыть тест ↗'                      },
  codes_copy:        { en: 'Copy',                               ru: 'Копировать'                          },
  codes_copied:      { en: 'Copied!',                            ru: 'Скопировано!'                        },
  codes_list_title:  { en: 'Generated Codes',                    ru: 'Созданные коды'                      },
  codes_col_code:    { en: 'Code',                               ru: 'Код'                                 },
  codes_col_status:  { en: 'Status',                             ru: 'Статус'                              },
  codes_col_invoice: { en: 'Invoice Ref',                        ru: 'Счёт'                                },
  codes_col_note:    { en: 'Note',                               ru: 'Заметка'                             },
  codes_col_created: { en: 'Created',                            ru: 'Создан'                              },
  codes_col_used:    { en: 'Used',                               ru: 'Использован'                         },
  codes_none:        { en: 'No codes generated yet',             ru: 'Коды ещё не созданы'                 },
  codes_unused:      { en: 'Unused',                             ru: 'Не использован'                      },
  codes_used:        { en: 'Used',                               ru: 'Использован'                         },
  codes_local_note:  { en: 'Stored locally — backend sync coming', ru: 'Хранится локально — синхронизация скоро' },
  codes_del:         { en: 'Delete',                             ru: 'Удалить'                             },
} as const;

export type TKey = keyof typeof T;

interface LangCtx {
  lang: AdminLang;
  setLang: (l: AdminLang) => void;
  t: (key: TKey) => string;
}

const Ctx = createContext<LangCtx>({
  lang: 'en',
  setLang: () => {},
  t: (k) => T[k].en,
});

export function AdminLangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<AdminLang>('en');

  useEffect(() => {
    const s = localStorage.getItem('psyid-admin-lang') as AdminLang | null;
    if (s === 'en' || s === 'ru') setLangState(s);
  }, []);

  function setLang(l: AdminLang) {
    setLangState(l);
    localStorage.setItem('psyid-admin-lang', l);
  }

  return (
    <Ctx.Provider value={{ lang, setLang, t: (k) => tr(k as string, lang) }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAdminLang = () => useContext(Ctx);
