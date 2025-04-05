// Mock for mongoose
global.jest = {
  fn: () => {
    const mockFn = (...args) => mockFn.mock.calls.push(args);
    mockFn.mock = {
      calls: [],
      instances: [],
      invocationCallOrder: [],
      results: []
    };
    mockFn.mockReturnThis = () => mockFn;
    mockFn.mockResolvedValue = (value) => {
      mockFn.mock.results.push({ type: 'return', value: Promise.resolve(value) });
      return mockFn;
    };
    mockFn.mockImplementation = (impl) => {
      mockFn.mock.implementations = impl;
      return mockFn;
    };
    return mockFn;
  }
}; 