window.DEFICIT_DIAL_CONFIG = {
  // Production default for the Netlify deploy in this repo.
  // The public app posts here, then the serverless function forwards to GHL.
  leadEndpoint: "/api/lead",

  // Emergency fallback only. Prefer GHL_WEBHOOK_URL in Netlify env vars so
  // the raw GHL webhook is not exposed in browser JavaScript.
  ghlWebhookUrl: "",
};
