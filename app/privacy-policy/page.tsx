import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for shiras.dev, including information about cookies, advertising, and contact details.',
  alternates: { canonical: '/privacy-policy/' },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(28px, 6vw, 72px) 22px', color: '#172033', lineHeight: 1.75 }}>
      <a href="/" style={{ color: '#0879dc', textDecoration: 'none' }}>← Back to shiras.dev</a>
      <h1 style={{ fontSize: 'clamp(32px, 5vw, 46px)', lineHeight: 1.15, marginTop: 28 }}>Privacy Policy</h1>
      <p><strong>Last updated:</strong> 14 October 2026</p>
      <p>This Privacy Policy explains how shiras.dev (the “Website”), operated by Shiras VM, handles information when you visit the Website or contact me. The Website is a personal developer portfolio and project showcase.</p>
      <h2>Information you provide</h2>
      <p>If you contact me by email or through a contact feature, I may receive the information you choose to provide, such as your name, email address, and message. I use it to respond to your enquiry and do not sell this information.</p>
      <h2>Cookies and similar technologies</h2>
      <p>The Website and third-party services may use cookies or similar technologies for functionality, security, analytics, advertising, frequency capping, and measuring ad performance. Your browser settings may allow you to control cookies. Blocking some cookies may affect certain features.</p>
      <h2>Google AdSense and advertising</h2>
      <p>This Website may display advertisements provided by Google AdSense and its partners. Third-party vendors, including Google, may use cookies or similar technologies to serve ads, measure performance, prevent fraud, and, where permitted and based on your settings or consent, personalize advertising. Google's use of information is governed by its own policies. Learn more at <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">How Google uses information from sites or apps that use its services</a> and review <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a>.</p>
      <p>You can manage Google ad personalization through <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer">My Ad Center</a>, where available. Depending on your location, applicable laws and Google's requirements, the Website may present consent or privacy choices before using certain advertising technologies.</p>
      <h2>Third-party services and links</h2>
      <p>The Website may link to third-party websites or services, such as GitHub, LinkedIn, and project demos. Those services operate under their own privacy policies. I do not control their practices.</p>
      <h2>Data retention and security</h2>
      <p>Information sent to me is retained only as reasonably necessary to respond to enquiries, maintain records, and meet legal obligations. No website or transmission method can be guaranteed completely secure.</p>
      <h2>Children's privacy</h2>
      <p>This Website is intended as a professional portfolio and is not directed at children. Please do not submit personal information about children through the Website.</p>
      <h2>Changes to this policy</h2>
      <p>This policy may be updated when the Website or its services change. The “Last updated” date above will be revised when material changes are made.</p>
      <h2>Contact</h2>
      <p>For questions about this Privacy Policy, contact <a href="mailto:shiras.vm@gmail.com">shiras.vm@gmail.com</a>.</p>
      <p style={{ marginTop: 40, fontSize: 13, color: '#667085' }}>This page provides general privacy information and is not legal advice. Update it if your data practices or services change.</p>
    </main>
  );
}
