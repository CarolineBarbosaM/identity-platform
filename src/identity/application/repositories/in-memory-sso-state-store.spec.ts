import { InMemorySsoStateStore } from './in-memory-sso-state-store';

describe('InMemorySsoStateStore', () => {
  it('should save and consume a state', async () => {
    const store = new InMemorySsoStateStore();

    await store.save('state-123');

    await expect(store.consume('state-123')).resolves.toBe(true);
  });

  it('should reject an unknown state', async () => {
    const store = new InMemorySsoStateStore();

    await expect(store.consume('unknown-state')).resolves.toBe(false);
  });

  it('should not allow the same state to be consumed twice', async () => {
    const store = new InMemorySsoStateStore();

    await store.save('state-123');

    await expect(store.consume('state-123')).resolves.toBe(true);

    await expect(store.consume('state-123')).resolves.toBe(false);
  });
});
