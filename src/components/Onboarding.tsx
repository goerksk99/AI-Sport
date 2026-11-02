import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import {
  UserProfile,
  FitnessGoal,
  Equipment,
  TrainingStyle,
  SelfAssessment,
} from "../domain/types";
import { generatePlan, uid } from "../domain/training";
import { useStore } from "../storage/store";
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
import { Assessments } from "./Assessments";
import { trainingStyles } from "../domain/preferences";
export const goals: Record<FitnessGoal, string> = {
  fit: "Fitter im Alltag",
  muscle: "Muskeln aufbauen",
  lose: "Gewicht reduzieren",
  performance: "Leistung verbessern",
};
export function Onboarding({
  editing = false,
  onDone,
}: {
  editing?: boolean;
  onDone?: () => void;
}) {
  const { data, update } = useStore();
  const old = data.profile;
  const [step, setStep] = useState(0);
  const [name, setName] = useState(old?.name || "");
  const [goal, setGoal] = useState<FitnessGoal>(old?.goal || "fit");
  const [level, setLevel] = useState<UserProfile["level"]>(
    old?.level || "beginner",
  );
  const [days, setDays] = useState(old?.days || 3);
  const [minutes, setMinutes] = useState(old?.minutes || 45);
  const [location, setLocation] = useState<UserProfile["location"]>(
    old?.location || "gym",
  );
  const [equipment, setEquipment] = useState<Equipment[]>(
    old?.equipment || ["body", "gym"],
  );
  const [cardio, setCardio] = useState(
    old?.preferences.includes("cardio") || false,
  );
  const [weight, setWeight] = useState(old?.weight?.toString() || "");
  const [limitations, setLimitations] = useState(old?.limitations || "");
  const [trainingStyle, setTrainingStyle] = useState<TrainingStyle>(
    old?.trainingStyle || "strength",
  );
  const [assessments, setAssessments] = useState<SelfAssessment[]>(
    old?.assessments || [],
  );
  const [error, setError] = useState("");
  function finish() {
    const w = weight.trim() ? Number(weight.replace(",", ".")) : undefined;
    if (w !== undefined && (!Number.isFinite(w) || w < 20 || w > 400)) {
      setError(
        "Bitte ein Körpergewicht zwischen 20 und 400 kg eintragen oder das Feld leer lassen.",
      );
      return;
    }
    const p: UserProfile = {
      id: old?.id || uid(),
      createdAt: old?.createdAt || new Date().toISOString(),
      name: name.trim() || "Sportler",
      goal,
      level,
      days,
      minutes,
      location,
      equipment,
      preferences: cardio ? ["strength", "cardio"] : ["strength"],
      weight: w,
      limitations: limitations.trim() || undefined,
      trainingStyle,
      assessments,
    };
    update((d) => ({ ...d, profile: p, plan: generatePlan(p) }));
    onDone?.();
  }
  return (
    <ScrollView
      contentContainerStyle={{
        padding: 24,
        paddingTop: 45,
        paddingBottom: 60,
        maxWidth: 620,
        width: "100%",
        alignSelf: "center",
        gap: 26,
      }}
    >
      <View style={[s.row, { justifyContent: "space-between" }]}>
        <T style={{ fontSize: 24, fontWeight: "900", letterSpacing: 3 }}>
          PULS<T style={{ color: C.accent }}> •</T>
        </T>
        <Label>DEIN START · {step + 1}/3</Label>
      </View>
      <View style={s.row}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 3,
              backgroundColor: i <= step ? C.accent : C.line,
            }}
          />
        ))}
      </View>
      <View style={{ gap: 10 }}>
        <Label>WENIGER PLANEN. MEHR BEWEGEN.</Label>
        <T style={[s.title, { fontSize: 40, lineHeight: 46 }]}>
          {
            [
              "Dein Ziel.\nDein Tempo.",
              "Passt in\ndeinen Alltag.",
              "Ein Plan,\nder zu dir passt.",
            ][step]
          }
        </T>
        <T muted>
          {
            [
              "Ein paar Angaben reichen für deinen ersten Trainingsplan. Ohne Konto, direkt auf deinem Gerät.",
              "Wir starten mit einem realistischen Rhythmus. Du kannst deinen Plan jederzeit anpassen.",
              "Dein Plan entsteht aus transparenten Regeln – ohne echte KI und ohne externe Datenübertragung.",
            ][step]
          }
        </T>
      </View>
      {step === 0 && (
        <>
          <Field
            label="Wie dürfen wir dich nennen? (optional)"
            value={name}
            onChange={setName}
            placeholder="Dein Vorname"
          />
          <Label>WAS MÖCHTEST DU ERREICHEN?</Label>
          <View style={s.wrap}>
            {Object.entries(goals).map(([v, l]) => (
              <Chip
                key={v}
                label={l}
                selected={goal === v}
                onPress={() => setGoal(v as FitnessGoal)}
              />
            ))}
          </View>
          <Label>DEINE ERFAHRUNG</Label>
          <View style={s.wrap}>
            <Chip
              label="Ich starte gerade"
              selected={level === "beginner"}
              onPress={() => setLevel("beginner")}
            />
            <Chip
              label="Ich trainiere regelmäßig"
              selected={level === "advanced"}
              onPress={() => setLevel("advanced")}
            />
          </View>
        </>
      )}
      {step === 1 && (
        <>
          <Label>TRAININGSTAGE PRO WOCHE</Label>
          <View style={s.wrap}>
            {[2, 3, 4, 5].map((v) => (
              <Chip
                key={v}
                label={`${v} Tage`}
                selected={days === v}
                onPress={() => setDays(v)}
              />
            ))}
          </View>
          <Label>ZEIT PRO EINHEIT</Label>
          <View style={s.wrap}>
            {[25, 45, 60].map((v) => (
              <Chip
                key={v}
                label={`${v} Min.`}
                selected={minutes === v}
                onPress={() => setMinutes(v)}
              />
            ))}
          </View>
          <Label>WO TRAINIERST DU?</Label>
          <View style={s.wrap}>
            <Chip
              label="Im Fitnessstudio"
              selected={location === "gym"}
              onPress={() => {
                setLocation("gym");
                setEquipment(["body", "gym"]);
              }}
            />
            <Chip
              label="Zu Hause"
              selected={location === "home"}
              onPress={() => {
                setLocation("home");
                setEquipment(["body"]);
              }}
            />
          </View>
          <Label>VERFÜGBARES EQUIPMENT</Label>
          <View style={s.wrap}>
            <T muted>Körpergewicht ist immer verfügbar.</T>
            <Chip
              label="Kurzhanteln"
              selected={equipment.includes("dumbbell")}
              onPress={() =>
                setEquipment((a) =>
                  a.includes("dumbbell")
                    ? a.filter((x) => x !== "dumbbell")
                    : [...a, "dumbbell"],
                )
              }
            />
            {location === "gym" && (
              <Chip
                label="Studiogeräte"
                selected={equipment.includes("gym")}
                onPress={() =>
                  setEquipment((a) =>
                    a.includes("gym")
                      ? a.filter((x) => x !== "gym")
                      : [...a, "gym"],
                  )
                }
              />
            )}
          </View>
          <Label>DEINE TRAININGSART</Label>
          <View style={s.wrap}>
            {Object.entries(trainingStyles).map(([v, l]) => (
              <Chip
                key={v}
                label={l}
                selected={trainingStyle === v}
                onPress={() => setTrainingStyle(v as TrainingStyle)}
              />
            ))}
          </View>
          <View style={s.wrap}>
            {(
              [
                { v: "barbell", l: "Langhantel & Hantelbank" },
                { v: "pullup", l: "Klimmzugstange" },
              ] as const
            ).map((x) => (
              <Chip
                key={x.v}
                label={x.l}
                selected={equipment.includes(x.v)}
                onPress={() =>
                  setEquipment((a) =>
                    a.includes(x.v) ? a.filter((e) => e !== x.v) : [...a, x.v],
                  )
                }
              />
            ))}
          </View>
          <Label>OPTIONAL ERGÄNZEN</Label>
          <View style={s.wrap}>
            <T muted>Zusätzliche lockere Ausdauer</T>
            <Chip
              label="+ Ausdauer einplanen"
              selected={cardio}
              onPress={() => setCardio(!cardio)}
            />
          </View>
        </>
      )}
      {step === 2 && (
        <>
          <Card>
            <Icon name="sliders" color={C.accent} />
            <T style={s.h2}>{goals[goal]}</T>
            <T muted>
              {days} Tage · {minutes} Minuten ·{" "}
              {location === "gym" ? "Studio" : "Zu Hause"}
            </T>
            <T muted>
              {level === "advanced" && days >= 4
                ? "Ober-/Unterkörper-Split"
                : "Ganzkörper mit Grundbewegungen"}{" "}
              · {trainingStyles[trainingStyle]}
              {cardio ? " + Ausdauer" : ""}
            </T>
          </Card>
          <Assessments
            profile={{
              id: old?.id || "preview",
              createdAt: old?.createdAt || new Date().toISOString(),
              name: name || "Sportler",
              goal,
              level,
              days,
              minutes,
              location,
              equipment,
              preferences: ["strength"],
              trainingStyle,
            }}
            value={assessments}
            onChange={setAssessments}
          />
          <Label>FREIWILLIG · EINFACH LEER LASSEN</Label>
          <Field
            label="Körpergewicht in kg (optional)"
            value={weight}
            onChange={setWeight}
            numeric
          />
          <Field
            label="Körperliche Einschränkungen (optional)"
            value={limitations}
            onChange={setLimitations}
            multiline
            placeholder="Was möchtest du festhalten?"
          />
          <T muted style={{ fontSize: 12 }}>
            Diese Notiz wird gespeichert, aber nicht medizinisch ausgewertet.
            Bei Einschränkungen die Übungsauswahl mit einer qualifizierten
            Fachperson prüfen. Der Prototyp ersetzt keine medizinische Beratung.
          </T>
          {editing && (
            <T muted>
              Dein Plan wird neu erstellt. Trainingshistorie und laufendes
              Training bleiben erhalten.
            </T>
          )}
          {!!error && <T style={{ color: C.red }}>{error}</T>}
        </>
      )}
      <Button
        label={
          step === 2
            ? editing
              ? "Profil & neuen Plan speichern"
              : "Meinen Plan erstellen"
            : "Weiter"
        }
        icon="arrow-right"
        onPress={() => (step < 2 ? setStep(step + 1) : finish())}
      />
      {step > 0 && (
        <Button label="Zurück" secondary onPress={() => setStep(step - 1)} />
      )}
      {editing && (
        <Button label="Abbrechen" secondary onPress={() => onDone?.()} />
      )}
    </ScrollView>
  );
}
