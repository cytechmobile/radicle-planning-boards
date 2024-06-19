import '@testing-library/jest-dom'

vi.stubGlobal('parent', {
  postMessage: vi.fn(),
})
