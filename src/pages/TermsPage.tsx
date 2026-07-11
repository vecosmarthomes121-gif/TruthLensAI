import { FileText, AlertTriangle, Shield, Zap, Ban, HelpCircle, Scale, Globe, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const EFFECTIVE_DATE = 'July 1, 2026';
const CONTACT_EMAIL = 'legal@verolente.ai';

function Section({ id, icon: Icon, title, children }: { id: string; icon: any; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12 scroll-mt-24">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
          <Icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
      </div>
      <div className="space-y-3 text-muted-foreground leading-relaxed text-sm">
        {children}
      </div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0 mt-2" />
      <span>{children}</span>
    </li>
  );
}

export default function TermsPage() {
  const toc = [
    { id: 'acceptance', label: 'Acceptance' },
    { id: 'the-service', label: 'The Service' },
    { id: 'your-account', label: 'Your Account' },
    { id: 'acceptable-use', label: 'Acceptable Use' },
    { id: 'prohibited', label: 'Prohibited Conduct' },
    { id: 'content', label: 'Your Content' },
    { id: 'disclaimers', label: 'Disclaimers' },
    { id: 'liability', label: 'Limitation of Liability' },
    { id: 'termination', label: 'Termination' },
    { id: 'governing-law', label: 'Governing Law' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-700 to-blue-700 py-16 text-white">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-8 w-8" />
            <span className="text-purple-200 text-sm font-semibold uppercase tracking-widest">Legal</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
          <p className="text-purple-100 text-lg">
            By using VeroLente AI you agree to these terms. Please read them — they are written to be understood.
          </p>
          <p className="text-purple-200 text-sm mt-4">Effective date: {EFFECTIVE_DATE}</p>
        </div>
      </div>

      <div className="container max-w-4xl py-12">
        <div className="lg:grid lg:grid-cols-[220px_1fr] gap-12 items-start">

          {/* Table of Contents */}
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
              <Link to="/privacy" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">Privacy Policy →</Link>
            </div>
          </aside>

          {/* Main content */}
          <article>
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 mb-10 text-sm text-amber-800 dark:text-amber-200">
              <strong>Important:</strong> VeroLente AI is an AI-powered verification tool. Our results are informational and should not be treated as legal, journalistic, or professional fact-checking conclusions. Always exercise independent judgment before acting on a result.
            </div>

            <Section id="acceptance" icon={FileText} title="Acceptance of Terms">
              <p>By accessing or using VeroLente AI ("the Service"), including via our website, mobile web experience, browser extension, or API, you agree to be bound by these Terms of Service ("Terms").</p>
              <p>If you do not agree to these Terms, do not use the Service. If you are using the Service on behalf of an organisation, you represent that you have authority to bind that organisation to these Terms.</p>
            </Section>

            <Section id="the-service" icon={Zap} title="The Service">
              <p>VeroLente AI provides AI-powered verification and deepfake detection tools, including:</p>
              <ul className="space-y-1.5 ml-1 mt-2">
                <Bullet>Text claim and news article fact-checking using AI and live web search</Bullet>
                <Bullet>Image deepfake and AI-generation detection using third-party forensic APIs</Bullet>
                <Bullet>Video content analysis for deepfakes and misinformation indicators</Bullet>
                <Bullet>Audio voice-clone and synthetic speech detection</Bullet>
                <Bullet>Team collaboration tools for professional fact-checking workflows</Bullet>
              </ul>
              <p className="mt-3">We reserve the right to modify, suspend, or discontinue any part of the Service at any time with reasonable notice. We are not liable to you for any changes to or discontinuation of the Service.</p>
            </Section>

            <Section id="your-account" icon={Shield} title="Your Account">
              <p>To access certain features you must create an account. You are responsible for:</p>
              <ul className="space-y-1.5 ml-1 mt-2">
                <Bullet>Providing accurate and current information when registering.</Bullet>
                <Bullet>Keeping your password confidential and not sharing access with others.</Bullet>
                <Bullet>All activity that occurs under your account.</Bullet>
                <Bullet>Notifying us immediately at <a href={`mailto:${CONTACT_EMAIL}`} className="text-purple-600 dark:text-purple-400 hover:underline">{CONTACT_EMAIL}</a> if you suspect unauthorised access.</Bullet>
              </ul>
              <p className="mt-3">You must be at least 13 years old to create an account. Users between 13 and 18 must have parental consent.</p>
            </Section>

            <Section id="acceptable-use" icon={Scale} title="Acceptable Use">
              <p>You may use VeroLente AI only for lawful purposes and in accordance with these Terms. Permitted uses include:</p>
              <ul className="space-y-1.5 ml-1 mt-2">
                <Bullet>Verifying the authenticity of news claims, images, videos, or audio for personal, journalistic, or research purposes.</Bullet>
                <Bullet>Integrating our API into your own applications to provide verification functionality to your users.</Bullet>
                <Bullet>Collaborating with team members on verification workflows within our Teams features.</Bullet>
              </ul>
            </Section>

            <Section id="prohibited" icon={Ban} title="Prohibited Conduct">
              <p>You must not use the Service to:</p>
              <ul className="space-y-1.5 ml-1 mt-2">
                <Bullet>Submit content that infringes copyright, trademarks, or other intellectual property rights.</Bullet>
                <Bullet>Harass, threaten, or harm any individual or group.</Bullet>
                <Bullet>Attempt to deceive or manipulate our AI systems.</Bullet>
                <Bullet>Reverse-engineer, decompile, or extract our models or proprietary algorithms.</Bullet>
                <Bullet>Circumvent rate limits, access controls, or security measures.</Bullet>
                <Bullet>Resell or sublicense access to the Service without our written permission.</Bullet>
                <Bullet>Submit illegal content including child sexual abuse material (CSAM), which will be reported to authorities.</Bullet>
                <Bullet>Use automated scripts or bots to make excessive requests beyond your plan's rate limits.</Bullet>
              </ul>
              <p className="mt-3">Violations may result in immediate account suspension without refund.</p>
            </Section>

            <Section id="content" icon={FileText} title="Your Content">
              <p>You retain ownership of any content you submit to the Service. By submitting content, you grant VeroLente AI a limited, non-exclusive, royalty-free licence to process your content solely to deliver the verification results back to you.</p>
              <p>We do not use your submitted content to train AI models, sell it to third parties, or make it publicly accessible except where you explicitly share a result (e.g., via a public result link).</p>
              <p>You represent that you have the right to submit any content you provide, and that it does not violate any law or third-party rights.</p>
            </Section>

            <Section id="disclaimers" icon={AlertTriangle} title="Disclaimers">
              <p>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.</p>
              <ul className="space-y-1.5 ml-1 mt-2">
                <Bullet><strong>Accuracy:</strong> AI verification is probabilistic. VeroLente AI results may be incorrect, incomplete, or outdated. Do not treat results as definitive truth.</Bullet>
                <Bullet><strong>No professional advice:</strong> Results do not constitute legal, medical, journalistic, or financial advice.</Bullet>
                <Bullet><strong>Third-party content:</strong> We are not responsible for the accuracy or availability of sources cited in results.</Bullet>
                <Bullet><strong>Uptime:</strong> We do not guarantee 100% uptime. Scheduled maintenance and unexpected outages may occur.</Bullet>
              </ul>
            </Section>

            <Section id="liability" icon={HelpCircle} title="Limitation of Liability">
              <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, VEROLENTE AI AND ITS DIRECTORS, EMPLOYEES, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.</p>
              <p>Our total liability to you for any claim arising from or related to the Service shall not exceed the amount you paid us in the 12 months preceding the claim, or $100, whichever is greater.</p>
            </Section>

            <Section id="termination" icon={Ban} title="Termination">
              <p>You may terminate your account at any time by contacting us or using the account deletion feature. Upon termination, your data will be deleted in accordance with our <Link to="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline">Privacy Policy</Link>.</p>
              <p>We may suspend or terminate your account if you violate these Terms, or for any other reason at our discretion. We will make reasonable efforts to notify you before termination unless your conduct requires immediate action (e.g., illegal activity).</p>
            </Section>

            <Section id="governing-law" icon={Globe} title="Governing Law">
              <p>These Terms are governed by and construed in accordance with the laws of England and Wales, without regard to conflict-of-law provisions. Any dispute arising from these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
              <p>If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.</p>
              <p>These Terms constitute the entire agreement between you and VeroLente AI regarding the Service and supersede any prior agreements.</p>
            </Section>

            <Section id="contact" icon={Mail} title="Contact">
              <p>For any questions about these Terms, contact our legal team:</p>
              <div className="bg-muted/50 border rounded-xl p-5 mt-3">
                <p className="font-semibold text-foreground mb-1">VeroLente AI — Legal Team</p>
                <p>Email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-purple-600 dark:text-purple-400 hover:underline">{CONTACT_EMAIL}</a></p>
                <p className="mt-2 text-xs text-muted-foreground">We aim to respond within 14 business days.</p>
              </div>
            </Section>

            <div className="border-t pt-8 flex items-center justify-between flex-wrap gap-4">
              <p className="text-sm text-muted-foreground">Last updated: {EFFECTIVE_DATE}</p>
              <Link to="/privacy" className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-semibold">Read our Privacy Policy →</Link>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
