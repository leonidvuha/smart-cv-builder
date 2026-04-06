/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

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

// ─── Locale helpers ────────────────────────────────────────────────────────────

type Locale = "de" | "en";

// Bilingual field: can be plain string OR { de: "...", en: "..." }
type BiText = string | { de: string; en: string };

function t(value: BiText | null | undefined, locale: Locale): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[locale] ?? value.en ?? "";
}

const labels: Record<Locale, Record<string, string>> = {
  de: {
    summary: "Profil",
    experience: "Berufserfahrung",
    education: "Ausbildung",
    skills: "Kenntnisse",
    present: "Heute",
  },
  en: {
    summary: "Professional Profile",
    experience: "Work Experience",
    education: "Education",
    skills: "Skills",
    present: "Present",
  },
};

// ─── Types ─────────────────────────────────────────────────────────────────────

type PersonalSection = {
  firstName: string;
  lastName: string;
  address?: string;
  phone?: string;
};

type SummarySection = {
  text: BiText | null;
};

type ExperienceItem = {
  company: string;
  position: BiText;
  startDate: string;
  endDate: string | null;
  responsibilities: BiText;
};

type EducationItem = {
  institution: string;
  degree: BiText;
  field: BiText;
  startDate: string;
  endDate: string;
};

type SkillsSection = {
  items: string[];
};

export type ResumeData = {
  email: string;
  locale?: Locale;
  personal: PersonalSection;
  summary: SummarySection;
  experience: { items: ExperienceItem[] };
  education: { items: EducationItem[] };
  skills: SkillsSection;
};

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
  header: {
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: "#1a9e75",
    paddingBottom: 16,
  },
  name: {
    fontSize: 28,
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
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
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
  entryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  entryTitle: {
    fontSize: 11,
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

// ─── Helper ────────────────────────────────────────────────────────────────────

function formatDate(date: string | null | undefined, locale: Locale): string {
  if (!date || date === "null") return labels[locale].present;
  if (date.includes("-")) {
    const [year, month] = date.split("-");
    const monthName = new Date(Number(year), Number(month) - 1).toLocaleString(
      locale === "de" ? "de-DE" : "en-US",
      { month: "short" },
    );
    return `${monthName} ${year}`;
  }
  return date;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function ClassicTemplate({ data }: { data: ResumeData }): any {
  const locale: Locale = data.locale ?? "en";
  const l = labels[locale];
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
            <Text style={styles.sectionTitle}>{l.summary}</Text>
            <Text style={styles.bodyText}>{t(summary.text, locale)}</Text>
          </View>
        ) : null}

        {/* ── Experience ── */}
        {experience?.items?.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{l.experience}</Text>
            {experience.items.map((item, index) => (
              <View key={index}>
                <View style={styles.entryRow}>
                  <Text style={styles.entryTitle}>
                    {t(item.position, locale)}
                  </Text>
                  <Text style={styles.entryDate}>
                    {formatDate(item.startDate, locale)} —{" "}
                    {formatDate(item.endDate, locale)}
                  </Text>
                </View>
                <Text style={styles.entrySubtitle}>{item.company}</Text>
                {item.responsibilities ? (
                  <Text style={styles.entryBody}>
                    {t(item.responsibilities, locale)}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Education ── */}
        {education?.items?.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{l.education}</Text>
            {education.items.map((item, index) => (
              <View key={index}>
                <View style={styles.entryRow}>
                  <Text style={styles.entryTitle}>{item.institution}</Text>
                  <Text style={styles.entryDate}>
                    {formatDate(item.startDate, locale)} —{" "}
                    {formatDate(item.endDate, locale)}
                  </Text>
                </View>
                <Text style={styles.entryBody}>
                  {[t(item.degree, locale), t(item.field, locale)]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Skills ── */}
        {skills?.items?.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{l.skills}</Text>
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
