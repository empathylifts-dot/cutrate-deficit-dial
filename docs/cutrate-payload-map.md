# Deficit Dial Payload Map

Use this when mapping the inbound webhook in GHL.

## Contact Fields

```text
firstName -> First Name
email -> Email
phone -> Phone
leadSource -> Contact Source
```

## Custom Field Map

```text
cutRate -> CutRate - Weekly Rate
zone -> CutRate - Zone
calories -> Deficit Dial - Daily Calories
protein/carbs/fats/fiber -> Deficit Dial - Macros
intentTier -> CutRate - Intent Tier
intentScore -> CutRate - Intent Score
wantsTextReminder -> CutRate - SMS Protocol Opt-In
wantsCoachAudit -> CutRate - Coach Audit Requested
payload snapshot -> CutRate - Payload Snapshot
```

## Routing Fields

```text
pipelineName = CutRate Protocol
pipelineStageRecommendation = New CutRate Lead | Protocol Text Opt-In | High Intent CutRate Lead | Coach Audit Requested
intentScore = 0-100
intentTier = new | warm | hot
tags = array of GHL tags to add
```

Actual GHL stage mapping:

```text
wantsCoachAudit = true -> Coach Audit Requested
wantsTextReminder = true OR Protocol Text Opt-In -> SMS Opt-In
High Intent CutRate Lead OR intentScore >= 70 -> Protocol Requested
default -> New CutRate Lead
```

## Sample Payload

```json
{
  "schemaVersion": "cutrate-lead-v1",
  "leadSource": "Deficit Dial",
  "leadMagnet": "CutRate Protocol",
  "offerBridge": "Performance Protected Cut",
  "firstName": "Test",
  "email": "test@example.com",
  "phone": "5555555555",
  "goal": "cut",
  "sex": "male",
  "age": 32,
  "calories": 2670,
  "protein": 185,
  "carbs": 350,
  "fats": 60,
  "fiber": "32-42",
  "BMR": 1980,
  "TDEE": 3170,
  "bodyWeight": 205,
  "bodyFat": 18,
  "bodyComp": "average",
  "bodyCompLabel": "Average",
  "LBM": 168,
  "liftingDays": 4,
  "steps": "8000-11999",
  "activity": "desk",
  "trainingAge": "3-7",
  "strengthTrend": "stable",
  "sleep": "7-8",
  "scaleTrend": "same",
  "desiredWeightLossRange": "20-40",
  "currentCalories": "",
  "cutRate": 1,
  "zone": "Performance Cut Zone",
  "resultType": "Performance cut",
  "warnings": [],
  "wantsTextReminder": true,
  "wantsCoachAudit": false,
  "intentScore": 25,
  "intentTier": "new",
  "pipelineName": "CutRate Protocol",
  "pipelineStageRecommendation": "Protocol Text Opt-In",
  "tags": [
    "leadmagnet:deficit-dial",
    "offer:cutrate-protocol",
    "cutrate:1lb",
    "zone:performance-cut-zone",
    "intent:new",
    "sms-optin:cutrate-protocol"
  ],
  "shareUrl": "https://cutrate.ryanschroers.com/?utm_source=deficit_dial_share&utm_medium=referral",
  "pageUrl": "https://cutrate.ryanschroers.com/",
  "utm_source": "",
  "utm_medium": "",
  "utm_campaign": "",
  "utm_content": "",
  "utm_term": "",
  "referral": "",
  "submittedAt": "2026-05-01T00:00:00.000Z"
}
```
