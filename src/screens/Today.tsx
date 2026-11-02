import React from "react";
import { View, Pressable, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { useStore } from "../storage/store";
import { record, startSession } from "../domain/training";
import { demoCoach } from "../domain/coach";
import { goals } from "../components/Onboarding";
import { Button, Card, Icon, Label, T, C, styles as s } from "../components/ui";
import { Heading } from "./Heading";
import { SessionRow } from "./SessionRow";
export function Today() {
  const { data, update } = useStore();
  const wide = useWindowDimensions().width > 1100;
  const p = data.profile!;
  const plan = data.plan!;
  const next =
    plan.workouts[
      data.sessions.filter((x) => x.planId === plan.id).length %
        plan.workouts.length
    ];
  const total = data.sessions.reduce((n, x) => n + record(x).sets, 0);
  const rec = demoCoach.recommend(
    data.sessions.filter(
      (s) =>
        (s.trainingStyle || "strength") === (p.trainingStyle || "strength"),
    ),
  )[0];
  const now = new Date();
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const thisWeek = data.sessions.filter(
    (x) => Date.parse(x.completedAt!) >= monday.getTime(),
  ).length;
  function start() {
    if (!data.draft)
      update((d) => ({ ...d, draft: startSession(plan, next.id, d.sessions) }));
    router.push("/session");
  }
  return (
    <>
      <View
        style={[
          s.row,
          { justifyContent: "space-between", alignItems: "flex-start" },
        ]}
      >
        <Heading
          eyebrow={now
            .toLocaleDateString("de-DE", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })
            .toUpperCase()}
          title={`Gut, dass du da bist, ${p.name}.`}
          description="Ein bisschen stärker. Eine Einheit nach der anderen."
        />
        <View
          style={{
            padding: 13,
            borderRadius: 40,
            borderWidth: 1,
            borderColor: C.line,
          }}
        >
          <Icon name="sun" color={C.accent} size={23} />
        </View>
      </View>
      <View style={{ flexDirection: wide ? "row" : "column", gap: 22 }}>
        <View style={{ flex: wide ? 1.6 : undefined, gap: 22 }}>
          <Card
            style={{
              backgroundColor: "#253321",
              borderColor: "#425336",
              padding: 26,
              overflow: "hidden",
            }}
          >
            <View style={[s.row, { justifyContent: "space-between" }]}>
              <View
                style={[
                  s.row,
                  {
                    backgroundColor: "#34472A",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 8,
                  },
                ]}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: C.accent,
                  }}
                />
                <T
                  style={{
                    fontSize: 11,
                    color: C.accent,
                    fontWeight: "700",
                    letterSpacing: 1,
                  }}
                >
                  DEIN NÄCHSTES TRAINING
                </T>
              </View>
              <Icon name="arrow-up-right" color={C.accent} />
            </View>
            <View style={{ gap: 8, paddingVertical: 8 }}>
              <T
                style={{
                  fontSize: 42,
                  lineHeight: 48,
                  fontWeight: "800",
                  letterSpacing: -1.8,
                }}
              >
                {data.draft?.name || next.name}
              </T>
              <T style={{ color: "#BDCCB5" }}>{next.focus}</T>
            </View>
            <View style={s.row}>
              <Icon name="clock" size={16} color="#BDCCB5" />
              <T style={{ color: "#BDCCB5", fontSize: 13 }}>
                ca. {p.minutes} Min.
              </T>
              <T muted>·</T>
              <Icon name="layers" size={16} color="#BDCCB5" />
              <T style={{ color: "#BDCCB5", fontSize: 13 }}>
                {next.exercises.length} Übungen
              </T>
            </View>
            <View style={{ flexDirection: "row", gap: 6, paddingVertical: 8 }}>
              {next.exercises.slice(0, 5).map((e, i) => (
                <View
                  key={e.id}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 10,
                    backgroundColor: i % 2 ? "#34442D" : "#3B4D32",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon
                    name={
                      ["activity", "trending-up", "target", "zap", "heart"][
                        i
                      ] as "activity"
                    }
                    color={i === 0 ? C.accent : "#A8BD9A"}
                    size={24}
                  />
                </View>
              ))}
            </View>
            <Button
              label={data.draft ? "Training fortsetzen" : "Training starten"}
              icon="play"
              onPress={start}
            />
            {!data.draft && (
              <Button
                label="Schon trainiert? Jetzt eintragen"
                secondary
                onPress={() => {
                  update((d) => ({
                    ...d,
                    draft: startSession(plan, next.id, d.sessions, {
                      posthoc: true,
                    }),
                  }));
                  router.push("/session");
                }}
              />
            )}
            <T style={{ fontSize: 11, textAlign: "center", color: "#A8BD9A" }}>
              Handy weglegen. Danach mit einer Aktion abschließen.
            </T>
          </Card>
          <View style={s.row}>
            <T style={[s.h2, { flex: 1 }]}>Deine Woche</T>
            <T muted style={{ fontSize: 12 }}>
              {thisWeek} von {p.days} Einheiten
            </T>
          </View>
          <Card>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              {["M", "D", "M", "D", "F", "S", "S"].map((day, i) => {
                const date = new Date(monday);
                date.setDate(date.getDate() + i);
                const done = data.sessions.some(
                  (x) =>
                    new Date(x.completedAt!).toDateString() ===
                    date.toDateString(),
                );
                const today = now.toDateString() === date.toDateString();
                return (
                  <View key={i} style={{ alignItems: "center", gap: 9 }}>
                    <T muted style={{ fontSize: 11 }}>
                      {day}
                    </T>
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 18,
                        backgroundColor: done
                          ? C.accent
                          : today
                            ? C.raised
                            : "transparent",
                        borderWidth: 1,
                        borderColor: today ? C.accent : C.line,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {done ? (
                        <Icon name="check" color={C.dark} size={16} />
                      ) : (
                        <T
                          style={{
                            fontSize: 12,
                            color: today ? C.accent : C.muted,
                          }}
                        >
                          {date.getDate()}
                        </T>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
            <View
              style={{ height: 5, backgroundColor: C.raised, borderRadius: 3 }}
            >
              <View
                style={{
                  height: 5,
                  backgroundColor: C.accent,
                  borderRadius: 3,
                  width: `${Math.min(100, (thisWeek / p.days) * 100)}%`,
                }}
              />
            </View>
            <T muted style={{ fontSize: 12 }}>
              Dein Rhythmus zählt. Die Trainingstage bleiben flexibel.
            </T>
          </Card>
        </View>
        <View style={{ flex: 1, gap: 22 }}>
          <View style={s.row}>
            <Card style={{ flex: 1, padding: 17 }}>
              <Icon name="activity" color={C.accent} />
              <T style={{ fontSize: 30, lineHeight: 35, fontWeight: "800" }}>
                {data.sessions.length}
              </T>
              <T muted style={{ fontSize: 11 }}>
                Einheiten gesamt
              </T>
            </Card>
            <Card style={{ flex: 1, padding: 17 }}>
              <Icon name="check-circle" color={C.accent} />
              <T style={{ fontSize: 30, lineHeight: 35, fontWeight: "800" }}>
                {total}
              </T>
              <T muted style={{ fontSize: 11 }}>
                Bestätigte Sätze
              </T>
            </Card>
          </View>
          <Card>
            <View style={s.row}>
              <View
                style={{
                  backgroundColor: "#35442A",
                  padding: 10,
                  borderRadius: 13,
                }}
              >
                <Icon name="zap" color={C.accent} />
              </View>
              <View>
                <T style={{ fontWeight: "700" }}>Ein Impuls für dich</T>
                <T muted style={{ fontSize: 10 }}>
                  DEMO-COACH · REGELBASIERT
                </T>
              </View>
            </View>
            <T style={{ fontSize: 19, fontWeight: "700" }}>{rec.title}</T>
            <T muted style={{ fontSize: 13 }}>
              {rec.message}
            </T>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/coach")}
              style={{ minHeight: 44, justifyContent: "center" }}
            >
              <T style={s.link}>Empfehlung verstehen ↗</T>
            </Pressable>
          </Card>
          <Card>
            <Label>DEIN FOKUS</Label>
            <T style={s.h2}>{goals[p.goal]}</T>
            <T muted style={{ fontSize: 13 }}>
              {p.days} Tage / Woche ·{" "}
              {p.level === "beginner" ? "Einsteiger" : "Fortgeschritten"}
              <T>{"\n"}</T>
              {p.location === "gym" ? "Fitnessstudio" : "Zu Hause"} ·{" "}
              {p.minutes} Minuten
            </T>
            <Button
              label="Trainingsplan ansehen"
              secondary
              small
              onPress={() => router.push("/training")}
            />
          </Card>
        </View>
      </View>
      <View style={s.row}>
        <T style={[s.h2, { flex: 1 }]}>Zuletzt trainiert</T>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/progress")}
          style={{ minHeight: 44, justifyContent: "center" }}
        >
          <T style={s.link}>Verlauf ansehen →</T>
        </Pressable>
      </View>
      {data.sessions.length ? (
        <SessionRow id={data.sessions[0].id} />
      ) : (
        <Card>
          <View style={s.row}>
            <Icon name="flag" color={C.muted} />
            <View style={{ flex: 1 }}>
              <T>Hier beginnt deine Geschichte.</T>
              <T muted style={{ fontSize: 12 }}>
                Deine erste abgeschlossene Einheit erscheint hier.
              </T>
            </View>
          </View>
        </Card>
      )}
    </>
  );
}
