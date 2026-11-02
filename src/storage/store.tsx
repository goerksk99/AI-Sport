import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppData } from "../domain/types";
import { emptyData } from "../domain/training";
import { createRepository } from "./repository";
const repository = createRepository(AsyncStorage);
type Store = {
  data: AppData;
  ready: boolean;
  error: string | null;
  saving: boolean;
  update: (fn: (d: AppData) => AppData) => void;
  retry: () => void;
};
const Context = createContext<Store>(null!);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData);
  const current = useRef(data);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const revision = useRef(0);
  const load = () => {
    setError(null);
    repository
      .load()
      .then((d) => {
        current.current = d;
        setData(d);
        setReady(true);
      })
      .catch((e) => setError(String(e.message)));
  };
  useEffect(load, []);
  const persist = (next: AppData) => {
    const id = ++revision.current;
    setSaving(true);
    repository
      .save(next)
      .then(() => {
        if (id === revision.current) {
          setError(null);
          setSaving(false);
        }
      })
      .catch(() => {
        setError(
          "Speichern fehlgeschlagen. Lass die App offen und versuche es erneut.",
        );
        setSaving(false);
      });
  };
  const update = (fn: (d: AppData) => AppData) => {
    const next = fn(current.current);
    current.current = next;
    setData(next);
    persist(next);
  };
  return (
    <Context.Provider
      value={{
        data,
        ready,
        error,
        saving,
        update,
        retry: () => (ready ? persist(current.current) : load()),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useStore = () => useContext(Context);
