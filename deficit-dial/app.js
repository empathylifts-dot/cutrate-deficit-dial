const CONFIG = window.DEFICIT_DIAL_CONFIG || {};

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

const state = {
  step: 0,
  screen: "form",
  leadStartedAt: Date.now(),
  submitted: false,
  result: null,
  lead: {
    firstName: "",
    email: "",
    phone: "",
    wantsTextReminder: false,
    wantsCoachAudit: false,
    website: "",
  },
  form: {
    sex: "male",
    age: "",
    weight: "",
    feet: "",
    inches: "",
    bodyComp: "average",
    liftingDays: 4,
    steps: "8000-11999",
    activity: "desk",
    trainingAge: "3-7",
    strengthTrend: "stable",
    sleep: "7-8",
    goal: "cut",
    lossRange: "20-40",
    trackingCalories: "no",
    currentCalories: "",
    scaleTrend: "same",
  },
};

const bodyCompMap = {
  lean: { male: 12, female: 20, label: "Lean" },
  average: { male: 18, female: 28, label: "Average" },
  higher: { male: 28, female: 38, label: "Higher body fat" },
  unsure: { male: 22, female: 32, label: "Not sure" },
};

const stepsMap = {
  under5000: { label: "Under 5,000", multiplier: 1.3 },
  "5000-7999": { label: "5,000-7,999", multiplier: 1.4 },
  "8000-11999": { label: "8,000-11,999", multiplier: 1.55 },
  "12000+": { label: "12,000+", multiplier: 1.7 },
};

const activityMap = {
  desk: { label: "Desk", adjust: 0 },
  mixed: { label: "Mixed", adjust: 0.05 },
  active: { label: "Active", adjust: 0.1 },
};

const labels = {
  sex: { male: "Male", female: "Female" },
  trainingAge: {
    under1: "Under 1 year",
    "1-3": "1-3 years",
    "3-7": "3-7 years",
    "7+": "7+ years",
  },
  strengthTrend: {
    up: "Going up",
    stable: "Stable",
    dropping: "Dropping",
    unsure: "Not sure",
  },
  sleep: {
    under6: "Under 6 hrs",
    "6-7": "6-7 hrs",
    "7-8": "7-8 hrs",
    "8+": "8+ hrs",
  },
  goal: {
    cut: "Cut",
    recomp: "Recomp",
    maintain: "Maintain",
    gain: "Lean gain",
  },
  lossRange: {
    under10: "Under 10 lb",
    "10-20": "10-20 lb",
    "20-40": "20-40 lb",
    "40-60": "40-60 lb",
    "60+": "60+ lb",
  },
  scaleTrend: {
    down: "Down",
    same: "About the same",
    up: "Up",
    unsure: "Not sure",
  },
};

const app = document.getElementById("app");

function render(options = {}) {
  if (state.screen === "success") {
    app.innerHTML = layout(renderSuccess());
  } else if (state.screen === "result") {
    app.innerHTML = layout(renderResult());
    animateCountUp();
  } else {
    app.innerHTML = layout(renderForm());
  }
  bindEvents();

  if (options.resetScroll) {
    resetScrollPosition();
  }
}

function resetScrollPosition() {
  const jumpTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  requestAnimationFrame(jumpTop);
  setTimeout(jumpTop, 0);
}

function layout(content) {
  return `
    <header class="app-header">
      <div class="wordmark">Deficit Dial <span class="wordmark-mark"></span></div>
      <div class="header-pill">FREE 7-Day CutRate Protocol</div>
    </header>
    ${content}
  `;
}

function renderForm() {
  const stepContent = [renderBodyStep, renderTrainingStep, renderGoalStep][state.step]();
  const primaryText = state.step === 2 ? "Find my CutRate" : "Continue";
  return `
    <section class="screen">
      ${
        state.step === 0
          ? `<div class="compact-hero">
              <h1>Find your CutRate.</h1>
              <p class="lede">The weekly fat-loss rate your calories and macros should be built around.</p>
            </div>`
          : ""
      }
      ${stepContent}
      <div id="error" class="error" role="alert"></div>
    </section>
    <nav class="bottom-bar">
      ${state.step > 0 ? `<button class="btn secondary" data-action="back">Back</button>` : ""}
      <button class="btn primary" data-action="next">${primaryText}</button>
    </nav>
  `;
}

