import React from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { useStore } from "../storage/store";
import { record } from "../domain/training";
import { Card, Icon, T, C, styles as s } from "../components/ui";
export function SessionRow({ id }: { id: string }) {
  const { data } = useStore();
  const x = data.sessions.find((x) => x.id === id)!;
  const r = record(x);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${x.name} vom ${new Date(r.date).toLocaleDateString("de-DE")} bearbeiten`}
      onPress={() =>
        router.push({ pathname: "/session", params: { id: x.id } })
      }
    >
      <Card>
        <View style={s.row}>
          <Icon name="check-circle" color={C.accent} />
          <View style={{ flex: 1 }}>
            <T style={{ fontWeight: "700" }}>{x.name}</T>
            <T muted style={{ fontSize: 12 }}>
              {new Date(r.date).toLocaleDateString("de-DE")} · {r.sets} Sätze ·{" "}
              {r.durationMinutes} Min. · {r.volume.toLocaleString("de-DE")} kg
              Volumen
            </T>
          </View>
          <Icon name="arrow-up-right" color={C.muted} />
        </View>
      </Card>
    </Pressable>
  );
}
