import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'ReplyPilot AI - Conversation Analysis, Strategic Replies & CRM Integration',
  description: 'Understand the conversation, get structured facts vs interpretations, generate calibrated replies with 13 rewrites, determine Next Best Action, and seamlessly sync with popular CRMs.',
  openGraph: {
    title: 'ReplyPilot AI - Conversation Analysis & Reply Assistant',
    description: 'Understand the conversation, get structured facts vs interpretations, generate calibrated replies with 13 rewrites, determine Next Best Action, and seamlessly sync with popular CRMs.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReplyPilot AI',
    description: 'Conversation analyzer, AI reply strategist, and CRM contact manager.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
