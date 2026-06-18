'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export type AdminLang = 'en' | 'ru';

export const T = {
  // Sidebar nav
  nav_section:      { en: 'Navigation',           ru: 'Навигация'           },
  nav_dashboard:    { en: 'Dashboard',            ru: 'Обзор'               },
  nav_assessments:  { en: 'Assessments',          ru: 'Тест'                },
  nav_report_tmpls: { en: 'Report Templates',     ru: 'Шаблоны отчётов'     },
  nav_users:        { en: 'Users',                ru: 'Пользователи'        },
  nav_results:      { en: 'Results',              ru: 'Результаты'          },
  nav_orders:       { en: 'Third Party Orders',   ru: 'Сторонние заказы'    },
  nav_billing:      { en: 'Billing',              ru: 'Финансы'             },
  nav_analytics:    { en: 'Analytics',            ru: 'Аналитика'           },
  nav_assess_ana:   { en: 'Assessment Analytics', ru: 'Аналитика теста'     },
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
  ass_sub:     { en: 'questions · TestPersonal v1', ru: 'вопросов · TestPersonal v1' },
  ass_search:  { en: 'Search...',                 ru: 'Поиск...'                  },
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
    <Ctx.Provider value={{ lang, setLang, t: (k) => T[k][lang] }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAdminLang = () => useContext(Ctx);
