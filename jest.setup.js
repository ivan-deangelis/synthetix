import '@testing-library/jest-dom'

global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}))

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
})

// Polyfill Request, Response, Headers for Next.js API route testing
const { Request, Response, Headers } = require('next/dist/server/web/spec-extension/adapters/headers')
global.Request = Request
global.Response = Response
global.Headers = Headers
