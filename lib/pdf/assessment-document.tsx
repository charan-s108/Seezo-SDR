import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer"

// Register custom fonts
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: "bold",
    },
  ],
})

/* ================= Styles ================= */

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    fontFamily: "Roboto",
    fontSize: 9,
    lineHeight: 1.6,
    backgroundColor: "#ffffff",
    position: "relative",
  },
  
  // Cover page
  coverPage: {
    padding: 0,
    fontFamily: "Roboto",
    backgroundColor: "#080808",
    color: "#ffffff",
  },
  coverHero: {
    padding: 40,
    paddingTop: 40,
    paddingBottom: 40,
    position: "relative",
  },
  coverBrand: {
    fontSize: 9,
    color: "#7a92ff",
    letterSpacing: 2,
    marginBottom: 15,
    fontWeight: "bold",
  },
  coverMainTitle: {
    fontSize: 10,
    color: "#ffffff",
    opacity: 0.7,
  },
  coverAssessmentName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
    lineHeight: 1.3,
  },
  coverProjectName: {
    fontSize: 14,
    color: "#7a92ff",
    marginBottom: 8,
    fontWeight: "bold",
  },
  coverStatsSection: {
    backgroundColor: "#ffffff",
    padding: 30,
  },
  coverStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  coverStatBox: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    marginHorizontal: 5,
    backgroundColor: "#fafbff",
    borderRadius: 4,
    borderLeft: "3 solid #7a92ff",
  },
  coverStatLabel: {
    fontSize: 7,
    color: "#666",
    letterSpacing: 1,
    marginBottom: 6,
  },
  coverStatValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#080808",
  },
  coverRiskBadge: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
    padding: "6 12",
    borderRadius: 4,
  },
  coverInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  coverInfoItem: {
    width: "48%",
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderLeft: "2 solid #7a92ff",
  },
  coverInfoLabel: {
    fontSize: 7,
    color: "#666",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  coverInfoValue: {
    fontSize: 9,
    color: "#080808",
    fontWeight: "bold",
  },
  coverDivider: {
    height: 2,
    backgroundColor: "#7a92ff",
    marginVertical: 15,
  },
  
  // Header - Simplified
  header: {
    marginBottom: 25,
    paddingBottom: 12,
    borderBottom: "2 solid #080808",
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#080808",
    marginBottom: 15,
  },
  pageSubtitle: {
    fontSize: 8,
    color: "#666",
    letterSpacing: 0.5,
  },
  
  // Summary section
  summarySection: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: "#fafbff",
    borderLeft: "4 solid #7a92ff",
  },
  summaryText: {
    fontSize: 9,
    color: "#080808",
    lineHeight: 1.7,
  },
  
  // Stats row
  statsRow: {
    flexDirection: "row",
    marginBottom: 30,
    gap: 15,
  },
  statCard: {
    flex: 1,
    padding: 15,
    backgroundColor: "#080808",
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7a92ff",
    marginBottom: 20,
  },
  statLabel: {
    fontSize: 7,
    color: "#ffffff",
    letterSpacing: 1,
  },
  
  // Info grid
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 25,
  },
  infoItem: {
    width: "48%",
    padding: 12,
    backgroundColor: "#fafafa",
  },
  infoLabel: {
    fontSize: 7,
    color: "#666",
    marginBottom: 4,
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 9,
    color: "#080808",
    fontWeight: "bold",
  },
  
  // Requirement card - Complete redesign
  reqCard: {
    marginBottom: 30,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  reqHeader: {
    backgroundColor: "#080808",
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reqTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#ffffff",
    flex: 1,
    marginRight: 10,
  },
  reqCategory: {
    fontSize: 8,
    padding: "5 10",
    backgroundColor: "#7a92ff",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  reqBody: {
    padding: 20,
  },
  reqMetaBar: {
    flexDirection: "row",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottom: "1 solid #e5e5e5",
    gap: 15,
  },
  reqMetaItem: {
    flex: 1,
  },
  reqMetaLabel: {
    fontSize: 7,
    color: "#666",
    marginBottom: 3,
    letterSpacing: 1,
  },
  reqMetaValue: {
    fontSize: 9,
    fontWeight: "bold",
  },
  reqSection: {
    marginBottom: 15,
  },
  reqSectionTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#080808",
    marginBottom: 5,
    letterSpacing: 1,
    paddingLeft: 10,
    borderLeft: "2 solid #7a92ff",
  },
  reqSectionContent: {
    fontSize: 9,
    color: "#444",
    lineHeight: 1.7,
    paddingLeft: 12,
  },
  
  // Standards pills
  pillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
    paddingLeft: 12,
  },

  pill: {
    backgroundColor: "#7a92ff",
    paddingVertical: 4,
    paddingHorizontal: 10,
    fontSize: 7,
    color: "#ffffff",
    letterSpacing: 0.5,
    marginRight: 8,
    marginBottom: 8,
  },
  
  // Risk badge
  riskBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    fontSize: 9,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  
  // Compliance card
  complianceCard: {
    marginBottom: 25,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  complianceHeader: {
    backgroundColor: "#fafbff",
    padding: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#7a92ff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  complianceStandard: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#080808",
    flexGrow: 1,
    maxWidth: "80%",
  },
  complianceControl: {
    fontSize: 8,
    padding: "4 8",
    backgroundColor: "#080808",
    color: "#ffffff",
  },
  complianceBody: {
    padding: 15,
  },
  complianceField: {
    marginBottom: 12,
  },
  complianceFieldLabel: {
    fontSize: 7,
    color: "#666",
    marginBottom: 3,
    letterSpacing: 1,
  },
  complianceFieldContent: {
    fontSize: 9,
    color: "#444",
    lineHeight: 1.7,
  },
  complianceControlTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#080808",
    marginBottom: 2,
  },
  complianceMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  complianceMetaText: {
    fontSize: 8,
    color: "#666",
  },
  complianceBullet: {
    fontSize: 8,
    color: "#444",
    marginLeft: 8,
    marginTop: 2,
  },

  // Compliance Report - Redesigned
  complianceReportCard: {
    marginBottom: 30,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  complianceStandardHeader: {
    backgroundColor: "#080808",
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  complianceStandardTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#ffffff",
  },
  complianceStandardCoverage: {
    fontSize: 11,
    color: "#7a92ff",
    fontWeight: "bold",
  },
  complianceStandardSummary: {
    padding: 15,
    backgroundColor: "#fafbff",
    borderBottom: "1 solid #e5e5e5",
  },
  complianceSummaryLabel: {
    fontSize: 8,
    color: "#666",
    marginBottom: 5,
  },
  complianceSummaryStats: {
    fontSize: 9,
    color: "#080808",
    lineHeight: 1.5,
  },
  complianceControlsContainer: {
    padding: 20,
  },
  complianceControlItem: {
    marginBottom: 20,
    paddingBottom: 20,
  },
  complianceControlItemBorder: {
    borderBottom: "1 solid #f0f0f0",
  },
  complianceControlTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  complianceStatusIcon: {
    fontSize: 10,
    fontWeight: "bold",
    marginRight: 8,
    width: 15,
  },
  complianceControlName: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#080808",
    flex: 1,
    lineHeight: 1.4,
  },
  complianceStatusRow: {
    flexDirection: "row",
    marginBottom: 10,
    marginLeft: 23,
  },
  complianceStatusBadge: {
    fontSize: 8,
    fontWeight: "bold",
    marginRight: 15,
  },
  complianceConfidence: {
    fontSize: 8,
    color: "#666",
  },
  complianceJustificationSection: {
    marginLeft: 23,
    marginBottom: 10,
  },
  complianceJustificationLabel: {
    fontSize: 7,
    color: "#666",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  complianceJustificationText: {
    fontSize: 9,
    color: "#444",
    lineHeight: 1.6,
  },
  complianceLinkedReqSection: {
    marginLeft: 23,
    marginTop: 6,
  },
  complianceLinkedReqLabel: {
    fontSize: 7,
    color: "#666",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  complianceLinkedReqItem: {
    fontSize: 8,
    color: "#444",
    marginLeft: 12,
    marginTop: 3,
    lineHeight: 1.4,
  },
  complianceLinkedReqMore: {
    fontSize: 7,
    color: "#888",
    marginLeft: 12,
    marginTop: 4,
  },

  // Closing Page Styles
  closingPageContent: {
    backgroundColor: "#ffffff",
    padding: 30,
  },
  closingSectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#080808",
    marginBottom: 15,
    borderBottom: "2 solid #7a92ff",
    paddingBottom: 8,
  },
  closingStatsGrid: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  },
  closingStatBox: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fafbff",
    borderLeft: "3 solid #7a92ff",
  },
  closingStatLabel: {
    fontSize: 9,
    color: "#666",
    marginBottom: 4,
  },
  closingStatValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#080808",
  },
  closingStatSubtext: {
    fontSize: 7,
    color: "#888",
    marginTop: 4,
  },
  closingSubsectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#080808",
    marginBottom: 10,
  },
  closingStandardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    marginBottom: 5,
    backgroundColor: "#f8f8f8",
  },
  closingStandardName: {
    fontSize: 9,
    color: "#080808",
    fontWeight: "bold",
  },
  closingStandardStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  closingStandardCount: {
    fontSize: 8,
    color: "#666",
    marginRight: 10,
  },
  closingProgressBar: {
    width: 60,
    height: 8,
    backgroundColor: "#e5e5e5",
    borderRadius: 4,
    overflow: "hidden",
  },
  closingProgressFill: {
    height: "100%",
  },
  closingProgressPercent: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#080808",
    marginLeft: 8,
    width: 35,
    textAlign: "right",
  },
  closingRiskBox: {
    padding: 15,
    backgroundColor: "#fafbff",
  },
  closingRiskLabel: {
    fontSize: 9,
    color: "#666",
    marginBottom: 4,
  },
  closingRiskValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  closingNextSteps: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fffbf5",
    borderLeft: "3 solid #f57c00",
  },
  closingNextStepsTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#080808",
    marginBottom: 8,
  },
  closingNextStepItem: {
    fontSize: 8,
    color: "#444",
    lineHeight: 1.6,
    marginBottom: 4,
  },
  closingMetadata: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: "1 solid #e5e5e5",
  },
  closingMetadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  closingMetadataLabel: {
    fontSize: 7,
    color: "#666",
    marginBottom: 2,
  },
  closingMetadataValue: {
    fontSize: 9,
    color: "#080808",
    fontWeight: "bold",
  },
  closingMetadataValueSmall: {
    fontSize: 8,
    color: "#080808",
  },
  closingDisclaimer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#f5f5f5",
  },
  closingDisclaimerText: {
    fontSize: 7,
    color: "#666",
    lineHeight: 1.5,
    textAlign: "center",
  },

  // Sources section
  sourceCard: {
    marginBottom: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  sourceHeader: {
    backgroundColor: "#fafbff",
    padding: 12,
    borderBottom: "2 solid #7a92ff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sourceName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#080808",
    flex: 1,
  },
  sourceType: {
    fontSize: 7,
    padding: "4 8",
    backgroundColor: "#7a92ff",
    color: "#ffffff",
    borderRadius: 3,
    fontWeight: "bold",
  },
  sourceBody: {
    padding: 12,
  },
  sourceInfo: {
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sourceInfoLabel: {
    fontSize: 7,
    color: "#666",
    letterSpacing: 0.5,
  },
  sourceInfoValue: {
    fontSize: 9,
    color: "#080808",
    fontWeight: "bold",
  },
  sourcePath: {
    fontSize: 8,
    color: "#7a92ff",
    marginTop: 8,
    fontFamily: "Courier",
    wordBreak: "break-all",
  },
  sourceImageContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    padding: 6,
  },
  sourceImage: {
    width: "100%",
    height: 180,
    objectFit: "contain",
  },
  
  // Footer
  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    paddingTop: 10,
    borderTop: "1 solid #e5e5e5",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 7,
    color: "#888",
  },
  footerBrand: {
    fontSize: 7,
    color: "#888",
    fontWeight: "bold",
  },
  
  // Refinement badge
  refinementBadge: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#f0f2ff",
    fontSize: 7,
    color: "#7a92ff",
  },

  // Compliance summary table
  complianceSummaryTable: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  complianceSummaryRow: {
    flexDirection: "row",
    borderBottom: "1 solid #e5e5e5",
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  complianceSummaryHeader: {
    backgroundColor: "#fafbff",
    borderBottom: "1 solid #e5e5e5",
  },
  complianceSummaryCol: {
    flex: 1,
    fontSize: 8,
    color: "#444",
  },
  complianceSummaryColSmall: {
    width: 70,
    fontSize: 8,
    color: "#444",
    textAlign: "right",
  },
  complianceSummaryColTiny: {
    width: 50,
    fontSize: 8,
    color: "#444",
    textAlign: "right",
  },

  // End page
  endPage: {
    paddingTop: 120,
    paddingBottom: 80,
    paddingHorizontal: 40,
    backgroundColor: "#080808",
    color: "#ffffff",
  },
  endTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  endSubtitle: {
    fontSize: 10,
    color: "#7a92ff",
    textAlign: "center",
    letterSpacing: 1,
    marginBottom: 24,
  },
  endMessage: {
    fontSize: 9,
    color: "#ffffff",
    opacity: 0.8,
    textAlign: "center",
    lineHeight: 1.6,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },  
  // Page branding (top right)
  pageBrand: {
    position: "absolute",
    top: 50,
    right: 50,
    fontSize: 9,
    color: "#000000",
    letterSpacing: 2,
    fontWeight: "bold",
  },
})

