import React, { useState } from "react";
import { router } from "expo-router";
import { View } from "react-native";
import { useStore } from "../storage/store";
import { Onboarding, goals } from "../components/Onboarding";
import { Button, Card, Label, T, C, styles as s } from "../components/ui";
import { equipmentLabels } from "../domain/catalog";
import { trainingStyles } from "../domain/preferences";
import { Assessments } from "../components/Assessments";
import { generatePlan } from "../domain/training";
import { Heading } from "./Heading";
export function Profile() {
  const { data, update } = useStore();
  const [edit, setEdit] = useState(false);
  if (edit) return <Onboarding editing onDone={() => setEdit(false)} />;
  const p = data.profile!;
  return (
    <>
      <Heading
        eyebrow="DEIN PROFIL"
        title={`Dein Training, ${p.name}.`}
        description="Deine Angaben bleiben auf diesem Gerät."
      />
      <Card>
        <View style={s.row}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 22,
              backgroundColor: "#34472A",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <T style={{ fontSize: 29, fontWeight: "800", color: C.accent }}>
              {p.name[0].toUpperCase()}
            </T>
          </View>
          <View>
            <T style={s.h2}>{p.name}</T>
            <T muted>Lokales Profil · Ohne Registrierung</T>
          </View>
        </View>
        {[
          ["Dein Ziel", goals[p.goal]],
          ["Trainingsart", trainingStyles[p.trainingStyle || "strength"]],
          [
            "Trainingsniveau",
            p.level === "beginner" ? "Einsteiger" : "Fortgeschritten",
          ],
          ["Dein Rhythmus", `${p.days} Tage · ${p.minutes} Minuten`],
          ["Trainingsort", p.location === "gym" ? "Fitnessstudio" : "Zu Hause"],
          ["Equipment", p.equipment.map((e) => equipmentLabels[e]).join(", ")],
          [
            "Vorlieben",
            p.trainingStyle === "cardio"
              ? "Ausdauer"
              : p.preferences.includes("cardio")
                ? "Kraft & Ausdauer"
                : "Kraft & Stabilität",
          ],
          ["Körpergewicht", p.weight ? `${p.weight} kg` : "Nicht angegeben"],
          ["Einschränkungen", p.limitations || "Nicht angegeben"],
        ].map(([k, v]) => (
          <View
            key={k}
            style={{
              gap: 4,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderColor: C.line,
            }}
          >
            <Label>{k.toUpperCase()}</Label>
            <T>{v}</T>
          </View>
        ))}
        <Button
          label="Profil & Plan anpassen"
          icon="edit-2"
          onPress={() => setEdit(true)}
        />
      </Card>
      <Button
        label="Trainingstage planen"
        icon="calendar"
        secondary
        onPress={() => router.navigate("/calendar")}
      />
      <Card>
        <Assessments
          profile={p}
          value={p.assessments || []}
          onChange={(assessments) =>
            update((d) => {
              const profile = { ...d.profile!, assessments };
              return { ...d, profile, plan: generatePlan(profile) };
            })
          }
        />
        <T muted style={{ fontSize: 12 }}>
          Neue Ausgangswerte erstellen einen passenden Plan. Historie und
          laufendes Training bleiben erhalten.
        </T>
      </Card>
      <Card>
        <Label>ERNÄHRUNG · AUSBLICK</Label>
        <T style={s.h2}>Mehr als Training.</T>
        <T muted>
          Kalorien, Makros und Mahlzeiten sind für eine spätere Version geplant.
          Der Prototyp konzentriert sich auf dein Training.
        </T>
      </Card>
      <T muted style={{ fontSize: 12 }}>
        PULS · Prototyp 1.3. Daten sind lokal und nicht verschlüsselt. Das
        Löschen von App- oder Browserdaten entfernt auch deine Trainings. Keine
        Cloud-Synchronisierung.
      </T>
    </>
  );
}
