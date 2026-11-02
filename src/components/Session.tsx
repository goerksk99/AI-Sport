import React, { useState, useEffect, useCallback } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useStore } from "../storage/store";
import { WorkoutSession, DocumentationMode } from "../domain/types";
import {
  completeSession,
  record,
  resolveOpen,
  resolveExercise,
  exerciseSummary,
} from "../domain/training";
import { effortHint } from "../domain/preferences";
import { ExerciseCard } from "./ExerciseCard";
import { Heading } from "../screens/Heading";
import { Button, Card, Chip, Field, Label, T, C, styles as s } from "./ui";
export function Session() {
  const { data, update } = useStore();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const session = id ? data.sessions.find((x) => x.id === id) : data.draft;
  const [changes, setChanges] = useState(
    !!id || !!session?.exercises.some((e) => e.editDraft),
  );
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [validity, setValidity] = useState<Record<string, boolean>>({});
  const onValidity = useCallback(
    (id: string, valid: boolean) =>
      setValidity((old) => (old[id] === valid ? old : { ...old, [id]: valid })),
    [],
  );
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  if (!session)
    return (
      <>
        <Heading
          eyebrow="TRAINING"
          title="Bereit, wenn du es bist."
          description="Es läuft gerade kein Training."
        />
        <Button
          label="Zum Trainingsplan"
          onPress={() => router.push("/training")}
        />
      </>
    );
  const sid = session.id;
  const mode = session.documentationMode || "quick";
  const metrics = record(session);
  const pending = session.exercises
    .flatMap((e) => e.sets)
    .filter((s) => s.status === "pending").length;
  const invalid =
    Object.values(validity).some((x) => !x) ||
    session?.exercises.some((e) => !!e.editDraft);
  const remaining = session.restEndsAt
    ? Math.max(0, Math.ceil((Date.parse(session.restEndsAt) - now) / 1000))
    : 0;
  const mutate = (fn: (s: WorkoutSession) => WorkoutSession, actual = false) =>
    update((d) => {
      const change = (s: WorkoutSession) => ({
        ...fn(s),
        updatedAt: new Date().toISOString(),
        performanceUpdatedAt: actual
          ? new Date().toISOString()
          : s.performanceUpdatedAt || s.updatedAt,
      });
      return d.draft?.id === sid
        ? { ...d, draft: change(d.draft) }
        : {
            ...d,
            sessions: d.sessions.map((s) => (s.id === sid ? change(s) : s)),
          };
    });
  function finish(status?: "confirmed" | "assumed") {
    try {
      update((d) => {
        const current =
          d.draft?.id === sid ? d.draft : d.sessions.find((s) => s.id === sid)!;
        return completeSession(
          d,
          status ? resolveOpen(current, status) : current,
        );
      });
      router.dismissTo("/progress");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const chooseMode = (mode: DocumentationMode) => {
    mutate((s) => ({ ...s, documentationMode: mode }));
    setChanges(mode !== "simple");
  };
  return (
    <>
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Label>
            {session.status === "completed"
              ? "GESPEICHERTE EINHEIT"
              : "DEIN TRAINING"}
          </Label>
          <T style={s.h2}>{session.name}</T>
        </View>
        <Button
          label="Zurück"
          secondary
          small
          onPress={() => router.push("/")}
        />
      </View>
      <Card style={{ backgroundColor: "#253321" }}>
        <T style={s.h2}>
          {session.status === "completed"
            ? "Dein Training, wie es wirklich war."
            : "Handy weg. Zeit für dich."}
        </T>
        <T muted>
          {session.status === "completed"
            ? "Du kannst einzelne Übungen und Sätze nachträglich korrigieren."
            : "Trainiere nach deinem Plan. Danach reicht eine Aktion – Details sind freiwillig."}
        </T>
        <T muted style={{ fontSize: 12 }}>
          {effortHint(data.profile?.trainingStyle)}
        </T>
        <T style={{ color: C.accent, fontSize: 12 }}>
          {metrics.sets} bestätigte Sätze · {metrics.assumedSets} angenommen ·{" "}
          {metrics.durationMinutes === null
            ? "Dauer nicht erfasst"
            : metrics.durationMinutes + " Min. inkl. Unterbrechungen"}
        </T>
      </Card>
      {session.status === "draft" && (
        <View style={{ gap: 12 }}>
          <Button
            label="Alles wie vorgeschlagen geschafft"
            icon="check-circle"
            disabled={invalid}
            onPress={() => finish("confirmed")}
          />
          <Button
            label={changes ? "Übersicht anzeigen" : "Etwas war anders"}
            secondary
            icon="edit-2"
            onPress={() => {
              if (mode === "detailed" && changes) chooseMode("simple");
              else setChanges(!changes);
            }}
          />
          <Button
            label="Nur Training als absolviert speichern"
            secondary
            disabled={invalid}
            onPress={() => finish("assumed")}
          />
          <T muted style={{ fontSize: 12 }}>
            „Alles geschafft“ bestätigt die offenen Leistungswerte. „Nur
            Training“ zählt die Einheit; offene Einzelwerte bleiben nach Plan
            angenommen und zählen nicht für Rekorde oder bestätigtes Volumen.
            Bereits erfasste Abweichungen bleiben erhalten.
          </T>
        </View>
      )}
      <View style={s.wrap}>
        {(
          [
            { v: "simple", l: "Einfach" },
            { v: "quick", l: "Nur Abweichungen" },
            { v: "detailed", l: "Detailliert" },
          ] as const
        ).map((x) => (
          <Chip
            key={x.v}
            label={x.l}
            selected={mode === x.v}
            onPress={() => chooseMode(x.v)}
          />
        ))}
      </View>
      {!!remaining && (
        <Card>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Label>PAUSE</Label>
              <T style={s.h2}>
                {Math.floor(remaining / 60)}:
                {String(remaining % 60).padStart(2, "0")}
              </T>
            </View>
            <Button
              label="Pause beenden"
              secondary
              small
              onPress={() => mutate((s) => ({ ...s, restEndsAt: undefined }))}
            />
          </View>
        </Card>
      )}
      {changes || mode === "detailed" || session.status === "completed" ? (
        session.exercises.map((ep) => (
          <ExerciseCard
            key={ep.id}
            performance={ep}
            detailed={mode === "detailed"}
            onValidity={onValidity}
            onReplace={(e) =>
              mutate(
                (s) => ({
                  ...s,
                  exercises: s.exercises.map((x) => (x.id === e.id ? e : x)),
                }),
                !e.editDraft &&
                  JSON.stringify(e.sets) !== JSON.stringify(ep.sets),
              )
            }
            onStatus={(status) =>
              mutate((s) => resolveExercise(s, ep.id, status), true)
            }
            onSet={(setId, p) =>
              mutate(
                (s) => ({
                  ...s,
                  exercises: s.exercises.map((e) =>
                    e.id === ep.id
                      ? {
                          ...e,
                          sets: e.sets.map((x) =>
                            x.id === setId ? { ...x, ...p } : x,
                          ),
                        }
                      : e,
                  ),
                }),
                true,
              )
            }
            onPause={() =>
              mutate((s) => ({
                ...s,
                restEndsAt: new Date(
                  Date.now() + ep.restSeconds * 1000,
                ).toISOString(),
              }))
            }
          />
        ))
      ) : (
        <View style={{ gap: 12 }}>
          {session.exercises.map((e) => (
            <Card key={e.id} style={{ padding: 17 }}>
              <T style={{ fontWeight: "700" }}>
                {requireExerciseName(e.exerciseId)}
              </T>
              <T muted>{exerciseSummary(e)}</T>
            </Card>
          ))}
        </View>
      )}
      {changes && session.durationUnknown && (
        <Field
          label="Trainingsdauer in Minuten (optional)"
          value={session.enteredDurationMinutes?.toString() || ""}
          numeric
          onChange={(v) => {
            const n = Number(v);
            if (!v)
              mutate((s) => ({ ...s, enteredDurationMinutes: undefined }));
            else if (Number.isInteger(n) && n > 0 && n <= 1440)
              mutate((s) => ({ ...s, enteredDurationMinutes: n }));
          }}
        />
      )}
      <Card>
        <Label>ZUSAMMENFASSUNG</Label>
        <T>
          {metrics.sets} bestätigte Sätze ·{" "}
          {metrics.volume.toLocaleString("de-DE")} kg bestätigtes Volumen
        </T>
        <T muted style={{ fontSize: 12 }}>
          Nur bestätigte externe Last × Wiederholungen. Körpergewicht,
          Haltezeiten und angenommene Werte sind ausgenommen.
        </T>
        {metrics.assumedSets > 0 && (
          <T muted>
            {metrics.assumedSets} Sätze nach Plan angenommen – keine bestätigte
            Leistung.
          </T>
        )}
      </Card>
      {!!error && <T style={{ color: C.red }}>{error}</T>}
      {invalid && (
        <T style={{ color: C.red }}>
          Bitte korrigiere ungültige Eingaben vor dem Abschluss.
        </T>
      )}
      {(changes || session.status === "completed") && (
        <>
          <Button
            label={
              session.status === "completed"
                ? "Korrektur abschließen"
                : "Training speichern & abschließen"
            }
            disabled={invalid}
            onPress={() => finish()}
          />
          {pending > 0 && (
            <Button
              label="Offene Übungen auslassen"
              secondary
              onPress={() => mutate((s) => resolveOpen(s, "skipped"))}
            />
          )}
        </>
      )}
      <T muted style={{ fontSize: 12 }}>
        Gültige Änderungen werden automatisch lokal gespeichert. Du kannst die
        App schließen und später fortsetzen.
      </T>
    </>
  );
}
import { exerciseById } from "../data/exercises";
const requireExerciseName = (id: string) => exerciseById(id).name;
