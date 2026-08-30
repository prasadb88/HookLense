# HookLens Platform Documentation

Welcome to the **HookLens** developer documentation. HookLens is an enterprise-grade webhook delivery gateway and observability platform designed to ingest, verify, monitor, retry, and deliver webhooks with zero payload loss.

---

## Table of Contents

- [1. Getting Started](#1-getting-started)
  - [Introduction](#introduction)
  - [How HookLens Works](#how-hooklens-works)
  - [Quick Start Guide](#quick-start-guide)
  - [Your First Webhook](#your-first-webhook)
- [2. Core Concepts](#2-core-concepts)
  - [Webhooks Explained](#webhooks-explained)
  - [Endpoints](#endpoints)
  - [Webhook URLs](#webhook-urls)
  - [Events](#events)
  - [Providers](#providers)
  - [Signing Secrets](#signing-secrets)
  - [Delivery Statuses](#delivery-statuses)
- [3. Integration Guides](#3-integration-guides)
  - [Razorpay Webhook Integration](#razorpay-webhook-integration)
  - [Custom Webhook Integration](#custom-webhook-integration)
- [4. Testing & Local Development](#4-testing--local-development)
  - [Testing with Postman](#testing-with-postman)
  - [Testing Razorpay Webhooks](#testing-razorpay-webhooks)
  - [Testing Local Backend with ngrok](#testing-local-backend-with-ngrok)
  - [Testing Deployed Production Backend](#testing-deployed-production-backend)
  - [Testing Failed Webhooks](#testing-failed-webhooks)
  - [Testing Retries & Replays](#testing-retries--replays)
- [5. Webhook Delivery System](#5-webhook-delivery-system)
  - [Delivery Lifecycle Flow](#delivery-lifecycle-flow)
  - [Successful Delivery](#successful-delivery)
  - [Failed Delivery](#failed-delivery)
  - [Exponential Backoff Retries](#exponential-backoff-retries)
  - [Delivery Logs & Telemetry](#delivery-logs--telemetry)
  - [Dead-Letter Queue (DLQ)](#dead-letter-queue-dlq)
- [6. Security & Secret Management](#6-security--secret-management)
  - [Provider Secrets](#provider-secrets)
  - [HookLens Outbound Signing Secret](#hooklens-outbound-signing-secret)
  - [HMAC SHA-256 Verification](#hmac-sha-256-verification)
  - [SSRF IP Egress Guard](#ssrf-ip-egress-guard)
  - [Secret Hygiene Best Practices](#secret-hygiene-best-practices)
- [7. Complete End-to-End Test](#7-complete-end-to-end-test)
  - [Test Setup Checklist](#test-setup-checklist)
  - [10-Step Verification Workflow](#10-step-verification-workflow)
- [8. API Reference](#8-api-reference)
  - [Authentication APIs](#authentication-apis)
  - [Endpoint Management APIs](#endpoint-management-apis)
  - [Webhook Ingestion APIs](#webhook-ingestion-apis)
  - [Event & Telemetry APIs](#event--telemetry-apis)
  - [Replays API](#replays-api)
  - [Analytics API](#analytics-api)
  - [API Keys API](#api-keys-api)
- [9. Environment Variables Reference](#9-environment-variables-reference)
- [10. Troubleshooting & FAQ](#10-troubleshooting--faq)
  - [Troubleshooting Common Errors](#troubleshooting-common-errors)
  - [Frequently Asked Questions](#frequently-asked-questions)

---

# 1. Getting Started

## Introduction

### What is HookLens?
A **webhook** is an automated HTTP POST notification sent from one application to another when an event occurs.

For example, when a customer completes a payment on **Razorpay**, Razorpay sends a webhook notification to your server saying: `"payment.captured"`.

Instead of your server receiving webhooks directly from third-party providers (which risks lost webhooks during downtime or unverified malicious requests), **HookLens** acts as a secure, high-throughput delivery gateway.

```text
┌──────────────────────────┐          ┌──────────────────────────┐          ┌──────────────────────────┐
│     Webhook Provider     │  ──────> │     HookLens Gateway     │  ──────> │       User Backend       │
│  (Razorpay / Custom API) │          │  (HMAC Verified & Logged)│          │   (Destination Server)   │
└──────────────────────────┘          └──────────────────────────┘          └──────────────────────────┘
```

### Why Do You Need HookLens?
- **Zero Webhook Loss**: Asynchronous Redis + BullMQ queuing guarantees payload retention during server outages.
- **Automated HMAC Security**: Cryptographically verifies provider signatures before forwarding requests.
- **SSRF Egress Guard**: Prevents malicious webhook URLs targeting private internal network IPs (`127.0.0.1`, `10.x.x.x`, cloud metadata endpoints).
- **Exponential Backoff Retries**: Automatically retries failed deliveries up to 5 times.
- **Dead-Letter Queue (DLQ)**: Holds permanently failed webhooks for one-click manual replay.
- **Real-Time Observability**: Inspect raw request/response headers, JSON bodies, and execution latency.

---

## How HookLens Works

```text
Provider Sends Webhook  ──────>  HookLens Ingestion (/wh/:token)
                                             │
                                             ▼
                                 Verify Provider HMAC Signature
                                             │
                                             ▼
                                 Store Event & Log Payload
                                             │
                                             ▼
                                Enqueue BullMQ Delivery Job
                                             │
                                             ▼
                                Deliver Payload to User Backend
                                             │
                                ┌────────────┴────────────┐
                                ▼                         ▼
                          HTTP 200 OK             HTTP 500 / Timeout
                         (SUCCESSFUL)              (RETRYING / DLQ)
```

### The 7 Execution Steps:
1. **Provider Webhook**: Provider sends an HTTP POST request to your HookLens URL (`/wh/:token`).
2. **Ingestion & Validation**: HookLens inspects the raw body and validates the provider's signature header (e.g. `x-razorpay-signature`).
3. **Event Logging**: HookLens generates a unique `eventId` and logs raw headers, body, and timestamp.
4. **BullMQ Queueing**: The event is pushed asynchronously into a Redis-backed BullMQ delivery queue.
5. **Outbound Forwarding**: The delivery worker attaches a fresh `x-hooklens-signature` and sends an HTTP POST to your backend.
6. **Backend Response**: Your server processes the payload and returns an HTTP status code (`200 OK`).
7. **Status Update**: HookLens updates delivery telemetry to `DELIVERED`.

---

## Quick Start Guide

Get up and running with HookLens in under 5 minutes:

### Step 1 — Sign Up / Log In
Navigate to your HookLens dashboard and register a developer account or sign in using Google OAuth.

### Step 2 — Create an Endpoint
Go to **Endpoints** → Click **Create Endpoint**.
- **Name**: e.g., `Razorpay Production Webhooks`
- **Provider**: Select `Razorpay` or `Custom / Generic`
- **Target URL**: Enter your destination backend server URL (e.g., `https://api.yourdomain.com/webhooks/razorpay`)
- **Webhook Secret**: Enter your provider webhook secret string (e.g., `my_razorpay_secret_123`)

### Step 3 — Copy Generated Webhook URL
Upon creation, HookLens generates a unique public ingestion URL:
`http://127.0.0.1:5000/api/v1/wh/ep_abc123xyz` (or `https://api.hooklens.dev/wh/ep_abc123xyz`).

### Step 4 — Configure Provider
Paste the copied HookLens URL into your provider's dashboard settings (e.g. Razorpay Dashboard → Webhooks).

### Step 5 — Send a Test Webhook
Trigger an event from your provider or send a test payload via Postman.

### Step 6 — Inspect Delivery Telemetry
Open **Events** in HookLens to view the ingested event, response status (`200 OK`), and execution time.

> [!EXPECTED RESULT]
> You will see your event marked as `DELIVERED` with an HTTP status `200` returned from your destination server.

---

# 2. Core Concepts

## Webhooks Explained
A webhook is an HTTP callback triggered by an event. Unlike polling (where your server repeatedly asks "Is there new data?"), webhooks deliver data instantly when events occur.

## Endpoints
An **Endpoint** is a target configuration registered inside HookLens. It maps an incoming public HookLens URL token (`ep_...`) to your actual destination backend server URL.

### Endpoint Object Properties:
| Field Name | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `_id` | String | Unique MongoDB document identifier | `66c8f90a12e34f0012ab9901` |
| `token` | String | Unique public ingestion token | `ep_abc123xyz` |
| `name` | String | Descriptive name for the endpoint | `Razorpay Payment Receiver` |
| `targetUrl` | String | Public HTTP/HTTPS URL of your backend server | `https://api.myapp.com/webhooks` |
| `provider` | String | Webhook provider type (`RAZORPAY` \| `CUSTOM`) | `RAZORPAY` |
| `secret` | String | Provider secret used to verify incoming webhooks | `my_secret_key` |
| `signingSecret` | String | Auto-generated outbound signing secret for your backend | `whsec_a1b2c3d4...` |
| `isActive` | Boolean | Enables or disables delivery for this endpoint | `true` |

---

## Webhook URLs

It is critical to distinguish between the two URLs used in HookLens:

```text
1. Provider Webhook URL (Ingestion)     ──────>  http://127.0.0.1:5000/api/v1/wh/ep_abc123xyz
   (Configured in Razorpay Dashboard)

2. Destination Target URL (Outbound)    ──────>  https://api.yourcompany.com/webhooks/razorpay
   (Your application server URL)
```

---

## Signing Secrets

Security requires two distinct secret layers:

```text
[ Razorpay ]  ──(Signed with Provider Webhook Secret)──>  [ HookLens ]  ──(Signed with HookLens Signing Secret)──>  [ Your Backend ]
```

1. **Provider Webhook Secret**: Configured in Razorpay settings. HookLens uses this secret to verify that webhooks arriving at `/wh/:token` were really sent by Razorpay.
2. **HookLens Signing Secret (`whsec_...`)**: Auto-generated by HookLens for every endpoint. Your backend uses this secret to verify that forwarded webhooks were really sent by HookLens.

> [!IMPORTANT]
> **Provider Webhook Secret** and **HookLens Signing Secret** are two completely different keys. Neither key should ever be exposed in frontend code, git repositories, or client bundles.

---

## Delivery Statuses

| Status | Badge Style | Meaning | Next Action Required |
| :--- | :--- | :--- | :--- |
| `QUEUED` | Gray | Webhook payload ingested and placed into Redis BullMQ queue | Automated delivery in progress |
| `DELIVERED` | Emerald | Target backend responded with HTTP `2xx` status code | None (Success) |
| `RETRYING` | Amber | Delivery attempt failed (5xx/timeout); backoff retry scheduled | None (Automated retry active) |
| `FAILED` | Red | Delivery failed due to permanent client error (4xx) or max retries | Check backend logs |
| `DEAD_LETTERED` | Purple | All 5 automated retries failed; moved to Dead-Letter Queue (DLQ) | Debug issue & click **Replay** |

---

# 3. Integration Guides

## Razorpay Webhook Integration

Follow this complete step-by-step guide to connect Razorpay to HookLens.

### Step 1 — Enable Razorpay Test Mode
1. Log into your [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Click the mode toggle switch in the top header to switch to **Test Mode**.

### Step 2 — Create Endpoint in HookLens
In HookLens Dashboard → Click **Endpoints** → **Create Endpoint**:
- **Name**: `Razorpay Test Receiver`
- **Provider**: `Razorpay`
- **Target URL**: `https://your-app.com/webhooks/razorpay` (or your ngrok URL)
- **Webhook Secret**: Enter a secret string (e.g. `razorpay_secret_test_123`)

> [!WARNING]
> Enter a custom Webhook Secret of your choice — do **NOT** enter your Razorpay API Key Secret!

### Step 3 — Configure Webhook in Razorpay
1. In Razorpay Dashboard → Go to **Settings** → **Webhooks** → Click **Add New Webhook**.
2. **Webhook URL**: Paste your unique HookLens ingestion URL (`http://127.0.0.1:5000/api/v1/wh/ep_abc123xyz`).
3. **Secret**: Enter the exact same secret string (`razorpay_secret_test_123`).
4. **Active Events**: Check `payment.captured`.
5. Click **Save Webhook**.

---

## Custom Webhook Integration

For custom webhooks (or testing via Postman / cURL), select provider `Custom / Generic`.

### Sample Ingestion Request (cURL):
```bash
curl -X POST "http://127.0.0.1:5000/api/v1/wh/ep_abc123xyz" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "order.created",
    "timestamp": "2026-08-25T12:00:00Z",
    "data": {
      "orderId": "ORD-10001",
      "amount": 1499,
      "currency": "INR"
    }
  }'
```

---

# 4. Testing & Local Development

## Testing with Postman

Postman allows you to manually send HTTP requests to test your webhooks without waiting for a live provider event.

1. Open Postman → Click **New Request**.
2. Set HTTP Method to `POST`.
3. Enter your HookLens Webhook URL: `http://127.0.0.1:5000/api/v1/wh/ep_abc123xyz`.
4. Under **Headers**, add: `Content-Type: application/json`.
5. Under **Body** → Select **raw** → Choose **JSON**:
   ```json
   {
     "event": "user.signup",
     "data": {
       "userId": "usr_9912",
       "email": "developer@example.com"
     }
   }
   ```
6. Click **Send**.
7. Response received: `202 Accepted` `{ "success": true, "eventId": "evt_..." }`.

---

## Testing Razorpay Webhooks

To test `payment.captured` without a live customer, use Razorpay Order API and Checkout modal:

### 1. Create a Test Order (Postman Request)
- **POST** `https://api.razorpay.com/v1/orders`
- **Auth**: Basic Auth (Username = `rzp_test_...`, Password = Your Test Key Secret)
- **Body**:
  ```json
  {
    "amount": 149900,
    "currency": "INR",
    "receipt": "receipt_001"
  }
  ```
  *(Note: `149900` represents ₹1,499.00 in paise).*

### 2. Complete Test Payment (HTML Snippet)
Creating an order alone does **not** trigger `payment.captured`. Complete the payment using Razorpay Checkout Test Modal:

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
  const options = {
    key: "YOUR_RAZORPAY_TEST_KEY_ID",
    amount: "149900",
    currency: "INR",
    name: "HookLens Test Store",
    order_id: "order_xyz123", // order_id returned from step 1
    handler: function (response) {
      alert("Payment Success! Payment ID: " + response.razorpay_payment_id);
    }
  };
  const rzp = new Razorpay(options);
  rzp.open();
</script>
```

---

## Testing Local Backend with ngrok

HookLens blocks outbound deliveries targeting `http://localhost:3000` to protect against SSRF vulnerabilities.

To deliver webhooks to a backend running locally on your computer:

1. Start your local backend server (e.g. port `3000`).
2. Start ngrok in your terminal:
   ```bash
   ngrok http 3000
   ```
3. Copy the generated public HTTPS URL (e.g., `https://a1b2c3d4.ngrok-free.app`).
4. In HookLens Endpoint settings, set your **Target URL** to:
   `https://a1b2c3d4.ngrok-free.app/webhooks/hooklens`

```text
Local Server (localhost:3000)  <───  ngrok Tunnel  <───  Public HTTPS URL  <───  HookLens Gateway
```

---

## Testing Deployed Production Backend

Once your application server is deployed to public hosting (Render, Vercel, Railway, AWS):
1. Set Target URL directly to your public server endpoint: `https://api.yourcompany.com/webhooks/hooklens`.
2. **ngrok is no longer required**.

---

# 5. Webhook Delivery System

## Exponential Backoff Retries

When your server returns an HTTP error status (`500 Internal Server Error`, `502 Bad Gateway`, `503 Service Unavailable`) or fails to respond within 10 seconds:

1. HookLens captures the failure and marks attempt as `FAILED`.
2. The BullMQ queue automatically schedules exponential backoff retries:
   - **Attempt 1**: Immediate initial delivery
   - **Attempt 2**: Retry after 5 seconds
   - **Attempt 3**: Retry after 25 seconds
   - **Attempt 4**: Retry after 125 seconds
   - **Attempt 5**: Retry after 625 seconds
3. If all 5 attempts fail, the payload is safely moved to the **Dead-Letter Queue (DLQ)**.

---

## Dead-Letter Queue (DLQ)

The Dead-Letter Queue (DLQ) acts as a safety buffer for events that failed all automatic retries.

- **Purpose**: Preserves raw request payloads, headers, and failure details without losing customer events during prolonged backend downtime.
- **Manual Replay**: Once you fix the bug on your server, open **Deliveries / DLQ** in HookLens and click **Replay Event** to re-forward the exact original webhook.

---

# 6. Security & Secret Management

## HMAC SHA-256 Signature Verification

HookLens signs every outbound webhook delivered to your destination server with a unique HMAC-SHA256 signature using your endpoint's `signingSecret` (`whsec_...`).

### Signature Header Format:
- `x-hooklens-signature`: Hexadecimal HMAC-SHA256 digest of raw request body.
- `x-hooklens-event-id`: Unique HookLens event ID.
- `x-hooklens-delivery-id`: Unique delivery attempt ID.
- `x-hooklens-timestamp`: ISO 8601 delivery timestamp.

### Node.js Verification Example:
```javascript
import express from 'express';
import crypto from 'crypto';

const app = express();
// IMPORTANT: Use raw body buffer for signature calculation
app.use(express.raw({ type: 'application/json' }));

app.post('/webhooks/hooklens', (req, res) => {
  const signatureHeader = req.headers['x-hooklens-signature'];
  const secret = process.env.HOOKLENS_SIGNING_SECRET; // "whsec_..."

  if (!signatureHeader || !secret) {
    return res.status(401).send('Missing signature or secret');
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(req.body)
    .digest('hex');

  const sigBuf = Buffer.from(signatureHeader);
  const expBuf = Buffer.from(expectedSignature);

  if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
    // Valid webhook! Process payload safely
    res.status(200).json({ received: true });
  } else {
    // Signature mismatch! Reject request
    res.status(401).send('Invalid webhook signature');
  }
});
```

---

## SSRF IP Egress Guard

To protect your backend infrastructure against Server-Side Request Forgery (SSRF), HookLens SSRF Guard automatically validates target URLs before saving endpoints or delivering webhooks.

### Blocked Target IP Ranges:
- Loopback addresses: `127.0.0.1`, `localhost`, `0.0.0.0`
- Private network ranges (RFC 1918): `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
- Cloud Instance Metadata IP: `169.254.169.254` (AWS IMDS, GCP metadata)

---

# 7. Complete End-to-End Test

Use this 10-step checklist to verify your complete setup:

```text
[ ] 1. HookLens Endpoint Created
[ ] 2. Webhook Secret Configured in Razorpay & HookLens
[ ] 3. HookLens Ingestion URL pasted into Razorpay Webhook settings
[ ] 4. Target Server running & publicly accessible (or ngrok active)
[ ] 5. Test Order created via Postman (POST /v1/orders)
[ ] 6. Test Payment completed via Razorpay Checkout modal
[ ] 7. Razorpay fires payment.captured event
[ ] 8. HookLens verifies x-razorpay-signature header
[ ] 9. HookLens delivers payload to user backend with x-hooklens-signature
[ ] 10. User backend responds HTTP 200 OK & HookLens logs SUCCESS
```

---

# 8. API Reference

All management requests require a Bearer JWT Token:
`Authorization: Bearer YOUR_HOOKLENS_JWT_TOKEN`

## Authentication APIs

### 1. Register User
- **POST** `/api/v1/auth/register` (alias `/auth/register`)
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response** `201 Created`:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": "usr_123",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "tenantId": "tnt_456"
    }
  }
  ```

### 2. Login User
- **POST** `/api/v1/auth/login` (alias `/auth/login`)
- **Request Body**: `{ "email": "jane@example.com", "password": "SecurePassword123!" }`

---

## Endpoint Management APIs

### 1. Create Endpoint
- **POST** `/api/v1/endpoints`
- **Request Body**:
  ```json
  {
    "name": "Razorpay Ingress Receiver",
    "targetUrl": "https://api.yourcompany.com/webhooks/razorpay",
    "provider": "RAZORPAY",
    "secret": "my_razorpay_secret_123"
  }
  ```
- **Response** `201 Created`:
  ```json
  {
    "success": true,
    "message": "Endpoint created successfully",
    "data": {
      "_id": "66c8f90a12e34f0012ab9901",
      "token": "ep_abc123xyz",
      "name": "Razorpay Ingress Receiver",
      "targetUrl": "https://api.yourcompany.com/webhooks/razorpay",
      "provider": "RAZORPAY",
      "signingSecret": "whsec_99887766554433221100aabb",
      "isActive": true
    }
  }
  ```

### 2. List Endpoints
- **GET** `/api/v1/endpoints`

### 3. Update Endpoint
- **PATCH** `/api/v1/endpoints/:token`
- **Request Body**: `{ "targetUrl": "https://new-api.yourcompany.com/webhooks" }`

### 4. Delete Endpoint
- **DELETE** `/api/v1/endpoints/:token`

---

## Webhook Ingestion APIs

- **POST** `/api/v1/wh/:token` (alias `/wh/:token`)
- **Public Ingestion Endpoint** (No Bearer token required; verified via provider signature).
- **Response** `202 Accepted`:
  ```json
  {
    "success": true,
    "message": "Webhook accepted and queued for delivery",
    "eventId": "evt_9876543210"
  }
  ```

---

## Event & Telemetry APIs

### 1. List Events
- **GET** `/api/v1/events?status=FAILED&page=1&limit=20`

### 2. Get Event Details
- **GET** `/api/v1/events/:eventId`

---

## Replays API

### Manual Event Replay
- **POST** `/api/v1/events/:eventId/replay`
- **Response** `202 Accepted`:
  ```json
  {
    "success": true,
    "message": "Event successfully queued for manual replay",
    "eventId": "evt_9876543210",
    "jobId": "job_replay_123",
    "status": "QUEUED"
  }
  ```

---

# 9. Environment Variables Reference

### Backend Environment Variables (`hooklens-backend/.env`)

| Variable Name | Required | Default / Example | Purpose |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | `5000` | HTTP server port for backend API |
| `MONGODB_URI` | **Required** | `mongodb://127.0.0.1:27017/hooklensdb` | Database connection string |
| `REDIS_URL` | **Required** | `redis://127.0.0.1:6379` | Redis connection for BullMQ delivery queues |
| `JWT_SECRET` | **Required** | `YOUR_SUPER_SECRET_JWT_KEY` | Secret key for JWT token signing |
| `GOOGLE_CLIENT_ID` | Optional | `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` | Google OAuth authentication client ID |

### Frontend Environment Variables (`hooklens-frontend/.env`)

| Variable Name | Required | Default / Example | Purpose |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | **Required** | `http://127.0.0.1:5000/api/v1` | Base API URL for frontend client |
| `VITE_GOOGLE_CLIENT_ID` | Optional | `YOUR_GOOGLE_CLIENT_ID` | Google OAuth client ID for login UI |

---

# 10. Troubleshooting & FAQ

## Troubleshooting Common Errors

### `404 Not Found`
- **Cause**: Incorrect Webhook URL token (`ep_...`) or destination route missing.
- **Fix**: Verify your HookLens URL token in HookLens Endpoints tab.

### `INVALID_SIGNATURE`
- **Cause**: Webhook secret mismatch or body modified before verification.
- **Fix**: Ensure exact Webhook Secret matches in Razorpay and HookLens. In Node.js, verify signature against raw body buffer before JSON parsing.

### `INVALID_TARGET_URL` (SSRF Guard Rejection)
- **Cause**: Destination Target URL is set to `localhost` or a private IP (`127.0.0.1`).
- **Fix**: Start ngrok (`ngrok http 3000`) and set Target URL to the generated HTTPS address (`https://xxx.ngrok-free.app`).

### Webhook Event Moved to DLQ
- **Cause**: Destination server returned 5xx errors or timed out across all 5 automatic retries.
- **Fix**: Resolve error on your backend server and click **Replay Event** in HookLens DLQ tab.

---

## Frequently Asked Questions

### Do I need ngrok for local development?
Yes. HookLens runs as a public/remote gateway and cannot reach `http://localhost:3000` directly. `ngrok` creates a secure public HTTPS tunnel to your local machine. Once deployed to Render/Vercel/cloud, ngrok is no longer needed.

### Is Razorpay API Key Secret the same as Webhook Secret?
**No.** Razorpay API Key Secret is used for API requests to Razorpay. Webhook Secret is configured specifically in Razorpay Webhook settings to sign webhook events.

### Is HookLens Signing Secret the same as Provider Webhook Secret?
**No.** Provider Webhook Secret verifies requests from Razorpay to HookLens. HookLens Signing Secret (`whsec_...`) verifies requests from HookLens to your application server.

### Can I test custom webhooks without Razorpay?
Yes! Create an endpoint with provider `Custom / Generic` and send POST requests directly using Postman or cURL.
