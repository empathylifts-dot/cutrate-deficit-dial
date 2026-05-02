# CutRate Launch Spec

Last updated: 2026-05-01

## Launch Goal

Make Deficit Dial live as a standalone lead magnet that sends every qualified submission into GHL, creates or updates the contact, routes the person into a dedicated CutRate Protocol pipeline, and starts the first-week follow-up.

## Public Asset

Name: Deficit Dial

Lead magnet: CutRate Protocol

Paid bridge: Performance Protected Cut

Primary URL target:

```text
https://mycutrate.com
```

Fallback URL:

```text
https://cutrate-deficit-dial.netlify.app
```

## Hosting Setup

Recommended host: Netlify

Reason: this repo now has a serverless lead intake function. The browser posts to `/api/lead`; Netlify rewrites that to `netlify/functions/submit-lead.js`; the function upserts the contact and opportunity into GHL through the private HighLevel API token.

Required env var:

```text
GHL_PRIVATE_TOKEN=...
```

Do not put the private token or a raw GHL webhook in `deficit-dial/config.js`. Public browser code should only call `/api/lead`.

Optional env vars are listed in `.env.example` if the GHL pipeline or custom fields are rebuilt later.

## GHL Pipeline

Pipeline name:

```text
CutRate Protocol
```

Pipeline ID:

```text
CgK2sdiuLa92SMADlhOu
```

Stages:

```text
New CutRate Lead
Protocol Requested
SMS Opt-In
Coach Audit Requested
PPC Call Booked
```

Default stage logic from the calculator payload:

```text
wantsCoachAudit = true -> Coach Audit Requested
wantsTextReminder = true -> SMS Opt-In
intentScore >= 70 -> Protocol Requested
all others -> New CutRate Lead
```

Stage IDs:

```text
New CutRate Lead = 1b691ac2-14c8-4791-9813-bc345b71a761
Protocol Requested = fd84a5c7-2067-40f9-b04c-2ddfdc0b612b
SMS Opt-In = 4ce9f621-30b2-43e6-b65f-451da57ffed4
Coach Audit Requested = 81050f3e-afb2-4903-89aa-1ab43fecdd43
PPC Call Booked = c5869191-a652-439b-958b-e7722651a2d5
```

## GHL Tags

Always add:

```text
leadmagnet:deficit-dial
offer:cutrate-protocol
cutrate:{value}lb
zone:{zone-slug}
intent:{new|warm|hot}
```

Conditional tags:

```text
sms-optin:cutrate-protocol
intent:coach-audit
signal:strength-dropping
```

## GHL Custom Fields

Created contact custom fields:

```text
CutRate - Weekly Rate = cTH9bgmXeBKszDZITcyV
CutRate - Zone = F9mSlslIVSwMwBDIfzpt
Deficit Dial - Daily Calories = jDfRwLdgmFmn7Zj1BQZU
Deficit Dial - Macros = ApyarK56VI8BrENmg2n7
CutRate - Intent Tier = KgD51d96ywurnLIgh1j3
CutRate - Intent Score = 3mkVfzMLkY5PT8ADhi16
CutRate - SMS Protocol Opt-In = Xc29eCtEMjGyy8VIKQr0
CutRate - Coach Audit Requested = DQIHEYni9Wjo8LTIwxIo
CutRate - Payload Snapshot = Fa8L19Uw20h4NnsUiYHZ
CutRate - Submitted At = QNMIDwZ67UOeFDZ1mlmn
CutRate - Share URL = ppENpXgsSMPhMloYvDaM
CutRate - Page URL = HQCyrObsfyklxQ4yUkmL
CutRate - UTM Source = UHgsedrRPD2YpeuByTEq
CutRate - UTM Medium = YBP7BI9xoIenSMGi1Vt3
CutRate - UTM Campaign = pCuVYWeWevK89trnx9sC
CutRate - Referral = eosORpe52Ze8wa7XFgVo
```

## GHL Workflow

Direct API intake is live-ready through `netlify/functions/submit-lead.js`. A GHL workflow is still useful for fulfillment once the contact/opportunity exists.

The Netlify function also has a Protocol delivery switch:

```text
CUTRATE_PROTOCOL_DELIVERY_ENABLED=true
CUTRATE_PROTOCOL_SMS_ENABLED=true
```

Live production has both switches on. When enabled, the function sends the immediate CutRate Protocol email, schedules day 2, day 4, and day 7 follow-up emails, and sends the SMS sequence only when the person checked `Text me the Protocol` and submitted a phone number.

Suggested workflow name:

```text
Deficit Dial - CutRate Protocol Intake
```

Trigger:

```text
Contact Tag Added: offer:cutrate-protocol
```

Actions:

1. Send the CutRate Protocol email immediately.
2. If tag `sms-optin:cutrate-protocol` is present and phone is present, send the Protocol SMS sequence.
3. If tag `intent:coach-audit` is present, create an internal notification or task for Ryan.
4. Wait 1 day, then start the first-week follow-up sequence.

## First Automation Rules

Email immediately:

```text
Subject: Your CutRate is set
```

SMS sequence when opted in:

```text
Immediate: Your CutRate is set. Run the target for 7 days before adjusting.
Day 2: First 48 hours are mostly noise.
Day 4: Do not overcorrect.
Day 7: Read the average, then adjust small.
```

Internal notification when audit requested:

```text
New CutRate audit request: {{contact.name}}. Check calories, CutRate, strength trend, and current calories.
```

## QA Checklist

Run these before traffic:

```text
Submit one normal lead.
Confirm contact exists in GHL.
Confirm custom fields populate.
Confirm tags populate.
Confirm opportunity appears in CutRate Protocol pipeline.
Confirm stage matches payload recommendation.
Confirm immediate email sends.
Confirm SMS only sends when checkbox is selected and phone exists.
Confirm test lead can be deleted after QA.
```

## Sources

HighLevel inbound webhook trigger:

```text
https://help.gohighlevel.com/support/solutions/articles/155000003147-trigger-inbound-webhook
```

HighLevel workflow triggers list:

```text
https://help.gohighlevel.com/support/solutions/articles/155000002292-a-list-of-workflow-triggers
```

HighLevel opportunities API reference:

```text
https://marketplace.gohighlevel.com/docs/ghl/opportunities/opportunities/index.html
```
