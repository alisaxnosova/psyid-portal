import type { Metadata } from 'next';
import ProfessionsView from './ProfessionsView';

export const metadata: Metadata = {
  title: 'Professions · RIASEC × ReNo — PsyID',
  description: 'Not "what to become" but where your nature works for you — the match between the RIASEC interest map and your ReNo profile.',
};

export default function ProfessionsPage() {
  return <ProfessionsView />;
}
