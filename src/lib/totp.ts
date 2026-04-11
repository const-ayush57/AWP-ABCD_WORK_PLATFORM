import { authenticator } from "otplib";

const ISSUER = "ABCD Work Platform";

export function generateTotpSecret(label: string) {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(label, ISSUER, secret);
  return { secret, otpauth, issuer: ISSUER };
}

export function verifyTotpToken(secret: string, token: string) {
  return authenticator.verify({ token, secret });
}