function renderBodyStep() {
  return `
    <section class="field-stack">
      ${optionGroup("Sex", "sex", labels.sex, "grid-2")}
      ${numberField("Age", "age", "e.g. 30")}
      ${numberField("Current weight (lb)", "weight", "e.g. 185")}
      <div class="field">
        <div class="label">Height</div>
        <div class="grid-2">
          ${numberField("Feet", "feet", "ft", "Feet")}
          ${numberField("Inches", "inches", "in", "Inches")}
        </div>
      </div>
      ${bodyCompCards()}
    </section>
  `;
}

function renderTrainingStep() {
  return `
    <section class="field-stack">
      <div class="section-title">
        <h2>Training</h2>
        <p class="hint">This helps the result feel coached instead of spreadsheet-only.</p>
      </div>
      <div class="field">
        <div class="label">Lifting days per week</div>
        <div class="option-grid compact">
          ${[0, 1, 2, 3, 4, 5, 6, 7]
            .map(
              (day) => `
                <button class="option-btn ${Number(state.form.liftingDays) === day ? "selected" : ""}"
                  data-field="liftingDays" data-value="${day}" type="button">${day}</button>
              `
            )
            .join("")}
        </div>
      </div>
      ${optionGroup("Average daily steps", "steps", mapLabels(stepsMap), "option-grid")}
      ${optionGroup("Job / activity level", "activity", mapLabels(activityMap), "grid-3")}
      ${optionGroup("Training age", "trainingAge", labels.trainingAge, "option-grid")}
      ${optionGroup("Current strength trend", "strengthTrend", labels.strengthTrend, "option-grid")}
      ${optionGroup("Average sleep", "sleep", labels.sleep, "option-grid")}
    </section>
  `;
}

function renderGoalStep() {
  const tracking = state.form.trackingCalories === "yes";
  return `
    <section class="field-stack">
      <div class="section-title">
        <h2>Goal</h2>
        <p class="hint">CutRate works best when it starts with the outcome you are actually trying to run.</p>
      </div>
      ${optionGroup("Goal", "goal", labels.goal, "option-grid")}
      ${
        state.form.goal === "cut"
          ? optionGroup("Roughly how much do you want to lose?", "lossRange", labels.lossRange, "option-grid")
          : ""
      }
      ${optionGroup("Currently tracking calories?", "trackingCalories", { yes: "Yes", no: "No" }, "grid-2")}
      ${tracking ? numberField("Current daily calories (optional)", "currentCalories") : ""}
      <div class="field">
        ${optionGroup("What has your weight done over the last 2 weeks?", "scaleTrend", labels.scaleTrend, "option-grid")}
      </div>
    </section>
  `;
}

function numberField(label, field, placeholder = "", shortLabel = label) {
  return `
    <div class="field">
      <label for="${field}">${label}</label>
      <input
        class="input"
        id="${field}"
        data-input="${field}"
        type="number"
        inputmode="numeric"
        placeholder="${placeholder}"
        value="${escapeHtml(state.form[field] ?? "")}"
      />
      ${shortLabel !== label ? `<span class="hint">${shortLabel}</span>` : ""}
    </div>
  `;
}

