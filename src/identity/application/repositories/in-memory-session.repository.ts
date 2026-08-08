import { Session } from '../../domain/entities/session.entity';
import { SessionRepository } from '../../domain/repositories/session.repository';

export class InMemorySessionRepository implements SessionRepository {
  private readonly sessions: Session[] = [];

  async findById(id: string): Promise<Session | null> {
    return this.sessions.find((session) => session.getId() === id) ?? null;
  }

  async save(session: Session): Promise<void> {
    const index = this.sessions.findIndex(
      (item) => item.getId() === session.getId(),
    );

    if (index >= 0) {
      this.sessions[index] = session;
      return;
    }

    this.sessions.push(session);
  }
}
