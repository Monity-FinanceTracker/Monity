# Monity Web Application - Cursor Rules

## Project Overview
Monity is a full-stack personal finance management application with AI-powered transaction categorization, collaborative expense splitting, and financial health insights. Built with React and Node.js following MVC architecture.

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with MVC architecture
- **Database**: PostgreSQL via Supabase
- **Authentication**: JWT with Supabase Auth
- **AI/ML**: Custom Naive Bayes classifier with NLP (natural, compromise, stopword, ml-naivebayes)
- **Payment Processing**: Stripe API
- **Caching**: LRU cache (in-memory)
- **Scheduling**: node-cron for automated tasks
- **Security**: helmet, rate limiting (express-rate-limit), encryption middleware, input validation (joi), XSS protection
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **State Management**: React Context + TanStack React Query v5
- **Routing**: React Router v7
- **Charts**: react-chartjs-2
- **i18n**: react-i18next (English & Portuguese)
- **Performance**: react-window for virtualization, lazy loading
- **Analytics**: Vercel Analytics & Speed Insights
- **Testing**: Vitest + Testing Library

### Infrastructure
- **Database & Auth**: Supabase
- **API**: RESTful with versioning (/api/v1)
- **CI/CD**: AWS deployment ready

## Project Structure

### Backend Structure
```
backend/
├── server.js                      # Application entry point
├── config/                        # Environment & database config
│   ├── supabase.js               # Supabase client setup
│   └── stripe.js                 # Stripe configuration
├── models/                        # Data models (User, Transaction, Category, etc.)
├── controllers/                   # Request handlers
│   ├── authController.js
│   ├── transactionController.js
│   ├── categoryController.js
│   ├── groupController.js
│   ├── savingsGoalController.js
│   ├── aiController.js
│   ├── adminController.js
│   └── index.js                  # Controller initialization
├── services/                      # Business logic layer
│   ├── smartCategorizationService.js  # AI categorization
│   ├── aiSchedulerService.js         # Scheduled transactions
│   ├── expenseSplittingService.js    # Group expense logic
│   ├── financialHealthService.js     # Financial scoring
│   ├── scheduledTransactionService.js
│   └── index.js
├── routes/                        # API endpoint definitions
│   ├── auth.js
│   ├── transactions.js
│   ├── categories.js
│   ├── groups.js
│   ├── savingsGoals.js
│   └── index.js                  # Route aggregation
├── middleware/                    # Cross-cutting concerns
│   ├── auth.js                   # JWT authentication
│   ├── validation.js             # Input validation
│   ├── encryption.js             # Data encryption
│   ├── errorHandler.js           # Error handling
│   ├── rateLimiter.js            # Rate limiting
│   └── index.js
├── utils/                         # Helper functions
│   ├── logger.js                 # Winston logger
│   ├── helpers.js                # Utility functions
│   └── constants.js              # App constants
├── migrations/                    # Database migrations
└── __tests__/                    # Backend test suite
```

### Frontend Structure
```
frontend/src/
├── App.jsx                       # Main router & layout
├── components/                   # React components
│   ├── auth/                    # Login, Signup, etc.
│   ├── dashboard/               # Dashboard views
│   ├── transactions/            # Transaction management
│   ├── groups/                  # Expense splitting
│   ├── settings/                # Settings & preferences
│   ├── admin/                   # Admin dashboard
│   ├── ai/                      # AI features
│   ├── cashFlow/                # Cash flow calendar
│   ├── ui/                      # Reusable UI components
│   └── index.js                 # Component exports
├── context/                      # Global state
│   └── AuthContext.jsx          # Auth state management
├── hooks/                        # Custom React hooks
│   ├── usePageTracking.js       # Analytics
│   └── useLazyComponentPreloader.js
├── utils/                        # Utilities
│   ├── api.js                   # API client
│   ├── supabase.js              # Supabase client
│   └── i18n/                    # Translations (en, pt)
└── styles/                       # Global styles
```

## Architecture Guidelines

### MVC Pattern
Follow strict separation of concerns:
- **Models**: Handle data structure, validation, and database operations
- **Controllers**: Process HTTP requests, coordinate models/services, format responses
- **Routes**: Define API endpoints, apply middleware chains
- **Services**: Contain complex business logic and algorithms
- **Middleware**: Handle authentication, validation, logging, errors

