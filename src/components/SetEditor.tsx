import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { PerformedSet } from "../domain/types";
import { Button, Field, Label, T, C, styles as s } from "./ui";
export function SetEditor({
  set,
  index,
  weighted,
  unit,
  patch,
  onConfirm,
  onValidity,
}: {
  set: PerformedSet;
  index: number;
  weighted: boolean;
  unit: string;
  patch: (p: Partial<PerformedSet>) => void;
  onConfirm: () => void;
  onValidity: (id: string, valid: boolean) => void;
}) {
  const [reps, setReps] = useState(String(set.reps));
  const [weight, setWeight] = useState(set.weight?.toString() || "");
  useEffect(() => {
    setReps(String(set.reps));
    setWeight(set.weight?.toString() || "");
  }, [set.reps, set.weight]);
  const validReps =
    reps.trim() !== "" &&
    Number.isInteger(Number(reps)) &&
    Number(reps) > 0 &&
    Number(reps) <= 10000;
  const parsedWeight = Number(weight.replace(",", "."));
  const validWeight =
    !weighted ||
    weight === "" ||
    (Number.isFinite(parsedWeight) &&
      parsedWeight >= 0 &&
      parsedWeight <= 1000);
  const skipped = set.status === "skipped";
  useEffect(() => {
    onValidity(set.id, skipped || (validReps && validWeight));
    return () => onValidity(set.id, true);
  }, [set.id, skipped, validReps, validWeight, onValidity]);
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: set.status === "confirmed" ? "#526C3C" : C.line,
        borderRadius: 16,
        padding: 13,
        gap: 10,
        backgroundColor: set.status === "confirmed" ? "#23301E" : C.bg,
      }}
    >
      <View style={[s.row, { justifyContent: "space-between" }]}>
        <Label>SATZ {index + 1}</Label>
        <T
          style={{
            fontSize: 11,
            color: set.status === "confirmed" ? C.accent : C.muted,
          }}
        >
          {set.status === "confirmed"
            ? "✓ Bestätigt"
            : set.status === "assumed"
              ? "Nach Plan angenommen"
              : skipped
                ? "Ausgelassen"
                : "Vorschlag · unbestätigt"}
        </T>
      </View>
      {!skipped && (
        <>
          <View style={s.row}>
            <Field
              label={`${unit === "seconds" ? "Sekunden" : "Wiederholungen"} Satz ${index + 1}`}
              numeric
              value={reps}
              onChange={(v) => {
                setReps(v);
                const n = Number(v);
                if (v && Number.isInteger(n) && n > 0 && n <= 10000)
                  patch({ reps: n });
              }}
            />
            {weighted && (
              <Field
                label={`Gewicht kg Satz ${index + 1}`}
                numeric
                placeholder="frei wählen"
                value={weight}
                onChange={(v) => {
                  setWeight(v);
                  const n = Number(v.replace(",", "."));
                  if (v === "") patch({ weight: undefined });
                  else if (Number.isFinite(n) && n >= 0 && n <= 1000)
                    patch({ weight: n });
                }}
              />
            )}
          </View>
          {(!validReps || !validWeight) && (
            <T style={{ color: C.red, fontSize: 12 }}>
              Bitte gültige positive Wiederholungen / Sekunden und ein Gewicht
              von 0–1000 kg eingeben.
            </T>
          )}
          {weighted && !weight && (
            <T muted style={{ fontSize: 11 }}>
              Ohne Gewicht zählt der Satz, aber kein Gewichtsvolumen.
            </T>
          )}
        </>
      )}
      <View style={s.row}>
        {set.status !== "confirmed" && !skipped && (
          <View style={{ flex: 1 }}>
            <Button
              label="Bestätigen"
              accessibilityLabel={`Satz ${index + 1} bestätigen`}
              small
              disabled={!validReps || !validWeight}
              onPress={onConfirm}
              icon="check"
            />
          </View>
        )}
        {skipped ? (
          <Button
            label="Wieder aufnehmen"
            accessibilityLabel={`Satz ${index + 1} wieder aufnehmen`}
            secondary
            small
            onPress={() => patch({ status: "pending", confirmedAt: undefined })}
          />
        ) : (
          <Button
            label="Auslassen"
            accessibilityLabel={`Satz ${index + 1} auslassen`}
            secondary
            small
            onPress={() => patch({ status: "skipped", confirmedAt: undefined })}
          />
        )}
      </View>
    </View>
  );
}
