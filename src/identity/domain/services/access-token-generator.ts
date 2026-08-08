export const ACCESS_TOKEN_GENERATOR = Symbol('ACCESS_TOKEN_GENERATOR');

export interface AccessTokenGenerator {
  generate(input: { userId: string }): Promise<string>;
}