### Controllers
- Accept Supabase client via dependency injection
- Use `asyncHandler` wrapper for async methods
- Return consistent JSON responses: `{ success, data, message, pagination }`
- Handle errors with appropriate HTTP status codes
- Never directly access database (use models)
- Validate inputs before processing

### Services
- Implement reusable business logic
- Independent of HTTP layer
- Should be testable in isolation
- Use dependency injection for external dependencies
- Handle complex algorithms (AI, financial calculations, splitting)
- Coordinate multiple models when needed

### Models
- One model per database table/resource
- Implement CRUD operations
- Handle data validation
- Manage database queries via Supabase
- Return plain objects (not class instances)
- Handle encryption/decryption when needed

### Routes
- RESTful endpoint design
- Apply middleware at appropriate levels (global, route-level, endpoint-specific)
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Implement pagination: `?page=1&limit=10`
- Support filtering and sorting
- Versioned: `/api/v1/resource`

## Coding Standards

### JavaScript/JSX Style
- Use ES6+ features (const/let, arrow functions, destructuring, async/await)
- Prefer named exports over default exports
- Use PascalCase for components, camelCase for functions/variables
- 2-space indentation
- Semicolons required
- Async/await over promises chains

### React Patterns
```jsx
// Component structure
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const ComponentName = ({ prop1, prop2 }) => {
  const { user } = useAuth();
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  const handleAction = useCallback(async () => {
    try {
      const response = await API.post('/endpoint', data);
      setState(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  }, [dependencies]);
  
  return (
    <div className="container">
      {/* JSX */}
    </div>
  );
};

export default React.memo(ComponentName);
```

### Backend Patterns
```javascript
// Controller pattern
class ResourceController {
  constructor(supabase) {
    this.supabase = supabase;
    this.model = new ResourceModel(supabase);
    this.service = new ResourceService(supabase);
  }

  getAll = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const data = await this.model.findByUser(userId, { page, limit });
    const total = await this.model.countByUser(userId);
    
    res.status(200).json({
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  });
}
```

### Error Handling
```javascript
// Backend
throw new Error('Descriptive error message');

// Frontend
try {
  await operation();
  toast.success('Operation successful');
} catch (error) {
  console.error('Operation failed:', error);
  toast.error(error.message || 'Operation failed');
}
```

## Security Best Practices

### Authentication & Authorization
- All protected routes require JWT via `authenticate` middleware
- Check user ownership: `userId === req.user.id`
- Admin routes use `requireRole('admin')` middleware
- Premium features check `subscriptionTier === 'premium'`
- Never trust client-side data, always validate server-side

### Data Protection
- Use encryption middleware for sensitive data
- Implement Row Level Security (RLS) in Supabase
- Validate all inputs with Joi schemas
- Sanitize user input to prevent XSS
- Rate limit sensitive endpoints (auth, payments)
- Use helmet for security headers

### API Security
```javascript
// Apply rate limiting
router.use('/auth', rateLimiter.authLimiter);
router.use('/api', rateLimiter.apiLimiter);

// Authentication middleware
router.use(middleware.auth.authenticate);

// Input validation
router.post('/', validationMiddleware.validateBody(schema), controller.create);
```

## Performance Optimization

### Frontend
- Lazy load routes and heavy components with `React.lazy()`
- Use `React.memo()` for expensive components
- Implement virtualization with `react-window` for long lists
- Preload critical components after initial render
- Optimize images and assets
- Use TanStack Query for caching and data synchronization
- Implement proper loading states and skeletons

### Backend
- Use LRU cache for frequently accessed data
- Implement pagination for large datasets
- Use database indexes on frequently queried fields
- Enable gzip compression
- Optimize Supabase queries (select specific fields, use filters)
- Background jobs for heavy operations (AI training, reports)

## Testing Standards

### Backend Tests
```javascript
// Unit test example
describe('ResourceController', () => {
  let controller;
  
  beforeEach(() => {
    controller = new ResourceController(mockSupabase);
  });
  
  it('should return all resources for user', async () => {
    const req = { user: { id: 'user-123' }, query: {} };
    const res = mockResponse();
    
    await controller.getAll(req, res);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.any(Array)
    });
  });
});
```

