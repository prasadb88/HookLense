import WebhookEndpoint from '../models/WebhookEndpoint.js';

export const createEndpoint = async (req, res) => {
    try {
        const { name, targetUrl, provider, secret, tenantId } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, error: 'Name is required' });
        }

        const endpoint = await WebhookEndpoint.create({
            tenantId: tenantId || 'default_tenant',
            name,
            targetUrl: targetUrl || '',
            provider: provider || 'RAZORPAY',
            secret: secret || 'rzp_test_secret_key_123',
        });

        return res.status(201).json({
            success: true,
            message: 'Endpoint created successfully',
            data: endpoint,
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const getAllEndpoints = async (req, res) => {
    try {
        const endpoints = await WebhookEndpoint.find().sort({ createdAt: -1 });
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
        const endpoint = await WebhookEndpoint.findOne({ token });

        if (!endpoint) {
            return res.status(404).json({ success: false, error: 'Endpoint not found' });
        }

        return res.status(200).json({ success: true, data: endpoint });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const updateEndpoint = async (req, res) => {
    try {
        const { token } = req.params;
        const endpoint = await WebhookEndpoint.findOneAndUpdate(
            { token },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!endpoint) {
            return res.status(404).json({ success: false, error: 'Endpoint not found' });
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
        const endpoint = await WebhookEndpoint.findOneAndDelete({ token });

        if (!endpoint) {
            return res.status(404).json({ success: false, error: 'Endpoint not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Endpoint deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};
