import express from 'express';

import UserController from './app/controllers/UserController';

const routes = express.Router();

// Root route
routes.get('/', (req, res) => res.json({ Api_status: 'working' }));

// User Routes
routes.post('/users', UserController.store);
routes.get('/users', UserController.index);
routes.get('/users/:id', UserController.show);
routes.put('/users', UserController.update);
routes.delete('/users/:id', UserController.delete);

export default routes;
