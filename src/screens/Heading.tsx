import React from "react";
import { View } from "react-native";
import { T, Label, styles as s } from "../components/ui";
export function Heading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <View style={{ gap: 8, flexShrink: 1 }}>
      <Label>{eyebrow}</Label>
      <T style={s.title}>{title}</T>
      {description && <T muted>{description}</T>}
    </View>
  );
}
