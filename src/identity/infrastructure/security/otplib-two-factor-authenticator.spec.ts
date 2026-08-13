jest.mock('otplib', () => {
  const generateSecret = jest.fn();
  const verify = jest.fn();

  return {
    OTP: jest.fn().mockImplementation(() => ({
      generateSecret,
      verify,
    })),
  };
});

jest.mock('@otplib/plugin-crypto-node', () => ({
  crypto: {},
}));

jest.mock('@otplib/plugin-base32-scure', () => ({
  base32: {},
}));

import {
  OtplibTwoFactorAuthenticator,
} from './otplib-two-factor-authenticator';

describe('OtplibTwoFactorAuthenticator', () => {
  let generateSecret: jest.Mock;
  let verify: jest.Mock;

  beforeEach(() => {
    const {
      OTP,
    } = jest.requireMock('otplib') as {
      OTP: jest.Mock;
    };

    const otpInstance =
      OTP.mock.results[0]?.value;

    if (otpInstance) {
      generateSecret =
        otpInstance.generateSecret;

      verify =
        otpInstance.verify;
    }

    jest.clearAllMocks();
  });

  it('should generate a secret', async () => {
    const {
      OTP,
    } = jest.requireMock('otplib') as {
      OTP: jest.Mock;
    };

    const mockedGenerateSecret =
      jest.fn().mockResolvedValue(
        'generated-secret',
      );

    OTP.mockImplementation(() => ({
      generateSecret:
        mockedGenerateSecret,
      verify: jest.fn(),
    }));

    const authenticator =
      new OtplibTwoFactorAuthenticator();

    const result =
      await authenticator.generateSecret();

    expect(result).toBe(
      'generated-secret',
    );

    expect(
      mockedGenerateSecret,
    ).toHaveBeenCalledTimes(1);
  });

  it('should return true when the code is valid', async () => {
    const {
      OTP,
    } = jest.requireMock('otplib') as {
      OTP: jest.Mock;
    };

    const mockedVerify =
      jest.fn().mockResolvedValue({
        valid: true,
      });

    OTP.mockImplementation(() => ({
      generateSecret: jest.fn(),
      verify: mockedVerify,
    }));

    const authenticator =
      new OtplibTwoFactorAuthenticator();

    const result =
      await authenticator.verifyCode(
        'secret',
        '123456',
      );

    expect(result).toBe(true);

    expect(
      mockedVerify,
    ).toHaveBeenCalledWith({
      secret: 'secret',
      token: '123456',
    });
  });

  it('should return false when the code is invalid', async () => {
    const {
      OTP,
    } = jest.requireMock('otplib') as {
      OTP: jest.Mock;
    };

    const mockedVerify =
      jest.fn().mockResolvedValue({
        valid: false,
      });

    OTP.mockImplementation(() => ({
      generateSecret: jest.fn(),
      verify: mockedVerify,
    }));

    const authenticator =
      new OtplibTwoFactorAuthenticator();

    const result =
      await authenticator.verifyCode(
        'secret',
        '123456',
      );

    expect(result).toBe(false);

    expect(
      mockedVerify,
    ).toHaveBeenCalledWith({
      secret: 'secret',
      token: '123456',
    });
  });
});