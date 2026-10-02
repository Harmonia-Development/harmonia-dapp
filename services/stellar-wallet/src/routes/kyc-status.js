const express = require('express');
const router = express.Router();
const { sorobanClient } = require('../soroban/client');
const KYC_CONTRACT_ID = process.env.KYC_CONTRACT_ID;

router.get('/kyc/status/:id', async (req, res) => {
  const { id } = req.params;

  if (!id || typeof id !== 'string' || id.trim() === '') {
    return res.status(400).json({ error: 'Invalid KYC ID' });
  }

  try {
    const result = await sorobanClient.callKyCStatus(KYC_CONTRACT_ID, id);
    return res.status(200).json({ kyc_id: id, status: result });
  } catch (error) {
    if (error.message.includes('not found') || error.code === 'NOT_FOUND') {
      return res.status(404).json({ error: 'KYC record not found' });
    }
    return res.status(500).json({ error: 'Failed to query KYC status' });
  }
});

module.exports = router;
