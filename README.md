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
│   ├── app/                     # Next.js App Router
│   │   ├── (dashboard)/         # Dashboard routes (protected)
│   │   ├── (index)/             # Public landing page
│   │   ├── api/                 # API routes
│   │   ├── community/           # Community features
│   │   ├── sign-in/             # Authentication pages
│   │   └── sign-up/
│   ├── components/              # React components
│   │   ├── ui/                  # Reusable UI components
│   │   ├── Dashboard/           # Dashboard-specific components
│   │   ├── Registration/        # Auth components
│   │   └── __tests__/           # Component tests
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utility functions
│   │   ├── data-generator.ts    # Data generation logic
│   │   ├── faker.ts             # Faker.js integration
│   │   ├── openai.ts            # OpenAI integration
│   │   ├── schema-builder.ts    # Schema building utilities
│   │   └── __tests__/           # Library tests
│   ├── supabase/                # Supabase client configuration
│   │   ├── client.ts            # Client-side Supabase
│   │   └── server.ts            # Server-side Supabase
│   └── types/                   # TypeScript type definitions
│       ├── database.types.ts    # Database types
│       └── schema.types.ts      # Schema types
├── public/                      # Static assets
├── coverage/                    # Test coverage reports
└── [config files]               # Configuration files
```

## 🧪 Testing

The project includes comprehensive test coverage using Jest and React Testing Library.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode
npm run test:ci
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

- **Framework**: [Next.js 15](https://nextjs.org/) - React framework with App Router
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- **UI Components**: [ShadCN](https://ui.shadcn.com/) - Accessible component primitives

### Backend & Database

- **Database**: [Supabase Cloud](https://supabase.com/) - PostgreSQL with real-time capabilities
- **Authentication**: [Clerk](https://clerk.com/) - Secure user authentication
- **AI**: [OpenAI API](https://openai.com/) - AI-powered schema generation

### Development Tools

- **Testing**: Comprehensive test coverage with Jest and React Testing Library
- **Linting**: [ESLint](https://eslint.org/) - Code quality and consistency
- **Data Generation**: [Faker.js](https://fakerjs.dev/) - Realistic mock data
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

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/ivan-deangelis/synthetix).
