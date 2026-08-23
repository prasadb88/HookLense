import { verifyRazorpaySignature, extractRazorpayMetadata } from './razorpay.js';

export const verifyWebhookSignature = (provider, rawBodyBuffer, headers, secret) => {
  const normalizedProvider = String(provider || '').toUpperCase();

  switch (normalizedProvider) {
    case 'RAZORPAY': {
      const signatureHeader = headers['x-razorpay-signature'] || headers['X-Razorpay-Signature'];
      return verifyRazorpaySignature(rawBodyBuffer, signatureHeader, secret);
    }

    case 'CUSTOM':
      return {
        verified: true,
        algorithm: 'NONE',
        reason: 'Signature verification is not enforced for CUSTOM provider',
      };

    default:
      return {
        verified: false,
        algorithm: 'UNKNOWN',
        reason: `Unsupported provider for signature verification: ${provider}`,
      };
  }
};

export const extractWebhookMetadata = (provider, rawBodyBuffer) => {
  const normalizedProvider = String(provider || '').toUpperCase();

  switch (normalizedProvider) {
    case 'RAZORPAY':
      return extractRazorpayMetadata(rawBodyBuffer);

    default: {
      try {
        const parsed = JSON.parse(rawBodyBuffer.toString('utf-8'));
        return {
          providerEventId: parsed.id || parsed.event_id || parsed.eventId || null,
          eventType: parsed.event || parsed.type || parsed.eventType || 'unknown',
          parsedBody: parsed,
        };
      } catch {
        return {
          providerEventId: null,
          eventType: 'unparseable_payload',
          parsedBody: null,
        };
      }
    }
  }
};
