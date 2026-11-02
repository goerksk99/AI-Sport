import React, { useState } from "react";
import { View } from "react-native";
import { AppData, TrainingStyle, FitnessGoal } from "../domain/types";
import {
  CoachProposal,
  profileProposal,
  goalLabels,
} from "../domain/personalCoach";
import { trainingStyles } from "../domain/preferences";
import { Button, Card, Chip, Label, T, styles as s } from "./ui";
export function CoachPlanHelper({
  data,
  onPreview,
}: {
  data: AppData;
  onPreview: (p: CoachProposal) => void;
}) {
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState(data.profile!.days);
  const [minutes, setMinutes] = useState(data.profile!.minutes);
  const [style, setStyle] = useState<TrainingStyle>(
    data.profile!.trainingStyle || "strength",
  );
  const [goal, setGoal] = useState<FitnessGoal>(data.profile!.goal);
  function showPreview() {
    try {
      onPreview(
        profileProposal(data, { days, minutes, trainingStyle: style, goal }),
      );
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function toggle() {
    if (!open) {
      setDays(data.profile!.days);
      setMinutes(data.profile!.minutes);
      setStyle(data.profile!.trainingStyle || "strength");
      setGoal(data.profile!.goal);
    }
    setOpen(!open);
    setError("");
  }
  return (
    <View style={{ gap: 12 }}>
      <Button
        label={open ? "Planhilfe schließen" : "Plan gemeinsam anpassen"}
        icon="sliders"
        secondary
        onPress={toggle}
      />
      {open && (
        <Card>
          <T style={{ fontWeight: "700" }}>
            Was passt gerade zu deinem Alltag?
          </T>
          <T muted>
            Freiwillig. Erst die Vorschau ansehen, dann bewusst übernehmen.
          </T>
          <Label>TAGE PRO WOCHE</Label>
          <View style={s.wrap}>
            {[2, 3, 4, 5].map((n) => (
              <Chip
                key={n}
                label={`${n} Tage`}
                selected={days === n}
                onPress={() => setDays(n)}
              />
            ))}
          </View>
          <Label>ZEIT PRO EINHEIT</Label>
          <View style={s.wrap}>
            {[15, 20, 25, 30, 45, 60].map((n) => (
              <Chip
                key={n}
                label={`${n} Min.`}
                selected={minutes === n}
                onPress={() => setMinutes(n)}
              />
            ))}
          </View>
          <Label>SCHWERPUNKT</Label>
          <View style={s.wrap}>
            {Object.entries(trainingStyles).map(([v, l]) => (
              <Chip
                key={v}
                label={l}
                selected={style === v}
                onPress={() => setStyle(v as TrainingStyle)}
              />
            ))}
          </View>
          <Label>DEIN ZIEL</Label>
          <View style={s.wrap}>
            {Object.entries(goalLabels).map(([v, l]) => (
              <Chip
                key={v}
                label={l}
                selected={goal === v}
                onPress={() => setGoal(v as FitnessGoal)}
              />
            ))}
          </View>
          {!!error && <T muted>{error}</T>}
          <Button label="Anpassung als Vorschau zeigen" onPress={showPreview} />
        </Card>
      )}
    </View>
  );
}
