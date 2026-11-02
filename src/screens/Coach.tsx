import React, { useState } from "react";
import { View } from "react-native";
import { useStore } from "../storage/store";
import { router } from "expo-router";
import {
  CoachMessage,
  upsertCoachMessage,
  questionKey,
} from "../domain/conversation";
import {
  personalCoachAnswer,
  applyCoachProposal,
  CoachProposal,
  goalLabels,
} from "../domain/personalCoach";
import { trainingStyles } from "../domain/preferences";
import { equipmentLabels } from "../domain/catalog";
import { CoachPlanHelper } from "../components/CoachPlanHelper";
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
  const [more, setMore] = useState(false);
  const [applied, setApplied] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<CoachMessage[]>([]);
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
    const reply = personalCoachAnswer(text, data);
    setMessages((m) =>
      upsertCoachMessage(m, text, reply.message, {
        reason: reply.reason,
        proposal: reply.proposal,
      }),
    );
    setError("");
    setQ("");
  };
  function preview(proposal: CoachProposal) {
    setMessages((m) =>
      upsertCoachMessage(
        m,
        "Meine Planänderung",
        "Hier ist deine Vorschau. Prüfe die Auswirkungen vor der Übernahme.",
        {
          proposal,
          reason:
            "Aus deinen bewusst gewählten Angaben; noch keine Änderung gespeichert.",
        },
      ),
    );
    setError("");
  }
  function apply(proposal: CoachProposal) {
    try {
      update((d) => applyCoachProposal(d, proposal));
      setApplied((a) => [...a, JSON.stringify(proposal)]);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  const quickQuestions = [
    "Wie mache ich Fortschritte?",
    "Wie viel Pause brauche ich?",
    "Wie schwer soll ich trainieren?",
    "Ich habe nur 20 Minuten",
    "Wie wärme ich mich auf?",
    "Was ist mit Ernährung?",
    "Ich bin müde und möchte leichter trainieren",
    "Ich habe ein Training verpasst",
    "Wie persönlich sind deine Empfehlungen?",
    "Ich möchte Cardio trainieren",
    "Ich möchte mit Kettlebell trainieren",
    "Ich möchte Calisthenics trainieren",
  ];
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
        <Label>DEIN KONTEXT</Label>
        <T style={s.h2}>{data.profile!.name}, wir planen für deinen Alltag.</T>
        <T>
          {goalLabels[data.profile!.goal]} ·{" "}
          {trainingStyles[data.profile!.trainingStyle || "strength"]} ·{" "}
          {data.profile!.days} Tage à {data.profile!.minutes} Minuten
        </T>
        <T muted style={{ fontSize: 12 }}>
          {data.profile!.equipment.map((e) => equipmentLabels[e]).join(" · ")}
        </T>
        <T muted style={{ fontSize: 12 }}>
          Profil, Kalender und bestätigte Leistungen helfen schon jetzt bei der
          Personalisierung. Einschränkungen werden nicht medizinisch beurteilt.
        </T>
      </Card>
      <CoachPlanHelper data={data} onPreview={preview} />
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
        automatisch. Konkrete unterstützte Anfragen wie „Ich habe nur 20
        Minuten“ können eine Planvorschau erzeugen. Freier KI-Dialog ist noch
        nicht angebunden; unklare Fragen werden als solche benannt.
      </T>
      <View style={s.wrap}>
        {quickQuestions
          .slice(0, more ? quickQuestions.length : 6)
          .map((text) => (
            <Chip
              key={text}
              label={text}
              selected={messages.at(-1)?.id === questionKey(text)}
              onPress={() => ask(text)}
            />
          ))}
      </View>
      <Button
        label={more ? "Weniger Themen" : "Weitere Themen"}
        secondary
        small
        onPress={() => setMore(!more)}
      />
      {messages.length > 0 && (
        <Button
          label="Verlauf leeren"
          secondary
          small
          onPress={() => setMessages([])}
        />
      )}
      <View style={s.wrap}>
        <Button
          label="Übungen im Plan ergänzen"
          icon="plus"
          secondary
          small
          onPress={() => router.navigate("/exercises")}
        />
        <Button
          label="Trainingsprofil anpassen"
          secondary
          small
          onPress={() => router.navigate("/profile")}
        />
      </View>
      {messages.map((m) => (
        <View key={m.id} testID="coach-message" style={{ gap: 12 }}>
          <Card style={{ backgroundColor: "#293522" }}>
            <T>{m.q}</T>
          </Card>
          <Card>
            <Label>PULS · REGELBASIERTE ANTWORT</Label>
            <T>{m.a}</T>
            {m.reason && (
              <T muted style={{ fontSize: 12 }}>
                Grundlage: {m.reason}
              </T>
            )}
            {m.proposal && (
              <View
                style={{
                  gap: 12,
                  borderTopWidth: 1,
                  borderColor: C.line,
                  paddingTop: 14,
                }}
              >
                <Label>VORSCHAU · NOCH NICHT ÜBERNOMMEN</Label>
                <T style={s.h2}>{m.proposal.title}</T>
                <T>{m.proposal.description}</T>
                <Button
                  label={
                    applied.includes(JSON.stringify(m.proposal))
                      ? "Planänderung übernommen"
                      : "Diese Planänderung übernehmen"
                  }
                  disabled={applied.includes(JSON.stringify(m.proposal))}
                  onPress={() => apply(m.proposal!)}
                />
              </View>
            )}
          </Card>
        </View>
      ))}
      {!!error && <T style={{ color: C.red }}>{error}</T>}
      <View style={[s.row, { alignItems: "flex-end" }]}>
        <Field
          label="Deine Frage"
          value={q}
          onChange={setQ}
          onSubmit={() => ask(q)}
          placeholder="Zum Beispiel: Plane 3 Tage pro Woche …"
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
