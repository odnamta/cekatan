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

interface CertificateDeliveryProps {
  orgName: string
  candidateName: string
  assessmentTitle: string
  score: number
  certificateUrl: string
  unsubscribeUrl: string
}

export default function CertificateDelivery({
  orgName,
  candidateName,
  assessmentTitle,
  score,
  certificateUrl,
  unsubscribeUrl,
}: CertificateDeliveryProps) {
  return (
    <Html lang="id">
      <Head />
      <Preview>
        Sertifikat Anda — {assessmentTitle}
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
            <Text style={greeting}>Selamat, {candidateName}!</Text>
            <Text style={messageText}>
              Anda telah berhasil menyelesaikan asesmen{' '}
              <strong>{assessmentTitle}</strong> dengan skor{' '}
              <strong>{score}</strong>. Sertifikat Anda sudah siap untuk
              diunduh.
            </Text>

            {/* Certificate Card */}
            <Section style={certificateCard}>
              <Text style={certificateIcon}>&#127942;</Text>
              <Text style={certificateTitle}>Sertifikat Kelulusan</Text>
              <Text style={certificateSubtitle}>{assessmentTitle}</Text>
              <Text style={certificateScore}>Skor: {score}</Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={actionButton} href={certificateUrl}>
                Unduh Sertifikat
              </Button>
            </Section>

            <Text style={noteText}>
              Sertifikat ini juga dapat diakses kapan saja melalui halaman
              profil Anda di platform Cekatan.
            </Text>
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
  fontSize: '20px',
  fontWeight: '600',
  color: '#1e293b',
  margin: '0 0 12px 0',
}

const messageText: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#475569',
  margin: '0 0 24px 0',
}

const certificateCard: React.CSSProperties = {
  padding: '24px',
  borderRadius: '8px',
  textAlign: 'center' as const,
  margin: '0 0 24px 0',
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
}

const certificateIcon: React.CSSProperties = {
  fontSize: '40px',
  margin: '0 0 8px 0',
  lineHeight: '1',
}

const certificateTitle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: '700',
  color: '#166534',
  margin: '0 0 4px 0',
}

const certificateSubtitle: React.CSSProperties = {
  fontSize: '14px',
  color: '#15803d',
  margin: '0 0 8px 0',
}

const certificateScore: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: '500',
  color: '#64748b',
  margin: '0',
}

const buttonContainer: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const actionButton: React.CSSProperties = {
  backgroundColor: '#16a34a',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  padding: '12px 32px',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
}

const noteText: React.CSSProperties = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#94a3b8',
  margin: '0',
  fontStyle: 'italic',
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
