import type { Metadata } from 'next';
import SourcesView from './SourcesView';

export const metadata: Metadata = {
  title: 'Sources & Literature — PsyID',
  description: 'The open science the ReNo method stands on. Beauty on the surface, rigor one tap deeper.',
};

export default function SourcesPage() {
  return <SourcesView />;
}
