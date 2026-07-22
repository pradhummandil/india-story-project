/**
 * Utility to normalize Indian state/region names to canonical database values.
 * Handles common abbreviations, old names, and punctuation differences.
 */

const CANONICAL_STATES: Record<string, string> = {
  // Abbreviations & aliases
  "mp": "Madhya Pradesh",
  "madhya pradesh": "Madhya Pradesh",
  "up": "Uttar Pradesh",
  "uttar pradesh": "Uttar Pradesh",
  "ap": "Andhra Pradesh",
  "andhra pradesh": "Andhra Pradesh",
  "andhra": "Andhra Pradesh",
  "hp": "Himachal Pradesh",
  "himachal pradesh": "Himachal Pradesh",
  "wb": "West Bengal",
  "west bengal": "West Bengal",
  "jk": "Jammu and Kashmir",
  "jammu & kashmir": "Jammu and Kashmir",
  "jammu and kashmir": "Jammu and Kashmir",
  "j&k": "Jammu and Kashmir",
  
  // NCT Delhi variations
  "delhi": "Delhi",
  "nct delhi": "Delhi",
  "nct of delhi": "Delhi",
  "national capital territory of delhi": "Delhi",
  
  // Historical / spelling variations
  "orissa": "Odisha",
  "odisha": "Odisha",
  "uttaranchal": "Uttarakhand",
  "uttarakhand": "Uttarakhand",
  "chhattisgarh": "Chhattisgarh",
  "chhatisgarh": "Chhattisgarh",
  "telangana": "Telangana",
  "telengana": "Telangana",
  
  // Other Union Territories and States
  "andaman and nicobar islands": "Andaman and Nicobar Islands",
  "andaman and nicobar": "Andaman and Nicobar Islands",
  "andaman & nicobar": "Andaman and Nicobar Islands",
  "arunachal pradesh": "Arunachal Pradesh",
  "arunachal": "Arunachal Pradesh",
  "assam": "Assam",
  "bihar": "Bihar",
  "chandigarh": "Chandigarh",
  "dadra and nagar haveli": "Dadra and Nagar Haveli",
  "daman and diu": "Daman and Diu",
  "goa": "Goa",
  "gujarat": "Gujarat",
  "haryana": "Haryana",
  "jharkhand": "Jharkhand",
  "karnataka": "Karnataka",
  "kerala": "Kerala",
  "lakshadweep": "Lakshadweep",
  "maharashtra": "Maharashtra",
  "manipur": "Manipur",
  "meghalaya": "Meghalaya",
  "mizoram": "Mizoram",
  "nagaland": "Nagaland",
  "puducherry": "Puducherry",
  "pondicherry": "Puducherry",
  "punjab": "Punjab",
  "rajasthan": "Rajasthan",
  "sikkim": "Sikkim",
  "tamil nadu": "Tamil Nadu",
  "tripura": "Tripura",
};

/**
 * Normalizes any state name string to its canonical database name.
 * If no match is found, returns the trimmed original name.
 */
export function normalizeStateName(name: string): string {
  if (!name) return "";
  const clean = name.trim().toLowerCase().replace(/\s+/g, " ");
  return CANONICAL_STATES[clean] || name.trim();
}

/**
 * Converts a canonical state name into its standard url slug format (e.g. "madhya-pradesh")
 */
export function stateNameToSlug(name: string): string {
  const canonical = normalizeStateName(name);
  return canonical
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
