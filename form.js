/* ── form.js — Flowstate Agency onboarding form ────────────────────── */

'use strict';

// ── State ────────────────────────────────────────────────────────────────
let currentStep = 1;
const TOTAL_STEPS = 5;
const formData = {};
const selectedChannels = [];
let selectedTone = '';

// ── Progress ─────────────────────────────────────────────────────────────
function updateProgress() {
  const pct = (currentStep / TOTAL_STEPS) * 100;
  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('progressLabel').textContent =
    `Step ${currentStep} of ${TOTAL_STEPS}`;
  const wrap = document.querySelector('.progress-wrap');
  if (wrap) wrap.setAttribute('aria-valuenow', pct);
}

// ── Navigation ────────────────────────────────────────────────────────────
function showStep(n) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('step' + n);
  if (el) el.classList.add('active');
  currentStep = n;
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextStep(step) {
  if (!validate(step)) return;
  collectData(step);
  if (step === 4) buildReview();
  showStep(step + 1);
}

function prevStep(step) {
  showStep(step - 1);
}

// ── Validation ────────────────────────────────────────────────────────────
function validate(step) {
  let ok = true;

  function check(id, errId, testFn) {
    const el  = document.getElementById(id);
    const err = document.getElementById(errId);
    const valid = el && (testFn ? testFn(el) : el.value.trim() !== '');
    if (!valid) {
      if (el)  el.classList.add('error');
      if (err) err.classList.add('show');
      ok = false;
    } else {
      if (el)  el.classList.remove('error');
      if (err) err.classList.remove('show');
    }
  }

  if (step === 1) {
    check('business_name', 'err_business_name');
    check('contact_name',  'err_contact_name');
    check('contact_email', 'err_contact_email', el => el.value.includes('@') && el.value.includes('.'));
    check('business_phone','err_business_phone');
    check('service_area',  'err_service_area');
    check('niche',         'err_niche', el => el.value !== '');
  }

  if (step === 2) {
    check('notify_phone', 'err_notify_phone', el => {
      const v = el.value.replace(/\s/g, '');
      return v.length >= 10;
    });
  }

  if (step === 3) {
    if (selectedChannels.length === 0) {
      document.getElementById('err_channels').classList.add('show');
      ok = false;
    } else {
      document.getElementById('err_channels').classList.remove('show');
    }
    check('avg_value', 'err_avg_value', el => el.value && parseInt(el.value, 10) > 0);
  }

  if (step === 4) {
    if (!selectedTone) {
      document.getElementById('err_tone').classList.add('show');
      ok = false;
    } else {
      document.getElementById('err_tone').classList.remove('show');
    }
    check('urgent_signals', 'err_urgent');
  }

  return ok;
}

// ── Data collection ───────────────────────────────────────────────────────
function collectData(step) {
  const v = id => (document.getElementById(id) || {}).value || '';

  if (step === 1) {
    Object.assign(formData, {
      business_name:  v('business_name').trim(),
      contact_name:   v('contact_name').trim(),
      contact_email:  v('contact_email').trim().toLowerCase(),
      business_phone: v('business_phone').trim(),
      service_area:   v('service_area').trim(),
      niche:          v('niche'),
    });
  }

  if (step === 2) {
    Object.assign(formData, {
      website:        v('website').trim(),
      booking_link:   v('booking_link').trim(),
      notify_phone:   v('notify_phone').trim(),
      hours_start:    parseInt(v('hours_start'), 10),
      hours_end:      parseInt(v('hours_end'), 10),
    });
  }

  if (step === 3) {
    Object.assign(formData, {
      channels:           [...selectedChannels],
      avg_customer_value: parseInt(v('avg_value'), 10),
      google_review_link: v('google_review_link').trim(),
    });
  }

  if (step === 4) {
    Object.assign(formData, {
      tone_profile:       selectedTone,
      urgent_signals:     v('urgent_signals').trim(),
      exclusion_rules:    v('exclusion_rules').trim(),
    });
  }
}

