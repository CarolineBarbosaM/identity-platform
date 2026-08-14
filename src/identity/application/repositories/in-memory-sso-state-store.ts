import type { SsoStateStore } from '../../domain/services/sso-state-store';

export class InMemorySsoStateStore implements SsoStateStore {
  private readonly states = new Set<string>();

  async save(state: string): Promise<void> {
    this.states.add(state);
  }

  async consume(state: string): Promise<boolean> {
    if (!this.states.has(state)) {
      return false;
    }

    this.states.delete(state);

    return true;
  }
}
