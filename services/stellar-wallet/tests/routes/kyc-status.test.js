const request = require('supertest');
const express = require('express');
const kycStatusRoutes = require('../../../src/routes/kyc-status');

jest.mock('../../../src/soroban/client', () => ({
  sorobanClient: {
    callKyCStatus: jest.fn(),
  },
}));

const { sorobanClient } = require('../../../src/soroban/client');

const app = express();
app.use(express.json());
app.use('/', kycStatusRoutes);

describe('GET /kyc/status/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with KYC status for valid ID', async () => {
    sorobanClient.callKyCStatus.mockResolvedValue('approved');

    const response = await request(app).get('/kyc/status/kyc123');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      kyc_id: 'kyc123',
      status: 'approved',
    });
    expect(sorobanClient.callKyCStatus).toHaveBeenCalledTimes(1);
    expect(sorobanClient.callKyCStatus).toHaveBeenCalledWith(
      expect.any(String),
      'kyc123'
    );
  });

  it('should return 400 for empty ID', async () => {
    const response = await request(app).get('/kyc/status/');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid KYC ID');
  });

  it('should return 400 for non-string ID', async () => {
    const response = await request(app).get('/kyc/status/123');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid KYC ID');
  });

  it('should return 404 when KYC record is not found', async () => {
    sorobanClient.callKyCStatus.mockRejectedValue(
      new Error('KYC record not found')
    );

    const response = await request(app).get('/kyc/status/nonexistent');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('KYC record not found');
  });

  it('should return 500 on contract call failure', async () => {
    sorobanClient.callKyCStatus.mockRejectedValue(
      new Error('Contract call failed')
    );

    const response = await request(app).get('/kyc/status/kyc456');

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Failed to query KYC status');
  });
});