### Frontend Tests
```javascript
// Component test example
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('renders component and handles interaction', async () => {
  render(<Component />);
  
  const button = screen.getByRole('button', { name: /submit/i });
  await userEvent.click(button);
  
  await waitFor(() => {
    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });
});
```

## Environment Configuration

### Backend (.env)
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# Server
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:3000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## API Design Standards

### RESTful Endpoints
```
GET    /api/v1/resource          # List all
GET    /api/v1/resource/:id      # Get one
POST   /api/v1/resource          # Create
PUT    /api/v1/resource/:id      # Update
DELETE /api/v1/resource/:id      # Delete

# Nested resources
GET    /api/v1/groups/:id/members      # List group members
POST   /api/v1/groups/:id/expenses     # Create group expense
```

### Response Format
```json
// Success
{
  "success": true,
  "data": {...},
  "message": "Optional success message",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}

// Error
{
  "success": false,
  "message": "Error description",
  "errors": ["validation error 1", "validation error 2"],
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes
- 200: Success (GET, PUT, DELETE)
- 201: Created (POST)
- 400: Bad Request (validation errors)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 409: Conflict (duplicate resource)
- 422: Unprocessable Entity (business logic error)
- 429: Too Many Requests (rate limit)
- 500: Internal Server Error

## Database Conventions

### Supabase Patterns
```javascript
// Query with RLS (as user)
const { data, error } = await supabase
  .from('transactions')
  .select('*')
  .eq('user_id', userId)
  .order('date', { ascending: false })
  .range(offset, offset + limit - 1);

// Insert
const { data, error } = await supabase
  .from('transactions')
  .insert({ ...transactionData, user_id: userId })
  .select()
  .single();

// Update
const { data, error } = await supabase
  .from('transactions')
  .update(updates)
  .eq('id', id)
  .eq('user_id', userId)
  .select()
  .single();

// Delete
const { error } = await supabase
  .from('transactions')
  .delete()
  .eq('id', id)
  .eq('user_id', userId);
```

### Table Naming
- Use snake_case for table and column names
- Plural table names: `transactions`, `categories`, `users`
- Foreign keys: `user_id`, `category_id`
- Timestamps: `created_at`, `updated_at`

## Internationalization (i18n)

### Translation Keys
```javascript
// Usage in React
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t } = useTranslation();
  
  return <h1>{t('dashboard.welcome')}</h1>;
};

// Translation files structure
// frontend/src/utils/i18n/locales/en.json
// frontend/src/utils/i18n/locales/pt.json
```

### Supported Languages
- English (en) - Default
- Portuguese (pt-BR)

## Feature-Specific Guidelines

### AI Categorization
- Use `smartCategorizationService` for ML predictions
- Train model with user feedback via `/ai/feedback`
- Cache categorization results
- Provide confidence scores
- Allow manual override

### Expense Splitting
- Use `expenseSplittingService` for calculations
- Support equal and percentage-based splits
- Track settlements and balances
- Generate invitation links for groups
- Handle currency consistently

### Financial Health
- Calculate scores based on income/expense ratio, savings rate, and budget adherence
- Update scores when transactions change
- Provide personalized insights
- Track trends over time

### Scheduled Transactions
- Use node-cron for recurring transactions
- Support frequencies: daily, weekly, biweekly, monthly, yearly
- Allow modification and deletion
- Track execution history

### Analytics
- Track key events: page views, transactions, AI usage
- Respect user consent (GDPR compliant)
- Use Vercel Analytics for frontend metrics
- Implement custom event tracking

## Git Workflow

### Commit Message Format
```
feat: add new feature
fix: fix bug in component
refactor: restructure code
docs: update documentation
test: add tests
style: formatting changes
perf: performance improvement
chore: maintenance tasks
```

### Branch Naming
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `refactor/component-name` - Code refactoring
- `docs/update-readme` - Documentation updates

## Common Patterns

### Loading States
```jsx
const [loading, setLoading] = useState(true);

if (loading) return <Spinner />;
```

### Error Boundaries
```jsx
import ErrorBoundary from './components/ui/ErrorBoundary';

<ErrorBoundary>
  <Component />
