import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  TicketingRepositoryState,
  TicketingStorage,
} from "../contracts/TicketingStorage";

const STORAGE_KEY = "liit-ticketing-repository-v1";

export class AsyncStorageTicketingStorage implements TicketingStorage {
  async load(): Promise<TicketingRepositoryState | null> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  async save(state: TicketingRepositoryState): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}
