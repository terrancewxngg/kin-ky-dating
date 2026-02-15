export const UBC_DOMAINS = ["@ubc.ca", "@student.ubc.ca"];

export function isUbcEmail(email: string): boolean {
  return UBC_DOMAINS.some((d) => email.toLowerCase().trim().endsWith(d));
}

export function getCurrentRoundKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const start = new Date(y, 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneDay = 86400000;
  const w = Math.ceil((diff / oneDay + start.getDay() + 1) / 7);
  return `${y}-W${String(w).padStart(2, "0")}`;
}

export const ICEBREAKER_QUESTION_IDS = ["q2", "q4", "q5"];

export const MAX_BIO = 200;

export const PRONOUNS_OPTIONS = [
  "he/him",
  "she/her",
  "they/them",
  "he/they",
  "she/they",
  "any pronouns",
  "prefer not to say",
];

export const YEAR_OPTIONS = [
  "1st year",
  "2nd year",
  "3rd year",
  "4th year",
  "5th year+",
  "Graduate",
  "Alumni",
];

export const FACULTY_OPTIONS = [
  "Arts",
  "Science",
  "Engineering",
  "Commerce",
  "Forestry",
  "Kinesiology",
  "Land & Food Systems",
  "Medicine",
  "Nursing",
  "Pharmaceutical Sciences",
  "Education",
  "Law",
  "Music",
  "Applied Science",
  "Other",
];