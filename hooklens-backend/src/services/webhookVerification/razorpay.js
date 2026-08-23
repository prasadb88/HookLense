import crypto from 'crypto';

export const verifyRazorpaySignature = (rawBodyBuffer, signatureHeader, secret) => {
  if (!signatureHeader || !secret) {
    return {
      verified: false,
      algorithm: 'HMAC-SHA256',
      reason: 'Missing signature header (x-razorpay-signature) or webhook secret',
    };
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBodyBuffer)
      .digest('hex');

    const sigBuf = Buffer.from(String(signatureHeader).trim());
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length) {
      return {
        verified: false,
        algorithm: 'HMAC-SHA256',
        reason: 'Signature length mismatch / tampered body',
      };
    }

    const isMatch = crypto.timingSafeEqual(sigBuf, expBuf);

    return {
      verified: isMatch,
      algorithm: 'HMAC-SHA256',
      reason: isMatch ? null : 'Signature mismatch / tampered body',
    };
  } catch (err) {
    return {
      verified: false,
      algorithm: 'HMAC-SHA256',
      reason: `Signature verification error: ${err.message}`,
    };
  }
};

export const extractRazorpayMetadata = (rawBodyBuffer) => {
  try {
    const parsed = JSON.parse(rawBodyBuffer.toString('utf-8'));
    return {
      providerEventId: parsed.event_id || parsed.id || null,
      eventType: parsed.event || 'unknown',
      parsedBody: parsed,
    };
  } catch {
    return {
      providerEventId: null,
      eventType: 'unparseable_payload',
      parsedBody: null,
    };
  }
};
