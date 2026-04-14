# Gender Classify API

A REST API that wraps [Genderize.io](https://genderize.io) with input validation, data processing, and confidence scoring.

## Endpoint

```
GET /api/classify?name=<name>
```

### Success Response

```json
{
  "status": "success",
  "data": {
    "name": "james",
    "gender": "male",
    "probability": 0.99,
    "sample_size": 1234,
    "is_confident": true,
    "processed_at": "2026-04-14T10:00:00.000Z"
  }
}
```

### Error Responses

| Scenario | Status Code | Message |
|---|---|---|
| Missing/empty `name` | 400 | Missing or empty 'name' query parameter |
| Non-string `name` | 422 | Invalid 'name' parameter: must be a string |
| No prediction from Genderize | 200 | No prediction available for the provided name |
| Genderize API unreachable | 502 | Failed to reach Genderize API |
| Internal error | 500 | Internal server error while calling Genderize API |

### Processing Rules

- `sample_size` is renamed from `count` in the Genderize response
- `is_confident` is `true` only when `probability >= 0.7` AND `sample_size >= 100`
- `processed_at` is always a fresh UTC ISO 8601 timestamp

## Running Locally

```bash
npm install
npm start
# Server runs on http://localhost:3000
```

Test it:
```bash
curl "http://localhost:3000/api/classify?name=james"
```

## Hosting on Render (Free)

1. Push this repo to GitHub (must be **public**)
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Deploy — your public URL will be shown in the dashboard

## Live API

> Replace this line with your Render URL, e.g.:
> `https://gender-classify-api.onrender.com`
