# CutRate Iteration Log

Use this file as the source of truth when changing the calculator, GHL workflow, or follow-up.

## Current Mechanism

Deficit Dial is the calculator.

CutRate is the recommended weekly rate of loss.

CutRate Protocol is the first 7 days after the calculator.

Performance Protected Cut is the paid coaching bridge.

Core belief shift:

```text
The problem is not just whether you are in a deficit. The problem is whether your CutRate is one you can hold without the rebound loop.
```

## Current Share Loop

After lead submit, the only CTA is:

```text
Share your CutRate
```

The share card shows only:

```text
CutRate
Zone
```

Private numbers stay private. Calories and macros are not shared.

## Current Form Fields

```text
Sex
Age
Current weight
Height
Body composition range
Lifting days
Steps
Job / activity
Training age
Strength trend
Sleep
Goal
Desired weight loss range
Currently tracking calories
Current calories
Two-week scale trend
First name
Email
Phone
Text me the Protocol
I want a coach to audit this
```

## Current Algorithm

Body fat estimate:

```text
Male lean: 12%
Male average: 18%
Male higher: 28%
Male not sure: 22%
Female lean: 20%
Female average: 28%
Female higher: 38%
Female not sure: 32%
```

CutRate:

```text
Under 10 lb to lose -> 0.75 lb/week
10-40 lb to lose -> 1 lb/week
40-60 lb to lose -> 1.5 lb/week
60+ lb to lose -> 2 lb/week max
```

Macros:

```text
BMR uses Katch-McArdle from estimated LBM.
Protein is 1.1g per lb LBM for cut or recomp.
Fat is guarded between roughly 20-30% of calories.
Carbs get the remaining calories.
Fiber target is around 14g per 1,000 calories, capped into a practical range.
```

## Do Not Break

```text
Do not expose the GHL private token or webhook in public JS.
Do not share calories/macros in the viral card.
Do not let the user text opt in without a phone number.
Do not let failed production submissions silently show success.
Do not remove the green-to-red Rebound Risk rail.
```

## Current GHL Setup

```text
Location: Forever Habits Coaching Program
Location ID: AE59IgCPafzV8OjBEu7v
Pipeline: CutRate Protocol
Pipeline ID: CgK2sdiuLa92SMADlhOu
Lead intake: /api/lead -> Netlify function -> HighLevel API
Required deploy env: GHL_PRIVATE_TOKEN
```

Pipeline stages:

```text
New CutRate Lead
Protocol Requested
SMS Opt-In
Coach Audit Requested
PPC Call Booked
```

CRM fields:

```text
CutRate - Weekly Rate
CutRate - Zone
Deficit Dial - Daily Calories
Deficit Dial - Macros
CutRate - Intent Tier
CutRate - Intent Score
CutRate - SMS Protocol Opt-In
CutRate - Coach Audit Requested
CutRate - Payload Snapshot
```

## Next Iterations To Test

```text
Button copy: Send me the Protocol vs Send my protocol
Lead copy length on mobile
Phone-first variant for SMS-heavy traffic
Women-specific ad angle with the same gender-neutral UI
CutRate share copy variants
7-day email subject lines
Coach audit checkbox placement
```
