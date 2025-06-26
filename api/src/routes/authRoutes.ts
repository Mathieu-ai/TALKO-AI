import { Application } from 'express';
import { AuthController } from '../controllers/authController';

export const authRoutes = (app: Application) => {
  const authController = new AuthController();

  console.log('Registering auth routes...');

  // Registration route
  app.post('/api/auth/register', (req, res) => {
    console.log('Registration request received:', req.body);
    return authController.register(req, res);
  });

  // Login route
  app.post('/api/auth/login', (req, res) => {
    console.log('Login request received:', req.body);
    return authController.login(req, res);
  });

  // Get current user route
  app.get('/api/auth/me', (req, res) => {
    return authController.getCurrentUser(req, res);
  });

  // Logout route
  app.post('/api/auth/logout', (req, res) => {
    return authController.logout(req, res);
  });

  console.log('Auth routes registered successfully');
};
