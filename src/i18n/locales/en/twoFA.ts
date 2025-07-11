export const twoFA = {
  setup: {
    title: "Configure Two-Factor Authentication",
    description: "Two-factor authentication adds an extra layer of security to your account",
    start: "Start Setup",
    error: "Failed to configure two-factor authentication",
    success: "Two-factor authentication configured successfully",
  },
  verify: {
    title: "Verify Two-Factor Authentication",
    description: "Verify your two-factor authentication code",
    manual: "Use Google Authenticator or any other compatible app",
    code: "Enter the 6-digit code from your application",
    verify: "Verify and activate",
    error: "Invalid code. Please try again",
    recovery: "Don't have your authentication app? Use the recovery codes",
  },
  recovery: {
    title: "Recovery Codes",
    description: "Save these codes in a secure location. You will need them if you lose access to your device.",
    warning: "These codes will only be shown once!",
    continue: "Continue to dashboard",
  },
};