</ErrorBoundary>
```

### Protected Routes
```jsx
import { ProtectedRoute, AdminRoute, PremiumRoute } from './App';

<Route path="/transactions" element={
  <ProtectedRoute>
    <TransactionList />
  </ProtectedRoute>
} />
```

### Toast Notifications
```javascript
import { toast } from 'react-toastify';

toast.success('Operation successful');
toast.error('Operation failed');
toast.info('Information message');
toast.warning('Warning message');
```

### API Client
```javascript
import API from '../utils/api';

// GET
const response = await API.get('/transactions');

// POST
const response = await API.post('/transactions', data);

// PUT
const response = await API.put(`/transactions/${id}`, updates);

// DELETE
const response = await API.delete(`/transactions/${id}`);
```

## Dependencies Management

### Backend Key Dependencies
- express: Web framework
- @supabase/supabase-js: Database & auth client
- jsonwebtoken: JWT handling
- bcryptjs: Password hashing
- joi: Input validation
- stripe: Payment processing
- helmet: Security headers
- cors: CORS handling
- compression: Response compression
- morgan: HTTP request logger
- natural, compromise, ml-naivebayes: NLP & ML
- node-cron: Task scheduling

### Frontend Key Dependencies
- react, react-dom: UI framework
- react-router-dom: Routing
- @tanstack/react-query: Data fetching & caching
- axios: HTTP client
- react-i18next: Internationalization
- react-chartjs-2: Charts
- react-toastify: Notifications
- date-fns, moment: Date manipulation
- lucide-react: Icons
- react-window: Virtualization

## Deployment

### Backend Deployment
- Deploy to AWS EC2 or similar Node.js hosting
- Set environment variables in hosting dashboard
- Run migrations before deploying
- Use PM2 or similar for process management
- Enable SSL/HTTPS in production
- Configure CORS for production domain

### Frontend Deployment
- Build: `npm run build` (outputs to `dist/`)
- Deploy to Vercel, Netlify, or AWS Amplify
- Configure production API URL
- Enable analytics and speed insights
- Set up custom domain

## Troubleshooting

### Common Issues
1. **CORS errors**: Check `CLIENT_URL` in backend .env
2. **Auth failures**: Verify Supabase keys and JWT configuration
3. **Database errors**: Check RLS policies and user permissions
4. **Stripe webhooks**: Verify webhook secret and endpoint
5. **AI categorization**: Ensure model is trained with sufficient data

### Debugging
- Backend: Check logs via Winston logger
- Frontend: Use React DevTools and browser console
- Network: Monitor API calls in browser Network tab
- Database: Use Supabase dashboard for query debugging

## Key Features Summary

1. **AI-Powered Categorization**: Automatic transaction categorization using ML
2. **Expense Splitting**: Collaborative group expense management
3. **Financial Health**: Personalized financial insights and scores
4. **Budgets**: Monthly budgets with alerts and tracking
5. **Savings Goals**: Goal setting and progress tracking
6. **Cash Flow Calendar**: Visual cash flow planning (Premium)
7. **Analytics Dashboard**: Comprehensive financial analytics
8. **Recurring Transactions**: Automated scheduled transactions
9. **Multi-language**: Full English and Portuguese support
10. **Admin Dashboard**: Platform analytics and user management

## Development Commands

### Backend
```bash
npm start              # Start server
npm run dev            # Start with nodemon
npm test               # Run tests
```

### Frontend
```bash
npm start              # Start dev server (Vite)
npm run build          # Production build
npm run preview        # Preview production build
npm test               # Run tests
npm run lint           # Run ESLint
```

## Best Practices Checklist

- [ ] Follow MVC architecture strictly
- [ ] Validate all user inputs
- [ ] Implement proper error handling
- [ ] Use TypeScript for new features (future consideration)
- [ ] Write tests for new functionality
- [ ] Document complex business logic
- [ ] Optimize for performance
- [ ] Ensure accessibility (a11y)
- [ ] Implement proper logging
- [ ] Handle edge cases
- [ ] Keep dependencies updated
- [ ] Follow security best practices
- [ ] Maintain code consistency
- [ ] Review before committing

---

**Remember**: This is a production application with real users. Prioritize security, performance, and user experience in all changes.







