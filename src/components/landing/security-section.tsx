import {
  ShieldCheck,
  Fingerprint,
  KeyRound,
  MapPin,
  Lock,
  ScrollText,
  Building2,
  MonitorSmartphone,
  Landmark,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

/**
 * The single security section on the page: how access works (the flow),
 * the six facts that matter, and the compliance posture — once, strongly.
 *
 * TODO(marketing): add ISO 27001 / SOC 2 badges here ONLY once certification
 * is actually complete — do not claim them before.
 * TODO(marketing): if/when the licensed-GSP integration goes live, this is
 * where to say "Licensed GSP connection" — it is deliberately NOT claimed now
 * because the GSP pathway is not the active sync mechanism.
 */

const flow = [
  {
    icon: Building2,
    title: 'You authorize',
    sub: 'OTP sent to your registered GST mobile — takes 2 minutes',
  },
  {
    icon: MonitorSmartphone,
    title: 'EffortlessInsight',
    sub: 'Holds only an encrypted session token — never your password',
  },
  {
    icon: ShieldCheck,
    title: 'Secure gateway',
    sub: 'Encrypted, authorized access — no credentials shared',
  },
  {
    icon: Landmark,
    title: 'GST Portal',
    sub: 'gst.gov.in — the official source of every notice',
  },
]

const facts = [
  {
    icon: ShieldCheck,
    title: 'Access you control',
    body: 'The connection to the GST portal is authorized by you and only reads your notices. Nothing is filed, changed or submitted without you.',
  },
  {
    icon: Fingerprint,
    title: 'You authorize with OTP',
    body: 'Access is granted by you, with the same OTP the portal sends you. Revoke it anytime — tokens are invalidated immediately.',
  },
  {
    icon: KeyRound,
    title: 'We never store your password',
    body: 'Your GST portal password is never asked for, never seen, never saved. Only encrypted session tokens are retained.',
  },
  {
    icon: MapPin,
    title: 'Your data is stored in India',
    body: 'All storage and backups live in Indian data centres (Mumbai region), in line with Indian data-protection requirements.',
  },
  {
    icon: Lock,
    title: 'Encrypted in transit and at rest',
    body: 'TLS on every connection; sensitive fields like session tokens and GSTINs protected with AES-256 encryption.',
  },
  {
    icon: ScrollText,
    title: 'Every action logged',
    body: 'A full audit trail of every sync, retrieval and access event, with timestamps — exportable for your auditors.',
  },
]

const compliance = [
  'DPDP Act 2023 aligned',
  '8-year record retention',
  'Role-based access with 2FA',
  'Account lockout & session controls',
]

export function SecuritySection() {
  return (
    <section id="security" className="scroll-mt-header relative overflow-hidden bg-gray-950 py-14 text-white md:py-20">
      {/* Ambient glow so the dark section feels lit, not flat */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary-500/10 blur-3xl"
      />
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center rounded-full border border-primary-500/30 bg-primary-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-300">
            Security
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Your tax data. Treated like tax data.
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            How access works, and six facts worth knowing before you connect
            anything to your GSTIN.
          </p>
        </div>

        {/* Access flow */}
        <div className="mx-auto mt-10 max-w-5xl">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-stretch">
            {flow.map((node, i) => (
              <div key={node.title} className="contents">
                <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5 text-center">
                  <node.icon className="mx-auto h-5 w-5 text-primary-400" aria-hidden />
                  <p className="mt-2.5 text-sm font-semibold text-white">{node.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-400">{node.sub}</p>
                </div>
                {i < flow.length - 1 && (
                  <div className="hidden items-center justify-center text-gray-600 md:flex">
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Six facts */}
        <div className="mx-auto mt-10 grid max-w-5xl gap-px overflow-hidden rounded-2xl border border-gray-800 bg-gray-800 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.title} className="group bg-gray-950 p-8 transition-colors hover:bg-gray-900/80">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 ring-1 ring-primary-500/30">
                <fact.icon className="h-5 w-5 text-primary-400" aria-hidden />
              </span>
              <h3 className="mt-4 font-semibold text-white">{fact.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">{fact.body}</p>
            </div>
          ))}
        </div>

        {/* Compliance posture */}
        <div className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-2.5">
          {compliance.map((item) => (
            <span
              key={item}
              className="rounded-full border border-gray-800 bg-gray-900/60 px-4 py-1.5 text-xs font-medium text-gray-300"
            >
              {item}
            </span>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-gray-400">
          More questions about access, encryption or disconnecting? The{' '}
          <Link href="#faq" className="text-primary-400 underline-offset-2 hover:underline">
            security FAQ
          </Link>{' '}
          covers the details.
        </p>
      </div>
    </section>
  )
}
