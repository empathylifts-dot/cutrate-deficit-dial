const REQUIRED_FIELDS = ["firstName", "email", "schemaVersion"];
const GHL_API_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

const DEFAULT_GHL = {
  locationId: "AE59IgCPafzV8OjBEu7v",
  pipelineId: "CgK2sdiuLa92SMADlhOu",
  stages: {
    newLead: "1b691ac2-14c8-4791-9813-bc345b71a761",
    protocolRequested: "fd84a5c7-2067-40f9-b04c-2ddfdc0b612b",
    smsOptIn: "4ce9f621-30b2-43e6-b65f-451da57ffed4",
    coachAudit: "81050f3e-afb2-4903-89aa-1ab43fecdd43",
    bookedCall: "c5869191-a652-439b-958b-e7722651a2d5",
  },
  fields: {
    cutRate: "cTH9bgmXeBKszDZITcyV",
    zone: "F9mSlslIVSwMwBDIfzpt",
    calories: "jDfRwLdgmFmn7Zj1BQZU",
    macros: "ApyarK56VI8BrENmg2n7",
    intentTier: "KgD51d96ywurnLIgh1j3",
    intentScore: "3mkVfzMLkY5PT8ADhi16",
    smsOptIn: "Xc29eCtEMjGyy8VIKQr0",
    coachAudit: "DQIHEYni9Wjo8LTIwxIo",
    payloadSnapshot: "Fa8L19Uw20h4NnsUiYHZ",
    submittedAt: "QNMIDwZ67UOeFDZ1mlmn",
    shareUrl: "ppENpXgsSMPhMloYvDaM",
    pageUrl: "HQCyrObsfyklxQ4yUkmL",
    utmSource: "UHgsedrRPD2YpeuByTEq",
    utmMedium: "YBP7BI9xoIenSMGi1Vt3",
    utmCampaign: "pCuVYWeWevK89trnx9sC",
    referral: "eosORpe52Ze8wa7XFgVo",
  },
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

function parsePayload(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch {
    return null;
  }
}

function getMissingFields(payload) {
  return REQUIRED_FIELDS.filter((field) => !payload[field]);
}

function isLikelyBot(payload) {
  const antiSpam = payload.antiSpam || {};
  if (antiSpam.website) return true;
  if (Number(antiSpam.elapsedMs) > 0 && Number(antiSpam.elapsedMs) < 2500) return true;
  return false;
}

function getEnv(name, fallback = "") {
  return process.env[name] || fallback;
}

function getGhlConfig() {
  return {
    token: process.env.GHL_PRIVATE_TOKEN || "",
    locationId: getEnv("GHL_LOCATION_ID", DEFAULT_GHL.locationId),
    pipelineId: getEnv("GHL_CUTRATE_PIPELINE_ID", DEFAULT_GHL.pipelineId),
    stages: {
      newLead: getEnv("GHL_STAGE_NEW_CUTRATE_LEAD", DEFAULT_GHL.stages.newLead),
      protocolRequested: getEnv("GHL_STAGE_PROTOCOL_REQUESTED", DEFAULT_GHL.stages.protocolRequested),
      smsOptIn: getEnv("GHL_STAGE_SMS_OPT_IN", DEFAULT_GHL.stages.smsOptIn),
      coachAudit: getEnv("GHL_STAGE_COACH_AUDIT", DEFAULT_GHL.stages.coachAudit),
      bookedCall: getEnv("GHL_STAGE_PPC_CALL_BOOKED", DEFAULT_GHL.stages.bookedCall),
    },
    fields: {
      cutRate: getEnv("GHL_FIELD_CUTRATE", DEFAULT_GHL.fields.cutRate),
      zone: getEnv("GHL_FIELD_ZONE", DEFAULT_GHL.fields.zone),
      calories: getEnv("GHL_FIELD_CALORIES", DEFAULT_GHL.fields.calories),
      macros: getEnv("GHL_FIELD_MACROS", DEFAULT_GHL.fields.macros),
      intentTier: getEnv("GHL_FIELD_INTENT_TIER", DEFAULT_GHL.fields.intentTier),
      intentScore: getEnv("GHL_FIELD_INTENT_SCORE", DEFAULT_GHL.fields.intentScore),
      smsOptIn: getEnv("GHL_FIELD_SMS_OPT_IN", DEFAULT_GHL.fields.smsOptIn),
      coachAudit: getEnv("GHL_FIELD_COACH_AUDIT", DEFAULT_GHL.fields.coachAudit),
      payloadSnapshot: getEnv("GHL_FIELD_PAYLOAD_SNAPSHOT", DEFAULT_GHL.fields.payloadSnapshot),
      submittedAt: getEnv("GHL_FIELD_SUBMITTED_AT", DEFAULT_GHL.fields.submittedAt),
      shareUrl: getEnv("GHL_FIELD_SHARE_URL", DEFAULT_GHL.fields.shareUrl),
      pageUrl: getEnv("GHL_FIELD_PAGE_URL", DEFAULT_GHL.fields.pageUrl),
      utmSource: getEnv("GHL_FIELD_UTM_SOURCE", DEFAULT_GHL.fields.utmSource),
      utmMedium: getEnv("GHL_FIELD_UTM_MEDIUM", DEFAULT_GHL.fields.utmMedium),
      utmCampaign: getEnv("GHL_FIELD_UTM_CAMPAIGN", DEFAULT_GHL.fields.utmCampaign),
      referral: getEnv("GHL_FIELD_REFERRAL", DEFAULT_GHL.fields.referral),
    },
  };
}

function getProtocolDeliveryConfig() {
  return {
    enabled: process.env.CUTRATE_PROTOCOL_DELIVERY_ENABLED === "true",
    smsEnabled: process.env.CUTRATE_PROTOCOL_SMS_ENABLED === "true",
  };
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : "";
}

function yesNo(value) {
  return value ? "yes" : "no";
}

function getStage(payload, stages) {
  if (payload.wantsCoachAudit) {
    return { id: stages.coachAudit, name: "Coach Audit Requested" };
  }

  if (payload.wantsTextReminder || payload.pipelineStageRecommendation === "Protocol Text Opt-In") {
    return { id: stages.smsOptIn, name: "SMS Opt-In" };
  }

  if (payload.pipelineStageRecommendation === "High Intent CutRate Lead" || Number(payload.intentScore) >= 70) {
    return { id: stages.protocolRequested, name: "Protocol Requested" };
  }

  return { id: stages.newLead, name: "New CutRate Lead" };
}

function getTags(payload) {
  const tags = Array.isArray(payload.tags) ? payload.tags : [];
  return Array.from(new Set(["Deficit Dial", "CutRate Protocol", ...tags].filter(Boolean)));
}

function getMacrosSummary(payload) {
  return [
    `Protein: ${payload.protein || ""}g`,
    `Carbs: ${payload.carbs || ""}g`,
    `Fat: ${payload.fats || ""}g`,
    `Fiber: ${payload.fiber || ""}g`,
  ].join(" / ");
}

function getPayloadSnapshot(payload) {
  const snapshot = {
    submittedAt: payload.submittedAt || payload.timestamp || "",
    leadMagnet: payload.leadMagnet,
    offerBridge: payload.offerBridge,
    cutRate: payload.cutRate,
    zone: payload.zone,
    calories: payload.calories,
    protein: payload.protein,
    carbs: payload.carbs,
    fats: payload.fats,
    fiber: payload.fiber,
    maintenance: payload.TDEE,
    bodyWeight: payload.bodyWeight,
    bodyComp: payload.bodyCompLabel || payload.bodyComp,
    liftingDays: payload.liftingDays,
    steps: payload.steps,
    trainingAge: payload.trainingAge,
    strengthTrend: payload.strengthTrend,
    sleep: payload.sleep,
    scaleTrend: payload.scaleTrend,
    desiredWeightLossRange: payload.desiredWeightLossRange,
    currentCalories: payload.currentCalories,
    wantsTextReminder: Boolean(payload.wantsTextReminder),
    wantsCoachAudit: Boolean(payload.wantsCoachAudit),
    intentScore: payload.intentScore,
    intentTier: payload.intentTier,
    shareUrl: payload.shareUrl,
    pageUrl: payload.pageUrl,
    utm_source: payload.utm_source,
    utm_medium: payload.utm_medium,
    utm_campaign: payload.utm_campaign,
    referral: payload.referral,
  };

  return JSON.stringify(snapshot);
}

function buildCustomFields(payload, fields) {
  const values = [
    { id: fields.cutRate, value: toNumber(payload.cutRate) },
    { id: fields.zone, value: payload.zone || "" },
    { id: fields.calories, value: toNumber(payload.calories) },
    { id: fields.macros, value: getMacrosSummary(payload) },
    { id: fields.intentTier, value: payload.intentTier || "" },
    { id: fields.intentScore, value: toNumber(payload.intentScore) },
    { id: fields.smsOptIn, value: yesNo(payload.wantsTextReminder) },
    { id: fields.coachAudit, value: yesNo(payload.wantsCoachAudit) },
    { id: fields.payloadSnapshot, value: getPayloadSnapshot(payload) },
    { id: fields.submittedAt, value: payload.submittedAt || payload.timestamp || "" },
    { id: fields.shareUrl, value: payload.shareUrl || "" },
    { id: fields.pageUrl, value: payload.pageUrl || "" },
    { id: fields.utmSource, value: payload.utm_source || "" },
    { id: fields.utmMedium, value: payload.utm_medium || "" },
    { id: fields.utmCampaign, value: payload.utm_campaign || "" },
    { id: fields.referral, value: payload.referral || "" },
  ];

  return values.filter((field) => field.id);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildProtocolEmail(payload, day = 0) {
  const firstName = escapeHtml(payload.firstName || "there");
  const cutRate = escapeHtml(payload.cutRate || "");
  const zone = escapeHtml(payload.zone || "");
  const calories = escapeHtml(payload.calories || "");
  const macros = escapeHtml(getMacrosSummary(payload));

  const emails = {
    0: {
      subject: "Your CutRate is set",
      html: `
        <p>Hey ${firstName},</p>
        <p>Your Deficit Dial is set.</p>
        <p><strong>CutRate:</strong> ${cutRate} lb/week<br>
        <strong>Zone:</strong> ${zone}<br>
        <strong>Calories:</strong> ${calories}<br>
        <strong>Macros:</strong> ${macros}</p>
        <p>Here is the first rule: do not adjust after one weigh-in.</p>
        <p>Run the target for 7 days. Weigh in daily if you can, then look at the weekly trend. One high morning does not mean the plan failed. One low morning does not mean you should cut harder.</p>
        <p>The whole point of your CutRate is to find the deficit you can repeat without the rebound loop: flat training, hunger spikes, low energy, and the weekend erasing everything.</p>
        <p><strong>Day 1 job:</strong> hit calories and protein. That is it.</p>
      `,
    },
    2: {
      subject: "The first 48 hours are not the trend",
      html: `
        <p>Hey ${firstName},</p>
        <p>Scale jumps in the first couple days are usually noise.</p>
        <p>More carbs, sodium, a hard lift, poor sleep, soreness, a later dinner. Any of those can move the scale without meaning fat gain.</p>
        <p>Stay on the target. Hit protein. Keep steps normal. Do not try to make up for a random weigh-in by slashing calories.</p>
      `,
    },
    4: {
      subject: "This is where people usually overcorrect",
      html: `
        <p>Hey ${firstName},</p>
        <p>Around day 4, most people start negotiating.</p>
        <p>If weight is down, they want to cut harder. If weight is flat, they want to cut harder. If hunger is up, they assume the plan is working and still cut harder.</p>
        <p>That is the rebound setup.</p>
        <p>Your job is to hold the CutRate long enough to read the trend. If training is already feeling flat, that is data too.</p>
      `,
    },
    7: {
      subject: "Now read the trend",
      html: `
        <p>Hey ${firstName},</p>
        <p>Now you have enough signal to make a smarter adjustment.</p>
        <p>Do not compare your highest weigh-in to your lowest weigh-in. Compare the average.</p>
        <p>If the average is moving near your CutRate, keep going. If nothing moved and tracking was honest, adjust small. If you were starving, flat, and already thinking about bailing, the issue is not discipline. The issue is the setup.</p>
        <p>This is where Performance Protected Cut starts: keeping the cut moving without turning it into the rebound loop again.</p>
        <p>Reply with your 7-day average and CutRate. I will tell you what signal I would look at first.</p>
      `,
    },
  };

  return emails[day];
}

function getScheduledTimestamp(daysFromNow) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return nowSeconds + daysFromNow * 24 * 60 * 60;
}

async function ghlFetch(path, config, options = {}) {
  const ghlResponse = await fetch(`${GHL_API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.token}`,
      Version: GHL_VERSION,
      ...(options.headers || {}),
    },
  });

  const text = await ghlResponse.text();
  let body = {};
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }
  }

  if (!ghlResponse.ok) {
    const detail = typeof body.raw === "string" ? body.raw : JSON.stringify(body);
    throw new Error(`GHL ${path} failed ${ghlResponse.status}: ${detail.slice(0, 500)}`);
  }

  return body;
}

