import { Shield, Database, Eye, Lock, Mail, RefreshCw, Trash2, Globe, Cookie, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const EFFECTIVE_DATE = 'July 1, 2026';
const CONTACT_EMAIL = 'privacy@verolente.ai';

function Section({ id, icon: Icon, title, children }: { id: string; icon: any; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12 scroll-mt-24">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
          <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
      </div>
      <div className="pl-13 space-y-3 text-muted-foreground leading-relaxed text-sm">
        {children}
      </div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
      <span>{children}</span>
    </li>
  );
}

export default function PrivacyPage() {
  const toc = [
    { id: 'data-we-collect', label: 'Data We Collect' },
    { id: 'how-we-use-it', label: 'How We Use It' },
    { id: 'data-sharing', label: 'Data Sharing' },
    { id: 'cookies', label: 'Cookies & Storage' },
    { id: 'your-rights', label: 'Your Rights' },
    { id: 'data-retention', label: 'Data Retention' },
    { id: 'security', label: 'Security' },
    { id: 'children', label: "Children's Privacy" },
    { id: 'contact', label: 'Contact Us' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 py-16 text-white">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8" />
            <span className="text-blue-200 text-sm font-semibold uppercase tracking-widest">Legal</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-blue-100 text-lg">
            We believe in being clear and honest about what data we collect and how we use it.
          </p>
          <p className="text-blue-200 text-sm mt-4">Effective date: {EFFECTIVE_DATE}</p>
        </div>
      </div>

      <div className="container max-w-4xl py-12">
        <div className="lg:grid lg:grid-cols-[220px_1fr] gap-12 items-start">

          {/* Table of Contents (sticky sidebar on desktop) */}
          <aside className="hidden lg:block sticky top-24">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">On This Page</p>
            <nav className="space-y-1">
              {toc.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="block text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all py-1"
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="mt-6 pt-6 border-t">
              <Link to="/terms" className="text-sm text-blue-600 hover:underline">Terms of Service →</Link>
            </div>
          </aside>

          {/* Main content */}
          <article>
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 mb-10 text-sm text-blue-800 dark:text-blue-200">
              <strong>Summary:</strong> VeroLente AI only collects the data it needs to provide the verification service. We do not sell your data, we do not train AI models on your submissions, and we give you full control to delete your account and data at any time.
            </div>

            <Section id="data-we-collect" icon={Database} title="Data We Collect">
              <p>We collect two categories of data: information you give us directly, and information collected automatically as you use our service.</p>
              <p className="font-semibold text-foreground mt-3 mb-1">Information you provide</p>
              <ul className="space-y-1.5 ml-1">
                <Bullet><strong>Account information:</strong> Email address and username when you register.</Bullet>
                <Bullet><strong>Verification submissions:</strong> Text claims, URLs, images, videos, and audio files you submit for analysis.</Bullet>
                <Bullet><strong>API keys:</strong> If you request API access, we store your API key securely.</Bullet>
                <Bullet><strong>Communications:</strong> Messages you send us via email or support channels.</Bullet>
              </ul>
              <p className="font-semibold text-foreground mt-3 mb-1">Information collected automatically</p>
              <ul className="space-y-1.5 ml-1">
                <Bullet><strong>Usage data:</strong> Pages visited, features used, and time spent — to understand how the product is used.</Bullet>
                <Bullet><strong>Device data:</strong> Browser type, operating system, and screen resolution.</Bullet>
                <Bullet><strong>IP address:</strong> Collected briefly for rate-limiting and fraud prevention, then discarded.</Bullet>
              </ul>
            </Section>

            <Section id="how-we-use-it" icon={Eye} title="How We Use Your Data">
              <p>We use your data only for the purposes described here:</p>
              <ul className="space-y-1.5 ml-1 mt-2">
                <Bullet>To deliver verification results — your submissions are sent to our AI systems and third-party detection APIs (BitMind, SightEngine, Reality Defender, Serper) solely to produce results for you.</Bullet>
                <Bullet>To maintain your verification history if you are logged in.</Bullet>
                <Bullet>To improve the reliability and accuracy of our service.</Bullet>
                <Bullet>To send you service notifications (verification complete, account updates). We do not send marketing emails without your explicit consent.</Bullet>
                <Bullet>To detect and prevent abuse, fraud, and API misuse.</Bullet>
              </ul>
              <p className="mt-3 font-semibold text-foreground">We do not use your submissions to train AI models.</p>
            </Section>

            <Section id="data-sharing" icon={Globe} title="Data Sharing">
              <p>We do not sell, rent, or trade your personal data. We share data only in these limited circumstances:</p>
              <ul className="space-y-1.5 ml-1 mt-2">
                <Bullet><strong>Third-party detection APIs:</strong> Submitted media (images, audio, video URLs) is sent to BitMind, SightEngine, and Reality Defender for analysis. These providers process data under their own privacy policies.</Bullet>
                <Bullet><strong>Serper (web search):</strong> Claim text is sent to Serper to retrieve relevant news and web results. No personal data is included.</Bullet>
                <Bullet><strong>Supabase (database & storage):</strong> Our infrastructure provider stores verification records and uploaded media.</Bullet>
                <Bullet><strong>Legal requirements:</strong> We may disclose data if required by law, court order, or to protect the rights and safety of users.</Bullet>
              </ul>
            </Section>

            <Section id="cookies" icon={Cookie} title="Cookies & Local Storage">
              <p>We use a minimal set of cookies and browser storage:</p>
              <ul className="space-y-1.5 ml-1 mt-2">
                <Bullet><strong>Authentication session:</strong> A secure HTTP-only cookie keeps you logged in. It expires after 7 days of inactivity.</Bullet>
                <Bullet><strong>Theme preference:</strong> Stored in <code className="bg-muted px-1 rounded text-xs">localStorage</code> under the key <code className="bg-muted px-1 rounded text-xs">verolente-theme</code> to remember your light/dark mode choice.</Bullet>
                <Bullet><strong>No advertising cookies:</strong> We do not use any third-party advertising or tracking cookies.</Bullet>
              </ul>
              <p className="mt-3">You can clear cookies and local storage at any time via your browser settings. Clearing the session cookie will log you out.</p>
            </Section>

            <Section id="your-rights" icon={RefreshCw} title="Your Rights">
              <p>Depending on your location (including GDPR in the EU and UK, and CCPA in California), you have the following rights:</p>
              <ul className="space-y-1.5 ml-1 mt-2">
                <Bullet><strong>Access:</strong> Request a copy of all data we hold about you.</Bullet>
                <Bullet><strong>Rectification:</strong> Ask us to correct inaccurate data.</Bullet>
                <Bullet><strong>Erasure:</strong> Request deletion of your account and all associated data.</Bullet>
                <Bullet><strong>Portability:</strong> Receive your verification history in JSON format.</Bullet>
                <Bullet><strong>Objection:</strong> Object to certain uses of your data.</Bullet>
                <Bullet><strong>Restriction:</strong> Request that we limit processing of your data while a dispute is resolved.</Bullet>
              </ul>
              <p className="mt-3">To exercise any of these rights, email us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 dark:text-blue-400 hover:underline">{CONTACT_EMAIL}</a>. We will respond within 30 days.</p>
            </Section>

            <Section id="data-retention" icon={Trash2} title="Data Retention">
              <ul className="space-y-1.5 ml-1">
                <Bullet><strong>Verification history:</strong> Kept for as long as your account is active. You can delete individual verifications from your History page at any time.</Bullet>
                <Bullet><strong>Uploaded media:</strong> Stored in Supabase Storage. Deleted when you delete the associated verification.</Bullet>
                <Bullet><strong>Account data:</strong> Permanently deleted within 30 days of account deletion request.</Bullet>
                <Bullet><strong>Anonymous verifications:</strong> Verifications made without logging in are retained for 90 days, then purged.</Bullet>
              </ul>
            </Section>

            <Section id="security" icon={Lock} title="Security">
              <p>We take security seriously and apply the following measures:</p>
              <ul className="space-y-1.5 ml-1 mt-2">
                <Bullet>All data is transmitted over TLS 1.3 (HTTPS).</Bullet>
                <Bullet>Data at rest is encrypted using AES-256.</Bullet>
                <Bullet>API keys and secrets are stored server-side only, never exposed to the client.</Bullet>
                <Bullet>Row-level security (RLS) policies ensure each user can only access their own data.</Bullet>
                <Bullet>We perform regular security reviews.</Bullet>
              </ul>
              <p className="mt-3">No method of transmission over the internet is 100% secure. If you discover a security vulnerability, please report it to <a href="mailto:security@verolente.ai" className="text-blue-600 dark:text-blue-400 hover:underline">security@verolente.ai</a>.</p>
            </Section>

            <Section id="children" icon={Bell} title="Children's Privacy">
              <p>VeroLente AI is not intended for children under the age of 13. We do not knowingly collect data from anyone under 13. If you believe a child has provided us personal data, please contact us and we will delete it immediately.</p>
            </Section>

            <Section id="contact" icon={Mail} title="Contact Us">
              <p>If you have questions about this Privacy Policy or want to exercise your rights, contact us:</p>
              <div className="mt-3 bg-muted/50 border rounded-xl p-5">
                <p className="font-semibold text-foreground mb-1">VeroLente AI — Privacy Team</p>
                <p>Email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 dark:text-blue-400 hover:underline">{CONTACT_EMAIL}</a></p>
                <p className="mt-2 text-xs text-muted-foreground">We aim to respond to all privacy requests within 30 days.</p>
              </div>
              <p className="mt-4">This policy may be updated from time to time. We will notify registered users by email of any material changes. The effective date at the top of this page shows when it was last revised.</p>
            </Section>

            <div className="border-t pt-8 flex items-center justify-between flex-wrap gap-4">
              <p className="text-sm text-muted-foreground">Last updated: {EFFECTIVE_DATE}</p>
              <Link to="/terms" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold">Read our Terms of Service →</Link>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
