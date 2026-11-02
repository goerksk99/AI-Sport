import { AppData } from "../domain/types";
import { emptyData } from "../domain/training";
import { parseData } from "./validation";
export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
export interface FitnessRepository {
  load(): Promise<AppData>;
  save(data: AppData): Promise<void>;
}
export const STORAGE_KEY = "puls:data:v1";
export function createRepository(storage: KeyValueStorage): FitnessRepository {
  let queue = Promise.resolve();
  return {
    async load() {
      const raw = await storage.getItem(STORAGE_KEY);
      if (!raw) return emptyData();
      return parseData(raw);
    },
    save(data) {
      const json = JSON.stringify(data);
      queue = queue
        .catch(() => {})
        .then(() => storage.setItem(STORAGE_KEY, json));
      return queue;
    },
  };
}
