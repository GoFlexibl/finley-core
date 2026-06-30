/**
 * Helper functions for chat functionality.
 */

/** Extracts year from text (e.g., "2024", "in 2025"). */
export const extractYearFromText = (text: string): number | null => {
  const m = text.match(/\b(20\d{2})\b/);
  return m ? Number(m[1]) : null;
};

/** Checks if text is an affirmation response. */
export const isAffirmation = (text: string): boolean => {
  return /^(yes|yeah|yep|sure|ok|okay|please|go ahead|explain|tell me)$/i.test(text.trim());
};

/** Checks if text is a list intent. */
export const isListIntent = (text: string): boolean => {
  return /\b(list|available|options|show me)\b/i.test(text) || /\bgive me the list\b/i.test(text);
};

/** Checks if text mentions payment methods. */
export const isPaymentMethodQuery = (text: string): boolean => {
  return /\b(payment method|payment methods|payment type|payment types)\b/i.test(text);
};

/**
 * Strips markdown formatting to plain text (headings, bold/italic, bullets,
 * code, links). Pure — extracted from ChatInterface.
 */
export const cleanMarkdown = (text: string): string => {
  return text
    .replace(/## /g, '')                      // Remove h2 markers
    .replace(/### /g, '')                     // Remove h3 markers
    .replace(/^# /gm, '')                     // Remove h1 markers at line start
    .replace(/\*\*/g, '')                     // Remove bold markers
    .replace(/\* /g, '• ')                    // Convert bullet markers to actual bullets
    .replace(/^- /gm, '• ')                   // Convert dash bullets to actual bullets
    .replace(/`/g, '')                        // Remove code markers
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove markdown links but keep text
    .replace(/_/g, '');                       // Remove italic markers
};
