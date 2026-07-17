module.exports = {
  initializeApp: jest.fn(() => ({})),
  cert: jest.fn(() => ({})),
  getAuth: jest.fn(() => ({
    verifyIdToken: jest.fn().mockResolvedValue({ phone_number: '+919999999999' })
  }))
};
