import React from "react";
import {
  View,
  ScrollView,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { router, usePathname } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../storage/store";
import { Onboarding } from "./Onboarding";
import { C, T, Icon, Label, Button, styles as s } from "./ui";
const tabs = [
  { path: "/", label: "Heute", icon: "grid" },
  { path: "/training", label: "Training", icon: "activity" },
  { path: "/progress", label: "Fortschritt", icon: "bar-chart-2" },
  { path: "/coach", label: "Coach", icon: "message-circle" },
  { path: "/profile", label: "Profil", icon: "user" },
] as const;
export function Shell({ children }: { children: React.ReactNode }) {
  const { data, ready, error, saving, retry } = useStore();
  const { width } = useWindowDimensions();
  const path = usePathname();
  const wide = width >= 950;
  if (!ready)
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: C.bg,
          justifyContent: "center",
          alignItems: "center",
          padding: 30,
          gap: 20,
        }}
      >
        {error ? (
          <>
            <T>{error}</T>
            <Button label="Erneut laden" onPress={retry} />
          </>
        ) : (
          <>
            <ActivityIndicator color={C.accent} />
            <T>Daten werden geladen …</T>
          </>
        )}
      </SafeAreaView>
    );
  if (!data.profile)
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <Onboarding />
        {error && <T style={{ color: C.red, padding: 20 }}>{error}</T>}
      </SafeAreaView>
    );
  const nav = (vertical: boolean) => (
    <View
      style={
        vertical
          ? { gap: 9 }
          : {
              flexDirection: "row",
              justifyContent: "space-around",
              paddingVertical: 8,
              borderTopWidth: 1,
              borderColor: C.line,
              backgroundColor: C.bg,
            }
      }
    >
      {tabs.map((t) => {
        const active = path === t.path;
        return (
          <Pressable
            key={t.path}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={t.label}
            onPress={() => router.push(t.path)}
            style={[
              vertical
                ? {
                    flexDirection: "row",
                    gap: 14,
                    paddingHorizontal: 18,
                    paddingVertical: 16,
                    borderRadius: 14,
                  }
                : {
                    alignItems: "center",
                    gap: 4,
                    minWidth: 58,
                    padding: 6,
                    minHeight: 52,
                  },
              {
                backgroundColor: active && vertical ? "#293522" : "transparent",
              },
            ]}
          >
            <Icon name={t.icon} color={active ? C.accent : C.muted} size={20} />
            <T
              style={{
                fontSize: vertical ? 14 : 10,
                fontWeight: active ? "700" : "500",
                color: active ? C.accent : C.muted,
              }}
            >
              {t.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {wide && (
          <View
            style={{
              width: 224,
              borderRightWidth: 1,
              borderColor: C.line,
              padding: 22,
              paddingTop: 34,
              gap: 50,
            }}
          >
            <View>
              <T style={{ fontSize: 29, fontWeight: "900", letterSpacing: 4 }}>
                PULS<T style={{ color: C.accent }}> •</T>
              </T>
              <T muted style={{ fontSize: 10, letterSpacing: 2 }}>
                DEIN TRAINING. DEIN TAKT.
              </T>
            </View>
            {nav(true)}
            <View style={{ flex: 1 }} />
            <View style={{ gap: 14 }}>
              <View
                style={[
                  s.row,
                  { backgroundColor: C.card, padding: 13, borderRadius: 14 },
                ]}
              >
                <View
                  style={{
                    backgroundColor: C.raised,
                    borderRadius: 20,
                    width: 34,
                    height: 34,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <T style={{ color: C.accent, fontWeight: "700" }}>
                    {data.profile.name[0].toUpperCase()}
                  </T>
                </View>
                <View>
                  <T style={{ fontWeight: "600", fontSize: 13 }}>
                    {data.profile.name}
                  </T>
                  <T muted style={{ fontSize: 10 }}>
                    Lokales Profil
                  </T>
                </View>
              </View>
              <T muted style={{ fontSize: 10 }}>
                PROTOTYP 01 · LOKAL & PRIVAT
              </T>
            </View>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              padding: wide ? 38 : 22,
              paddingBottom: 40,
              width: "100%",
              maxWidth: 1260,
              alignSelf: "center",
              gap: 26,
            }}
          >
            <View style={[s.row, { justifyContent: "space-between" }]}>
              <Label>
                {wide
                  ? "DEIN PERSÖNLICHER TRAININGSRAUM"
                  : "PULS • DEIN TRAINING"}
              </Label>
              <View style={s.row}>
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: error ? C.red : C.accent,
                  }}
                />
                <T muted style={{ fontSize: 11 }}>
                  {error
                    ? "Speicherfehler"
                    : saving
                      ? "Speichert …"
                      : "Lokal gespeichert"}
                </T>
              </View>
            </View>
            {error && (
              <View style={{ gap: 10 }}>
                <T style={{ color: C.red }}>{error}</T>
                <Button
                  label="Speichern erneut versuchen"
                  onPress={retry}
                  secondary
                />
              </View>
            )}
            {data.draft && path !== "/session" && (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/session")}
                style={[
                  s.row,
                  {
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: "#293522",
                    justifyContent: "space-between",
                  },
                ]}
              >
                <T style={{ color: C.accent, fontSize: 13 }}>
                  Training läuft · {data.draft.name}
                </T>
                <Icon name="arrow-right" color={C.accent} />
              </Pressable>
            )}
            {children}
          </ScrollView>
          {!wide && nav(false)}
        </View>
      </View>
    </SafeAreaView>
  );
}
