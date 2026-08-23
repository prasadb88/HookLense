import dns from 'dns/promises';
import ipaddr from 'ipaddr.js';

export const isPrivateIP = (ipString) => {
  try {
    let addr = ipaddr.parse(ipString);
    // Unmap IPv4-mapped IPv6 addresses (e.g. ::ffff:127.0.0.1 -> 127.0.0.1)
    if (addr.kind() === 'ipv6' && addr.isIPv4MappedAddress()) {
      addr = addr.toIPv4Address();
    }

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
      'multicast',
    ];

    return blockedRanges.includes(range);
  } catch {
    // Fail closed if IP address parsing fails
    return true;
  }
};

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'ip6-localhost',
  'ip6-loopback',
  '0.0.0.0',
]);

const BLOCKED_HOSTNAME_SUFFIXES = ['.local', '.internal', '.lan', '.localdomain'];

export const validateTargetUrl = async (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return {
      safe: false,
      error: 'INVALID_TARGET_URL',
      message: 'The target URL is not allowed.',
      reason: 'Target URL is required',
    };
  }

  let parsed;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return {
      safe: false,
      error: 'INVALID_TARGET_URL',
      message: 'The target URL is not allowed.',
      reason: 'Malformed URL format',
    };
  }

  // 1. Protocol check: Allow HTTP and HTTPS
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return {
      safe: false,
      error: 'INVALID_TARGET_URL',
      message: 'The target URL is not allowed.',
      reason: 'Only HTTP and HTTPS protocols are allowed',
    };
  }

  // 2. Reject embedded credentials (e.g. https://user:pass@example.com)
  if (parsed.username || parsed.password) {
    return {
      safe: false,
      error: 'INVALID_TARGET_URL',
      message: 'The target URL is not allowed.',
      reason: 'Embedded credentials are not permitted in target URLs',
    };
  }

  const hostname = parsed.hostname.toLowerCase().trim();

  // 3. Obvious internal hostnames & TLD suffixes check
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return {
      safe: false,
      error: 'INVALID_TARGET_URL',
      message: 'The target URL is not allowed.',
      reason: `Blocked internal hostname: ${hostname}`,
    };
  }

  if (BLOCKED_HOSTNAME_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
    return {
      safe: false,
      error: 'INVALID_TARGET_URL',
      message: 'The target URL is not allowed.',
      reason: `Blocked internal domain suffix`,
    };
  }

  // 4. Direct IP Address Literal check (IPv4 or IPv6)
  if (ipaddr.isValid(hostname)) {
    if (isPrivateIP(hostname)) {
      return {
        safe: false,
        error: 'INVALID_TARGET_URL',
        message: 'The target URL is not allowed.',
        reason: 'Private IP address literal is blocked',
      };
    }
    return {
      safe: true,
      normalizedUrl: parsed.href,
      resolvedIps: [hostname],
    };
  }

  // 5. DNS Resolution: Resolve hostname to EVERY IPv4 and IPv6 address
  try {
    const addresses = await dns.lookup(hostname, { all: true });

    if (!addresses || addresses.length === 0) {
      return {
        safe: false,
        error: 'INVALID_TARGET_URL',
        message: 'The target URL is not allowed.',
        reason: 'Unable to resolve destination DNS',
      };
    }

    const resolvedIps = [];
    for (const record of addresses) {
      resolvedIps.push(record.address);
      if (isPrivateIP(record.address)) {
        return {
          safe: false,
          error: 'INVALID_TARGET_URL',
          message: 'The target URL is not allowed.',
          reason: `Target hostname resolves to private IP address (${record.address})`,
        };
      }
    }

    return {
      safe: true,
      normalizedUrl: parsed.href,
      resolvedIps,
    };
  } catch {
    // If DNS resolution fails, reject the endpoint
    return {
      safe: false,
      error: 'INVALID_TARGET_URL',
      message: 'The target URL is not allowed.',
      reason: 'DNS resolution failed',
    };
  }
};

export default validateTargetUrl;