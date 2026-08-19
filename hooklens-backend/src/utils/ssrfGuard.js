import dns from 'dns/promises';
import ipaddr from 'ipaddr.js';

export const isPrivateIP = (ipString) => {
    try {
        const addr = ipaddr.parse(ipString);
        const range = addr.range();

        const blockedRanges = [
            'loopback',
            'private',
            'linkLocal',
            'uniqueLocal',
            'carrierGradeNat',
            'broadcast',
            'reserved',
            'unspecified',
        ];

        return blockedRanges.includes(range);
    } catch (err) {
        return true;
    }
};

export const validateTargetUrl = async (rawUrl) => {
    try {
        const parsed = new URL(rawUrl);

        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return { safe: false, reason: 'Only HTTP and HTTPS protocols allowed' };
        }

        if (parsed.hostname.toLowerCase() === 'localhost') {
            return { safe: false, reason: 'Localhost addresses are blocked (SSRF Guard)' };
        }

        const addresses = await dns.lookup(parsed.hostname, { all: true });
        if (!addresses || addresses.length === 0) {
            return { safe: false, reason: 'Unable to resolve destination DNS' };
        }

        for (const record of addresses) {
            if (isPrivateIP(record.address)) {
                return {
                    safe: false,
                    reason: `Target resolves to restricted IP: ${record.address}`,
                };
            }
        }

        return { safe: true };
    } catch (error) {
        return { safe: false, reason: `URL validation failed: ${error.message}` };
    }
};