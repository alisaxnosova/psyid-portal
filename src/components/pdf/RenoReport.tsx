import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 56,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 36,
    borderBottom: '1px solid #E5DED2',
    paddingBottom: 24,
  },
  brand: {
    fontSize: 11,
    letterSpacing: 2,
    color: '#8A8FA8',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  typeBadge: {
    backgroundColor: '#050C2E',
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 4,
    padding: '10px 20px',
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 6,
  },
  metaLabel: {
    fontSize: 9,
    color: '#8A8FA8',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 12,
    color: '#4F5470',
    fontFamily: 'Helvetica-Bold',
  },
  sectionTitle: {
    fontSize: 9,
    letterSpacing: 2,
    color: '#8A8FA8',
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  narrativeParagraph: {
    fontSize: 12,
    lineHeight: 1.75,
    color: '#1A1E3C',
    marginBottom: 14,
    textAlign: 'justify',
  },
  footer: {
    position: 'absolute',
    bottom: 36,
    left: 56,
    right: 56,
    borderTop: '1px solid #E5DED2',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#8A8FA8',
    letterSpacing: 1,
  },
  footerBrand: {
    fontSize: 9,
    color: '#FF9540',
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});

interface RenoReportProps {
  mbtiType: string;
  narrative: string;
  codeRef?: string;
  date: string;
  lang: string;
}

export default function RenoReport({
  mbtiType,
  narrative,
  codeRef,
  date,
  lang,
}: RenoReportProps) {
  const paragraphs = narrative
    .split(/\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  return (
    <Document
      title={`PsyID Personality Report — ${mbtiType}`}
      author="PsyID"
      subject="Personality Assessment Report"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brand}>PsyID · Personality Report</Text>
          <Text style={styles.typeBadge}>{mbtiType}</Text>
          <View style={styles.metaRow}>
            {codeRef && (
              <View>
                <Text style={styles.metaLabel}>Reference</Text>
                <Text style={styles.metaValue}>{codeRef}</Text>
              </View>
            )}
            <View>
              <Text style={styles.metaLabel}>Date</Text>
              <Text style={styles.metaValue}>{date}</Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>Language</Text>
              <Text style={styles.metaValue}>{lang.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Narrative */}
        <View>
          <Text style={styles.sectionTitle}>Your Personality Profile</Text>
          {paragraphs.map((para, i) => (
            <Text key={i} style={styles.narrativeParagraph}>
              {para}
            </Text>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>psyid.com</Text>
          <Text style={styles.footerBrand}>PsyID</Text>
          <Text style={styles.footerText}>{mbtiType} · {date}</Text>
        </View>
      </Page>
    </Document>
  );
}
