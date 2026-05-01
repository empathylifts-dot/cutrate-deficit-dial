# Deficit Dial

Static calculator app for Ryan's CutRate lead magnet.

## Run Locally

From the project root:

```bash
python3 -m http.server 5173 --directory deficit-dial
```

Open:

```text
http://localhost:5173
```

## Lead Capture

Local development logs the lead payload to the console so you can test without sending live CRM data.

Production posts to the serverless intake endpoint:

```js
window.DEFICIT_DIAL_CONFIG = {
  leadEndpoint: "/api/lead",
  ghlWebhookUrl: "",
};
```

The Netlify function at `../netlify/functions/submit-lead.js` privately upserts the contact in GHL, writes the CutRate custom fields, adds tags, and upserts an opportunity into the `CutRate Protocol` pipeline.

Emergency fallback: set `ghlWebhookUrl` in `config.js` only if you intentionally want the browser to post directly to GHL.

## Deploy

Recommended path is Netlify because this repo includes `netlify.toml` and a lead forwarding function.

Required Netlify env var:

```text
GHL_PRIVATE_TOKEN=...
```

Optional Netlify env vars are listed in `../.env.example`. The pipeline/stage/custom-field IDs for the current Forever Habits GHL account are already baked into the function and can be overridden through those env vars later.

The public app posts to `/api/lead`. Netlify rewrites that to the function, and the function syncs the lead to GHL server-side.

## GHL Payload

The form sends a flat, workflow-friendly JSON payload with:

- contact basics: `firstName`, `email`, `phone`
- result fields: `calories`, `protein`, `carbs`, `fats`, `fiber`, `cutRate`, `zone`, `TDEE`, `BMR`, `LBM`
- intent fields: `intentScore`, `intentTier`, `pipelineStageRecommendation`, `wantsTextReminder`, `wantsCoachAudit`
- attribution: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `referral`, `shareUrl`
- tags array: `leadmagnet:deficit-dial`, `offer:cutrate-protocol`, `cutrate:*`, `zone:*`, `intent:*`

See [docs/cutrate-ghl-launch-spec.md](../docs/cutrate-ghl-launch-spec.md) for the GHL pipeline and workflow map.