// ── Review summary ─────────────────────────────────────────────────────────
function buildReview() {
  const niceNiche = (formData.niche || '').replace(/_/g, ' ');
  const niCh = (formData.channels || []).map(c => c.replace(/_/g, ' ')).join(', ');
  const hoursLabel = (h) => {
    const ampm = h >= 12 ? 'pm' : 'am';
    const h12 = h > 12 ? h - 12 : h;
    return `${h12}:00${ampm}`;
  };

  const rows = [
    ['Business name',     formData.business_name],
    ['Contact',           `${formData.contact_name} — ${formData.contact_email}`],
    ['Phone',             formData.business_phone],
    ['Location',          formData.service_area],
    ['Industry',          niCh ? niCh.split(',')[0] : niiceNiche],
    ['Industry',          niCh ? niiceNiche : '—'],
    ['Booking link',      formData.booking_link || 'Not provided'],
    ['Reply forwards to', formData.notify_phone],
    ['Contact hours',     `${hoursLabel(formData.hours_start)} – ${hoursLabel(formData.hours_end)}`],
    ['Active channels',   niCh || '—'],
    ['Avg customer value', '$' + (formData.avg_customer_value || 0).toLocaleString() + ' AUD'],
    ['Tone profile',      formData.tone_profile],
    ['Urgency signals',   formData.urgent_signals],
  ].filter(([, v]) => v && v !== '—');

  // Remove duplicate industry row
  const seen = new Set();
  const unique = rows.filter(([k]) => {
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const html = `<div class="review-table">${
    unique.map(([k, v]) =>
      `<div class="review-row">
        <span class="review-key">${k}</span>
        <span class="review-val">${v}</span>
      </div>`
    ).join('')
  }</div>`;

  document.getElementById('review_content').innerHTML = html;
}

// ── Form submission ────────────────────────────────────────────────────────
function submitForm() {
  const v = id => (document.getElementById(id) || {}).value || '';
  formData.extra_notes    = v('extra_notes').trim();
  formData.submitted_at   = new Date().toISOString();
  formData.form_version   = '1.0';

  // ── WEBHOOK ──────────────────────────────────────────────────────────
  // To send data to your server or a Make.com webhook, uncomment and
  // replace the URL below:
  //
  // fetch('https://hook.eu1.make.com/YOUR_WEBHOOK_ID', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(formData),
  // }).catch(console.error);
  //
  // The JSON payload matches your Airtable Clients table field names
  // exactly, so you can pipe it directly into an Airtable record.
  // ─────────────────────────────────────────────────────────────────────

  console.log('Flowstate onboarding submission:', JSON.stringify(formData, null, 2));

  // Show success screen
  document.querySelector('.header').style.display = 'none';
  document.querySelector('.progress-wrap').style.display = 'none';
  document.querySelector('.form-card').style.display = 'none';

  const niCh = (formData.channels || []).length;
  document.getElementById('successDetail').innerHTML = `<div class="review-table">${[
    ['Business',        formData.business_name],
    ['Contact email',   formData.contact_email],
    ['Channels added',  niCh + (niCh === 1 ? ' channel' : ' channels')],
    ['Tone profile',    formData.tone_profile],
    ['Expected live',   'Within 48 hours'],
    ['Your contact',    'Jae Park — Flowstate Agency'],
  ].map(([k, v]) =>
    `<div class="review-row">
      <span class="review-key">${k}</span>
      <span class="review-val">${v}</span>
    </div>`
  ).join('')}</div>`;

  document.getElementById('successScreen').style.display = 'block';
}

// ── Interactive controls ──────────────────────────────────────────────────
function toggleCheck(el, val) {
  el.classList.toggle('selected');
  const checked = el.classList.contains('selected');
  el.setAttribute('aria-checked', checked ? 'true' : 'false');
  const idx = selectedChannels.indexOf(val);
  if (idx > -1) selectedChannels.splice(idx, 1);
  else          selectedChannels.push(val);
}

function selectRadio(el, val) {
  document.querySelectorAll('.radio-item').forEach(r => {
    r.classList.remove('selected');
    r.setAttribute('aria-checked', 'false');
  });
  el.classList.add('selected');
  el.setAttribute('aria-checked', 'true');
  selectedTone = val;
}

// Keyboard support for custom controls
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const t = e.target;
  if (t.getAttribute('role') === 'checkbox') {
    e.preventDefault();
    t.click();
  }
  if (t.getAttribute('role') === 'radio') {
    e.preventDefault();
    t.click();
  }
});

// ── Init ──────────────────────────────────────────────────────────────────
updateProgress();
