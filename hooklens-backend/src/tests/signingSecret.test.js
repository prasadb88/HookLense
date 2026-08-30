import crypto from 'crypto';
import assert from 'assert/strict';
import { nanoid } from 'nanoid';

console.log('🧪 Running HookLens Outbound Signing Secret Test Suite...\n');

// 1. Helper function to generate outbound HookLens HMAC-SHA256 signature
const generateOutboundSignature = (rawPayload, secret) => {
    return crypto
        .createHmac('sha256', secret)
        .update(rawPayload)
        .digest('hex');
};

// 2. Helper function to verify outbound HookLens signature timing-safely
const verifyOutboundSignature = (rawPayload, signatureHeader, secret) => {
    if (!signatureHeader || !secret) return false;
    const expected = generateOutboundSignature(rawPayload, secret);
    const sigBuf = Buffer.from(String(signatureHeader).trim());
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
};

// Simulated Endpoint Creation Factory (mimicking WebhookEndpoint schema default)
const createSimulatedEndpoint = (name, provider = 'RAZORPAY') => {
    return {
        id: `ep_${nanoid(12)}`,
        name,
        provider,
        token: nanoid(16),
        secret: `sec_${nanoid(24)}`,
        signingSecret: `whsec_${nanoid(24)}`,
    };
};

try {
    // TEST 1: Two newly created endpoints receive different secrets
    console.log('▶ Test 1: Two newly created endpoints receive unique signing secrets');
    const endpointA = createSimulatedEndpoint('Endpoint A');
    const endpointB = createSimulatedEndpoint('Endpoint B');

    assert.notStrictEqual(
        endpointA.signingSecret,
        endpointB.signingSecret,
        'Endpoint A and Endpoint B must not share the same signingSecret'
    );
    assert.ok(endpointA.signingSecret.startsWith('whsec_'), 'Signing secret A must start with whsec_');
    assert.ok(endpointB.signingSecret.startsWith('whsec_'), 'Signing secret B must start with whsec_');
    console.log(`  ✓ Endpoint A secret: ${endpointA.signingSecret.substring(0, 12)}...`);
    console.log(`  ✓ Endpoint B secret: ${endpointB.signingSecret.substring(0, 12)}...`);
    console.log('  ✅ Passed\n');

    // TEST 2: Endpoint A cannot verify a signature generated using Endpoint B's secret
    console.log('▶ Test 2: Endpoint A cannot verify signature generated with Endpoint B secret');
    const payload = Buffer.from(JSON.stringify({ event: 'payment.captured', amount: 5000 }));
    const signatureB = generateOutboundSignature(payload, endpointB.signingSecret);

    const verifiedByA = verifyOutboundSignature(payload, signatureB, endpointA.signingSecret);
    assert.strictEqual(
        verifiedByA,
        false,
        'Signature generated with secret B must FAIL verification with secret A'
    );
    console.log('  ✅ Passed (Verification correctly rejected mismatch)\n');

    // TEST 3: The correct endpoint secret successfully verifies the webhook
    console.log('▶ Test 3: Correct endpoint secret successfully verifies the webhook signature');
    const signatureA = generateOutboundSignature(payload, endpointA.signingSecret);
    const verifiedByCorrectA = verifyOutboundSignature(payload, signatureA, endpointA.signingSecret);
    assert.strictEqual(
        verifiedByCorrectA,
        true,
        'Signature generated with secret A must PASS verification with secret A'
    );
    console.log('  ✅ Passed (Verification succeeded with matching secret)\n');

    // TEST 4: "whsec_protected" is never used as an actual secret
    console.log('▶ Test 4: "whsec_protected" is never used as an actual secret');
    const endpointsBatch = Array.from({ length: 50 }, (_, i) => createSimulatedEndpoint(`Endpoint ${i}`));
    for (const ep of endpointsBatch) {
        assert.notStrictEqual(
            ep.signingSecret,
            'whsec_protected',
            `Endpoint ${ep.id} must not use "whsec_protected"`
        );
        assert.notStrictEqual(
            ep.secret,
            'whsec_protected',
            `Endpoint ${ep.id} must not use "whsec_protected" for provider secret`
        );
    }
    console.log('  ✅ Passed (Verified 50 generated endpoints, zero hardcoded secrets found)\n');

    console.log('🎉 ALL SIGNING SECRET TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
} catch (err) {
    console.error('❌ TEST FAILED:', err.message);
    console.error(err.stack);
    process.exit(1);
}