/* ================= Helper Functions ================= */

const getRiskColor = (risk: string): string => {
  switch (risk?.toLowerCase()) {
    case "high":
    case "critical":
      return "#d32f2f"
    case "medium":
      return "#f57c00"
    case "low":
      return "#388e3c"
    default:
      return "#757575"
  }
}

const formatDate = (date: any): string => {
  if (!date) return "N/A"
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

const getComplianceStats = (findings: any[]) => {
  const groups: Record<string, { total: number; covered: number; partial: number; notCovered: number }> = {}
  for (const f of findings || []) {
    const standard = (f.standard || f.framework || "Unknown").toString()
    if (!groups[standard]) {
      groups[standard] = { total: 0, covered: 0, partial: 0, notCovered: 0 }
    }
    groups[standard].total += 1
    const status = (f.status || "").toString().toLowerCase()
    if (status === "covered") groups[standard].covered += 1
    else if (status === "partial") groups[standard].partial += 1
    else groups[standard].notCovered += 1
  }

  const totals = Object.values(groups).reduce(
    (acc, g) => {
      acc.total += g.total
      acc.covered += g.covered
      acc.partial += g.partial
      acc.notCovered += g.notCovered
      return acc
    },
    { total: 0, covered: 0, partial: 0, notCovered: 0 }
  )

  return { groups, totals }
}

const getCoveragePercent = (covered: number, partial: number, total: number) => {
  if (!total) return 0
  return Math.round(((covered + partial) / total) * 100)
}

const PDFFooter = ({ pageName }: { pageName?: string }) => (
  <View style={styles.footer}>
    <Text style={styles.footerBrand}>SEEZO-SDR</Text>
    <Text style={styles.footerText}>
      {pageName ? `${pageName} | ` : ""}Confidential - Do Not Distribute
    </Text>
  </View>
)

/* ================= Components ================= */

interface AssessmentPDFProps {
  assessment: {
    name: string
    mode: string
    risk?: string
    createdAt: any
    completedAt?: any
    createdBy?: any
    summary?: {
      executiveSummary?: string
      riskSummary?: string
      securityRequirementsCount?: number
      openQuestionsCount?: number
      complianceFindingsCount?: number
    }
  }
  projectName: string
  securityRequirements: any[]
  complianceFindings: any[]
  openQuestions?: any[]
  sources?: any[]
}

export function AssessmentPDFDocument({
  assessment,
  projectName,
  securityRequirements,
  complianceFindings,
  openQuestions = [],
  sources = [],
}: AssessmentPDFProps) {
  const risk = assessment.risk || "unknown"
  const createdBy = assessment.createdBy?.name || assessment.createdBy?.email || "Unknown"
  const complianceStats = getComplianceStats(complianceFindings)
  const overallCoverage = getCoveragePercent(
    complianceStats.totals.covered,
    complianceStats.totals.partial,
    complianceStats.totals.total
  )  

  return (
    <Document>
      {/* ============= COVER PAGE ============= */}
      <Page size="A4" style={styles.coverPage}>
        {/* Hero section with dark background */}
        <View style={styles.coverHero}>
          <Text style={[styles.coverBrand, {fontSize: 20, paddingTop: 180}]}>SEEZO-SDR</Text>
          <Text style={[styles.coverAssessmentName, {fontSize: 36}]}>{assessment.name}</Text>
          <Text style={[styles.coverAssessmentName, {fontSize: 36}]}>Assessment Report</Text>
          <Text style={[styles.coverProjectName, {fontSize:28}]}>{projectName}</Text>
          <View style={styles.coverDivider} />
          <Text style={[styles.coverMainTitle, {fontSize: 20, paddingBottom: 100}]}>Security Design Review Report</Text>
        </View>
        <PDFFooter pageName="Cover" />
      </Page>

      {/* ================= REPORT SUMMARY ================= */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageBrand}>SEEZO-SDR</Text>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>ASSESSMENT OVERVIEW</Text>
          <Text style={styles.pageSubtitle}>Report Summary</Text>
        </View>

        {/* Key Findings Section */}
        <View style={styles.closingPageContent}>
          <Text style={styles.closingSectionTitle}>Report Summary</Text>

          {/* Summary Grid */}
          <View style={styles.closingStatsGrid}>
            <View style={styles.closingStatBox}>
              <Text style={styles.closingStatLabel}>Security Requirements</Text>
              <Text style={styles.closingStatValue}>
                {securityRequirements.filter((req: any) => req.status?.toLowerCase() === "accepted").length}
              </Text>
              <Text style={styles.closingStatSubtext}>Accepted Controls</Text>
            </View>

            <View style={[styles.closingStatBox, { borderLeft: "3 solid #388e3c" }]}>
              <Text style={styles.closingStatLabel}>Compliance Coverage</Text>
              <Text style={styles.closingStatValue}>
                {overallCoverage}%
              </Text>
              <Text style={styles.closingStatSubtext}>
                {complianceStats.totals.covered + complianceStats.totals.partial}/{complianceStats.totals.total} Controls
              </Text>
            </View>
          </View>

          {/* Compliance by Standard */}
          {Object.keys(complianceStats.groups).length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.closingSubsectionTitle}>Compliance by Standard</Text>
              {Object.entries(complianceStats.groups).map(([standard, stats]) => {
                const coverage = getCoveragePercent(stats.covered, stats.partial, stats.total)
                const barColor = coverage >= 70 ? "#388e3c" : coverage >= 40 ? "#f57c00" : "#d32f2f"
                return (
                  <View key={standard} style={styles.closingStandardRow}>
                    <Text style={styles.closingStandardName}>{standard}</Text>
                    <View style={styles.closingStandardStats}>
                      <Text style={styles.closingStandardCount}>
                        {stats.covered + stats.partial}/{stats.total}
                      </Text>
                      <View style={styles.closingProgressBar}>
                        <View style={[styles.closingProgressFill, { width: `${coverage}%`, backgroundColor: barColor }]} />
                      </View>
                      <Text style={styles.closingProgressPercent}>
                        {coverage}%
                      </Text>
                    </View>
                  </View>
                )
              })}
            </View>
          )}

          {/* Risk Assessment */}
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.closingSubsectionTitle}>Risk Assessment</Text>
            <View style={[styles.closingRiskBox, { borderLeft: "3 solid " + getRiskColor(risk) }]}>
              <Text style={styles.closingRiskLabel}>Overall Risk Level</Text>
              <Text style={[styles.closingRiskValue, { color: getRiskColor(risk) }]}>
                {risk.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Footer Info */}
          <View style={styles.closingMetadata}>
            <View style={styles.closingMetadataRow}>
              <View>
                <Text style={styles.closingMetadataLabel}>Project</Text>
                <Text style={styles.closingMetadataValue}>{projectName}</Text>
              </View>
              <View>
                <Text style={styles.closingMetadataLabel}>Assessment</Text>
                <Text style={styles.closingMetadataValue}>{assessment.name}</Text>
              </View>
            </View>
            <View style={styles.closingMetadataRow}>
              <View>
                <Text style={styles.closingMetadataLabel}>Created By</Text>
                <Text style={styles.closingMetadataValueSmall}>{createdBy}</Text>
              </View>
              <View>
                <Text style={styles.closingMetadataLabel}>Generated On</Text>
                <Text style={styles.closingMetadataValueSmall}>{formatDate(new Date())}</Text>
              </View>
            </View>
          </View>

          {/* Disclaimer */}
          <View style={styles.closingDisclaimer}>
            <Text style={styles.closingDisclaimerText}>
              This report was generated by SEEZO-SDR, an automated Security Design Review tool. The findings and recommendations
              should be reviewed by qualified security professionals. This document is confidential and intended solely for the use
              of the designated recipient. Unauthorized distribution is prohibited.
            </Text>
          </View>
        </View>
      </Page>

      {/* ============= SOURCES PAGE ============= */}
      {sources && sources.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.pageBrand}>SEEZO-SDR</Text>
          <View style={styles.header} fixed>
            <Text style={styles.pageTitle}>Sources & References</Text>
            <Text style={styles.pageSubtitle}>ASSESSMENT INPUT FILES AND REFERENCES</Text>
          </View>

          {sources
            .filter((src: any) => {
              // Include: text, file (except PDF), image, and links (gdocs, github, jira, confluence)
              // Exclude: PDF files and decision tree related items
              if (src.type === "text") return true
              if (src.type === "file" && src.mimeType && !src.mimeType.includes("pdf")) return true
              if (src.type === "diagram") return true
              if (["gdocs", "github", "jira", "confluence"].includes(src.type)) return true
              return false
            })
            .map((src: any, index: number) => (
              <View key={src._id || index} style={styles.sourceCard} wrap={false}>
                {/* Source header */}
                <View style={styles.sourceHeader}>
                  <Text style={styles.sourceName}>{src.name}</Text>
                  <Text style={styles.sourceType}>{src.type.toUpperCase()}</Text>
                </View>

                {/* Source body */}
                <View style={styles.sourceBody}>
                  {/* Size info for files */}
                  {src.size && (
                    <View style={styles.sourceInfo}>
                      <Text style={styles.sourceInfoLabel}>SIZE</Text>
                      <Text style={styles.sourceInfoValue}>
                        {formatFileSize(src.size)}
                      </Text>
                    </View>
                  )}

                  {/* MIME type for files */}
                  {src.mimeType && (
                    <View style={styles.sourceInfo}>
                      <Text style={styles.sourceInfoLabel}>FORMAT</Text>
                      <Text style={styles.sourceInfoValue}>{src.mimeType}</Text>
                    </View>
                  )}

                  {/* Upload date */}
                  {src.uploadedAt && (
                    <View style={styles.sourceInfo}>
                      <Text style={styles.sourceInfoLabel}>UPLOADED</Text>
                      <Text style={styles.sourceInfoValue}>
                        {formatDate(src.uploadedAt)}
                      </Text>
                    </View>
                  )}

                  {/* Preview image for diagrams/images */}
                  {src.imageDataUrl && (
                    <View style={styles.sourceImageContainer}>
                      <Image style={styles.sourceImage} src={src.imageDataUrl} />
                    </View>
                  )}
                </View>
              </View>
            ))}
          <PDFFooter pageName="Sources" />
        </Page>
      )}

      {/* ============= EXECUTIVE SUMMARY ============= */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageBrand}>SEEZO-SDR</Text>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Executive Summary</Text>
          <Text style={styles.pageSubtitle}>SECURITY ASSESSMENT OVERVIEW</Text>
        </View>

        {/* Summary content */}
        {assessment.summary?.executiveSummary && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryText}>{assessment.summary.executiveSummary}</Text>
          </View>
        )}

        <PDFFooter pageName="Summary" />
      </Page>

      {/* ============= SECURITY REQUIREMENTS ============= */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageBrand} fixed>SEEZO-SDR</Text>
        <View style={styles.header} fixed>
          <Text style={styles.pageTitle}>Security Requirements</Text>
          <Text style={styles.pageSubtitle}>IDENTIFIED CONTROLS & RECOMMENDATIONS</Text>
        </View>

        {securityRequirements.length === 0 || securityRequirements.filter((req: any) => req.status?.toLowerCase() === "accepted").length === 0 ? (
          <Text style={{ fontSize: 9, color: "#666", textAlign: "center", marginTop: 50 }}>
            No accepted security requirements identified for this assessment.
          </Text>
        ) : (
          securityRequirements
            .filter((req: any) => req.status?.toLowerCase() === "accepted")
            .map((req: any, index: number) => (
            <View key={req.id || index} style={styles.reqCard} wrap={false}>
              {/* Card header */}
              <View style={styles.reqHeader}>
                <Text style={styles.reqTitle}>
                  {req.isRefined && "[REFINED] "}
                  {req.title || "Untitled Requirement"}
                </Text>
                {req.category && (
                  <Text style={styles.reqCategory}>{req.category}</Text>
                )}
              </View>

              {/* Card body */}
              <View style={styles.reqBody}>
                {/* Meta bar with key info */}
                <View style={styles.reqMetaBar}>
                  {req.risk_ranking && (
                    <View style={styles.reqMetaItem}>
                      <Text style={styles.reqMetaLabel}>RISK LEVEL</Text>
                      <Text style={[styles.reqMetaValue, { color: getRiskColor(req.risk_ranking) }]}>
                        {req.risk_ranking.toUpperCase()}
                      </Text>
                    </View>
                  )}
                  {req.status && (
                    <View style={styles.reqMetaItem}>
                      <Text style={styles.reqMetaLabel}>STATUS</Text>
                      <Text style={styles.reqMetaValue}>{req.status.toUpperCase()}</Text>
                    </View>
                  )}
                </View>

                {/* Applicable Standards as pills */}
                {req.applicable_standards && req.applicable_standards.length > 0 && (
                  <View style={styles.reqSection}>
                    <Text style={styles.reqSectionTitle}>APPLICABLE STANDARDS</Text>
                    <View style={styles.pillsContainer}>
                      {req.applicable_standards.map((standard: string, idx: number) => (
                        <View key={idx} style={styles.pill}>
                          <Text>{standard}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Context */}
                {req.context && (
                  <View style={styles.reqSection}>
                    <Text style={styles.reqSectionTitle}>CONTEXT</Text>
                    <Text style={styles.reqSectionContent}>{req.context}</Text>
                  </View>
                )}

                {/* Identified Gap */}
                {req.identified_gap && (
                  <View style={styles.reqSection}>
                    <Text style={styles.reqSectionTitle}>IDENTIFIED GAP</Text>
                    <Text style={styles.reqSectionContent}>{req.identified_gap}</Text>
                  </View>
                )}

                {/* Threat */}
                {req.threat && (
                  <View style={styles.reqSection}>
                    <Text style={styles.reqSectionTitle}>THREAT</Text>
                    <Text style={styles.reqSectionContent}>{req.threat}</Text>
                  </View>
                )}

                {/* Mitigation */}
                {req.mitigation && (
                  <View style={styles.reqSection}>
                    <Text style={styles.reqSectionTitle}>MITIGATION</Text>
                    <Text style={styles.reqSectionContent}>{req.mitigation}</Text>
                  </View>
                )}

                {/* Remediation */}
                {req.remediation && (
                  <View style={styles.reqSection}>
                    <Text style={styles.reqSectionTitle}>REMEDIATION</Text>
                    <Text style={styles.reqSectionContent}>{req.remediation}</Text>
                  </View>
                )}

                {/* Recommendation */}
                {req.recommendation && (
                  <View style={styles.reqSection}>
                    <Text style={styles.reqSectionTitle}>RECOMMENDATION</Text>
                    <Text style={styles.reqSectionContent}>{req.recommendation}</Text>
                  </View>
                )}

              </View>
            </View>
          ))
        )}
        <PDFFooter pageName="Requirements" />
      </Page>

      {/* ============= COMPLIANCE REPORT ============= */}
      {complianceFindings.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.pageBrand} fixed>SEEZO-SDR</Text>
          <View style={styles.header} fixed>
            <Text style={styles.pageTitle}>Compliance Report</Text>
            <Text style={styles.pageSubtitle}>STANDARDS, CONTROLS, AND COVERAGE</Text>
          </View>

          {Object.entries(complianceStats.groups).map(([standard, stats]) => {
            const standardFindings = complianceFindings.filter(
              (f: any) => (f.standard || f.framework || "Unknown") === standard
            )
            const coverage = getCoveragePercent(stats.covered, stats.partial, stats.total)

            return (
              <View key={standard} style={styles.complianceReportCard}>
                {/* Standard Header */}
                <View style={styles.complianceStandardHeader}>
                  <Text style={styles.complianceStandardTitle}>{standard}</Text>
                  <Text style={styles.complianceStandardCoverage}>{coverage}% Coverage</Text>
                </View>

                {/* Standard Summary */}
                <View style={styles.complianceStandardSummary}>
                  <Text style={styles.complianceSummaryLabel}>Coverage Summary</Text>
                  <Text style={styles.complianceSummaryStats}>
                    ✓ Covered: {stats.covered} controls{"\n"}
                    ◐ Partial: {stats.partial} controls{"\n"}
                    ✗ Not Covered: {stats.notCovered} controls{"\n"}
                    Total Controls: {stats.total}
                  </Text>
                </View>

                {/* Controls */}
                <View style={styles.complianceControlsContainer}>
                  {standardFindings.map((finding: any, idx: number) => {
                    const status = String(finding.status || "unknown").toLowerCase()
                    const statusColor = status === "covered" ? "#388e3c" : status === "partial" ? "#f57c00" : "#d32f2f"
                    const statusSymbol = status === "covered" ? "✓" : status === "partial" ? "◐" : "✗"
                    const linkedRequirements = Array.isArray(finding.linkedRequirementTitles) ? finding.linkedRequirementTitles : []
                    const isLastControl = idx === standardFindings.length - 1
                    
                    return (
                      <View 
                        key={finding.id || idx} 
                        style={[
                          styles.complianceControlItem,
                          ...(isLastControl ? [] : [styles.complianceControlItemBorder])
                        ]}
                      >
                        {/* Control Title with Status Icon */}
                        <View style={styles.complianceControlTitleRow}>
                          <Text style={[styles.complianceStatusIcon, { color: statusColor }]}>
                            {statusSymbol}
                          </Text>
                          <Text style={styles.complianceControlName}>
                            {finding.controlId ? `${finding.controlId} — ` : ""}
                            {finding.controlTitle || finding.requirement || "Control"}
                          </Text>
                        </View>

                        {/* Status and Confidence Row */}
                        <View style={styles.complianceStatusRow}>
                          <Text style={[styles.complianceStatusBadge, { color: statusColor }]}>
                            {status.toUpperCase()}
                          </Text>
                          <Text style={styles.complianceConfidence}>
                            Confidence: {finding.confidence ?? "N/A"}%
                          </Text>
                        </View>

                        {/* Justification */}
                        {finding.justification && (
                          <View style={styles.complianceJustificationSection}>
                            <Text style={styles.complianceJustificationLabel}>JUSTIFICATION</Text>
                            <Text style={styles.complianceJustificationText}>
                              {finding.justification}
                            </Text>
                          </View>
                        )}

                        {/* Linked Requirements */}
                        {linkedRequirements.length > 0 && (
                          <View style={styles.complianceLinkedReqSection}>
                            <Text style={styles.complianceLinkedReqLabel}>
                              LINKED REQUIREMENTS ({linkedRequirements.length})
                            </Text>
                            {linkedRequirements.slice(0, 5).map((title: string, i: number) => (
                              <Text key={`${finding.id || idx}-lr-${i}`} style={styles.complianceLinkedReqItem}>
                                • {title}
                              </Text>
                            ))}
                            {linkedRequirements.length > 5 && (
                              <Text style={styles.complianceLinkedReqMore}>
                                ... and {linkedRequirements.length - 5} more requirement{linkedRequirements.length - 5 > 1 ? "s" : ""}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    )
                  })}
                </View>
              </View>
            )
          })}
          <PDFFooter pageName="Compliance" />
        </Page>
      )}

      {/* ============= END PAGE ============= */}
      <Page size="A4" style={styles.endPage}>
        <View style={styles.centerContainer}>
        <Text style={styles.endTitle}>End of Report</Text>
        <Text style={styles.endSubtitle}>SEEZO-SDR</Text>
        <Text style={styles.endMessage}>
          This document concludes the security assessment report. Please contact the
          security team for any clarifications or remediation support.
        </Text>
        </View>
      </Page>
    </Document>
  )
}
