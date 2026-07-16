import type { Metadata } from 'next';
import SourcesView from './SourcesView';

export const metadata: Metadata = {
  title: 'Источники и литература — PsyID',
  description: 'Работы, на которых стоит методика ReNo. Красота — на поверхности, строгость — на один тап вглубь. · The open science the ReNo method stands on.',
};

export default function SourcesPage() {
  return <SourcesView />;
}
