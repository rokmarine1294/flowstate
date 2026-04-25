# Flowstate Agency — Client Onboarding Form

A clean, branded multi-step onboarding form for new agency clients.
Collects all information needed to configure the automation system.

## Files

```
flowstate-onboarding/
├── index.html   — form structure and markup
├── style.css    — Flowstate brand styles
├── form.js      — form logic, validation, state
└── README.md    — this file
```

## Usage

### Host on GitHub Pages

1. Push this folder to a GitHub repository
2. Go to Settings → Pages → Source: main branch / root
3. Your form will be live at `https://yourusername.github.io/repo-name`

### Connect to Make.com (recommended)

When a client submits the form, send the data automatically to Make.com
which creates their Airtable record and notifies you on Telegram.

In `form.js`, find the webhook comment block and uncomment:

```js
fetch('https://hook.eu1.make.com/YOUR_WEBHOOK_ID', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData),
});
```

The JSON payload field names match the Airtable Clients table exactly.

### Custom domain

Point a CNAME record at `yourusername.github.io` and add a `CNAME` file
containing your domain (e.g. `onboarding.flowstateagency.com.au`).

## Brand colours

| Token   | Hex       | Usage           |
|---------|-----------|-----------------|
| Navy    | #0D1B2A   | Background      |
| Blue    | #2563EB   | Primary accent  |
| Sky     | #38BDF8   | Logo sub, hints |
| Emerald | #10B981   | Submit button   |

## Fonts

- DM Serif Display — headings (Google Fonts)
- DM Sans — body copy (Google Fonts)
- JetBrains Mono — labels, progress (Google Fonts)
