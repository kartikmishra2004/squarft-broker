/**
 * Property Helper Functions
 * Shared utility functions for formatting property data consistently across components
 */

/**
 * Format text value by replacing underscores with spaces and capitalizing each word
 * @param {any} value - The value to format
 * @param {string} fallback - Fallback value if input is empty (default: "N/A")
 * @returns {string} Formatted text value
 */
export const formatTextValue = (value, fallback = "N/A") => {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value)
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Format RERA status value consistently
 * Checks the approval_status column from database
 * @param {any} value - The RERA approval_status value to format
 * @returns {string} Formatted RERA status: "Approved", "Pending", "Not Approved", or "N/A"
 */
export const formatReraStatus = (value) => {
  if (value === undefined || value === null || value === "") return "N/A";
  if (typeof value === "boolean") return value ? "Approved" : "Not Approved";

  const normalized = String(value).trim().toLowerCase().replace(/[\s-]+/g, "_");
  
  // Check for approved status
  if (normalized === "approved" || normalized === "yes" || normalized === "true") return "Approved";
  
  // Check for pending status
  if (normalized === "pending" || normalized === "in_progress" || normalized === "under_review") return "Pending";
  
  // Check for not approved/rejected status
  if (
    normalized === "not_approved" ||
    normalized === "unapproved" ||
    normalized === "rejected" ||
    normalized === "no" ||
    normalized === "false"
  ) {
    return "Not Approved";
  }
  
  return formatTextValue(value);
};

/**
 * Get the first non-empty value from an object using a list of possible field names
 * @param {Object} item - The object to search in
 * @param {Array<string>} fields - Array of field names to check in priority order
 * @returns {any} The first non-empty value found, or undefined
 */
export const firstValue = (item, fields) => {
  for (const field of fields) {
    const value = item?.[field];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return undefined;
};
