import crypto from 'crypto';

export class RazorpayAdapter {
    /**
     * Verify HMAC SHA256 signature using RAW Buffer
     */
    static verifySignature(rawBodyBuffer, signatureHeader, secret) {
        if (!signatureHeader || !secret) {
            return { verified: false, reason: 'Missing signature header or webhook secret' };
        }

        try {
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(rawBodyBuffer)
                .digest('hex');

            const isMatch = crypto.timingSafeEqual(
                Buffer.from(signatureHeader),
                Buffer.from(expectedSignature)
            );

            return {
                verified: isMatch,
                algorithm: 'HMAC-SHA256',
                reason: isMatch ? null : 'Signature mismatch / tampered body',
            };
        } catch (err) {
            return { verified: false, reason: err.message };
        }
    }

    /**
     * Parse Razorpay event metadata safely
     */
    static extractMetadata(rawBodyBuffer) {
        try {
            const parsed = JSON.parse(rawBodyBuffer.toString('utf-8'));
            return {
                providerEventId: parsed.event_id || parsed.id || null,
                eventType: parsed.event || 'unknown',
                parsedBody: parsed,
            };
        } catch (e) {
            return {
                providerEventId: null,
                eventType: 'unparseable_payload',
                parsedBody: null,
            };
        }
    }
}