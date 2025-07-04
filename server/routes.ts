import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import bcrypt from "bcrypt";
import { insertUserSchema } from "@shared/schema";

// Authentication middleware
function requireAuth(req: any, res: any, next: any) {
  if (req.session?.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware setup
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  }));
  // Authentication routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      req.session.userId = user.id;
      res.json({ 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to logout' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Notifications routes
  app.get('/api/notifications', requireAuth, async (req: any, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.session.userId);
      res.json(notifications);
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/notifications/:id/read', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.markNotificationAsRead(parseInt(id));
      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error('Mark notification read error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create default admin user if none exists
  app.post('/api/setup', async (req, res) => {
    try {
      const existingUser = await storage.getUserByEmail('admin@admin.com');
      if (existingUser) {
        return res.status(400).json({ error: 'Admin user already exists' });
      }

      const hashedPassword = await bcrypt.hash('admin123', 10);
      const user = await storage.createUser({
        email: 'admin@admin.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        isActive: true
      });

      res.json({ message: 'Admin user created successfully' });
    } catch (error) {
      console.error('Setup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Seed sample notifications
  app.post('/api/notifications/seed', requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      
      const sampleNotifications = [
        {
          userId,
          title: 'New Service Provider',
          message: 'Alex Martinez has submitted a new provider application',
          type: 'info',
          isRead: false
        },
        {
          userId,
          title: 'Payment Received',
          message: 'Payment of $150 received for booking #BK-2024-001',
          type: 'success',
          isRead: false
        },
        {
          userId,
          title: 'Support Ticket',
          message: 'New high priority support ticket #ST-001 requires attention',
          type: 'warning',
          isRead: true
        },
        {
          userId,
          title: 'System Update',
          message: 'Platform maintenance scheduled for tonight at 2:00 AM',
          type: 'info',
          isRead: false
        }
      ];

      for (const notification of sampleNotifications) {
        await storage.createNotification(notification);
      }

      res.json({ message: 'Sample notifications created successfully' });
    } catch (error) {
      console.error('Seed notifications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
