# CutRate Netlify Deploy

Live URL:

```text
https://cutrate-deficit-dial.netlify.app
```

Netlify project:

```text
cutrate-deficit-dial
```

Netlify site ID:

```text
a7128f66-eb0a-4f1f-beae-6144289f401a
```

## Deploy After Edits

Set a short-lived Netlify personal access token, then run:

```bash
NETLIFY_AUTH_TOKEN=... node scripts/deploy-cutrate-netlify.mjs
```

The script uploads:

```text
deficit-dial/*
netlify/functions/submit-lead.js
```

No secrets are stored in the script.

## Required Netlify Environment Variable

The live function expects:

```text
GHL_PRIVATE_TOKEN
```

Netlify free account blocked secret-scoped env vars during setup, so the current variable was created as a normal site env var. It is still server-side and not exposed in browser JavaScript, but it is visible inside Netlify project settings.

## Live QA

Tested on 2026-05-01:

```text
POST https://cutrate-deficit-dial.netlify.app/api/lead
GHL contact created: yes
GHL opportunity created: yes
Pipeline stage: SMS Opt-In
Fake test record cleanup: GHL delete API returned 200
```
