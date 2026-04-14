// ---------------------------------------------------------------------------
// SmartCV Builder — Resume type definitions
// Shared between API routes, frontend components, and PDF generation.
// ---------------------------------------------------------------------------

/** Supported locales for resume generation */
export type ResumeLocale = "en" | "de";

// ---------------------------------------------------------------------------
// Resume sections — the structure OpenAI returns per locale
// ---------------------------------------------------------------------------

export interface PersonalSection {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  photoUrl?: string; // Uploaded photo, injected after OpenAI response
}

export interface SummarySection {
  text: string | null;
}

export interface ExperienceItem {
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  responsibilities: string;
}

export interface ExperienceSection {
  items: ExperienceItem[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  field: string; // NOT fieldOfStudy
  startDate: string;
  endDate: string;
}

export interface EducationSection {
  items: EducationItem[];
}

export interface SkillsSection {
  items: string[]; // Plain string array, not objects
}

// ---------------------------------------------------------------------------
// ResumeData — a complete, single-locale resume ready for PDF rendering.
// This is what ClassicTemplate receives as `data` prop.
// ---------------------------------------------------------------------------

export interface ResumeData {
  personal: PersonalSection;
  summary: SummarySection;
  experience: ExperienceSection;
  education: EducationSection;
  skills: SkillsSection;
}

// ---------------------------------------------------------------------------
// LocalizedContent — stored in Resume.localizedContent (Prisma Json field).
// Both locales are REQUIRED — OpenAI returns them in a single request.
// ---------------------------------------------------------------------------

export interface LocalizedContent {
  en: ResumeData;
  de: ResumeData;
}

// ---------------------------------------------------------------------------
// RawContent — stored in Resume.rawContent (Prisma Json field).
// Original user input before AI processing. Fields can be in any language.
// ---------------------------------------------------------------------------

export interface RawContent {
  /** Raw text from chat messages (user's free-form input) */
  chatText: string;

  /** Structured fields from the right-side form */
  form: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
}

// ---------------------------------------------------------------------------
// Resume status — mirrors the `status` column in Prisma schema
// ---------------------------------------------------------------------------

export type ResumeStatus = "draft" | "processing" | "ready" | "error";

// ---------------------------------------------------------------------------
// Helper: extract a single locale from LocalizedContent
// ---------------------------------------------------------------------------

export function getResumeByLocale(
  content: LocalizedContent,
  locale: ResumeLocale,
): ResumeData {
  return content[locale];
}
