import type { Metadata } from 'next';
import MethodologyView from './MethodologyView';

export const metadata: Metadata = {
  title: 'Методология · ReNo 2.0 — PsyID',
  description: 'Как ReNo читает тебя: пять осей, полюс и полоса, честная погрешность на каждом утверждении. · The shape of the ReNo method behind PsyID.',
};

export default function MethodologyPage() {
  return <MethodologyView />;
}
