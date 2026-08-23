import mongoose from 'mongoose';
import WebhookEndpoint from '../models/WebhookEndpoint.js';
import { validateTargetUrl } from '../utils/ssrfGuard.js';

export const createEndpoint = async (req, res) => {
    try {
        const { name, provider, secret } = req.body;
        const rawTargetUrl = req.body.targetUrl || req.body.target_url || req.body.url || req.body.targetURL;
        const tenantId = req.user.tenantId;

        // 1. Log received targetUrl (without secrets)
        console.log(`[SSRF LOG] CREATE Request received. Name: "${name}", targetUrl: "${rawTargetUrl}"`);

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, error: 'INVALID_INPUT', message: 'Name is required' });
        }

        if (!rawTargetUrl || !String(rawTargetUrl).trim()) {
            console.log('[SSRF LOG] validateTargetUrl() NOT called because targetUrl is missing or empty.');
            return res.status(400).json({
                success: false,
                error: 'INVALID_TARGET_URL',
                message: 'The target URL is not allowed.',
            });
        }

        // 2. Log whether validateTargetUrl() is called
        console.log(`[SSRF LOG] Calling validateTargetUrl("${rawTargetUrl}")`);
        const ssrfResult = await validateTargetUrl(String(rawTargetUrl).trim());

        // 3. Log validation result
        console.log(`[SSRF LOG] validateTargetUrl() result: safe=${ssrfResult.safe}, error=${ssrfResult.error || 'none'}, reason=${ssrfResult.reason || 'none'}`);

        if (!ssrfResult.safe) {
            console.log('[SSRF LOG] SSRF Guard REJECTED targetUrl. Endpoint save() SKIPPED. Returning HTTP 400.');
            return res.status(400).json({
                success: false,
                error: 'INVALID_TARGET_URL',
                message: 'The target URL is not allowed.',
            });
        }

        // 4. Log whether endpoint save() is executed
        console.log('[SSRF LOG] SSRF Guard PASSED. Executing WebhookEndpoint.create()...');

        const endpoint = await WebhookEndpoint.create({
            tenantId,
            name: name.trim(),
            targetUrl: ssrfResult.normalizedUrl,
            provider: provider || 'RAZORPAY',
            secret: secret || undefined,
        });

        console.log(`[SSRF LOG] WebhookEndpoint.create() EXECUTED successfully. Endpoint ID: ${endpoint._id}`);

        return res.status(201).json({
            success: true,
            message: 'Endpoint created successfully',
            data: endpoint,
        });
    } catch (error) {
        console.error('[SSRF LOG] Exception in createEndpoint:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const getAllEndpoints = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const endpoints = await WebhookEndpoint.find({ tenantId }).sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: endpoints.length,
            data: endpoints,
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const getEndpointByToken = async (req, res) => {
    try {
        const { token } = req.params;
        const tenantId = req.user.tenantId;

        const isObjectId = mongoose.Types.ObjectId.isValid(token);
        const query = {
            tenantId,
            $or: [{ token }, ...(isObjectId ? [{ _id: token }] : [])],
        };

        const endpoint = await WebhookEndpoint.findOne(query);

        if (!endpoint) {
            return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Endpoint not found' });
        }

        return res.status(200).json({ success: true, data: endpoint });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const updateEndpoint = async (req, res) => {
    try {
        const { token } = req.params;
        const tenantId = req.user.tenantId;

        // Prevent client from altering tenantId
        const updateData = { ...req.body };
        delete updateData.tenantId;

        const rawTargetUrl = updateData.targetUrl || updateData.target_url || updateData.url || updateData.targetURL;

        console.log(`[SSRF LOG] UPDATE Request for token "${token}". TargetUrl: "${rawTargetUrl}"`);

        // Run SSRF validation if targetUrl (or any alias) is supplied
        if (rawTargetUrl !== undefined && rawTargetUrl !== null) {
            const trimmedUrl = String(rawTargetUrl).trim();
            if (!trimmedUrl) {
                console.log('[SSRF LOG] UPDATE REJECTED: targetUrl is empty.');
                return res.status(400).json({
                    success: false,
                    error: 'INVALID_TARGET_URL',
                    message: 'The target URL is not allowed.',
                });
            }

            console.log(`[SSRF LOG] Calling validateTargetUrl("${trimmedUrl}") on UPDATE`);
            const ssrfResult = await validateTargetUrl(trimmedUrl);
            console.log(`[SSRF LOG] UPDATE validateTargetUrl() result: safe=${ssrfResult.safe}`);

            if (!ssrfResult.safe) {
                console.log('[SSRF LOG] UPDATE REJECTED by SSRF Guard. Returning HTTP 400.');
                return res.status(400).json({
                    success: false,
                    error: 'INVALID_TARGET_URL',
                    message: 'The target URL is not allowed.',
                });
            }
            updateData.targetUrl = ssrfResult.normalizedUrl;
        }

        const isObjectId = mongoose.Types.ObjectId.isValid(token);
        const query = {
            tenantId,
            $or: [{ token }, ...(isObjectId ? [{ _id: token }] : [])],
        };

        const endpoint = await WebhookEndpoint.findOneAndUpdate(
            query,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!endpoint) {
            return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Endpoint not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Endpoint updated successfully',
            data: endpoint,
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const deleteEndpoint = async (req, res) => {
    try {
        const { token } = req.params;
        const tenantId = req.user.tenantId;

        const isObjectId = mongoose.Types.ObjectId.isValid(token);
        const query = {
            tenantId,
            $or: [{ token }, ...(isObjectId ? [{ _id: token }] : [])],
        };

        const endpoint = await WebhookEndpoint.findOneAndDelete(query);

        if (!endpoint) {
            return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Endpoint not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Endpoint deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};
