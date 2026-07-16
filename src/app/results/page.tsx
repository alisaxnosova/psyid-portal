import { redirect } from 'next/navigation';

// The legacy on-screen results/passport view is retired. The subscriber's results now
// live in the interactive "personality universe" at /portal. (The admin report viewer
// at /results/report is a separate route and stays.)
export default function ResultsPage() {
  redirect('/portal');
}
