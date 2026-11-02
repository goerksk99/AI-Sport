import React, { useState } from "react";
import { View } from "react-native";
import { useStore } from "../storage/store";
import { demoCoach } from "../domain/coach";
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
} from "../components/ui";
import { Heading } from "./Heading";
export function Coach() {
  const { data, update } = useStore();
  const [q, setQ] = useState("");
  const [messages, setMessages] = useState<{ q: string; a: string }[]>([]);
  const relevant = data.sessions.filter(
    (s) =>
      (s.trainingStyle || "strength") ===
      (data.profile?.trainingStyle || "strength"),
  );
  const rec = demoCoach.recommend(relevant)[0];
  const adjustment = rec.adjustment;
  const matches =
    data.plan?.workouts
      .flatMap((w) => w.exercises)
      .filter((e) => e.exerciseId === adjustment?.exerciseId) || [];
  const already =
    !!adjustment &&
    matches.length > 0 &&
    matches.every((e) =>
      e.sets.every(
        (s) =>
          (adjustment.kind === "reps" ? s.reps : (s.weight ?? 0)) >=
          adjustment.value,
      ),
    );
  function adopt() {
    if (!adjustment) return;
    update((d) => ({
      ...d,
      plan: {
        ...d.plan!,
        workouts: d.plan!.workouts.map((w) => ({
          ...w,
          exercises: w.exercises.map((e) =>
            e.exerciseId === adjustment.exerciseId
              ? {
                  ...e,
                  editedAt: new Date().toISOString(),
                  sets: e.sets.map((s) => ({
                    ...s,
                    ...(adjustment.kind === "reps"
                      ? { reps: adjustment.value }
                      : { weight: adjustment.value }),
                  })),
                }
              : e,
          ),
        })),
      },
    }));
  }
  const ask = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [
      ...m,
      { q: text.trim(), a: demoCoach.answer(text, relevant) },
    ]);
    setQ("");
  };
  return (
    <>
      <Heading
        eyebrow="DEIN COACH"
        title="Ein guter Impuls. Ein klarer Grund."
        description="Trainiere bewusst. Verstehe deine nächsten Schritte."
      />
      <View style={s.row}>
        <View
          style={{
            backgroundColor: "#34472A",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
          }}
        >
          <T style={{ fontSize: 11, color: C.accent, fontWeight: "700" }}>
            DEMO · KEINE ECHTE KI
          </T>
        </View>
      </View>
      <Card>
        <Icon name="zap" color={C.accent} size={30} />
        <T style={s.h2}>{rec.title}</T>
        <T>{rec.message}</T>
        {adjustment && matches.length > 0 && (
          <>
            <Button
              label={
                already
                  ? "Im Plan übernommen"
                  : "Vorschlag für nächste Trainings übernehmen"
              }
              disabled={already}
              onPress={adopt}
            />
            <T muted style={{ fontSize: 12 }}>
              Nur dein zukünftiger Plan ändert sich. Laufendes Training und
              gespeicherte Leistungen bleiben erhalten. Wähle die
              nächstmögliche, kontrolliert ausführbare Last.
            </T>
          </>
        )}
        <View
          style={{
            backgroundColor: C.bg,
            padding: 15,
            borderRadius: 13,
            gap: 6,
          }}
        >
          <Label>WARUM DIESE EMPFEHLUNG?</Label>
          <T muted style={{ fontSize: 13 }}>
            {rec.reason}
          </T>
        </View>
      </Card>
      <T style={s.h2}>Was beschäftigt dich?</T>
      <T muted>
        Der lokale Demo-Coach beantwortet Themen zu Fortschritt, Pausen,
        Beschwerden und Ernährung mit festen Regeln. Er ändert deinen Plan nicht
        automatisch.
      </T>
      <View style={s.wrap}>
        {[
          "Wie mache ich Fortschritte?",
          "Wie viel Pause brauche ich?",
          "Was ist mit Ernährung?",
        ].map((text) => (
          <Chip
            key={text}
            label={text}
            selected={false}
            onPress={() => ask(text)}
          />
        ))}
      </View>
      {messages.map((m, i) => (
        <View key={i} style={{ gap: 12 }}>
          <Card style={{ backgroundColor: "#293522" }}>
            <T>{m.q}</T>
          </Card>
          <Card>
            <Label>PULS · REGELBASIERTE ANTWORT</Label>
            <T>{m.a}</T>
          </Card>
        </View>
      ))}
      <View style={[s.row, { alignItems: "flex-end" }]}>
        <Field
          label="Deine Frage"
          value={q}
          onChange={setQ}
          placeholder="Frag deinen Demo-Coach …"
        />
        <Button
          label="Senden"
          icon="arrow-up"
          disabled={!q.trim()}
          onPress={() => ask(q)}
        />
      </View>
      <T muted style={{ fontSize: 12 }}>
        Keine Diagnosen oder medizinische Beratung. Keine Datenübertragung an
        einen KI-Anbieter.
      </T>
    </>
  );
}
