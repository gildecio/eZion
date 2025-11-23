import '@testing-library/jest-dom'

// Mock window.alert
global.alert = jest.fn()

// Mock window.confirm
global.confirm = jest.fn(() => true)

// Mock fetch
global.fetch = jest.fn()

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks()
})
