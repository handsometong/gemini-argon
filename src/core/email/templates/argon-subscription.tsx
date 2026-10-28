import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export function ArgonSubscriptionEmail({
  confirmationUrl,
  unsubscribeUrl,
  kind = 'confirmation',
}: {
  confirmationUrl?: string;
  unsubscribeUrl?: string;
  kind?: 'confirmation' | 'update' | 'unsubscribe';
}) {
  const copy =
    kind === 'confirmation'
      ? {
          preview: 'Confirm your Gemini Argon tracker subscription',
          title: 'Confirm your Argon updates',
          body: 'Click the button below to receive source-linked Gemini 4 Argon availability, pricing, and benchmark updates.',
          button: 'Confirm subscription',
          url: confirmationUrl,
          expiry: 'This confirmation link expires in 24 hours.',
        }
      : kind === 'unsubscribe'
        ? {
            preview: 'You have unsubscribed from Gemini Argon updates',
            title: 'Subscription cancelled',
            body: 'You will no longer receive Gemini Argon tracker emails. You can revisit the tracker at any time.',
            button: undefined,
            url: undefined,
            expiry: '',
          }
        : {
            preview: 'Gemini Argon tracker update',
            title: 'Gemini Argon tracker update',
            body: 'There is a new source-linked update to the Gemini 4 Argon tracker.',
            button: 'Open the tracker',
            url: confirmationUrl,
            expiry: '',
          };

  return (
    <Html>
      <Head />
      <Preview>{copy.preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.card}>
            <Section style={styles.accentBar} />
            <Text style={styles.brand}>GEMINI ARGON TRACKER</Text>
            <Heading style={styles.heading}>{copy.title}</Heading>
            <Text style={styles.paragraph}>{copy.body}</Text>
            {copy.button && copy.url ? (
              <Section style={styles.buttonWrap}>
                <Button href={copy.url} style={styles.button}>
                  {copy.button}
                </Button>
              </Section>
            ) : null}
            {copy.expiry ? (
              <Text style={styles.muted}>{copy.expiry}</Text>
            ) : null}
            {copy.url ? (
              <>
                <Hr style={styles.hr} />
                <Text style={styles.small}>
                  If the button does not work, copy this link into your browser:
                </Text>
                <Link href={copy.url} style={styles.link}>
                  {copy.url}
                </Link>
              </>
            ) : null}
            {unsubscribeUrl ? (
              <Text style={styles.footer}>
                Manage your subscription:{' '}
                <Link href={unsubscribeUrl}>unsubscribe</Link>.
              </Text>
            ) : (
              <Text style={styles.footer}>
                Independent, unofficial Gemini 4 Argon tracker. Not affiliated
                with or endorsed by Google.
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    margin: 0,
    padding: 0,
    backgroundColor: '#f6f9fc',
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif',
    color: '#0f172a',
  },
  container: { maxWidth: 560, margin: '0 auto', padding: '32px 16px 40px' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: '28px 24px',
    border: '1px solid rgba(15, 23, 42, .08)',
  },
  accentBar: {
    height: 6,
    borderRadius: 999,
    marginBottom: 20,
    background: 'linear-gradient(90deg,#6366f1,#ec4899,#0ea5e9)',
  },
  brand: {
    margin: '0 0 14px',
    fontSize: 11,
    letterSpacing: '0.16em',
    fontWeight: 700,
    color: '#6366f1',
  },
  heading: { margin: '0 0 12px', fontSize: 25, lineHeight: '32px' },
  paragraph: {
    margin: '0 0 18px',
    fontSize: 14,
    lineHeight: '22px',
    color: '#334155',
  },
  buttonWrap: { textAlign: 'center', margin: '22px 0 14px' },
  button: {
    backgroundColor: '#111827',
    borderRadius: 10,
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    textDecoration: 'none',
    padding: '12px 18px',
  },
  muted: {
    margin: '0 0 8px',
    textAlign: 'center',
    fontSize: 12,
    color: '#64748b',
  },
  hr: { borderColor: 'rgba(15,23,42,.08)', margin: '18px 0' },
  small: { margin: '0 0 6px', fontSize: 12, color: '#64748b' },
  link: { fontSize: 12, color: '#2563eb', wordBreak: 'break-all' },
  footer: {
    margin: '22px 0 0',
    fontSize: 12,
    lineHeight: '18px',
    color: '#94a3b8',
  },
};
