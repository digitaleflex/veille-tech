import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/server/prisma';
import { Share2, Printer, FileDown, Copy } from 'lucide-react';

async function getReview(date: string, viewerUserId?: string) {
  return prisma.review.findFirst({
    where: viewerUserId
      ? { date, OR: [{ isPublic: true }, { userId: viewerUserId }] }
      : { date, isPublic: true },
    include: {
      ReviewToTag: { include: { tags: true } },
      sources: true,
      user: { select: { username: true } },
    },
  });
}

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const review = await getReview(date, session?.user?.id);

  if (!review) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <article className="prose prose-invert max-w-none">
        <header className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">{review.formattedDate}</h1>
          <div className="text-slate-400">
            <span>Par {review.user?.username || 'Auteur inconnu'}</span>
            <span className="mx-2">•</span>
            <span>{review.dominantCategory}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {review.ReviewToTag.map((reviewToTag) => (
              <span
                key={reviewToTag.tags.id}
                className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary"
              >
                {reviewToTag.tags.name}
              </span>
            ))}
          </div>
        </header>

        <section className="mb-12">
          <h2 className="mb-4 border-b border-slate-700 pb-2 text-2xl font-semibold">Résumé Flash</h2>
          <p>{review.flashSummary}</p>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 border-b border-slate-700 pb-2 text-2xl font-semibold">Analyse IA</h2>
          <p className="whitespace-pre-wrap">{review.aiAnalysis || ''}</p>
        </section>

        <section className="mb-12">
          <h2 className="mb-4 border-b border-slate-700 pb-2 text-2xl font-semibold">
            Sources ({review.sources.length})
          </h2>
          <ul className="space-y-2">
            {review.sources.map((source) => (
              <li key={source.id}>
                <a
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="sticky bottom-8">
          <div className="mx-auto flex max-w-sm justify-around rounded-full border border-slate-700 bg-dark-800/80 p-3 shadow-lg backdrop-blur-lg">
            <button type="button" aria-label="Partager" className="flex flex-col items-center text-slate-300 transition-colors hover:text-white">
              <Share2 className="h-6 w-6" />
              <span className="mt-1 text-xs">Partager</span>
            </button>
            <button type="button" aria-label="Imprimer" className="flex flex-col items-center text-slate-300 transition-colors hover:text-white">
              <Printer className="h-6 w-6" />
              <span className="mt-1 text-xs">Imprimer</span>
            </button>
            <button type="button" aria-label="Télécharger Markdown" className="flex flex-col items-center text-slate-300 transition-colors hover:text-white">
              <FileDown className="h-6 w-6" />
              <span className="mt-1 text-xs">Markdown</span>
            </button>
            <button type="button" aria-label="Copier" className="flex flex-col items-center text-slate-300 transition-colors hover:text-white">
              <Copy className="h-6 w-6" />
              <span className="mt-1 text-xs">Copier</span>
            </button>
          </div>
        </section>
      </article>
    </div>
  );
}
