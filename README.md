# Synthetix - AI-Powered API Creation Platform

A modern platform for creating, managing, and deploying REST APIs with AI-powered schema generation and real-time data processing capabilities.

---

## 🚀 Quick Start

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for comprehensive instructions.

---

## 🌟 Features

### Core Functionality

- 🤖 Context-Aware Data Generation
  Uses OpenAI to generate realistic, domain-specific datasets that match the user’s context (e.g., medical, educational, sports, ecommerce).
- 🧩 Visual No-Code Schema Builder
  Users define API structures through an intuitive interface — no backend knowledge required.
- ⚡ Instant API Deployment
  Every schema instantly becomes a fully functional RESTful API endpoint without writing any code.
- 📝 Mixed Data Strategy (AI + Deterministic)
  Combines AI-generated data with Faker.js fields for structure, consistency, and realism.

### Technical Highlights

- **Type-Safe**: Full TypeScript implementation for enhanced code quality
- **Testing**: Comprehensive test coverage with Jest and React Testing Library
- **Scalable**: Built on Next.js 15 with App Router for optimal performance
- **Cloud-Native**: Powered by Supabase Cloud (PostgreSQL with real-time capabilities)

## 🏗️ Project Structure

```
synthetix/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (marketing)/           # Public landing page
│   │   ├── api/                   # API routes
│   │   │   └── v1/               # API v1 endpoints
│   │   ├── auth/                  # Auth callback handlers
│   │   │   └── callback/         # Supabase auth callback
│   │   ├── dashboard/             # Dashboard routes (protected)
│   │   │   ├── api/              # API detail page
│   │   │   └── new/              # Create new API
│   │   ├── login/                 # Login page
│   │   ├── signup/                # Signup page
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── actions/                   # Server actions
│   │   ├── ai.ts                 # AI-related actions
│   │   ├── generateData.ts       # Data generation
│   │   ├── generateDataAction.ts # Data generation action
│   │   ├── generateHybridData.ts # Hybrid AI+Faker generation
│   │   └── __tests__/            # Action tests
│   ├── components/                # React components
│   │   ├── ui/                   # Shadcn UI components
│   │   ├── dashboard/            # Dashboard-specific components
│   │   ├── schema/               # Schema builder components
│   │   ├── marketing/            # Marketing page components
│   │   └── __tests__/            # Component tests
│   ├── constants/                 # Constants
│   │   └── fakerTypes.ts         # Faker type definitions
│   ├── hooks/                     # Custom React hooks
│   │   ├── use-mobile.ts         # Mobile detection hook
│   │   └── use-toast.ts          # Toast notifications hook
│   ├── lib/                       # Core libraries
│   │   ├── openai.ts             # OpenAI client
│   │   ├── supabase.ts           # Supabase helpers
│   │   └── utils.ts              # Utility functions
│   ├── types/                     # TypeScript type definitions
│   │   └── schema.ts             # Schema type definitions
│   └── utils/                     # Utility modules
│       ├── supabase/             # Supabase client configuration
│       │   ├── client.ts         # Client-side Supabase
│       │   ├── server.ts         # Server-side Supabase
│       │   ├── middleware.ts     # Middleware helper
│       │   └── admin.ts          # Admin client
│       ├── dataGeneration.ts     # Data generation utilities
│       ├── schemaValidation.ts   # Schema validation
│       └── __tests__/            # Utility tests
├── supabase/                      # Supabase configuration
│   └── schema.sql                # Database schema
├── public/                        # Static assets
└── [config files]                 # Configuration files
```

## 🧪 Testing

The project includes comprehensive test coverage using Jest and React Testing Library.

### Running Tests

```bash
# Run all tests
npm test
```

### Test Coverage

The project maintains high test coverage standards:

- ✅ Component tests for UI components
- ✅ API route tests
- ✅ Utility function tests
- ✅ Integration tests

Coverage goals: 70%+ across branches, functions, lines, and statements.

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 16](https://nextjs.org/) - React framework with App Router
- **UI Library**: [React 19](https://react.dev/) - Modern React with latest features
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) - Accessible component primitives built on Radix UI
- **Animations**: [Framer Motion](https://www.framer.com/motion/) - Production-ready motion library

### Backend & Database

- **Database**: [Supabase](https://supabase.com/) - PostgreSQL with real-time capabilities, storage, and edge functions
- **Authentication**: [Supabase Auth](https://supabase.com/docs/guides/auth) - Built-in authentication with email/password
- **AI**: [OpenAI API](https://openai.com/) - AI-powered data generation and schema understanding

### Development Tools

- **Testing**: [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/react) - Comprehensive test coverage
- **Linting**: [ESLint](https://eslint.org/) - Code quality and consistency
- **Data Generation**: [Faker.js](https://fakerjs.dev/) - Realistic mock data generation
- **Containerization**: [Docker](https://www.docker.com/) - Consistent development environment

---

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete setup instructions (cloud Supabase setup, Clerk integration)
- **README.md** - This file (project overview and quick start)

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🤝 Support

For issues, questions, or contributions, please open an issue in the project repository.