import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock window object
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(), // deprecated
		removeListener: vi.fn(), // deprecated
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
})

// Mock wallet APIs
Object.defineProperty(window, 'freighterApi', {
	writable: true,
	value: {
		isConnected: vi.fn().mockResolvedValue(true),
		getPublicKey: vi
			.fn()
			.mockResolvedValue('GBVLKFOEIK6A3CUOOH554ETKFTWHDF7TSPJAL4NU7PIB3NOQCEPTSXHO'),
		signTransaction: vi.fn().mockResolvedValue('signed-xdr'),
	},
})

Object.defineProperty(window, 'xBull', {
	writable: true,
	value: {},
})

Object.defineProperty(window, 'lobstr', {
	writable: true,
	value: {},
})

Object.defineProperty(window, 'Albedo', {
	writable: true,
	value: {},
})

Object.defineProperty(window, 'rabet', {
	writable: true,
	value: {},
})
