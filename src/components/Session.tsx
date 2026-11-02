import React, { useEffect, useState, useCallback } from "react";
import { View, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useStore } from "../storage/store";
import { PerformedSet, WorkoutSession } from "../domain/types";
import { completeSession, record, targetRange } from "../domain/training";
import { exerciseById } from "../data/exercises";
import {
  Button,
  Card,
  Chip,
  Field,
  Icon,
  Label,
  T,
  C,
  styles as s,
} from "./ui";
import { Heading } from "./screens";
function SetEditor({
  set,
  index,
  weighted,
  unit,
  patch,
  onConfirm,
  onValidity,
}: {
  set: PerformedSet;
  index: number;
  weighted: boolean;
  unit: string;
  patch: (p: Partial<PerformedSet>) => void;
  onConfirm: () => void;
  onValidity: (id: string, valid: boolean) => void;
}) {
  const [reps, setReps] = useState(String(set.reps));
  const [weight, setWeight] = useState(set.weight?.toString() || "");
  useEffect(() => {
    setReps(String(set.reps));
    setWeight(set.weight?.toString() || "");
  }, [set.reps, set.weight]);
  const validReps =
    reps.trim() !== "" &&
    Number.isInteger(Number(reps)) &&
    Number(reps) > 0 &&
    Number(reps) <= 10000;
  const parsedWeight = Number(weight.replace(",", "."));
  const validWeight =
    !weighted ||
    weight === "" ||
    (Number.isFinite(parsedWeight) &&
      parsedWeight >= 0 &&
      parsedWeight <= 1000);
  const skipped = set.status === "skipped";
  useEffect(() => {
    onValidity(set.id, skipped || (validReps && validWeight));
    return () => onValidity(set.id, true);
  }, [set.id, skipped, validReps, validWeight, onValidity]);
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: set.status === "confirmed" ? "#526C3C" : C.line,
        borderRadius: 16,
        padding: 13,
        gap: 10,
        backgroundColor: set.status === "confirmed" ? "#23301E" : C.bg,
      }}
    >
      <View style={[s.row, { justifyContent: "space-between" }]}>
        <Label>SATZ {index + 1}</Label>
        <T
          style={{
            fontSize: 11,
            color: set.status === "confirmed" ? C.accent : C.muted,
          }}
        >
          {set.status === "confirmed"
            ? "✓ Bestätigt"
            : skipped
              ? "Ausgelassen"
              : "Vorschlag · unbestätigt"}
        </T>
      </View>
      {!skipped && (
        <>
          <View style={s.row}>
            <Field
              label={`${unit === "seconds" ? "Sekunden" : "Wiederholungen"} Satz ${index + 1}`}
              numeric
              value={reps}
              onChange={(v) => {
                setReps(v);
                const n = Number(v);
                if (v && Number.isInteger(n) && n > 0 && n <= 10000)
                  patch({ reps: n });
              }}
            />
            {weighted && (
              <Field
                label={`Gewicht kg Satz ${index + 1}`}
                numeric
                placeholder="frei wählen"
                value={weight}
                onChange={(v) => {
                  setWeight(v);
                  const n = Number(v.replace(",", "."));
                  if (v === "") patch({ weight: undefined });
                  else if (Number.isFinite(n) && n >= 0 && n <= 1000)
                    patch({ weight: n });
                }}
              />
            )}
          </View>
          {(!validReps || !validWeight) && (
            <T style={{ color: C.red, fontSize: 12 }}>
              Bitte gültige positive Wiederholungen / Sekunden und ein Gewicht
              von 0–1000 kg eingeben.
            </T>
          )}
          {weighted && !weight && (
            <T muted style={{ fontSize: 11 }}>
              Ohne Gewicht zählt der Satz, aber kein Gewichtsvolumen.
            </T>
          )}
        </>
      )}
      <View style={s.row}>
        {set.status !== "confirmed" && !skipped && (
          <View style={{ flex: 1 }}>
            <Button
              label="Bestätigen"
              accessibilityLabel={`Satz ${index + 1} bestätigen`}
              small
              disabled={!validReps || !validWeight}
              onPress={onConfirm}
              icon="check"
            />
          </View>
        )}
        {skipped ? (
          <Button
            label="Wieder aufnehmen"
            accessibilityLabel={`Satz ${index + 1} wieder aufnehmen`}
            secondary
            small
            onPress={() => patch({ status: "pending", confirmedAt: undefined })}
          />
        ) : (
          <Button
            label="Auslassen"
            accessibilityLabel={`Satz ${index + 1} auslassen`}
            secondary
            small
            onPress={() => patch({ status: "skipped", confirmedAt: undefined })}
          />
        )}
      </View>
    </View>
  );
}
export function Session() {
  const { data, update } = useStore();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const session = id ? data.sessions.find((x) => x.id === id) : data.draft;
  const [index, setIndex] = useState(0);
  const [summary, setSummary] = useState(!!id);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [validity, setValidity] = useState<Record<string, boolean>>({});
  const onValidity = useCallback((id: string, valid: boolean) => {
    setValidity((previous) =>
      previous[id] === valid ? previous : { ...previous, [id]: valid },
    );
  }, []);
  const invalid = Object.values(validity).some((v) => !v);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!session)
    return (
      <>
        <Heading
          eyebrow="TRAINING"
          title="Bereit, wenn du es bist."
          description="Aktuell läuft keine Einheit."
        />
        <Button
          label="Zum Trainingsplan"
          onPress={() => router.push("/training")}
        />
      </>
    );
  const sessionId = session.id;
  function mutate(fn: (s: WorkoutSession) => WorkoutSession) {
    update((d) => {
      const next = (s: WorkoutSession) => ({
        ...fn(s),
        updatedAt: new Date().toISOString(),
      });
      return d.draft?.id === sessionId
        ? { ...d, draft: next(d.draft) }
        : {
            ...d,
            sessions: d.sessions.map((s) => (s.id === sessionId ? next(s) : s)),
          };
    });
  }
  function patch(eid: string, sid: string, p: Partial<PerformedSet>) {
    mutate((s) => ({
      ...s,
      exercises: s.exercises.map((e) =>
        e.id !== eid
          ? e
          : {
              ...e,
              sets: e.sets.map((x) => (x.id === sid ? { ...x, ...p } : x)),
            },
      ),
    }));
  }
  const all = session.exercises.flatMap((e) => e.sets);
  const confirmed = all.filter((s) => s.status === "confirmed").length;
  const pending = all.filter((s) => s.status === "pending").length;
  const r = record(session);
  const remaining = session.restEndsAt
    ? Math.max(0, Math.ceil((Date.parse(session.restEndsAt) - now) / 1000))
    : 0;
  function finish() {
    try {
      update((d) => completeSession(d, session!));
      router.replace("/progress");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const visible = summary
    ? session.exercises
    : [session.exercises[Math.min(index, session.exercises.length - 1)]];
  return (
    <>
      <View style={s.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Training verlassen und speichern"
          onPress={() => router.push("/")}
          style={{ minWidth: 44, minHeight: 44, justifyContent: "center" }}
        >
          <Icon name="arrow-left" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Label>
            {session.status === "completed"
              ? "GESPEICHERTE EINHEIT · KORREKTUR"
              : "DEIN TRAINING · ENTWURF"}
          </Label>
          <T style={s.h2}>{session.name}</T>
        </View>
        <T muted style={{ fontSize: 12 }}>
          {r.durationMinutes} Min.
        </T>
      </View>
      <View style={{ gap: 9 }}>
        <View style={[s.row, { justifyContent: "space-between" }]}>
          <T muted>
            {confirmed} von {all.length} Sätzen bestätigt
          </T>
          <T style={{ color: C.accent }}>
            {Math.round((confirmed / all.length) * 100)} %
          </T>
        </View>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: C.raised }}>
          <View
            style={{
              height: 6,
              borderRadius: 3,
              backgroundColor: C.accent,
              width: `${(confirmed / all.length) * 100}%`,
            }}
          />
        </View>
      </View>
      <View style={s.wrap}>
        <Chip
          label="Live-Training"
          selected={!summary}
          onPress={() => setSummary(false)}
        />
        <Chip
          label="Nachtragen & Abschluss"
          selected={summary}
          onPress={() => setSummary(true)}
        />
      </View>
      <T muted style={{ fontSize: 12 }}>
        Alle Änderungen werden automatisch gespeichert. Vorschläge zählen erst
        nach deiner Bestätigung. Auch einzelne Übungen kannst du später
        ergänzen.
      </T>
      {!summary && (
        <View style={s.wrap}>
          {session.exercises.map((e, i) => (
            <Chip
              key={e.id}
              label={`${i + 1}. ${exerciseById(e.exerciseId).name}`}
              selected={index === i}
              onPress={() => setIndex(i)}
            />
          ))}
        </View>
      )}
      {!!remaining && (
        <Card style={{ backgroundColor: "#293522" }}>
          <View style={[s.row, { justifyContent: "space-between" }]}>
            <View>
              <Label>DEINE PAUSE</Label>
              <T
                style={{
                  fontSize: 30,
                  lineHeight: 38,
                  fontWeight: "800",
                  color: C.accent,
                }}
              >
                {Math.floor(remaining / 60)}:
                {String(remaining % 60).padStart(2, "0")}
              </T>
            </View>
            <Button
              label="Pause beenden"
              secondary
              onPress={() => mutate((s) => ({ ...s, restEndsAt: undefined }))}
            />
          </View>
        </Card>
      )}
      {visible.map((ep) => {
        const e = exerciseById(ep.exerciseId);
        return (
          <Card key={ep.id}>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Label>{e.muscles.join(" · ").toUpperCase()}</Label>
                <T style={s.h2}>{e.name}</T>
              </View>
              <Icon name="activity" color={C.accent} />
            </View>
            <T muted style={{ fontSize: 13 }}>
              {e.instruction}
            </T>
            <T style={{ fontSize: 12, color: C.accent }}>
              Plan: {ep.plannedSets.length} Sätze ·{" "}
              {targetRange(ep.plannedSets[0].reps, e.unit)} · {ep.restSeconds} s
              Pause
            </T>
            {ep.sets.map((set, i) => (
              <SetEditor
                key={set.id}
                set={set}
                index={i}
                weighted={e.weighted}
                unit={e.unit}
                onValidity={onValidity}
                patch={(p) => patch(ep.id, set.id, p)}
                onConfirm={() => {
                  patch(ep.id, set.id, {
                    status: "confirmed",
                    confirmedAt: new Date().toISOString(),
                  });
                  if (!summary && session.status === "draft")
                    mutate((s) => ({
                      ...s,
                      restEndsAt: new Date(
                        Date.now() + ep.restSeconds * 1000,
                      ).toISOString(),
                    }));
                }}
              />
            ))}
            <View style={s.wrap}>
              <Button
                label={`Übung auslassen: ${e.name}`}
                secondary
                small
                onPress={() =>
                  mutate((s) => ({
                    ...s,
                    exercises: s.exercises.map((x) =>
                      x.id !== ep.id
                        ? x
                        : {
                            ...x,
                            sets: x.sets.map((y) => ({
                              ...y,
                              status: "skipped",
                              confirmedAt: undefined,
                            })),
                          },
                    ),
                  }))
                }
              />
              {!summary && (
                <Button
                  label="Pause starten"
                  secondary
                  small
                  icon="clock"
                  onPress={() =>
                    mutate((s) => ({
                      ...s,
                      restEndsAt: new Date(
                        Date.now() + ep.restSeconds * 1000,
                      ).toISOString(),
                    }))
                  }
                />
              )}
            </View>
          </Card>
        );
      })}
      {!summary ? (
        <>
          <Button
            label={
              index < session.exercises.length - 1
                ? "Nächste Übung"
                : "Zur Zusammenfassung"
            }
            icon="arrow-right"
            onPress={() =>
              index < session.exercises.length - 1
                ? setIndex(index + 1)
                : setSummary(true)
            }
          />
          <Button
            label="Später nachtragen / Training abschließen"
            secondary
            onPress={() => setSummary(true)}
          />
        </>
      ) : (
        <>
          <Card>
            <Label>DEINE ZUSAMMENFASSUNG</Label>
            <T style={s.h2}>{confirmed} bestätigte Sätze</T>
            <T muted>
              {
                session.exercises.filter((e) =>
                  e.sets.some((s) => s.status === "confirmed"),
                ).length
              }{" "}
              absolvierte Übungen · {r.durationMinutes} Minuten ·{" "}
              {r.volume.toLocaleString("de-DE")} kg bestätigtes Volumen
            </T>
            <T muted style={{ fontSize: 12 }}>
              Dauer = verstrichene Zeit inklusive Pausen. Volumen: nur externe
              Last × Wiederholungen. Sätze ohne Last, Körpergewicht und
              Haltezeiten werden nicht als Gewichtsvolumen berechnet.
            </T>
            {(() => {
              const previous = data.sessions
                .filter(
                  (x) =>
                    x.id !== session.id && x.workoutId === session.workoutId,
                )
                .sort((a, b) =>
                  (b.completedAt || "").localeCompare(a.completedAt || ""),
                )[0];
              if (!previous)
                return (
                  <T muted style={{ fontSize: 12 }}>
                    Noch keine vorherige Einheit dieses Trainings zum Vergleich.
                  </T>
                );
              const before = record(previous);
              const diff = r.volume - before.volume;
              return (
                <T style={{ fontSize: 13 }}>
                  Vorherige Einheit: {before.sets} Sätze · {before.volume} kg.
                  Volumenänderung: {diff > 0 ? "+" : ""}
                  {diff} kg. Nur bei vergleichbaren Übungen und Lasten
                  aussagekräftig.
                </T>
              );
            })()}
            {(() => {
              const records = session.exercises.flatMap((e) => {
                const ex = exerciseById(e.exerciseId);
                if (!ex.weighted) return [];
                const weights = e.sets
                  .filter(
                    (s) => s.status === "confirmed" && s.weight !== undefined,
                  )
                  .map((s) => s.weight!);
                const previous = data.sessions
                  .filter((s) => s.id !== session.id)
                  .flatMap((s) =>
                    s.exercises
                      .filter((x) => x.exerciseId === e.exerciseId)
                      .flatMap((x) =>
                        x.sets
                          .filter(
                            (y) =>
                              y.status === "confirmed" &&
                              y.weight !== undefined,
                          )
                          .map((y) => y.weight!),
                      ),
                  );
                return weights.length &&
                  previous.length &&
                  Math.max(...weights) > Math.max(...previous)
                  ? [`${ex.name}: ${Math.max(...weights)} kg`]
                  : [];
              });
              return records.length ? (
                <T style={{ color: C.accent }}>
                  Neue bestätigte Gewichtsbestwerte: {records.join(" · ")}
                </T>
              ) : null;
            })()}
          </Card>
          {pending > 0 && (
            <>
              <T style={{ color: C.red }}>
                {pending} offene Vorschläge. Bitte bestätigen oder auslassen.
              </T>
              <Button
                disabled={invalid}
                label="Ja, alle offenen Vorschläge tatsächlich geschafft"
                secondary
                icon="check-circle"
                onPress={() =>
                  mutate((s) => ({
                    ...s,
                    exercises: s.exercises.map((e) => ({
                      ...e,
                      sets: e.sets.map((x) =>
                        x.status === "pending"
                          ? {
                              ...x,
                              status: "confirmed",
                              confirmedAt: new Date().toISOString(),
                            }
                          : x,
                      ),
                    })),
                  }))
                }
              />
              <Button
                label="Alle offenen Sätze als ausgelassen markieren"
                secondary
                onPress={() =>
                  mutate((s) => ({
                    ...s,
                    exercises: s.exercises.map((e) => ({
                      ...e,
                      sets: e.sets.map((x) =>
                        x.status === "pending"
                          ? { ...x, status: "skipped", confirmedAt: undefined }
                          : x,
                      ),
                    })),
                  }))
                }
              />
            </>
          )}
          {!!error && <T style={{ color: C.red }}>{error}</T>}
          {invalid && (
            <T style={{ color: C.red }}>
              Bitte korrigiere ungültige Eingaben vor dem Abschluss.
            </T>
          )}
          <Button
            disabled={invalid}
            label={
              session.status === "completed"
                ? "Korrektur abschließen"
                : "Training speichern & abschließen"
            }
            icon="check"
            onPress={finish}
          />
          {session.status === "completed" && (
            <T muted style={{ fontSize: 12 }}>
              Korrekturen werden sofort lokal gespeichert und aktualisieren den
              Fortschritt.
            </T>
          )}
        </>
      )}
    </>
  );
}
