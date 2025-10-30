# Monity

**AI-powered personal finance management with collaborative expense splitting.**

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)]()
[![Status: Pre-Launch](https://img.shields.io/badge/Status-Pre--Launch-orange.svg)]()

> **🚀 Coming Soon** – Currently in final testing before public launch. Star the repo to follow our progress!

[Live App](#) • [Landing Page](#) • [Report Bug](https://github.com/yourusername/Monity/issues)

---

## What is Monity?

Monity is a full-stack personal finance tracker that combines AI-powered transaction categorization with collaborative expense management. Built with a focus on clean architecture and modern web development practices.

**Core Features:**
- **AI Categorization** – Automatic transaction categorization using machine learning with continuous model improvement
- **Expense Splitting** – Real-time collaborative expense tracking for groups (roommates, trips, shared costs)
- **Financial Health** – Personalized insights and recommendations based on spending patterns
- **Bilingual Support** – Full English and Portuguese localization (500+ translation keys)
- **Modern UI** – Responsive design with dark mode, animations, and mobile-first approach

**Current Status:** Pre-launch. App is deployed and undergoing final testing before public release.

---

## Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js with MVC architecture
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** JWT with Supabase Auth
- **AI/ML:** Custom Naive Bayes classifier with NLP preprocessing
- **Scheduled Jobs:** node-cron for automated model retraining
- **Security:** Encryption middleware, rate limiting, input validation

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **State Management:** React Context + React Query
- **Routing:** React Router v6
- **i18n:** react-i18next

### Infrastructure
- **Database & Auth:** Supabase
- **Hosting:** [To be disclosed at launch]
- **CI/CD:** [To be configured]

---

## Project Structure

```
Monity/
├── backend/
│   ├── server.js                  # Application entry point
│   ├── config/                    # Environment and database config
│   ├── models/                    # Data models (User, Transaction, Category, Group, etc.)
│   ├── controllers/               # Request handlers (auth, transactions, AI, admin, etc.)
│   ├── services/                  # Business logic (AI, financial health, expense splitting)
│   ├── routes/                    # API endpoint definitions
│   ├── middleware/                # Auth, validation, encryption, error handling
│   ├── utils/                     # Helper functions and constants
│   ├── migrations/                # Database migrations and scripts
│   └── __tests__/                 # Backend test suite
│
├── frontend/
│   ├── src/
│   │   ├── components/            # React components (organized by feature)
│   │   ├── context/               # Global state (AuthContext)
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── utils/                 # Utilities and i18n
│   │   └── App.jsx                # Main application router
│   └── package.json
│
└── docs/                          # Documentation and assets
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account (free tier works)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/Monity.git
cd Monity
```

**2. Set up Supabase**
- Create a new project at [supabase.com](https://supabase.com)
- Run the SQL migrations found in `backend/migrations/` to set up the database schema
- Copy your project URL and API keys (you'll need both `anon` and `service_role` keys)

**3. Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

**4. Configure environment variables**

Create `backend/.env`:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
PORT=3001
NODE_ENV=development
```

Create `frontend/.env`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:3001
```

**5. Start development servers**

```bash
# Terminal 1 - Backend API (port 3001)
cd backend
npm start

# Terminal 2 - Frontend dev server (port 5173)
cd frontend
npm run dev
```

Visit `http://localhost:5173` to see the app.

---

## API Documentation

The backend exposes a REST API with 50+ endpoints organized by feature. All endpoints (except auth) require JWT authentication via the `Authorization: Bearer <token>` header.

### Key Endpoints

**Authentication**
- `POST /auth/signup` – Create new account
- `POST /auth/login` – Login and receive JWT token

**AI Features**
- `POST /ai/suggest-category` – Get AI category suggestions for transaction
- `POST /ai/feedback` – Submit feedback to improve model
- `GET /ai/stats` – View AI performance metrics (admin)

**Transactions**
- `GET /transactions` – List user transactions
- `POST /transactions` – Create new transaction
- `PUT /transactions/:id` – Update transaction
- `DELETE /transactions/:id` – Delete transaction

**Groups & Expense Splitting**
- `POST /groups` – Create expense-sharing group
- `GET /groups/:id` – View group details and balances
- `POST /groups/:id/expenses` – Add shared expense
- `POST /shares/:id/settle` – Settle debt between members

**Admin Dashboard**
- `GET /admin/analytics` – Platform growth metrics
- `GET /admin/trends` – User engagement trends
- `GET /admin/ai-performance` – ML model accuracy tracking

Full API documentation: [Coming soon]

---

## Architecture

Monity follows a clean MVC (Model-View-Controller) architecture with additional service and middleware layers:

```
┌─────────────┐
│   React     │  Frontend - UI components, state management
│   Frontend  │
└──────┬──────┘
       │ REST API
┌──────▼──────┐
│   Routes    │  API endpoints
└──────┬──────┘
       │
┌──────▼──────┐
│ Controllers │  Request handling, response formatting
└──────┬──────┘
       │
┌──────▼──────┐
│  Services   │  Business logic, AI/ML, financial calculations
└──────┬──────┘
       │
┌──────▼──────┐
│   Models    │  Data access, validation
└──────┬──────┘
       │
┌──────▼──────┐
│  Supabase   │  PostgreSQL + Auth + Realtime
└─────────────┘
```

**Design Principles:**
- Separation of concerns between layers
- Controllers never directly access the database (go through models)
- Business logic lives in services, not controllers
- Middleware handles cross-cutting concerns (auth, validation, logging)

---

## Security

- **Authentication:** JWT tokens via Supabase Auth
- **Authorization:** Role-based access control (user, premium, admin)
- **Data Encryption:** Sensitive fields encrypted at rest using middleware
- **Row Level Security (RLS):** Database-level access control via Supabase
- **Rate Limiting:** API rate limits on sensitive endpoints
- **Input Validation:** Comprehensive validation middleware on all inputs
- **Password Security:** Strong password requirements with client-side strength indicators

---

## Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests  
cd frontend
npm test
```

Test coverage includes:
- Unit tests for models and services
- Integration tests for API endpoints
- Security tests for encryption and auth
- AI model performance tests

---

## Deployment

**Backend:** Node.js hosting (Render, Railway, Fly.io)
- Set environment variables in hosting dashboard
- Deploy from `backend/` directory
- Ensure `PORT` is set correctly for the platform

**Frontend:** Static site hosting (Vercel, Netlify)
- Build: `npm run build` (outputs to `frontend/dist/`)
- Deploy the `dist/` folder
- Configure environment variables for production API

---

## Roadmap

**Upcoming (Pre-Launch):**
- [ ] Final security audit
- [ ] Performance optimization
- [ ] User acceptance testing with pilot group

**Q1-Q2 2025:**
- [ ] Public launch
- [ ] User feedback integration
- [ ] Mobile responsive improvements
- [ ] Enhanced AI model with more training data

**Q3-Q4 2025:**
- [ ] React Native mobile app
- [ ] Bank integration (Plaid API)
- [ ] Advanced financial forecasting
- [ ] Additional language support (Spanish, French)

**Future:**
- [ ] Docker support for easier local development
- [ ] Advanced analytics and custom reports
- [ ] Investment tracking
- [ ] Multi-currency support

---

## Contributing

Contributions are welcome! This is an educational project and we're open to improvements.

**How to contribute:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- Code follows existing style and architecture patterns
- Tests pass (`npm test`)
- Commit messages are clear and descriptive

---

## Team

- **Leonardo Stuart** – [https://github.com/leo-stuart](#) • [https://www.linkedin.com/in/leonardo-stuart-almeida-ramalho-ab799825a](#)
- **Luca G. Lodi** – [https://github.com/LucaLodii](#) • [https://www.linkedin.com/in/luca-guimarães-lodi-752981356](#)
- **Fabio Brugnara** – [https://github.com/fabiobrug](#) • [https://www.linkedin.com/in/fabio-brugnara-b32307324](#)

---

## License

This project is proprietary software. All rights reserved - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Supabase for providing an excellent backend platform
- The open-source community for the amazing tools and libraries
- Our early testers for valuable feedback

---

**Questions or feedback?** Open an issue or reach out to the team.

*Built with modern web technologies and clean architecture principles.*

