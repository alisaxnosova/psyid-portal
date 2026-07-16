import type { Metadata } from 'next';
import ProfessionsView from './ProfessionsView';

export const metadata: Metadata = {
  title: 'Профессии · RIASEC × ReNo — PsyID',
  description: 'Не «кем стать», а где твоя природа работает на тебя. Совпадение на стыке карты интересов RIASEC и твоего профиля ReNo. · Where your nature works for you.',
};

export default function ProfessionsPage() {
  return <ProfessionsView />;
}