function bodyCompCards() {
  const options = {
    lean: { title: "Lean", desc: "Visible abs, vascularity.", range: bodyCompRange("lean") },
    average: { title: "Average", desc: "Some definition, normal body fat.", range: bodyCompRange("average") },
    higher: { title: "Higher body fat", desc: "Carrying extra weight, softer look.", range: bodyCompRange("higher") },
    unsure: { title: "Not sure", desc: "Calculator based on standard averages.", range: "Auto" },
  };

  return `
    <div class="field">
      <div class="label">How would you describe your current body composition?</div>
      <div class="body-comp-list">
        ${Object.entries(options)
          .map(
            ([value, item]) => `
              <button
                class="body-comp-card ${state.form.bodyComp === value ? "selected" : ""}"
                data-field="bodyComp"
                data-value="${value}"
                type="button"
              >
                <span class="body-comp-range">${item.range}</span>
                <span class="body-comp-title">${item.title}</span>
                <span class="body-comp-desc">${item.desc}</span>
              </button>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function bodyCompRange(type) {
  const ranges = {
    male: {
      lean: "10-14%",
      average: "15-24%",
      higher: "25%+",
    },
    female: {
      lean: "18-22%",
      average: "23-32%",
      higher: "33%+",
    },
  };
  return ranges[state.form.sex]?.[type] || "Auto";
}

function optionGroup(label, field, options, className) {
  return `
    <div class="field">
      <div class="label">${label}</div>
      <div class="${className.includes("grid") ? className : "option-grid"}">
        ${Object.entries(options)
          .map(
            ([value, text]) => `
              <button
                class="option-btn ${state.form[field] == value ? "selected" : ""}"
                data-field="${field}"
                data-value="${value}"
                type="button"
              >${text}</button>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderResult() {
  const result = state.result || calculate();
  const ratePosition = getRatePosition(result.cutRate);
  const canShareRate = result.cutRate > 0;

  return `
    <section class="screen">
      <p class="eyebrow">Your result</p>
      <div class="result-panel">
        <div class="result-top">
          <div>
            <div class="diagnosis">${result.diagnosis}</div>
            <div class="zone">${result.zone}</div>
          </div>
          <span class="chip">${state.form.goal === "cut" ? "Cut phase" : labels.goal[state.form.goal]}</span>
        </div>

        <div class="stat-label">Daily calories</div>
        <div class="calorie-number" data-count="${result.calories}">0</div>

        ${
          canShareRate
            ? `
              <div class="cutrate-card">
                <div class="stat-label">Your CutRate</div>
                <div><span class="cutrate-number">${formatRate(result.cutRate)}</span> <span class="unit">lb/week</span></div>
                <p class="fine-print">Your Deficit Dial built your calories around this CutRate.</p>
                <div class="rate-rail" style="--marker:${ratePosition}%; --fill:${ratePosition}%">
                  <div class="rail-marker" aria-hidden="true"></div>
                  <div class="rail-line"><div class="rail-fill"></div></div>
                  <div class="rail-labels">
                    <span>0.75</span><span>1</span><span>1.5</span><span>2</span>
                  </div>
                  <div class="rail-risk-labels">
                    <span>Repeatable</span><span>Rebound risk</span>
                  </div>
                </div>
                <p class="fine-print">Picked for a deficit you can repeat. The red zone is where hunger, flat training, and weekend rebound start getting louder.</p>
              </div>
            `
            : `<div class="cutrate-card"><div class="stat-label">Your CutRate</div><p class="fine-print">No fat-loss rate is assigned because your current goal is ${labels.goal[state.form.goal].toLowerCase()}.</p></div>`
        }
      </div>

      <div class="bento">
        ${statTile("Protein", `${result.protein}g`)}
        ${statTile("Carbs", `${result.carbs}g`)}
        ${statTile("Fat", `${result.fat}g`)}
        ${statTile("Fiber", `${result.fiberLow}-${result.fiberHigh}g`, true)}
        ${statTile("Maintenance", `${result.tdee.toLocaleString()}`, true, "estimated TDEE")}
      </div>

      <div class="copy-panel">
        <h3>You may be thinking "this seems like a lot of calories".</h3>
        <p>If you have been cutting hard and still falling off, this is usually the loop: calories drop too low, training feels flat, hunger climbs, energy dips, and the weekend erases the deficit.</p>
        <p>The goal is not the lowest calorie number. The goal is the CutRate you can actually hold.</p>
      </div>

      ${renderWarnings(result.warnings)}

      ${renderLeadCapture()}

      <div class="post-lead-actions">
        <button class="link-button" data-action="start-over" type="button">Start over</button>
      </div>
    </section>
  `;
}

function statTile(label, value, large = false, sub = "") {
  return `
    <div class="tile ${large ? "large" : ""}">
      <div class="stat-label">${label}</div>
      <div class="tile-value">${value}</div>
      ${sub ? `<div class="fine-print">${sub}</div>` : ""}
    </div>
  `;
}

function renderWarnings(warnings) {
  if (!warnings.length) return "";
  return `
    <div class="copy-panel">
      <h3>Coach notes</h3>
      ${warnings.map((warning) => `<p>${warning}</p>`).join("")}
    </div>
  `;
}

function renderLeadCapture() {
  return `
    <form class="lead-panel" data-lead-form>
      <h2>Get your CutRate Protocol</h2>
      <p>I'm sure you know by now that having a set of macros to hit is just the start.</p>
      <p>What you need now is the next 7-14 days mapped out so you can dial in this deficit, know what to track, what to ignore, what to pay attention to, and when to not overcorrect and make adjustments that break everything.</p>
      <p>Insert your email or phone and I'll toss it over.</p>
      <div class="field-stack">
        <div class="field">
          <label for="firstName">First name</label>
          <input class="input" id="firstName" name="firstName" autocomplete="given-name" required />
        </div>
        <div class="field">
          <label for="email">Email</label>
          <input class="input" id="email" name="email" type="email" autocomplete="email" required />
        </div>
        <div class="field">
          <label for="phone">Phone <span class="muted">(optional)</span></label>
          <input class="input" id="phone" name="phone" type="tel" autocomplete="tel" />
        </div>
        <div class="hp-field" aria-hidden="true">
          <label for="website">Website</label>
          <input id="website" name="website" tabindex="-1" autocomplete="off" />
        </div>
        <label class="checkbox-row">
          <input type="checkbox" name="wantsTextReminder" />
          <span>Text me the Protocol</span>
        </label>
        <label class="checkbox-row">
          <input type="checkbox" name="wantsCoachAudit" />
          <span>I want a coach to audit this</span>
        </label>
        <div id="lead-error" class="error" role="alert"></div>
        <button class="btn primary full" type="submit">Send my protocol</button>
      </div>
    </form>
  `;
}

function renderSuccess() {
  const result = state.result;
  const shareUrl = getShareUrl();
  const shareText = result.cutRate
    ? `My CutRate is ${formatRate(result.cutRate)} lb/week in the ${result.zone}. Find yours with the Deficit Dial: ${shareUrl}`
    : `I found my starting point with the Deficit Dial. Get yours: ${shareUrl}`;

  return `
    <section class="screen">
      <div class="success-panel">
        <p class="eyebrow">Saved</p>
        <h1>Your Deficit Dial is set.</h1>
        <p>Run your targets for 7 days. Track the trend. Do not panic-adjust after one weigh-in.</p>
      </div>

      <div class="copy-panel">
        <h2>Compare CutRates</h2>
        <p>Send this to someone that needs to cut with you.</p>
        <div class="share-card">
          <div class="wordmark">Deficit Dial <span class="wordmark-mark"></span></div>
          <p class="eyebrow" style="margin-top:22px">Share your CutRate</p>
          <div class="big">${result.cutRate ? `${formatRate(result.cutRate)} lb/week` : "Starting point"}</div>
          <p class="zone">${result.zone}</p>
          <p class="fine-print">Private numbers stay private. This card only shares your CutRate and zone.</p>
        </div>
        <button class="btn primary full" data-action="share" data-share="${escapeHtml(shareText)}" type="button">Share your CutRate</button>
      </div>
    </section>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-field]").forEach((button) => {
    button.addEventListener("click", () => {
      const field = button.dataset.field;
      state.form[field] = button.dataset.value;
      render();
    });
  });

  document.querySelectorAll("[data-input]").forEach((input) => {
    input.addEventListener("input", () => {
      state.form[input.dataset.input] = input.value;
    });
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => handleAction(button.dataset.action, button));
  });

  const leadForm = document.querySelector("[data-lead-form]");
  if (leadForm) {
    leadForm.addEventListener("submit", submitLead);
  }
}

function handleAction(action, button) {
  if (action === "next") {
    if (!validateStep()) return;
    if (state.step < 2) {
      state.step += 1;
      render({ resetScroll: true });
    } else {
      state.result = calculate();
      state.screen = "result";
      render({ resetScroll: true });
    }
  }

  if (action === "back") {
    state.step = Math.max(0, state.step - 1);
    render({ resetScroll: true });
  }

  if (action === "start-over") {
    state.step = 0;
    state.screen = "form";
    state.result = null;
    state.leadStartedAt = Date.now();
    render({ resetScroll: true });
  }

  if (action === "show-result") {
    state.screen = "result";
    render({ resetScroll: true });
  }

  if (action === "share") {
    shareText(button.dataset.share).then((status) => {
      if (status === "copied") {
        button.textContent = "Share text copied";
        setTimeout(() => (button.textContent = "Share your CutRate"), 1600);
      }
    });
  }
}

function validateStep() {
  const error = document.getElementById("error");
  const setError = (message) => {
    if (error) error.textContent = message;
    return false;
  };

  if (state.step === 0) {
    if (!positive(state.form.age)) return setError("Add your age.");
    if (!positive(state.form.weight)) return setError("Add your current weight.");
    if (!positive(state.form.feet)) return setError("Add your height in feet and inches.");
    if (Number(state.form.inches || 0) < 0 || Number(state.form.inches || 0) > 11) {
      return setError("Height inches should be between 0 and 11.");
    }
  }

  if (state.step === 2 && state.form.goal === "cut" && !state.form.lossRange) {
    return setError("Choose roughly how much you want to lose.");
  }

  if (error) error.textContent = "";
  return true;
}

function positive(value) {
  return Number(value) > 0;
}

function calculate() {
  const form = state.form;
  const sex = form.sex;
  const bodyWeight = Number(form.weight);
  const heightIn = Number(form.feet) * 12 + Number(form.inches || 0);
  const heightCm = heightIn * 2.54;
  const weightKg = bodyWeight / 2.2046;
  const bodyFat = bodyCompMap[form.bodyComp][sex];
  const lbm = bodyWeight * (1 - bodyFat / 100);
  const lbmKg = lbm / 2.2046;
  const bmr = 370 + 21.6 * lbmKg;

  const liftingDays = Number(form.liftingDays);
  let multiplier = stepsMap[form.steps].multiplier + activityMap[form.activity].adjust;
  multiplier += Math.max(0, liftingDays - 3) * 0.02;
  multiplier = Math.min(multiplier, 1.85);

  const tdeeRaw = bmr * multiplier;
  let cutRate = 0;
  let calories = tdeeRaw;

  if (form.goal === "cut") {
    cutRate = getCutRate(form.lossRange);
    calories = tdeeRaw - (cutRate * 3500) / 7;
    calories = Math.max(calories, bmr * 1.1);
  } else if (form.goal === "recomp") {
    calories = tdeeRaw * 0.95;
  } else if (form.goal === "gain") {
    calories = tdeeRaw + 250;
  }

  const roundedCalories = roundTo(calories, 10);
  const protein = roundTo(lbm * (form.goal === "cut" || form.goal === "recomp" ? 1.1 : 1), 5);
  const minFatByLbm = lbm * (form.goal === "cut" || form.goal === "recomp" ? 0.3 : 0.35);
  const minFatByCal = (roundedCalories * 0.2) / 9;
  const maxFatByCal = (roundedCalories * 0.3) / 9;
  const fat = roundTo(Math.min(Math.max(minFatByLbm, minFatByCal), maxFatByCal), 5);
  const carbs = roundTo(Math.max(0, (roundedCalories - protein * 4 - fat * 9) / 4), 5);
  const fiber = Math.min(45, Math.max(25, Math.round((roundedCalories / 1000) * 14)));
  const warnings = getWarnings({ form, calories: roundedCalories, bmr, carbs, lbm, tdeeRaw, cutRate });

  return {
    calories: roundedCalories,
    protein,
    carbs,
    fat,
    fiberLow: Math.max(20, fiber - 5),
    fiberHigh: Math.min(50, fiber + 5),
    tdee: roundTo(tdeeRaw, 10),
    bmr: Math.round(bmr),
    bodyWeight,
    bodyFat,
    lbm: Math.round(lbm),
    cutRate,
    zone: getZone(cutRate, form.goal),
    diagnosis: getDiagnosis(form, roundedCalories, tdeeRaw),
    warnings,
    heightCm,
    weightKg,
  };
}

function getCutRate(lossRange) {
  if (lossRange === "under10") return 0.75;
  if (lossRange === "40-60") return 1.5;
  if (lossRange === "60+") return 2;
  return 1;
}

function getZone(cutRate, goal) {
  if (goal !== "cut") return labels.goal[goal];
  if (cutRate === 0.75) return "Lean Cut Zone";
  if (cutRate === 1.5) return "Accelerated Cut Zone";
  if (cutRate === 2) return "High-Runway Cut Zone";
  return "Performance Cut Zone";
}

function getDiagnosis(form, calories, tdee) {
  if (form.goal === "gain") return "Lean gain ready";
  if (form.goal === "maintain") return "Maintenance reset";
  if (form.goal === "recomp") return form.scaleTrend === "same" ? "Recomp reset" : "Stalled recomp";
  if (form.lossRange === "40-60" || form.lossRange === "60+") return "Higher-loss cut";
  if (form.strengthTrend === "dropping" || form.sleep === "under6") return "Guardrailed cut";
  if (Number(form.currentCalories) > 0 && Number(form.currentCalories) < calories - 250) return "Fuel leak";
  if (tdee - calories > 650) return "Guardrailed cut";
  return "Performance cut";
}

function getWarnings({ form, calories, bmr, carbs, lbm, tdeeRaw, cutRate }) {
  const warnings = [];
  const currentCalories = Number(form.currentCalories);
  if (currentCalories && currentCalories < calories - 250 && form.strengthTrend === "dropping") {
    warnings.push("You may already be under-fueled. The fix is not always another calorie drop.");
  }
  if (form.goal === "cut" && cutRate >= 1.5) {
    warnings.push("You have more room to lose, but this still needs to stay recoverable.");
  }
  if (carbs < lbm && Number(form.liftingDays) >= 4) {
    warnings.push("Carbs are low for your training volume. Watch flat sessions before cutting harder.");
  }
  if (form.sleep === "under6") {
    warnings.push("Recovery may be the limiter before calories are.");
  }
  if (form.scaleTrend === "same" && currentCalories && currentCalories < tdeeRaw - 650) {
    warnings.push("If your reported intake is far below maintenance and weight is stable, tracking or weekend intake may be the first read.");
  }
  if (calories <= bmr * 1.12) {
    warnings.push("The calculated deficit pushed too low, so the target was raised to keep the cut more repeatable.");
  }
  return warnings;
}

function getRatePosition(rate) {
  const positions = {
    0.75: 16,
    1: 38,
    1.5: 66,
    2: 92,
  };
  return positions[rate] || 0;
}

function submitLead(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const leadError = document.getElementById("lead-error");
  const setLeadError = (message) => {
    if (leadError) leadError.textContent = message;
  };

  state.lead = {
    firstName: String(data.get("firstName") || ""),
    email: String(data.get("email") || ""),
    phone: String(data.get("phone") || ""),
    wantsTextReminder: data.get("wantsTextReminder") === "on",
    wantsCoachAudit: data.get("wantsCoachAudit") === "on",
    website: String(data.get("website") || ""),
  };

  if (state.lead.website) {
    state.submitted = true;
    state.screen = "success";
    render({ resetScroll: true });
    return;
  }

  if (state.lead.wantsTextReminder && !state.lead.phone.trim()) {
    setLeadError("Add your phone number if you want the Protocol by text.");
    return;
  }

  setLeadError("");
  const payload = buildPayload();
  sendWebhook(payload)
    .then(() => {
      state.submitted = true;
      state.screen = "success";
      render({ resetScroll: true });
    })
    .catch((error) => {
      console.warn("Deficit Dial lead failed", error);
      setLeadError("Something did not send. Try again in a second.");
    });
}

function getIntentScore(result) {
  let score = 0;

  if (state.lead.wantsCoachAudit) score += 40;
  if (state.lead.wantsTextReminder) score += 15;
  if (state.form.strengthTrend === "dropping") score += 15;
  if (state.form.scaleTrend === "same") score += 10;
  if (["40-60", "60+"].includes(state.form.lossRange)) score += 10;
  if (result.cutRate >= 1.5) score += 10;
  if (Number(state.form.currentCalories) > 0 && Number(state.form.currentCalories) < result.calories - 250) score += 10;

  return Math.min(100, score);
}

function getIntentTier(score) {
  if (score >= 70) return "hot";
  if (score >= 35) return "warm";
  return "new";
}

function getPipelineStageRecommendation(score) {
  if (state.lead.wantsCoachAudit) return "Coach Audit Requested";
  if (score >= 70) return "High Intent CutRate Lead";
  if (state.lead.wantsTextReminder) return "Protocol Text Opt-In";
  return "New CutRate Lead";
}

function getLeadTags(result, score) {
  const tags = [
    "leadmagnet:deficit-dial",
    "offer:cutrate-protocol",
    `cutrate:${result.cutRate || "none"}lb`,
    `zone:${slugify(result.zone)}`,
    `intent:${getIntentTier(score)}`,
  ];

  if (state.lead.wantsTextReminder) tags.push("sms-optin:cutrate-protocol");
  if (state.lead.wantsCoachAudit) tags.push("intent:coach-audit");
  if (state.form.strengthTrend === "dropping") tags.push("signal:strength-dropping");

  return tags;
}

function buildPayload() {
  const result = state.result;
  const form = state.form;
  const params = new URLSearchParams(window.location.search);
  const intentScore = getIntentScore(result);
  const submittedAt = new Date().toISOString();
  const shareUrl = getShareUrl();

  return {
    schemaVersion: "cutrate-lead-v1",
    leadSource: "Deficit Dial",
    leadMagnet: "CutRate Protocol",
    offerBridge: "Performance Protected Cut",
    firstName: state.lead.firstName,
    email: state.lead.email,
    phone: state.lead.phone,
    goal: form.goal,
    sex: form.sex,
    age: Number(form.age),
    calories: result.calories,
    protein: result.protein,
    carbs: result.carbs,
    fats: result.fat,
    fiber: `${result.fiberLow}-${result.fiberHigh}`,
    BMR: result.bmr,
    TDEE: result.tdee,
    bodyWeight: result.bodyWeight,
    bodyFat: result.bodyFat,
    bodyComp: form.bodyComp,
    bodyCompLabel: bodyCompMap[form.bodyComp].label,
    LBM: result.lbm,
    liftingDays: form.liftingDays,
    steps: form.steps,
    activity: form.activity,
    trainingAge: form.trainingAge,
    strengthTrend: form.strengthTrend,
    sleep: form.sleep,
    scaleTrend: form.scaleTrend,
    desiredWeightLossRange: form.lossRange,
    currentCalories: Number(form.currentCalories) || "",
    cutRate: result.cutRate,
    zone: result.zone,
    resultType: result.diagnosis,
    warnings: result.warnings,
    wantsTextReminder: state.lead.wantsTextReminder,
    wantsCoachAudit: state.lead.wantsCoachAudit,
    intentScore,
    intentTier: getIntentTier(intentScore),
    pipelineName: "CutRate Protocol",
    pipelineStageRecommendation: getPipelineStageRecommendation(intentScore),
    tags: getLeadTags(result, intentScore),
    shareUrl,
    pageUrl: window.location.href,
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
    utm_term: params.get("utm_term") || "",
    referral: params.get("ref") || "",
    antiSpam: {
      website: state.lead.website,
      startedAt: new Date(state.leadStartedAt).toISOString(),
      elapsedMs: Date.now() - state.leadStartedAt,
    },
    timestamp: submittedAt,
    submittedAt,
  };
}

async function sendWebhook(payload) {
  const leadEndpoint =
    CONFIG.leadEndpoint ||
    localStorage.getItem("DEFICIT_DIAL_LEAD_ENDPOINT") ||
    getDefaultLeadEndpoint();
  const webhookUrl = CONFIG.ghlWebhookUrl || localStorage.getItem("DEFICIT_DIAL_WEBHOOK_URL") || "";

  if (!leadEndpoint && !webhookUrl) {
    console.info("Deficit Dial webhook payload", payload);
    return { dryRun: true };
  }

  const response = await fetch(leadEndpoint || webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Lead endpoint returned ${response.status}`);
  }

  return response;
}

function getDefaultLeadEndpoint() {
  const localHosts = ["localhost", "127.0.0.1", ""];
  if (localHosts.includes(window.location.hostname)) return "";
  return "/api/lead";
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getShareUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("utm_source", "deficit_dial_share");
  url.searchParams.set("utm_medium", "referral");
  return url.toString();
}

async function shareText(text) {
  if (navigator.share) {
    try {
      await navigator.share({ title: "Deficit Dial", text });
      return "shared";
    } catch (error) {
      if (error.name !== "AbortError") console.warn(error);
    }
  }
  await copyText(text);
  return "copied";
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
}

function animateCountUp() {
  const element = document.querySelector("[data-count]");
  if (!element) return;
  const target = Number(element.dataset.count);
  const start = performance.now();
  const duration = 650;

  function tick(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(target * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function roundTo(value, increment) {
  return Math.round(value / increment) * increment;
}

function formatRate(rate) {
  return Number(rate).toString();
}

function mapLabels(map) {
  return Object.fromEntries(Object.entries(map).map(([key, value]) => [key, value.label]));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

render({ resetScroll: true });
