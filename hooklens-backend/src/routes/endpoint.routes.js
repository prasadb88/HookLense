import express from 'express';
import {
    createEndpoint,
    getAllEndpoints,
    getEndpointByToken,
    updateEndpoint,
    deleteEndpoint,
} from '../controller/endpoint.controller.js';

const router = express.Router();

router.route('/')
    .post(createEndpoint)
    .get(getAllEndpoints);

router.route('/:token')
    .get(getEndpointByToken)
    .patch(updateEndpoint)
    .delete(deleteEndpoint);

export default router;
