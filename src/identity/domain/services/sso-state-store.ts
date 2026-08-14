export interface SsoStateStore {
  save(state: string): Promise<void>;

  consume(state: string): Promise<boolean>;
}

export const SSO_STATE_STORE = Symbol(
  'SSO_STATE_STORE',
);
