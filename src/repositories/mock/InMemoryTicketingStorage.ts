import {
  TicketingRepositoryState,
  TicketingStorage,
} from "../contracts/TicketingStorage";

export class InMemoryTicketingStorage implements TicketingStorage {
  private state: TicketingRepositoryState | null = null;

  async load(): Promise<TicketingRepositoryState | null> {
    return this.state ? structuredClone(this.state) : null;
  }

  async save(state: TicketingRepositoryState): Promise<void> {
    this.state = structuredClone(state);
  }

  async clear(): Promise<void> {
    this.state = null;
  }
}
