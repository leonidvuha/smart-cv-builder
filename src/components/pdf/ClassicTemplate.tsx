/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
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
    fontFamily: "Helvetica-Bold",
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
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#1a9e75",
    marginBottom: 8,
    letterSpacing: 1,
  },
  bodyText: {
    fontSize: 10,
    color: "#333333",
    lineHeight: 1.6,
  },
});

type ResumeData = {
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  email: string;
  aiSummary: string;
};

export function ClassicTemplate({ data }: { data: ResumeData }): any {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>
            {data.firstName} {data.lastName}
          </Text>
          <View style={styles.contactRow}>
            {data.email ? (
              <Text style={styles.contactText}>{data.email}</Text>
            ) : null}
            {data.phone ? (
              <Text style={styles.contactText}>{data.phone}</Text>
            ) : null}
            {data.address ? (
              <Text style={styles.contactText}>{data.address}</Text>
            ) : null}
          </View>
        </View>

        {data.aiSummary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PROFESSIONAL PROFILE</Text>
            <Text style={styles.bodyText}>{data.aiSummary}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
