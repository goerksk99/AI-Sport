import React, { useState } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { useStore } from "../storage/store";
import {
  calendarDay,
  monthCells,
  weekdaysFor,
  weekdayLabels,
  setWeeklySchedule,
  setCalendarDay,
  resetCalendarDay,
} from "../domain/calendar";
import { dateKey, localDate } from "../domain/dates";
import { startSession } from "../domain/training";
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
export function Calendar() {
  const { data, update } = useStore();
  const today = dateKey(new Date());
  const [selected, setSelected] = useState(today);
  const [month, setMonth] = useState(() => localDate(today));
  const [settings, setSettings] = useState(false);
  const [days, setDays] = useState(() => weekdaysFor(data, today));
  const [error, setError] = useState("");
  const [width, setWidth] = useState(308);
  const cells = monthCells(month);
  const state = calendarDay(data, selected);
  const future = selected > today;
  function move(offset: number) {
    setMonth(new Date(month.getFullYear(), month.getMonth() + offset, 1, 12));
  }
  function openSettings() {
    setDays(weekdaysFor(data, today));
    setError("");
    setSettings(!settings);
  }
  function saveWeek() {
    try {
      update((d) => setWeeklySchedule(d, days));
      setSettings(false);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function train() {
    if (!data.draft && state.workout)
      update((d) => ({
        ...d,
        draft: startSession(d.plan!, state.workout!.id, d.sessions, {
          posthoc: selected !== today,
          trainingDate: selected,
        }),
      }));
    router.push("/session");
  }
  return (
    <>
      <Heading
        eyebrow="DEIN RHYTHMUS"
        title="Training braucht auch Pausen."
        description="Dein Kalender für Training, Ruhetage und abgeschlossene Einheiten."
      />
      <View style={s.wrap}>
        <Button
          label="Trainingstage ändern"
          icon="sliders"
          secondary
          onPress={openSettings}
        />
        <Button
          label="Heute"
          secondary
          small
          onPress={() => {
            setSelected(today);
            setMonth(localDate(today));
          }}
        />
      </View>
      {settings && (
        <Card>
          <T style={s.h2}>{data.profile!.days} Trainingstage pro Woche</T>
          <T muted>
            Wähle genau {data.profile!.days} Tage. Die übrigen Tage sind
            Ruhetage. Die Änderung gilt ab heute; einzelne Tage kannst du
            separat anpassen.
          </T>
          <View style={s.wrap}>
            {weekdayLabels.map((label, i) => (
              <Chip
                key={i}
                label={label}
                selected={days.includes(i)}
                onPress={() =>
                  setDays((old) =>
                    old.includes(i) ? old.filter((x) => x !== i) : [...old, i],
                  )
                }
              />
            ))}
          </View>
          <T muted>
            {days.length} von {data.profile!.days} ausgewählt
          </T>
          <Button
            label="Wochenrhythmus speichern"
            disabled={days.length !== data.profile!.days}
            onPress={saveWeek}
          />
        </Card>
      )}
      <Card style={{ padding: 14 }}>
        <View style={[s.row, { justifyContent: "space-between" }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voriger Monat"
            onPress={() => move(-1)}
            style={{
              minWidth: 44,
              minHeight: 44,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="chevron-left" />
          </Pressable>
          <T style={s.h2}>
            {month.toLocaleDateString("de-DE", {
              month: "long",
              year: "numeric",
            })}
          </T>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Nächster Monat"
            onPress={() => move(1)}
            style={{
              minWidth: 44,
              minHeight: 44,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="chevron-right" />
          </Pressable>
        </View>
        <View
          onLayout={(event) =>
            setWidth(Math.max(308, event.nativeEvent.layout.width))
          }
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ width }}>
              <View style={{ flexDirection: "row" }}>
                {weekdayLabels.map((label, i) => (
                  <View
                    key={i}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      paddingVertical: 8,
                    }}
                  >
                    <Label>{label}</Label>
                  </View>
                ))}
              </View>
              {Array.from({ length: cells.length / 7 }, (_, row) => (
                <View key={row} style={{ flexDirection: "row" }}>
                  {cells.slice(row * 7, row * 7 + 7).map((key, i) => {
                    if (!key)
                      return (
                        <View key={i} style={{ flex: 1, minHeight: 62 }} />
                      );
                    const day = calendarDay(data, key);
                    const label =
                      day.kind === "workout"
                        ? "Training"
                        : day.kind === "rest"
                          ? "Ruhetag"
                          : "Ohne Plan";
                    const done = day.completed.length > 0;
                    return (
                      <Pressable
                        key={key}
                        accessibilityRole="button"
                        accessibilityLabel={`${key}: ${label}${done ? ", absolviert" : ""}`}
                        accessibilityState={{ selected: key === selected }}
                        onPress={() => setSelected(key)}
                        style={{
                          flex: 1,
                          minHeight: 62,
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 5,
                          borderWidth: 1,
                          borderColor:
                            key === selected
                              ? C.accent
                              : key === today
                                ? C.muted
                                : "transparent",
                          borderRadius: 12,
                          backgroundColor:
                            key === selected ? "#293820" : "transparent",
                        }}
                      >
                        <T
                          style={{
                            fontWeight: key === today ? "800" : "500",
                            color:
                              key === today
                                ? C.accent
                                : day.kind === "unplanned"
                                  ? C.muted
                                  : C.text,
                          }}
                        >
                          {localDate(key).getDate()}
                        </T>
                        <View style={{ flexDirection: "row", gap: 3 }}>
                          <View
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: 4,
                              backgroundColor:
                                day.kind === "workout"
                                  ? C.accent
                                  : day.kind === "rest"
                                    ? C.muted
                                    : "transparent",
                            }}
                          />
                          {done && (
                            <Icon name="check" size={12} color="#83D3B2" />
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
        <View style={s.wrap}>
          <T style={{ color: C.accent, fontSize: 12 }}>● Training</T>
          <T muted style={{ fontSize: 12 }}>
            ● Ruhetag
          </T>
          <T style={{ color: "#83D3B2", fontSize: 12 }}>✓ Absolviert</T>
        </View>
      </Card>
      <Card>
        <Label>
          {localDate(selected)
            .toLocaleDateString("de-DE", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })
            .toUpperCase()}
        </Label>
        <T style={s.h2}>
          {state.workout?.name ||
            (state.kind === "rest" ? "Ruhetag" : "Noch kein Training geplant")}
        </T>
        <T muted>
          {state.kind === "rest"
            ? "Zeit für Erholung. Ein Spaziergang oder lockere Bewegung ist optional."
            : state.workout
              ? `${state.workout.exercises.length} Übungen · ca. ${data.profile!.minutes} Minuten. Planung ist keine bestätigte Leistung.`
              : "Vor Beginn deines aktuellen Plans sind keine Trainingstage automatisch eingetragen."}
        </T>
        {data.draft ? (
          <Button
            label="Laufendes Training fortsetzen"
            icon="play"
            onPress={() => router.push("/session")}
          />
        ) : (
          state.workout &&
          !future && (
            <Button
              label={
                selected === today
                  ? "Training starten"
                  : "Training für diesen Tag nachtragen"
              }
              icon="play"
              onPress={train}
            />
          )
        )}
        {future && (
          <T muted style={{ fontSize: 12 }}>
            Zukünftige Tage können geplant, aber noch nicht als absolvierte
            Trainings erfasst werden.
          </T>
        )}
        <Label>TAGESPLAN ANPASSEN</Label>
        <View style={s.wrap}>
          {data.plan!.workouts.map((w) => (
            <Chip
              key={w.id}
              label={w.name}
              selected={state.workout?.id === w.id}
              onPress={() => update((d) => setCalendarDay(d, selected, w.id))}
            />
          ))}
        </View>
        <View style={s.wrap}>
          <Button
            label="Als Ruhetag planen"
            small
            secondary
            onPress={() => update((d) => setCalendarDay(d, selected))}
          />
          {state.overridden && (
            <Button
              label="Wochenplan übernehmen"
              secondary
              small
              onPress={() => update((d) => resetCalendarDay(d, selected))}
            />
          )}
        </View>
      </Card>
      {state.completed.length > 0 && (
        <View style={{ gap: 12 }}>
          <T style={s.h2}>An diesem Tag absolviert</T>
          {state.completed.map((session) => (
            <SessionRow key={session.id} id={session.id} />
          ))}
        </View>
      )}
      {!!error && <T style={{ color: C.red }}>{error}</T>}
      <T muted style={{ fontSize: 12 }}>
        Die Planung bleibt flexibel und wird lokal gespeichert. Eine
        Planänderung verändert keine bereits dokumentierten Leistungen. Keine
        Erinnerungen oder externe Kalendersynchronisierung.
      </T>
    </>
  );
}
