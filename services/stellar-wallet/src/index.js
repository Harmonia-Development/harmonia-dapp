const express = require('express');
const kycRoutes = require('./routes/kyc');
const kycVerifyRoutes = require('./routes/kyc-verify');
const kycStatusRoutes = require('./routes/kyc-status');

const app = express();
app.use(express.json());

app.use('/kyc', kycRoutes);
app.use('/kyc/verify', kycVerifyRoutes);
app.use('/kyc/status', kycStatusRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
