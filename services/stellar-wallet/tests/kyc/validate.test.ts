import { validateKycData } from '../../src/kyc/validate'

describe('validateKycData', () => {
	it('accepts valid input', () => {
		const { isValid, errors, data } = validateKycData({
			name: 'María López',
			document: 'AB12345678',
		})
		expect(isValid).toBe(true)
		expect(errors).toEqual([])
		expect(data).toEqual({ name: 'María López', document: 'AB12345678' })
	})

	it('rejects short name', () => {
		const res = validateKycData({ name: 'A', document: 'AB12345678' })
		expect(res.isValid).toBe(false)
		expect(res.errors).toEqual(expect.arrayContaining(['name must be at least 2 characters']))
	})

	it('rejects name with digits/symbols', () => {
		const res = validateKycData({ name: 'John3!', document: 'AB12345678' })
		expect(res.isValid).toBe(false)
		expect(res.errors).toEqual(
			expect.arrayContaining(['name must contain only letters and spaces']),
		)
	})

	it('rejects short document', () => {
		const res = validateKycData({ name: 'Alice', document: 'ABC123' })
		expect(res.isValid).toBe(false)
		expect(res.errors).toEqual(
			expect.arrayContaining(['document must be between 8 and 20 characters']),
		)
	})

	it('rejects long document', () => {
		const res = validateKycData({
			name: 'Alice',
			document: 'A'.repeat(21),
		})
		expect(res.isValid).toBe(false)
		expect(res.errors).toEqual(
			expect.arrayContaining(['document must be between 8 and 20 characters']),
		)
	})

	it('rejects non-alphanumeric document', () => {
		const res = validateKycData({ name: 'Alice', document: 'ABC-12345' })
		expect(res.isValid).toBe(false)
		expect(res.errors).toEqual(expect.arrayContaining(['document must be alphanumeric']))
	})
})
