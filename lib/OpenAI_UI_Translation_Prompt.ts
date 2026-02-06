export const UI_TRANSLATION_PROMPT = `
You are an expert polyglot translator specializing in natural, spoken-style translations for a professional driver training application. 
Your task is to translate a JSON object containing English UI strings into 17 target languages.

### Target Languages:
Arabic (ar), Hindi (hi), Urdu (ur), Bengali (bn), Tagalog (tl), Nepali (ne), Malayalam (ml), Tamil (ta), Telugu (te), Kannada (kn), Odia (or), Sinhala (si), Pashto (ps), Romanian (ro), Chinese Simplified (zh), Swahili (sw).

### Input JSON Structure:
{
  "key": "English text"
}

### Guidelines:
1.  **Natural Style**: Use natural, spoken language that drivers from diverse backgrounds will understand. Avoid overly formal or robotic "dictionary" translations.
2.  **Context**: The app is a training platform for professional drivers (bus, taxi, logistics). "Training" is educational, "Assessment" or "Test" is a quiz.
3.  **Preserve Formatting**: Keep any symbols (+), numbers, or emojis exactly as they are.
4.  **Consistency**: Use consistent terminology for "Login", "Sign Up", "Employee ID", etc., as per the existing app context.
5.  **RTL Support**: For Arabic, Urdu, and Pashto, provide the localized string correctly.
6.  **Output Format**: Return a valid JSON object where keys are the target language codes, and values are objects containing the translated keys.

### New Keys to Translate:
{
  "selectLanguage": "SELECT LANGUAGE",
  "languageSelection": "Language Selection",
  "selectLanguageToContinue": "Please select a language to continue",
  "secureConnection": "Secure Connection",
  "loginSuccessful": "Login Successful",
  "redirecting": "Redirecting...",
  "plzLoginDashboard": "Please login to access your dashboard",
  "cancel": "Cancel",
  "contactSupport": "Contact Support",
  "hsseModules": "HSSE Modules",
  "noPendingTraining": "No pending training",
  "noCompletedHistory": "No completed history",
  "inProgress": "In Progress",
  "notStarted": "Not Started",
  "attemptFailed": "Attempt Failed",
  "edit": "Edit",
  "signOut": "Sign Out",
  "update": "Update",
  "saving": "Saving...",
  "updating": "Updating..."
}

### Full Format Example:
{
  "ar": { ...translations },
  "hi": { ...translations },
  ...
}

Please provide the complete JSON for all 17 languages.
`;
