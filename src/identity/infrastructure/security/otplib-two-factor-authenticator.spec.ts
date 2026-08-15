type VerifyInput = {
  secret: string;
  token: string;
};

type VerifyResult = {
  valid: boolean;
};

type OtpInstance = {
  generateSecret: () => Promise<string>;
  verify: (input: VerifyInput) => Promise<VerifyResult>;
};

const mockOTP = jest.fn<OtpInstance, []>(() => ({
  generateSecret: jest.fn<Promise<string>, []>(),
  verify: jest.fn<Promise<VerifyResult>, [VerifyInput]>(),
}));

jest.mock('otplib', () => ({
  OTP: mockOTP,
}));

jest.mock('@otplib/plugin-crypto-node', () => ({
  crypto: {},
}));

jest.mock('@otplib/plugin-base32-scure', () => ({
  base32: {},
}));

import { OtplibTwoFactorAuthenticator } from './otplib-two-factor-authenticator';

describe('OtplibTwoFactorAuthenticator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a secret', async () => {
    const mockedGenerateSecret = jest
      .fn<Promise<string>, []>()
      .mockResolvedValue('generated-secret');

    mockOTP.mockImplementation(() => ({
      generateSecret: mockedGenerateSecret,
      verify: jest.fn<Promise<VerifyResult>, [VerifyInput]>(),
    }));

    const authenticator = new OtplibTwoFactorAuthenticator();

    const result = await authenticator.generateSecret();

    expect(result).toBe('generated-secret');
    expect(mockedGenerateSecret).toHaveBeenCalledTimes(1);
  });

  it('should return true when the code is valid', async () => {
    const mockedVerify = jest
      .fn<Promise<VerifyResult>, [VerifyInput]>()
      .mockResolvedValue({
        valid: true,
      });

    mockOTP.mockImplementation(() => ({
      generateSecret: jest.fn<Promise<string>, []>(),
      verify: mockedVerify,
    }));

    const authenticator = new OtplibTwoFactorAuthenticator();

    const result = await authenticator.verifyCode('secret', '123456');

    expect(result).toBe(true);

    expect(mockedVerify).toHaveBeenCalledWith({
      secret: 'secret',
      token: '123456',
    });
  });

  it('should return false when the code is invalid', async () => {
    const mockedVerify = jest
      .fn<Promise<VerifyResult>, [VerifyInput]>()
      .mockResolvedValue({
        valid: false,
      });

    mockOTP.mockImplementation(() => ({
      generateSecret: jest.fn<Promise<string>, []>(),
      verify: mockedVerify,
    }));

    const authenticator = new OtplibTwoFactorAuthenticator();

    const result = await authenticator.verifyCode('secret', '123456');

    expect(result).toBe(false);

    expect(mockedVerify).toHaveBeenCalledWith({
      secret: 'secret',
      token: '123456',
    });
  });
});
