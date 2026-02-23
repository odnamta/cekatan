import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Link,
  Hr,
  Preview,
} from '@react-email/components'

interface ResultNotificationProps {
  orgName: string
  candidateName: string
  assessmentTitle: string
  score: number
  passed: boolean
  actionUrl: string
  unsubscribeUrl: string
}

export default function ResultNotification({
  orgName,
  candidateName,
  assessmentTitle,
  score,
  passed,
  actionUrl,
  unsubscribeUrl,
}: ResultNotificationProps) {
  const statusLabel = passed ? 'LULUS' : 'TIDAK LULUS'
  const statusColor = passed ? '#16a34a' : '#dc2626'
  const statusBg = passed ? '#f0fdf4' : '#fef2f2'
  const statusBorder = passed ? '#bbf7d0' : '#fecaca'

  return (
    <Html lang="id">
      <Head />
      <Preview>
        Hasil Asesmen: {assessmentTitle} — {statusLabel}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerBrand}>Cekatan</Text>
            <Text style={headerOrg}>{orgName}</Text>
          </Section>

          <Hr style={divider} />

          {/* Body */}
          <Section style={content}>
            <Text style={greeting}>Halo {candidateName},</Text>
            <Text style={messageText}>
              Hasil asesmen <strong>{assessmentTitle}</strong> Anda telah tersedia.
            </Text>

            {/* Score Card */}
            <Section
              style={{
                ...scoreCard,
                backgroundColor: statusBg,
                border: `1px solid ${statusBorder}`,
              }}
            >
              <Text style={scoreLabel}>Skor Anda:</Text>
              <Text style={scoreValue}>{score}</Text>
              <Text
                style={{
                  ...statusBadge,
                  color: statusColor,
                  backgroundColor: statusBg,
                  border: `1px solid ${statusBorder}`,
                }}
              >
                {statusLabel}
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={actionButton} href={actionUrl}>
                Lihat Detail Hasil
              </Button>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Email ini dikirim oleh Cekatan atas nama {orgName}.
            </Text>
            <Link href={unsubscribeUrl} style={unsubscribeLink}>
              Berhenti berlangganan
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: 0,
  padding: 0,
}

const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  overflow: 'hidden',
  marginTop: '40px',
  marginBottom: '40px',
  border: '1px solid #e2e8f0',
}

const header: React.CSSProperties = {
  backgroundColor: '#1e40af',
  padding: '24px 32px',
}

const headerBrand: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 4px 0',
  letterSpacing: '-0.5px',
}

const headerOrg: React.CSSProperties = {
  color: '#bfdbfe',
  fontSize: '14px',
  fontWeight: '400',
  margin: '0',
}

const divider: React.CSSProperties = {
  borderColor: '#e2e8f0',
  margin: '0',
}

const content: React.CSSProperties = {
  padding: '32px',
}

const greeting: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: '500',
  color: '#1e293b',
  margin: '0 0 12px 0',
}

const messageText: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#475569',
  margin: '0 0 24px 0',
}

const scoreCard: React.CSSProperties = {
  padding: '24px',
  borderRadius: '8px',
  textAlign: 'center' as const,
  margin: '0 0 24px 0',
}

const scoreLabel: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: '500',
  color: '#64748b',
  margin: '0 0 4px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const scoreValue: React.CSSProperties = {
  fontSize: '48px',
  fontWeight: '700',
  color: '#1e293b',
  margin: '0 0 12px 0',
  lineHeight: '1',
}

const statusBadge: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '700',
  padding: '4px 16px',
  borderRadius: '9999px',
  display: 'inline-block',
  letterSpacing: '0.5px',
}

const buttonContainer: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const actionButton: React.CSSProperties = {
  backgroundColor: '#2563eb',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  padding: '12px 32px',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
}

const footer: React.CSSProperties = {
  padding: '24px 32px',
  backgroundColor: '#f8fafc',
}

const footerText: React.CSSProperties = {
  fontSize: '12px',
  color: '#94a3b8',
  margin: '0 0 8px 0',
}

const unsubscribeLink: React.CSSProperties = {
  fontSize: '12px',
  color: '#94a3b8',
  textDecoration: 'underline',
}
