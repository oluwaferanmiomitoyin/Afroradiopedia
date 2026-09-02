const authConfig = {
  providers: [
    {
      type: "customJwt",
      applicationID: "afroradiopedia",
      issuer: "https://afroradiopedia.app",
      // Public key only — safe to commit. Matches the private key signing
      // tokens in src/lib/convexToken.ts (CONVEX_JWT_PRIVATE_KEY, server-only).
      jwks: "data:text/plain;charset=utf-8;base64,eyJrZXlzIjpbeyJrdHkiOiJSU0EiLCJuIjoidEFSM3M0SWQzOUJWejhVUnd2VG53d2lmOG9laEp2d0FnakNVdEpmbFgyZWlmc3QyZUNYOG13b2ZIU3BoeFdUYVI2WFoxcGRqRXlsUkpISkxERURrM2I2c092am1rdjRCaFVMUldjQS1KbnJrRzRfb3lkVld2TnhqcHlPbW9fVlNvaW9vdFIyX3c4eGlRRWZoXy1LYmFvT3FrRFF2UFBGRHVJMFVnOGNnWmZUUnNYZnZoU2kzRFpSYWhkWVp6RWRBdVFmQWMxUjk1Z29GeVNaa2NudkJERlpmeEVmU1p2cHM5WGN4NDhtUVBZSDU3c210QVcyRU5CZHRGbFZSZGk0TkFveHg4YWlzLURSb3c0ZkROTzEwSGNkbkhDRWVSZG40S2MySDBmdXhVZlFiYkJGSnE4aEFVYUllOUQ5LUhEOC15SW8tR2ZWRnNnWDZGYUxXcHFtdWd3IiwiZSI6IkFRQUIiLCJhbGciOiJSUzI1NiIsInVzZSI6InNpZyIsImtpZCI6ImNvbnZleC0xIn1dfQ==",
      algorithm: "RS256",
    },
  ],
};

export default authConfig;
