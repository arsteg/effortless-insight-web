import { LandingHeader } from './landing-header'
import { LandingFooter } from './landing-footer'

export interface LegalSection {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

/**
 * Shared shell for the legal pages (privacy, terms, refund). Plain,
 * readable prose — no marketing styling, generous line length limits.
 */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string
  updated: string
  intro: string
  sections: LegalSection[]
}) {
  return (
    <main className="min-h-screen bg-white">
      <LandingHeader />
      <article className="container mx-auto px-4 pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: {updated}</p>
          <p className="mt-6 leading-relaxed text-gray-700">{intro}</p>

          {sections.map((section) => (
            <section key={section.heading} className="mt-10">
              <h2 className="text-xl font-semibold text-gray-950">{section.heading}</h2>
              {section.paragraphs.map((para) => (
                <p key={para.slice(0, 40)} className="mt-3 leading-relaxed text-gray-700">
                  {para}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
                  {section.bullets.map((bullet) => (
                    <li key={bullet.slice(0, 40)} className="leading-relaxed">
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="font-semibold text-gray-950">Questions?</h2>
            <p className="mt-2 text-gray-700">
              Write to{' '}
              <a
                href="mailto:info@arsteg.com"
                className="font-medium text-primary-600 underline-offset-2 hover:underline"
              >
                info@arsteg.com
              </a>{' '}
              and a real person will reply.
            </p>
          </section>
        </div>
      </article>
      <LandingFooter />
    </main>
  )
}
