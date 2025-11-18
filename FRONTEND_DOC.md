# Frontend Integration Guide

This document explains how a frontend application (web, mobile, desktop, CLI) should integrate with the CliqDrop API safely, respecting authentication requirements, rate limits, and endpoint behaviors.

---

## 1. Mandatory Request Headers

Every single request **must** include these headers:

| Header | Required | Description | Example |
|--------|----------|-------------|---------|
| `x-api-secret` | Yes | Secret key issued to the frontend application. Stored securely (never expose publicly). | `x-api-secret: frontendPortal2025` |
| `x-client-id` | Recommended | Stable identifier per end user/device. Used by backend rate limiter. | `x-client-id: user-8a2f1c` |

### 1.1 Managing `x-api-secret`
- Treat it like a password; store in secure config, server-side proxy, or environment variables.
- Never ship secrets inside public repositories or expose in client-side source visible to users.
- Rotate the secret promptly if leaked.
- If building a purely client-side web app, proxy requests through your backend to keep the secret hidden.

### 1.2 Generating `x-client-id`
- Should uniquely represent the end user/device session.
- If you have accounts: use user ID (hashed if preferred).
- If no accounts: generate UUID on first visit and persist via secure cookie or local storage.
- It must remain constant even if users open multiple tabs or use incognito, otherwise they may trigger each other’s rate limits.

Example (JavaScript):
```js
import { v4 as uuid } from 'uuid';

const CLIENT_ID_KEY = 'cliqdrop-client-id';

function getClientId() {
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = uuid();
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}
```

---

## 2. Endpoint Usage Checklist

All endpoints are under `https://<your-api-domain>/api`.

### 2.1 Upload File (`POST /api/send/file`)
- Send multipart/form-data with `file`, optional `expiresIn`, `deleteAfterView`.
- Include the required headers.
- Handle 201 success (returns `code`) and possible 400/429 errors.

### 2.2 Share Text (`POST /api/send/text`)
- Send JSON with `content`, optional `expiresIn`, `deleteAfterView`.
- Ensure content stays within 10,000 words before sending.
- Handle 201 success and 429 for rate limits.

### 2.3 Get Share (`GET /api/receive/:code`)
- Use fetch/axios with headers to retrieve metadata.
- Handle 404 (expired or invalid code) and 429 (too many requests).

### 2.4 Download File (`GET /api/download/:code`)
- Use `fetch`/XHR with `responseType='blob'` in browsers.
- Include headers; handle 404/429.
- Provide download progress UI when possible.

### 2.5 Health (`GET /api/health`)
- Used for monitoring; keep requests infrequent to avoid hitting read limits.

---

## 3. Rate Limiting Behavior

Backend rate limiting is calculated per `x-client-id` (or IP+User-Agent fallback).

| Action | Limit | Window |
|--------|-------|--------|
| Text sharing (`POST /send/text`) | 60 requests | per minute |
| File uploads (`POST /send/file`) | 1 GB total data | per hour |
| Read endpoints (`/receive`, `/download`, `/health`, `/`) | 60 requests | per minute |

### 3.1 How It Works Internally
- Each request is attributed to a client fingerprint (either provided `x-client-id` or fallback fingerprint).
- For each action, the backend keeps an in-memory counter:
  - Text counter resets after 60 seconds.
  - File-byte counter resets after 60 minutes.
  - Read counter resets after 60 seconds.
- When `n` users use the same frontend simultaneously, each user’s limits are tracked independently (as long as they have distinct `x-client-id` values). Shared IDs (e.g., due to no identifier or incognito resets) will share the same bucket and hit limits faster.
- If the frontend uses the same secret across multiple deployments (e.g., web + desktop), only the per-user buckets matter; the secret is not part of the rate limit key.

### 3.2 Handling 429 Responses
- Watch for HTTP 429.
- Parse the JSON error message.
- Implement exponential backoff or UI messages telling the user to retry later.
- For file uploads, the backend deletes the temporary upload if the request is rejected by the limiter—no additional cleanup required.

---

## 4. Error Handling Patterns

| Status | Cause | Suggested UX |
|--------|-------|--------------|
| 400 | Missing file/text, oversized payload, invalid code | Show validation message, highlight input fields. |
| 401 | Missing/invalid `x-api-secret` | Alert developer/admin; this shouldn’t happen in production if secret stored correctly. |
| 404 | Code not found/expired | Display “code expired or invalid” message; allow user to re-enter. |
| 429 | Rate limit exceeded | Inform user to wait; optionally display countdown until next allowed action. |
| 500 | Server error | Show generic error, log for monitoring. |

For better UX, parse the `error` field from the JSON response body and display it in the UI.

---

## 5. Sample Integration (Fetch API)

```js
async function uploadText(content, options = {}) {
  const res = await fetch(`${API_BASE_URL}/send/text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-secret': process.env.API_SECRET,
      'x-client-id': getClientId()
    },
    body: JSON.stringify({
      content,
      expiresIn: options.expiresIn ?? 30,
      deleteAfterView: options.deleteAfterView ?? false
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${res.status})`);
  }

  return res.json();
}
```

Apply the same header pattern to every endpoint.

---

## 6. Frontend Architecture Recommendations

1. **Proxy layer (preferred):** If possible, have your own backend server that keeps `x-api-secret` hidden and attaches `x-client-id` based on your session management. Client-side apps call your server; server calls CliqDrop API.
2. **Client-side only apps:** If you must call the API directly from browsers, store secrets securely (build-time injection, never in repository) and consider obfuscation. Understand that secrets in browser code can still be discovered.
3. **Retry strategy:** When rate limit exceeded, show message like “Please wait 30 seconds before trying again.” Optionally schedule automatic retry.
4. **Monitoring:** Track the number of 429/401 responses your frontend sees. High numbers indicate users hitting limits or secret misconfiguration.
5. **Testing:** Use `.env` mocks and Postman collections included in the project (`TEST.md`) to simulate frontend behavior.

---

## 7. FAQs

**Q: What happens if two different devices share the same `x-client-id`?**  
A: They share the same rate limit bucket, so they might throttle each other. Always ensure IDs are unique per device/user.

**Q: Can I have multiple secrets for different frontend apps?**  
A: Yes. Set `API_SECRETS=secret1,secret2,...` on the backend. Each frontend gets a unique secret so you can revoke access by removing it.

**Q: Do I need to change anything when running locally?**  
A: Use the same headers; just keep secrets in local `.env` files or Postman environment variables. RATE limits apply even in development.

**Q: How are limits reset if the server restarts?**  
A: Counters are in-memory; a restart resets them. In production with multiple instances, consider persistent/shared stores like Redis to keep counts consistent (future enhancement).

---

## 8. Quick Checklist for Frontend Developers

- [ ] Store `x-api-secret` securely (environment variable, build-time config, or backend proxy).
- [ ] Generate and persist `x-client-id` per user/device/session.
- [ ] Attach both headers to **every** request.
- [ ] Handle JSON error responses gracefully, especially 429 and 404.
- [ ] Respect text and file size limits before sending data.
- [ ] Provide UI feedback for file upload progress and expiration info.
- [ ] Monitor for repeated failures (invalid secret, rate limit) and alert your team.
- [ ] Coordinate with backend team before changing rate-sensitive workflows (e.g., bulk uploads).

---

Following these practices ensures your frontend uses CliqDrop API reliably, protects shared infrastructure, and delivers a smooth experience to end users. Reach out to the backend team for new secrets, rate limit adjustments, or additional endpoints.

