# Inquiry Triage: Webhook → AI → Slack + Notion

A brand's shared inbox mixes corporate-gifting leads, angry customers, creator collab requests, internship asks and SEO spam. Someone reads every message by hand and forwards it. This service takes each form submission by **webhook**, **classifies it with Claude**, **alerts the right people in Slack** and **logs it to a Notion database** with a suggested first reply.

## Problem → decision → result

| | |
|---|---|
| **Problem** | High-value messages (a ₹6L gifting lead, a damaged-order complaint) wait in the same queue as spam. |
| **Build / buy / skip** | Zapier or n8n could do the routing. I wrote it in code because it needs signature checks, deduplication and retries, which get messy in no-code tools. For a simpler version (no dedupe, low volume), an n8n flow is the faster choice. |
| **Key design choices** | **Rules before the LLM:** obvious spam is filtered by regex and never costs a model call. **Structured output:** the category comes from a fixed `enum`, so routing can't break on a typo. **Prompt-injection guard:** message text is wrapped and treated as untrusted. |
| **Reliability** | HMAC signature verification · idempotency (form tools retry webhooks) · returns 202 fast, then processes · retries with backoff for Slack and Notion · one failing destination doesn't block the other. |
| **Result** | Urgent messages reach Slack in seconds with a 🔴 tag. The team works from a Notion board instead of an inbox. |

## Run it (no accounts needed)

```bash
npm install
npm start               # terminal 1
npm run samples         # terminal 2: sends 6 realistic inquiries + 1 forged one
```

Without keys, every step runs in **dry-run**. Classification uses a keyword fallback, and Slack and Notion output is printed to the console.

## Connect the real services

| Env var | Where to get it |
|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `SLACK_WEBHOOK_URL` | Slack → Apps → Incoming Webhooks → pick a channel |
| `NOTION_TOKEN` | notion.so/my-integrations → new internal integration |
| `NOTION_DATABASE_ID` | Create a database with properties `Name` (title), `Category`, `Urgency`, `Status` (select), `Email` (email), `Summary`, `Suggested reply` (text). Share it with the integration. The ID is in the URL. |
| `WEBHOOK_SECRET` | Any long random string. Configure the same one in your form tool. |

To receive real form submissions locally, expose the port with `ngrok http 3001`. Then point Tally, Typeform or your website form at `/webhook/inquiry`.

## Production notes

- Move the dedupe map and failed jobs into a Postgres/Supabase table, so restarts don't lose state and failures can be replayed.
- Send a Slack DM to the owner when a job fails three times.
- Review once a week: how many low-confidence calls were wrong? Adjust the categories or prompt based on that.
