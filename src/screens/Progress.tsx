import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useStore } from "../storage/store";
import { record } from "../domain/training";
import { exerciseById } from "../data/exercises";
import {
  Button,
  Card,
  Chip,
  Icon,
  Label,
  T,
  C,
  styles as s,
} from "../components/ui";
import { Heading } from "./Heading";
import { SessionRow } from "./SessionRow";
export function Progress() {
  const { data } = useStore();
  const [exercise, setExercise] = useState("");
  const history = [...data.sessions].sort((a, b) =>
    (a.completedAt || "").localeCompare(b.completedAt || ""),
  );
  const ids = Array.from(
    new Set(
      history.flatMap((x) =>
        x.exercises
          .filter((e) => e.sets.some((s) => s.status === "confirmed"))
          .map((e) => e.exerciseId),
      ),
    ),
  );
  const chosen = ids.includes(exercise) ? exercise : ids[0];
  const ex = chosen ? exerciseById(chosen) : null;
  const values = chosen
    ? history.flatMap((x) => {
        const sets = x.exercises
          .filter((e) => e.exerciseId === chosen)
          .flatMap((e) => e.sets.filter((s) => s.status === "confirmed"));
        return sets.length
          ? [
              {
                date: x.completedAt!,
                value: Math.max(
                  ...sets.map((s) => (ex?.weighted ? s.weight || 0 : s.reps)),
                ),
              },
            ]
          : [];
      })
    : [];
  const max = Math.max(1, ...values.map((v) => v.value));
  const totalVolume = history.reduce((n, x) => n + record(x).volume, 0);
  const weeks = Math.max(
    1,
    history.length
      ? Math.ceil(
          (Date.now() - Date.parse(history[0].startedAt)) / (7 * 86400000),
        )
      : 1,
  );
  return (
    <>
      <Heading
        eyebrow="DEIN FORTSCHRITT"
        title="Jede Einheit zählt."
        description="Echte Leistungen. Keine geschätzten Erfolge."
      />
      <View style={s.row}>
        {[
          { v: history.length, l: "Einheiten" },
          { v: (history.length / weeks).toFixed(1), l: "pro Woche Ø" },
          { v: totalVolume.toLocaleString("de-DE"), l: "kg Gesamtvolumen" },
        ].map((x) => (
          <Card key={x.l} style={{ flex: 1, padding: 14 }}>
            <T style={{ fontSize: 26, fontWeight: "800", lineHeight: 32 }}>
              {x.v}
            </T>
            <T muted style={{ fontSize: 11 }}>
              {x.l}
            </T>
          </Card>
        ))}
      </View>
      {!history.length ? (
        <Card>
          <Icon name="trending-up" color={C.accent} size={32} />
          <T style={s.h2}>Dein Fortschritt beginnt mit dir.</T>
          <T muted>
            Schließe dein erstes Training ab. Nur ausdrücklich bestätigte
            Leistungen erscheinen in deinen Statistiken.
          </T>
          <Button
            label="Zum Training"
            onPress={() => router.push("/training")}
          />
        </Card>
      ) : (
        <>
          <Card>
            <Label>ÜBUNGSENTWICKLUNG</Label>
            <View style={s.wrap}>
              {ids.map((id) => (
                <Chip
                  key={id}
                  label={exerciseById(id).name}
                  selected={chosen === id}
                  onPress={() => setExercise(id)}
                />
              ))}
            </View>
            <T style={s.h2}>{ex?.name}</T>
            <T muted>
              Bestwert: {Math.max(0, ...values.map((v) => v.value))}{" "}
              {ex?.weighted
                ? "kg"
                : ex?.unit === "seconds"
                  ? "Sekunden"
                  : "Wiederholungen"}{" "}
              pro Satz
            </T>
            <View
              accessibilityLabel="Verlauf bestätigter Bestwerte"
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                gap: 12,
                height: 180,
                paddingTop: 20,
              }}
            >
              {values.slice(-8).map((v, i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 5,
                  }}
                >
                  <T style={{ fontSize: 11, color: C.accent }}>{v.value}</T>
                  <View
                    style={{
                      width: "80%",
                      height: Math.max(3, (v.value / max) * 110),
                      backgroundColor: C.accent,
                      borderTopLeftRadius: 7,
                      borderTopRightRadius: 7,
                    }}
                  />
                  <T muted style={{ fontSize: 9 }}>
                    {new Date(v.date).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </T>
                </View>
              ))}
            </View>
            <T muted style={{ fontSize: 11 }}>
              Je Einheit der höchste bestätigte Wert. Unterschiedliche
              Wiederholungen sind nur eingeschränkt vergleichbar. Volumen =
              externe Last × Wiederholungen; Körpergewicht und Haltezeiten sind
              ausgenommen.
            </T>
          </Card>
          <T style={s.h2}>Trainingshistorie</T>
          {[...history].reverse().map((x) => (
            <SessionRow key={x.id} id={x.id} />
          ))}
        </>
      )}
    </>
  );
}
