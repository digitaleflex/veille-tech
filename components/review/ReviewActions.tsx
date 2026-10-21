'use client';

import { useState } from 'react';
import { Copy, FileDown, Printer, Share2 } from 'lucide-react';

interface ReviewActionsProps {
  title: string;
  date: string;
  summary: string;
  analysis: string;
  content: string;
}

export default function ReviewActions({
  title,
  date,
  summary,
  analysis,
  content,
}: ReviewActionsProps) {
  const [status, setStatus] = useState('');

  const markdown = `# ${title}

Date : ${date}

## Résumé

${summary}

## Analyse IA

${analysis}

## Revue complète

${content}
`;

  async function copyReview() {
    try {
      await navigator.clipboard.writeText(markdown);
      setStatus('Revue copiée dans le presse-papiers.');
    } catch {
      setStatus('La copie automatique est indisponible dans ce navigateur.');
    }
  }

  async function shareReview() {
    try {
      if (navigator.share) {
        await navigator.share({ title, text: summary, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setStatus('Lien copié dans le presse-papiers.');
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setStatus('Le partage a échoué.');
      }
    }
  }

  function downloadMarkdown() {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `revue-tech-${date}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setStatus('Fichier Markdown téléchargé.');
  }

  return (
    <div className="sticky bottom-8">
      <div className="mx-auto flex max-w-sm justify-around rounded-full border border-slate-700 bg-dark-800/80 p-3 shadow-lg backdrop-blur-lg">
        <button type="button" onClick={shareReview} aria-label="Partager la revue" className="flex flex-col items-center text-slate-300 transition-colors hover:text-white">
          <Share2 className="h-6 w-6" />
          <span className="mt-1 text-xs">Partager</span>
        </button>
        <button type="button" onClick={() => window.print()} aria-label="Imprimer la revue" className="flex flex-col items-center text-slate-300 transition-colors hover:text-white">
          <Printer className="h-6 w-6" />
          <span className="mt-1 text-xs">Imprimer</span>
        </button>
        <button type="button" onClick={downloadMarkdown} aria-label="Télécharger en Markdown" className="flex flex-col items-center text-slate-300 transition-colors hover:text-white">
          <FileDown className="h-6 w-6" />
          <span className="mt-1 text-xs">Markdown</span>
        </button>
        <button type="button" onClick={copyReview} aria-label="Copier la revue" className="flex flex-col items-center text-slate-300 transition-colors hover:text-white">
          <Copy className="h-6 w-6" />
          <span className="mt-1 text-xs">Copier</span>
        </button>
      </div>
      <p role="status" aria-live="polite" className="mt-2 text-center text-sm text-slate-400">{status}</p>
    </div>
  );
}
