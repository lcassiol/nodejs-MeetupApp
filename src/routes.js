import express from 'express';

const routes = express.Router();

// Root route
routes.get('/', (req, res) => res.json({ Api_status: 'working' }));

export default routes;
