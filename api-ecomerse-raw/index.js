import express from 'express';
import cors from 'cors';
import { connectDb } from './db.js';
import {
  AuthRouter,
  ProductRouter,
  CartRouter,
  UserRouter,
  OrderRouter,
  PaymentRouter,
  AboutRouter,
  StatsRouter,
  CategoryRouter,
  BrandRouter,
  SettingRouter,
  CouponRouter,
  CampaignRouter,
  CustomerMessageRouter,
  SupportTicketRouter,
  ReviewRouter,
  ReturnRouter,
} from './routers/index.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import helmet from 'helmet';

const app = express();
// Increase payload size limit to handle base64 images (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
  origin: [
    'http://localhost:5174',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const options = {
  customCssUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui.css',
};

const cspDefaults = helmet.contentSecurityPolicy.getDefaultDirectives();
delete cspDefaults['upgrade-insecure-requests'];

app.use(
  helmet({
    contentSecurityPolicy: { directives: cspDefaults },
  })
);

// Debug middleware to log all requests
app.use('/api/v1', (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  // Log if it's an admin route
  if (req.path.includes('/admin/')) {
    console.log(`  → Admin route detected: ${req.path}`)
  }
  next()
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, options));

// Log all registered routes for debugging
console.log('Registering routes...')
console.log('ReviewRouter:', ReviewRouter ? 'Loaded' : 'NOT LOADED')

app.use('/api/v1', AuthRouter);
// ReviewRouter must be before ProductRouter to avoid route conflicts
// Admin routes should be registered early to avoid conflicts
app.use('/api/v1', ReviewRouter);
console.log('ReviewRouter registered at /api/v1')
console.log('  → Admin routes:')
console.log('    - GET /admin/reviews')
console.log('    - GET /admin/products-for-filter')
console.log('    - GET /admin/reviews/rating-stats')
console.log('    - GET /admin/reviews/negative-reports')
console.log('    - PUT /admin/reviews/:id/status')
console.log('    - POST /admin/reviews/:id/reply')
app.use('/api/v1', ProductRouter);
app.use('/api/v1', CartRouter);
app.use('/api/v1', UserRouter);
app.use('/api/v1', OrderRouter);
app.use('/api/v1', PaymentRouter);
app.use('/api/v1', AboutRouter);
app.use('/api/v1', StatsRouter);
app.use('/api/v1', CategoryRouter);
app.use('/api/v1', BrandRouter);
app.use('/api/v1', SettingRouter);
app.use('/api/v1', CouponRouter);
app.use('/api/v1', CampaignRouter);
app.use('/api/v1', CustomerMessageRouter);
app.use('/api/v1', SupportTicketRouter);
app.use('/api/v1', ReturnRouter);
app.use('/index', (req, res) => {
  return res.body('OK');
});

const start = () => {
  connectDb(app);
};

start();
