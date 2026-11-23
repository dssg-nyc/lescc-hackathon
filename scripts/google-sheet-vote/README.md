# Vote sheet (Google Apps Script)

The `#summary` card posts each vote to a Google Sheet. The `#results` card reads the totals back. There is no server of our own.

## Set up (about 5 minutes)

1. Create a Google Sheet, for example "LESCC story votes".
2. In the sheet: **Extensions → Apps Script**. Replace the editor contents with `Code.gs` from this folder. Save.
3. **Deploy → New deployment → Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Copy the web app URL (it ends in `/exec`).
5. Put it in `app/.env.local`:
   ```
   VITE_VOTE_ENDPOINT=https://script.google.com/macros/s/XXXX/exec
   ```
6. Restart `npm run dev`. For production, set the same variable in the host's build settings.

The first vote creates a `votes` tab with `timestamp` and `choice` columns.

## What it stores

Timestamp and choice only. No IP, name, email, or browser id.

## Limits

- One vote per browser is enforced in the browser (localStorage). Anyone can clear it and vote again, and anyone with the URL can post. Treat results as a self-selected poll; the results card says so.
- Apps Script quotas apply (about 20,000 URL calls a day on a consumer account). Fine for a demo.
- To reset: clear rows 2 and below in the `votes` tab.
