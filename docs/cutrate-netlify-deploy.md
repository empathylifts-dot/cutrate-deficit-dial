# CutRate Netlify Deploy

Live URL:

```text
https://cutrate-deficit-dial.netlify.app
```

Target custom domain:

```text
https://mycutrate.com
```

Netlify has the custom domain attached. DNS is hosted at GoDaddy and still needs:

```text
Type: A
Name: @
Value: 75.2.60.5
TTL: default

Type: CNAME
Name: www
Value: cutrate-deficit-dial.netlify.app
TTL: default
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

Protocol delivery env vars:

```text
CUTRATE_PROTOCOL_DELIVERY_ENABLED=true
CUTRATE_PROTOCOL_SMS_ENABLED=true
```

## Live QA

Tested on 2026-05-01:

```text
POST https://cutrate-deficit-dial.netlify.app/api/lead
GHL contact created: yes
GHL opportunity created: yes
Pipeline stage: SMS Opt-In
Fake test record cleanup: GHL delete API returned 200
```

Full stage sweep tested:

```text
New CutRate Lead: pass
SMS Opt-In: pass
Coach Audit Requested: pass
Protocol Requested: pass
Calories custom field: pass
CutRate custom field: pass
UTM custom fields: pass
Fake test records cleanup: pass
```

Browser UI lead form tested:

```text
Live page loaded: pass
Step 1 body inputs: pass
Step 2 training inputs: pass
Step 3 goal inputs: pass
Lead form submission: pass
GHL contact tags: pass
GHL opportunity in CutRate Protocol pipeline: pass
GHL stage: New CutRate Lead
GHL custom fields: pass
UTM attribution fields: pass
Fake browser QA record cleanup: pass
```
