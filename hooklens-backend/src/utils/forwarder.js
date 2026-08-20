import axios from 'axios';
import { validateTargetUrl } from './ssrfGuard.js';

export const forwardWebhook = async (targetUrl, payloadBuffer, headers = {}) => {
    if (!targetUrl) {
        return {
            status: 'FAILED',
            httpStatus: null,
            latencyMs: 0,
            responseBody: null,
            errorMessage: 'No destination targetUrl configured.',
        };
    }

    const ssrfCheck = await validateTargetUrl(targetUrl);
    if (!ssrfCheck.safe) {
        return {
            status: 'BLOCKED_SSRF',
            httpStatus: null,
            latencyMs: 0,
            responseBody: null,
            errorMessage: ssrfCheck.reason,
        };
    }

    const outboundHeaders = { ...headers };
    delete outboundHeaders.host;
    delete outboundHeaders['content-length'];

    const startTime = Date.now();

    try {
        const response = await axios.post(targetUrl, payloadBuffer, {
            headers: {
                ...outboundHeaders,
                'content-type': 'application/json',
                'x-forwarded-by': 'HookLens-Egress',
            },
            timeout: 10000,
            maxRedirects: 0,
        });

        return {
            status: 'SUCCEEDED',
            httpStatus: response.status,
            latencyMs: Date.now() - startTime,
            responseBody: response.data,
            errorMessage: null,
        };
    } catch (error) {
        const latencyMs = Date.now() - startTime;

        if (error.response) {
            return {
                status: 'FAILED',
                httpStatus: error.response.status,
                latencyMs,
                responseBody: error.response.data,
                errorMessage: `Target returned HTTP ${error.response.status}`,
            };
        }

        return {
            status: 'FAILED',
            httpStatus: null,
            latencyMs,
            responseBody: null,
            errorMessage: error.message || 'Connection Timeout / Network Error',
        };
    }
};