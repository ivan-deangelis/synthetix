# Synthetix - AI-Powered API Creation Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.4-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-61dafb?logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, professional-grade platform for creating, managing, and deploying REST APIs with AI-powered schema generation and real-time data processing capabilities.

## 🌟 Features

### Core Functionality

-   **🤖 AI-Powered Schema Generation**: Leverage OpenAI to automatically generate API schemas from natural language descriptions
-   **🔄 Real-time Data Processing**: Background processing system for generating large datasets efficiently
-   **📝 Smart Data Generation**: Integrated Faker.js for realistic mock data generation
-   **🔐 Secure Authentication**: Built-in user authentication and authorization with Clerk
-   **📡 RESTful API Endpoints**: Automatically generated REST API endpoints for all created schemas
-   **🎨 Modern UI/UX**: Beautiful, responsive interface built with ShadCN and Tailwind CSS

### Technical Highlights

-   **Type-Safe**: Full TypeScript implementation for enhanced code quality
-   **Testing**: Comprehensive test coverage with Jest and React Testing Library
-   **Scalable**: Built on Next.js 15 with App Router for optimal performance
-   **Database**: Powered by Supabase

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js** (v18 or higher)
-   **npm** or **yarn**
-   **Supabase (cloud/local)** (for database)
-   **Clerk API Key** (for authentication)
-   **OpenAI API key** (for AI-powered features)

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/ivan-deangelis/synthetix.git
    cd synthetix
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Set up environment variables**

    Copy the `.env.example` file to `.env.local` and fill in your credentials:

    ```bash
    cp .env.example .env.local
    ```

4. **Run database migrations**

    ```bash
    npx supabase db push
    ```

5. **Start the development server**

    ```bash
    npm run dev
    ```

6. **Open your browser**

    Navigate to [http://localhost:3000](http://localhost:3000)

## 🐳 Docker Setup

To run the application with using Cloud Supabase:

    ```bash
    docker-compose up -d
    ```
    The app will be available at http://localhost:3000

To run Supabase locally (optional, for development/testing):

    ```bash
    docker-compose -f docker-compose.supabase.yml up -d
    ```

    - Database: localhost:54322
    - API: http://localhost:54321
    - Auth: http://localhost:9999
    - Studio: http://localhost:54323

## 📖 Usage

### Creating Your First API

1. **Sign up/Login** - Create an account or sign in to your existing account
2. **Dashboard** - Navigate to your dashboard to see all your API projects
3. **Create New API** - Click "Create New API" and provide:
    - API name
    - Description
4. **Design Schema** - Use the visual schema builder to:
    - Add fields to your API
    - Configure data types
    - Set validation rules
    - Or use AI to generate schema from description
5. **Generate Data** - Create sample data using the built-in data generator
6. **Deploy** - Your API is automatically available at the generated endpoint

### API Endpoints

All created APIs are accessible via:

```
https://your-domain.com/api/v1/[api-id]
```

Supported operations:

-   `GET /api/v1/[api-id]` - Fetch a single record
-   `GET /api/v1/[api-id]?count=5` - Fetch multiple records

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (dashboard)/         # Dashboard routes (protected)
│   │   ├── (index)/             # Public landing page
│   │   ├── api/                 # API routes
│   │   ├── community/           # Community features
│   │   ├── sign-in/             # Authentication pages
│   │   └── sign-up/
│   ├── components/               # React components
│   │   ├── ui/                  # Reusable UI components
│   │   ├── Dashboard/           # Dashboard-specific components
│   │   ├── Registration/        # Auth components
│   │   └── __tests__/           # Component tests
│   ├── hooks/                    # Custom React hooks
│   │   └── __tests__/           # Hook tests
│   ├── lib/                      # Utility functions
│   │   ├── data-generator.ts    # Data generation logic
│   │   ├── faker.ts             # Faker.js integration
│   │   ├── openai.ts            # OpenAI integration
│   │   ├── schema-builder.ts    # Schema building utilities
│   │   └── __tests__/           # Library tests
│   ├── supabase/                 # Supabase client configuration
│   │   ├── client.ts            # Client-side Supabase
│   │   └── server.ts            # Server-side Supabase
│   └── types/                    # TypeScript type definitions
│       ├── database.types.ts    # Database types
│       └── schema.types.ts      # Schema types
├── supabase/                     # Supabase configuration
│   ├── migrations/              # Database migrations
│   └── schemas/                 # SQL schema definitions
├── public/                       # Static assets
├── coverage/                     # Test coverage reports
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

-   ✅ Component tests for all UI components
-   ✅ Hook tests for custom React hooks
-   ✅ API route tests
-   ✅ Utility function tests
-   ✅ Integration tests

Coverage goals: 70%+ across branches, functions, lines, and statements.

## 🛠️ Tech Stack

### Frontend

-   **Framework**: [Next.js 15](https://nextjs.org/) - React framework with App Router
-   **Language**: [TypeScript 5](https://www.typescriptlang.org/) - Type-safe JavaScript
-   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
-   **UI Components**: [ShadCN](https://ui.shadcn.com/) - Accessible component primitives

### Backend & Database

-   **Database**: [Supabase](https://supabase.com/) - PostgreSQL with real-time capabilities
-   **Authentication**: [Clerk](https://clerk.com/) - Secure user authentication
-   **AI**: [OpenAI API](https://openai.com/) - AI-powered schema generation

### Development Tools

-   **Testing**: [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/)
-   **Linting**: [ESLint](https://eslint.org/) - Code quality and consistency
-   **Data Generation**: [Faker.js](https://fakerjs.dev/) - Realistic mock data

## 📚 Available Scripts

| Command                 | Description                             |
| ----------------------- | --------------------------------------- |
| `npm run dev`           | Start development server with Turbopack |
| `npm run build`         | Build for production                    |
| `npm run start`         | Start production server                 |
| `npm run lint`          | Run ESLint                              |
| `npm test`              | Run all tests                           |
| `npm run test:watch`    | Run tests in watch mode                 |
| `npm run test:coverage` | Generate test coverage report           |
| `npm run test:ci`       | Run tests in CI mode                    |

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ivan De Angelis**
