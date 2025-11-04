import '@testing-library/jest-dom'

// Extend expect with jest-dom matchers
import { expect } from '@jest/globals'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock Next.js server components
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, options) => ({
      json: async () => data,
      status: options?.status || 200,
      headers: options?.headers || {},
    }),
  },
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Suppress console errors in tests unless explicitly needed
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Mock Clerk server API to avoid ESM issues in tests
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(async () => ({
    userId: 'test-user',
    getToken: jest.fn(async () => 'test-token'),
  })),
}))

// Mock Supabase JS client to avoid importing ESM-only code
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(function () { return this }),
    select: jest.fn(function () { return this }),
    eq: jest.fn(function () { return this }),
    single: jest.fn(),
  })),
}))

// Provide a lightweight mock for faker to avoid ESM import issues where not locally mocked
jest.mock('@faker-js/faker', () => ({
  faker: {
    person: {
      firstName: jest.fn(() => 'Jane'),
      lastName: jest.fn(() => 'Doe'),
      fullName: jest.fn(() => 'Jane Doe'),
    },
    number: {
      int: jest.fn(() => 42),
      float: jest.fn(() => 123.45),
    },
    internet: {
      userName: jest.fn(() => 'janedoe'),
      email: jest.fn(() => 'jane@example.com'),
    },
    lorem: {
      word: jest.fn(() => 'lorem'),
      sentence: jest.fn(() => 'Lorem ipsum dolor sit amet.'),
    },
    company: { name: jest.fn(() => 'Acme Corp') },
    location: {
      streetAddress: jest.fn(() => '123 Main St'),
      city: jest.fn(() => 'New York'),
    },
    phone: { number: jest.fn(() => '+1234567890') },
    string: { uuid: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000') },
    commerce: { price: jest.fn(() => 99.99) },
    datatype: { boolean: jest.fn(() => true), number: jest.fn(() => 42) },
    date: { past: jest.fn(() => new Date('2023-01-01')) },
  },
}))

// Mock OpenAI client to avoid requiring real API key
jest.mock('openai', () => ({
  __esModule: true,
  default: class OpenAI {
    constructor() {}
  },
}))

// Mock header title context provider to avoid wrapping in tests
jest.mock('@/components/Dashboard/header-title-context', () => ({
  HeaderTitleProvider: ({ children }) => children,
  useHeaderTitle: () => ({ setTitle: jest.fn(), setTitleOverride: jest.fn() }),
}))
