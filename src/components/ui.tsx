import React from "react";
import {
  Pressable,
  Text,
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
export const C = {
  bg: "#101312",
  card: "#1A1F1C",
  raised: "#242B26",
  line: "#303A32",
  text: "#F3F6EE",
  muted: "#9BA99D",
  accent: "#C3F56A",
  dark: "#17220F",
  red: "#FFAE9E",
};
export function T({
  children,
  style,
  muted = false,
}: {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  muted?: boolean;
}) {
  return (
    <Text
      style={[
        {
          color: muted ? C.muted : C.text,
          fontSize: 15,
          lineHeight: 23,
          flexShrink: 1,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Icon({
  name,
  size = 20,
  color = C.text,
}: {
  name: React.ComponentProps<typeof Feather>["name"];
  size?: number;
  color?: string;
}) {
  return <Feather name={name} size={size} color={color} />;
}
export function Button({
  label,
  accessibilityLabel,
  onPress,
  secondary = false,
  icon,
  disabled = false,
  small = false,
}: {
  label: string;
  accessibilityLabel?: string;
  onPress: () => void;
  secondary?: boolean;
  icon?: React.ComponentProps<typeof Feather>["name"];
  disabled?: boolean;
  small?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: small ? 44 : 54,
          maxWidth: "100%",
          paddingVertical: 10,
          borderRadius: 16,
          paddingHorizontal: small ? 14 : 20,
          backgroundColor: secondary ? C.raised : C.accent,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 9,
          opacity: disabled ? 0.4 : pressed ? 0.75 : 1,
        },
      ]}
    >
      {icon && (
        <Icon name={icon} color={secondary ? C.text : C.dark} size={18} />
      )}
      <T
        style={{
          fontWeight: "700",
          fontSize: small ? 13 : 15,
          textAlign: "center",
          color: secondary ? C.text : C.dark,
        }}
      >
        {label}
      </T>
    </Pressable>
  );
}
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: C.card,
          borderWidth: 1,
          borderColor: C.line,
          borderRadius: 23,
          padding: 22,
          gap: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
export function Label({ children }: { children: React.ReactNode }) {
  return (
    <T
      style={{
        fontSize: 11,
        letterSpacing: 2,
        fontWeight: "700",
        color: C.muted,
      }}
    >
      {children}
    </T>
  );
}
export function Field({
  label,
  value,
  onChange,
  placeholder,
  numeric = false,
  multiline = false,
  onSubmit,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  numeric?: boolean;
  multiline?: boolean;
  onSubmit?: () => void;
}) {
  return (
    <View style={{ gap: 7, flex: 1 }}>
      <T style={{ fontSize: 12, color: C.muted }}>{label}</T>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        returnKeyType={onSubmit ? "send" : "done"}
        placeholder={placeholder}
        placeholderTextColor="#758578"
        keyboardType={numeric ? "decimal-pad" : "default"}
        multiline={multiline}
        style={{
          color: C.text,
          borderWidth: 1,
          borderColor: C.line,
          backgroundColor: C.bg,
          borderRadius: 13,
          padding: 13,
          minHeight: 48,
          fontSize: 16,
        }}
      />
    </View>
  );
}
export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        paddingVertical: 12,
        paddingHorizontal: 16,
        minHeight: 46,
        borderRadius: 13,
        borderWidth: 1,
        borderColor: selected ? C.accent : C.line,
        backgroundColor: selected ? "#293820" : C.card,
      }}
    >
      <T
        style={{
          fontSize: 14,
          color: selected ? C.accent : C.text,
          fontWeight: selected ? "700" : "400",
        }}
      >
        {label}
      </T>
    </Pressable>
  );
}
export const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  title: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: "800",
    letterSpacing: -1.3,
  },
  h2: { fontSize: 22, lineHeight: 29, fontWeight: "700", letterSpacing: -0.5 },
  section: { gap: 16 },
  link: { color: C.accent, fontSize: 13, fontWeight: "600" },
});
