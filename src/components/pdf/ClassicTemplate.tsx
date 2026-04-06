/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register Roboto with Cyrillic support
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.ttf",
      fontWeight: 700,
    },
  ],
});

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 11,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 50,
    backgroundColor: "#ffffff",
    color: "#1a1a1a",
  },
  // Header
  header: {
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: "#1a9e75",
    paddingBottom: 16,
  },
  name: {
    fontSize: 28,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  contactText: {
    fontSize: 10,
    color: "#555555",
  },
  // Sections
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: "#1a9e75",
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  bodyText: {
    fontSize: 10,
    color: "#333333",
    lineHeight: 1.6,
  },
  // Experience / Education entries
  entryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  entryTitle: {
    fontSize: 11,
    fontFamily: "Roboto",
    fontWeight: 700,
    color: "#1a1a1a",
  },
  entryDate: {
    fontSize: 10,
    color: "#777777",
  },
  entrySubtitle: {
    fontSize: 10,
    color: "#555555",
    marginBottom: 3,
  },
  entryBody: {
    fontSize: 10,
    color: "#333333",
    lineHeight: 1.5,
    marginBottom: 10,
  },
  // Skills
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillBadge: {
    fontSize: 10,
    color: "#1a9e75",
    backgroundColor: "#e8f7f2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
});

// ─── Types ─────────────────────────────────────────────────────────────────────

type PersonalSection = {
  firstName: string;
  lastName: string;
  address?: string;
  phone?: string;
};

type SummarySection = {
  text: string | null;
};

type ExperienceItem = {
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  responsibilities: string;
};

type EducationItem = {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
};

type SkillsSection = {
  items: string[];
};

export type ResumeData = {
  email: string;
  personal: PersonalSection;
  summary: SummarySection;
  experience: { items: ExperienceItem[] };
  education: { items: EducationItem[] };
  skills: SkillsSection;
};

// ─── Helper ────────────────────────────────────────────────────────────────────

function formatDate(date: string | null | undefined): string {
  if (!date || date === "null") return "Present";
  // "2023-01" → "Jan 2023", "2022" → "2022"
  if (date.includes("-")) {
    const [year, month] = date.split("-");
    const monthName = new Date(Number(year), Number(month) - 1).toLocaleString(
      "en",
      { month: "short" },
    );
    return `${monthName} ${year}`;
  }
  return date;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function ClassicTemplate({ data }: { data: ResumeData }): any {
  const { personal, summary, experience, education, skills } = data;
  const fullName = `${personal.firstName} ${personal.lastName}`.trim();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.name}>{fullName}</Text>
          <View style={styles.contactRow}>
            {data.email ? (
              <Text style={styles.contactText}>{data.email}</Text>
            ) : null}
            {personal.phone ? (
              <Text style={styles.contactText}>{personal.phone}</Text>
            ) : null}
            {personal.address ? (
              <Text style={styles.contactText}>{personal.address}</Text>
            ) : null}
          </View>
        </View>

        {/* ── Summary ── */}
        {summary?.text ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Profile</Text>
            <Text style={styles.bodyText}>{summary.text}</Text>
          </View>
        ) : null}

        {/* ── Experience ── */}
        {experience?.items?.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {experience.items.map((item, index) => (
              <View key={index}>
                <View style={styles.entryRow}>
                  <Text style={styles.entryTitle}>{item.position}</Text>
                  <Text style={styles.entryDate}>
                    {formatDate(item.startDate)} — {formatDate(item.endDate)}
                  </Text>
                </View>
                <Text style={styles.entrySubtitle}>{item.company}</Text>
                {item.responsibilities ? (
                  <Text style={styles.entryBody}>{item.responsibilities}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Education ── */}
        {education?.items?.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.items.map((item, index) => (
              <View key={index}>
                <View style={styles.entryRow}>
                  <Text style={styles.entryTitle}>{item.institution}</Text>
                  <Text style={styles.entryDate}>
                    {formatDate(item.startDate)} — {formatDate(item.endDate)}
                  </Text>
                </View>
                <Text style={styles.entryBody}>
                  {[item.degree, item.field].filter(Boolean).join(", ")}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Skills ── */}
        {skills?.items?.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsWrap}>
              {skills.items.map((skill, index) => (
                <Text key={index} style={styles.skillBadge}>
                  {skill}
                </Text>
              ))}
            </View>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
