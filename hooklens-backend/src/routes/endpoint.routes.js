import express from 'express';
import {
    createEndpoint,
    getAllEndpoints,
    getEndpointByToken,
    updateEndpoint,
    deleteEndpoint,
} from '../controller/endpoint.controller.js';
import requireAuth from '../middleware/auth.middleware.js';

const router = express.Router();

// All endpoint management routes require authentication & tenant context
router.use(requireAuth);

router.route('/')
    .post(createEndpoint)
    .get(getAllEndpoints);

router.route('/:token')
    .get(getEndpointByToken)
    .patch(updateEndpoint)
    .delete(deleteEndpoint);

export default router;
