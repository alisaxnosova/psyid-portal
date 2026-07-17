import type { Metadata } from 'next';
import MethodologyView from './MethodologyView';

export const metadata: Metadata = {
  title: 'Methodology · ReNo 2.0 — PsyID',
  description: 'The shape of the ReNo method behind PsyID: five axes, a pole and a band, and an honest margin on every statement.',
};

export default function MethodologyPage() {
  return <MethodologyView />;
}