async function sendProtocolMessage(config, body) {
  return ghlFetch("/conversations/messages", config, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

async function maybeSendProtocolSequence(payload, contactId, config) {
  const delivery = getProtocolDeliveryConfig();
  if (!delivery.enabled) {
    return { enabled: false };
  }

  const sent = [];
  const errors = [];
  const emailSchedule = [
    { day: 0 },
    { day: 2, scheduledTimestamp: getScheduledTimestamp(2) },
    { day: 4, scheduledTimestamp: getScheduledTimestamp(4) },
    { day: 7, scheduledTimestamp: getScheduledTimestamp(7) },
  ];

  for (const item of emailSchedule) {
    const email = buildProtocolEmail(payload, item.day);
    try {
      const result = await sendProtocolMessage(config, {
        type: "Email",
        contactId,
        subject: email.subject,
        html: email.html,
        ...(item.scheduledTimestamp ? { scheduledTimestamp: item.scheduledTimestamp } : {}),
      });
      sent.push({ type: "Email", day: item.day, id: result.messageId || result.id || "" });
    } catch (error) {
      errors.push({ type: "Email", day: item.day, error: error.message });
    }
  }

  if (delivery.smsEnabled && payload.wantsTextReminder && payload.phone) {
    try {
      const result = await sendProtocolMessage(config, {
        type: "SMS",
        contactId,
        message:
          "Your CutRate is set. Run the target for 7 days before adjusting. Day 1 job: hit calories and protein. Do not panic-adjust off one weigh-in.",
      });
      sent.push({ type: "SMS", day: 0, id: result.messageId || result.id || "" });
    } catch (error) {
      errors.push({ type: "SMS", day: 0, error: error.message });
    }
  }

  return { enabled: true, sent, errors };
}

async function syncLeadToGhl(payload) {
  const config = getGhlConfig();
  if (!config.token) {
    return null;
  }

  const stage = getStage(payload, config.stages);
  const contactBody = {
    locationId: config.locationId,
    firstName: payload.firstName,
    email: payload.email,
    source: payload.leadSource || "Deficit Dial",
    tags: getTags(payload),
    customFields: buildCustomFields(payload, config.fields),
  };

  if (payload.phone) {
    contactBody.phone = payload.phone;
  }

  const contactResult = await ghlFetch("/contacts/upsert", config, {
    method: "POST",
    body: JSON.stringify(contactBody),
  });

  const contact = contactResult.contact || {};
  if (!contact.id) {
    throw new Error("GHL contact upsert returned no contact id");
  }

  const opportunityName = `CutRate: ${payload.firstName} - ${payload.cutRate || "?"} lb/week`;
  const opportunityResult = await ghlFetch("/opportunities/upsert", config, {
    method: "POST",
    body: JSON.stringify({
      locationId: config.locationId,
      pipelineId: config.pipelineId,
      pipelineStageId: stage.id,
      contactId: contact.id,
      name: opportunityName,
      status: "open",
      monetaryValue: 0,
      source: payload.leadSource || "Deficit Dial",
    }),
  });

  const protocolDelivery = await maybeSendProtocolSequence(payload, contact.id, config);

  return {
    contactId: contact.id,
    opportunityId: opportunityResult.opportunity?.id || "",
    stage: stage.name,
    protocolDelivery,
  };
}

async function forwardToWebhook(payload) {
  const webhookUrl = process.env.GHL_WEBHOOK_URL;
  if (!webhookUrl) {
    return null;
  }

  const ghlResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!ghlResponse.ok) {
    const detail = await ghlResponse.text().catch(() => "");
    throw new Error(`GHL webhook failed ${ghlResponse.status}: ${detail.slice(0, 500)}`);
  }

  return { forwarded: true };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return response(204, {});
  }

  if (event.httpMethod !== "POST") {
    return response(405, { ok: false, error: "Method not allowed" });
  }

  const payload = parsePayload(event);
  if (!payload) {
    return response(400, { ok: false, error: "Invalid JSON" });
  }

  if (isLikelyBot(payload)) {
    return response(202, { ok: true, ignored: true });
  }

  const missing = getMissingFields(payload);
  if (missing.length) {
    return response(400, { ok: false, error: "Missing required fields", missing });
  }

  const forwardedPayload = {
    ...payload,
    serverReceivedAt: new Date().toISOString(),
    serverSource: "netlify-functions/submit-lead",
  };

  try {
    const directSync = await syncLeadToGhl(forwardedPayload);
    if (directSync) {
      return response(200, { ok: true, ghl: directSync });
    }

    const webhookSync = await forwardToWebhook(forwardedPayload);
    if (webhookSync) {
      return response(200, { ok: true, ghl: webhookSync });
    }
  } catch (error) {
    console.warn("Deficit Dial GHL sync failed", error);
    return response(502, { ok: false, error: "GHL sync failed" });
  }

  console.info("Deficit Dial dry run payload", forwardedPayload);
  return response(202, { ok: true, dryRun: true });
};
