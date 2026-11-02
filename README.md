# PULS · Training mit wenig Dokumentation

React Native, Expo SDK 55, Expo Router und TypeScript. Deutsch, Dark Mode, lokale Speicherung. Kein Konto, kein Server und keine kostenpflichtige API. Der Coach verwendet transparente Regeln, keine echte KI.

## Neu in 1.3.0: persönlicher lokaler Coach und Übungsbibliothek

Wiederholte Coach-Fragen erzeugen keine mehrfachen Antwortblöcke mehr. Dieselbe Frage aktualisiert ihre vorhandene Antwort; Unterschiede in Großschreibung, Leerzeichen und abschließender Interpunktion werden berücksichtigt. Der lokale Verlauf ist auf 30 unterschiedliche Fragen begrenzt und kann geleert werden. Er wird nicht dauerhaft als Chat gespeichert.

Der Coach nutzt Ziel, Erfahrung, Equipment, Zeitbudget, Kalender und bestätigte Leistungen. Er nennt die Grundlage seiner Antworten und unterscheidet angenommene von bestätigten Sätzen. Unterstützte Themen sind Fortschritt, Belastung, Pausen, Aufwärmen, Technik bekannter Übungen, Motivation, verpasste Einheiten, Kalender, allgemeine Ernährung sowie konkrete Planänderungen. Beschwerden werden nicht diagnostiziert und erzeugen keine medizinisch begründeten Plananpassungen.

**Plan gemeinsam anpassen** bietet eine strukturierte Vorschau für Trainingstage, Dauer, Schwerpunkt und Ziel. Auch unterstützte kurze Anfragen erzeugen Vorschläge, beispielsweise:

- „Ich habe nur 20 Minuten“
- „Plane 3 Tage pro Woche“
- „Ich möchte Cardio trainieren“
- „Ich möchte mit Kettlebell trainieren“
- „Ich möchte ohne Geräte trainieren“
- „Ich möchte leichter trainieren“
- „Ersetze Liegestütze“

Erst **Diese Planänderung übernehmen** schreibt eine Änderung. Die Vorschau erklärt, ob der zukünftige Plan neu erstellt wird oder nur Satzumfang beziehungsweise Übungen geändert werden. Eigene Übungsänderungen können bei einer vollständigen Neuplanung ersetzt werden. Laufende Einheit und Historie bleiben unverändert. Überholte Vorschläge werden nach einer Profil-/Planänderung abgelehnt. Unveränderte Angaben erzeugen keinen unnötigen neuen Plan. Bei unveränderter Wochenhäufigkeit bleibt der ausgewählte Wochentagsrhythmus erhalten.

Neue Zeit-/Zielvorgaben werden nicht durch einen älteren, längeren Trainingsumfang überschrieben. Bekannte Lasten können für dieselbe Übung und Trainingsart übernommen werden. Selbsteinschätzungen werden mit der Trainingsart gespeichert; alte Angaben ohne diese Kennzeichnung gelten als Krafttraining und werden nicht automatisch auf Kraftausdauer übertragen.

Der Katalog enthält jetzt **54 Übungen**, darunter acht Kettlebell-Übungen, weitere Calisthenics-Varianten, funktionelle Übungen und Cardio. Die Bibliothek ist über **Training → Übungsbibliothek** oder den Coach erreichbar. Suche und Filter berücksichtigen Kategorien, Muskelgruppen und Equipment. Eine Übung kann dem gewählten zukünftigen Training hinzugefügt werden; doppelte Einträge derselben Übung werden verhindert. Fortgeschrittene Varianten sind gekennzeichnet und werden Anfängern nicht automatisch eingeplant.

Neue Equipment-Optionen sind Kettlebell, Widerstandsbänder, Ringe, Springseil, Trainingsbox, Ruderergometer und Laufband. **Functional / CrossFit** ergänzt kontrollierte funktionelle Bewegungen und Ausdauer, kein maximales Wettkampfprogramm. **Cardio** ist eine eigene Trainingsart mit fünf Minuten lockerem Einstieg und einem zeitgesteuerten Hauptteil im Sprechtempo. Unterstützte Zeitfenster sind 15, 20, 25, 30, 45 und 60 Minuten. Für geladene Halte-/Trageübungen wird nicht fälschlich Gewicht × Sekunden als Wiederholungsvolumen gezählt.

**Grenze:** Das ist weiterhin ein lokaler Regelcoach mit unterstützten Formulierungen, kein frei verstehendes Sprachmodell. Unbekannte Fragen werden ausdrücklich als nicht zugeordnet benannt. Es gibt keine KI-API, keine serverseitigen Schlüssel und keine Übertragung persönlicher Daten an einen KI-Anbieter. Echte freie KI-Unterhaltung und medizinische Beratung sind nicht implementiert.

## Neu in 1.2.0: Kalender

Über **Heute → Kalender öffnen**, **Training → Kalender & Ruhetage** oder **Profil → Trainingstage planen** erreichst du die Monatsansicht. Grün markiert geplante Trainings, Grau Ruhetage; ein Häkchen zeigt tatsächlich gespeicherte Einheiten. Die Wochenübersicht auf Heute verwendet dieselbe Planung.

Ohne zusätzliche Pflichtangaben wird ein Rhythmus vorgegeben: 2 Tage Mo/Do, 3 Tage Mo/Mi/Fr, 4 Tage Mo/Di/Do/Sa, 5 Tage Mo/Di/Mi/Fr/Sa. Die Trainingstage werden in dieser Reihenfolge mit den Einheiten des aktuellen Plans belegt. Unter **Trainingstage ändern** wählst du genau die im Profil festgelegte Anzahl. Neue Wochenregeln gelten ab ihrem Speicherdatum. Die frühere Planung desselben Plans bleibt für ältere Daten erhalten.

Einzelne Kalendertage können separat mit einer anderen Einheit oder als Ruhetag belegt werden. **Wochenplan übernehmen** entfernt diese Tagesausnahme. Ausnahmen haben Vorrang vor dem Wochenrhythmus. Eine Regeneration des Trainingsplans erzeugt neue Plan-IDs; alte Ausnahmen werden nicht auf andere Einheiten übertragen. Bestehende absolvierte Trainings bleiben unabhängig davon sichtbar.

Vergangene Tage können über **Training für diesen Tag nachtragen** dokumentiert werden. Das gewählte lokale Kalenderdatum wird gesondert gespeichert und für Historie, Wochenzählung und Diagramme verwendet. Die tatsächliche Eingabezeit bleibt erhalten; es wird keine Trainingsdauer erfunden. Zukünftige Tage sind planbar, aber nicht als absolvierte Einheiten erfassbar. Ein laufender Entwurf wird nicht überschrieben.

Kalenderdaten werden lokal und rückwärtskompatibel gespeichert. Es gibt keine automatische Google-/Apple-Kalendersynchronisierung und noch keine Erinnerungen oder Benachrichtigungen.

## Neu in 1.1.0

Der normale Ablauf braucht keine Satzeingaben:

1. Plan ansehen und trainieren. Ein vorheriger Start ist optional.
2. Danach eine Aktion wählen:
   - **Alles wie vorgeschlagen geschafft** bestätigt die noch offenen Leistungswerte und speichert die Einheit.
   - **Etwas war anders** öffnet kompakte Übungskarten mit **Geschafft / Ändern / Ausgelassen**.
   - **Nur Training als absolviert speichern** zählt die Einheit; offene Einzelwerte bleiben **nach Plan angenommen**.
3. Nur bei Abweichungen etwas eingeben. Einzelne Sätze sind über Details erreichbar.

Eine Sammelaktion erhält bereits bestätigte, geänderte und ausgelassene Sätze. Einfache Abschlüsse sind keine erfundenen Leistungen: angenommene Sätze erzeugen weder Rekorde noch bestätigtes Gewichtsvolumen oder Laststeigerungen. Sie können später durch echte Leistungen ergänzt werden.

**Einfach / Nur Abweichungen / Detailliert** sind freiwillige Darstellungen im Training, keine zusätzliche Onboarding-Pflicht. Die Auswahl kann während einer Einheit wechseln, ohne Daten umzudeuten. Der Standard ist die kompakte Darstellung. Keine täglichen Pflicht-Check-ins.

## Auf dem Handy aktualisieren

Android-Paket: `com.aisport.puls` · Version **1.3.0** · **versionCode 4** · Android ab 7.0 (API 24) · ARM64 und ARMv7.

Die neue Test-APK direkt über die bestehende App installieren. **Nicht vorher deinstallieren oder App-Daten löschen**, sonst gehen lokale Trainings verloren. Paketname und Entwicklungsschlüssel werden beibehalten; die Zertifikate der alten APK und des Builds werden beim Bereitstellen verglichen. Es handelt sich um eine private Testversion, nicht um einen Store-Release. Ein erfolgreicher Build und eine geprüfte Signatur ersetzen keinen echten Gerätetest.

Die APK enthält das App-Bundle und funktioniert für die Trainingsfunktionen offline, ohne Expo Go oder laufenden Rechner. Browser-/Expo-Go-Daten werden nicht automatisch übernommen.

## Lokal starten

Node.js ab 22 und npm. Geprüfte Cloud-Toolchain: Node 24.19 / npm 11.9.

```sh
npm ci
npm run web
```

In einer eingeschränkten Cloud-Umgebung:

```sh
EXPO_NO_TELEMETRY=1 EXPO_OFFLINE=1 npm run web -- --localhost --port 8081
```

Für Expo Go: `npm start`. Computer und Handy müssen sich erreichen können. Native Entwicklung: `npm run android` beziehungsweise `npm run ios`; iOS benötigt macOS/Xcode.

## Trainingsarten und Ausgangswerte

Das Onboarding fragt Ziel, Niveau, Rhythmus, Zeit und verfügbares Equipment ab. Name, Körpergewicht, Einschränkungen und bekannte Ausgangswerte bleiben freiwillig.

- **Krafttraining:** kontrollierte Grundbewegungen, typischerweise 8–12 Wiederholungen für Muskelaufbau beziehungsweise 10–14 für die übrigen Ziele.
- **Kraftausdauer:** typischerweise 16–20 Wiederholungen und kürzere Pausen (40 Sekunden); moderate, kontrollierte Belastung.
- **Calisthenics:** Körpergewichtsübungen, typischerweise 6–10 Wiederholungen; anspruchsvollere Varianten nur für entsprechende Erfahrung. Klimmzüge setzen eine sicher montierte, vorhandene Stange voraus.
- **Gemischt:** Tage mit externer Last und Tage mit Körpergewichtsübungen. Equipment begrenzt die Auswahl immer.

Anfänger erhalten einen Ganzkörperplan, Fortgeschrittene ab vier Tagen einen Ober-/Unterkörper-Split. Halteübungen werden in Sekunden, optionale Ausdauer separat geplant. Zeitangaben im Plan sind Richtwerte. Die lokale Datenbank enthält 54 Übungen mit Anleitung und Metadaten; sie ersetzt keine fachliche Beurteilung körperlicher Einschränkungen.

Für konkrete Übungen können freiwillig übliche Bereiche hinterlegt werden, beispielsweise Langhantel-Bankdrücken: **100 kg, 3–4 Sätze, 6–10 Wiederholungen**. Gespeichert werden die ursprünglichen Bereiche und der Zeitpunkt als Selbsteinschätzung. Der konkrete Vorschlag verwendet die untere Satzanzahl und die Mitte des Wiederholungsbereichs, hier 3 × 8 mit 100 kg. Solche Werte sind weder absolvierte Trainings noch ein Maximalkrafttest. Sie werden nicht auf andere Übungen oder Geräte umgerechnet.

Angaben sind im Profil nachträglich bearbeitbar. Eine neue Selbsteinschätzung erstellt einen passenden Plan; laufende Einheiten und Historie bleiben erhalten.

Gewichte sind optional. Belastungshinweise orientieren sich an sauberer Ausführung mit ungefähr zwei möglichen zusätzlichen Wiederholungen, bei Kraftausdauer etwa zwei bis drei. Keine pauschale Aufforderung zum Maximalgewicht, kein erzwungenes Muskelversagen und keine Prozentwerte ohne bekannte Bezugsgröße.

## Dokumentation, Herkunft und Anpassung

- **Plan:** künftige Sollwerte.
- **Selbsteinschätzung:** freiwilliger Ausgangspunkt, noch keine Leistung.
- **Vorschlag / pending:** editierbarer Ausgangswert einer Einheit.
- **Bestätigt / confirmed:** ausdrücklich tatsächlich erreichte Leistung.
- **Nach Plan angenommen / assumed:** Einheit wurde grob als absolviert gespeichert, genaue Einzelwerte sind nicht bestätigt.
- **Ausgelassen / skipped:** zählt nicht als absolvierte Leistung.

Eine Übung mit **Geschafft** bestätigt ihre angezeigten Werte. **Ändern** bearbeitet Satzanzahl, gemeinsame Wiederholungen/Haltezeit und optional Gewicht. Erst **Werte übernehmen & geschafft** bestätigt diese Eingabe. Noch offene gemeinsame Eingaben werden als eigener Entwurf automatisch gespeichert und nach Neustart wieder angeboten; sie blockieren einen versehentlichen Sammelabschluss. **Abbrechen** verwirft nur diese unübernommene Eingabe. In den Details sind unterschiedliche Sätze und der Pausentimer verfügbar.

Für das nächste passende Training werden die neuesten bestätigten Werte derselben Übung und Trainingsart vorgeschlagen. Vollständig bestätigte Übungsleistungen können auch eine geänderte Satzanzahl übernehmen. Bloß angenommene Werte werden übersprungen. Neuere manuelle Planänderungen und neuere Selbsteinschätzungen haben Vorrang vor älteren Leistungen. Ein Wechsel der Darstellung ist keine neue Leistung. Änderungen eines Plans wirken nicht auf den bereits laufenden Session-Snapshot.

Der Demo-Coach prüft vergleichbare, bestätigte Übungsleistungen. Verfehlte Ziele führen zu vorsichtigen Hinweisen, nicht zu einem sofortigen Planumbau. Wiederholt erreichte Ziele können einen kleinen nächsten Schritt begründen: beispielsweise 2,5 % mehr Gewicht oder eine zusätzliche Wiederholung beziehungsweise fünf Sekunden bei Körpergewichts-/Halteübungen. Ein passender Vorschlag muss bewusst für zukünftige Trainings übernommen werden; bestehende Einheiten bleiben unverändert. Keine automatischen, unbegrenzten Steigerungen oder medizinischen Diagnosen. Bei fehlenden Daten bleibt die Empfehlung allgemein.

## Fortschritt und Zeit

Trainingshäufigkeit zählt gespeicherte Einheiten auch ohne detaillierte Zahlen. Leistungsdiagramme und Rekorde verwenden ausschließlich geeignete bestätigte Daten. Fehlende Gewichte werden nicht als gemessene Nullgewichte gezeichnet.

Gewichtsvolumen = bekannte externe Last × bestätigte Wiederholungen. Körpergewicht, Haltezeiten und angenommene Werte sind ausgenommen. Satzanzahl und Wiederholungen bleiben auch ohne Last nutzbar.

**Schon trainiert? Jetzt eintragen** auf Heute beziehungsweise **Dieses Training nachtragen** im Plan benötigt keinen vorherigen Start. Ohne bekannte Startzeit bleibt die Dauer unbekannt; eine optionale manuelle Dauer ist möglich. Bei gestarteten Einheiten ist die angezeigte Dauer verstrichene Zeit einschließlich Unterbrechungen, keine Sensor-Messung aktiver Bewegungszeit.

## Speicherung und Kompatibilität

AsyncStorage unter dem bestehenden Schlüssel `puls:data:v1` (Web: localStorage). Das Format wird rückwärtskompatibel mit optionalen Feldern erweitert. Alte Profile, Plan-IDs, bestätigte Leistungen und Entwürfe bleiben erhalten; fehlende neue Felder haben sichere Standardwerte. Keine automatische Zurücksetzung, keine Umdeutung alter Vorschläge in Leistungen. Die alte App-Version sollte nach Nutzung der neuen Datentypen nicht wieder installiert werden.

Schreibvorgänge werden serialisiert. Speicherfehler erscheinen mit einer Wiederholungsmöglichkeit. Beschädigte oder unbekannte Daten werden nicht still überschrieben. Ein Abschluss speichert per Session-ID und erzeugt beim erneuten Speichern kein Duplikat. Korrekturen behalten den ursprünglichen Abschlusszeitpunkt.

Daten bleiben lokal und sind nicht verschlüsselt. Deinstallation oder Löschen von Browser-/App-Daten kann sie entfernen. Android-Systembackup ist für diese Test-App deaktiviert. Keine Cloud-Synchronisierung.

## Architektur

| Pfad                              | Aufgabe                                                             |
| --------------------------------- | ------------------------------------------------------------------- |
| `app/`                            | Expo-Router-Einstiege                                               |
| `src/screens/`                    | Heute, Training, Fortschritt, Coach, Profil                         |
| `src/components/Session.tsx`      | Einfacher Abschluss, Darstellung und Wiederaufnahme                 |
| `src/components/ExerciseCard.tsx` | Kompakte Übung und gemeinsame Eingabe                               |
| `src/components/SetEditor.tsx`    | Freiwillige Satzdetails                                             |
| `src/components/Assessments.tsx`  | Freiwillige Ausgangswerte                                           |
| `src/components/ui.tsx`           | Designsystem                                                        |
| `src/data/exercises.ts`           | Equipmentabhängiger Übungskatalog                                   |
| `src/domain/`                     | Typen, Planerstellung, Berechnungen, Regeln und Coach-Schnittstelle |
| `src/storage/`                    | Repository, Schema-Prüfung, Schreibwarteschlange                    |
| `tests/`, `e2e/`                  | Logik-/Speichertests und Browser-Nutzerabläufe                      |

`FitnessRepository` und `CoachService` bleiben die Austauschgrenzen für eine spätere Backend-Integration. Konten, sichere Synchronisierung, serverseitige KI und Zugriffskontrollen sind zukünftige Arbeiten. API-Schlüssel gehören nicht in die mobile App.

## Prüfen und Android-APK bauen

```sh
npm run typecheck
npm test
npm run test:e2e
EXPO_NO_TELEMETRY=1 EXPO_OFFLINE=1 npm run build:web
```

Browser-Tests starten ihren Expo-Server bei Bedarf selbst auf localhost:8081. Verwendet wird `/usr/bin/chromium`, wenn vorhanden; andernfalls `npx playwright install chromium` ausführen oder `CHROMIUM_PATH` setzen. Die Tests haben eigene Browserkontexte und verändern keine tatsächlichen Nutzerprofile.

Für die Android-APK: vollständiges JDK 17, Android Platform 36, Build Tools 36.0.0, NDK 27.1.12297006 und CMake 3.22.1. `JAVA_HOME` und `ANDROID_HOME` setzen. Auf Windows das Bash-Skript etwa mit WSL oder Git Bash verwenden.

```sh
npm ci
npm run build:android:apk
```

Ergebnis: `artifacts/PULS-Android-Test.apk`. Das Skript generiert `android/` aus der Expo-Konfiguration. APKs, generierte native Verzeichnisse und Signierschlüssel sind vom Git-Repository ausgeschlossen. In eingeschränkten Netzwerken werden die Paketquellen einschließlich `repo.reactnative.dev` benötigt; bestehende Proxy- und TLS-Verifikation beibehalten.

Die private APK verwendet den öffentlichen Entwicklungsschlüssel des Expo-Templates. Für einen späteren Store-Release sind eine eigene geschützte Signieridentität und eine separate Release-Pipeline erforderlich. Ernährung, Abos und Werbung werden in dieser Version nicht implementiert.

## PC-Paket erstellen

`npm run package:pc` baut die Browser-App und legt unter `artifacts/PULS-PC-<Version>` eine startbereite Browser-Version mit Windows-Startdatei ab. Node.js ab 22 muss auf dem PC vorhanden sein; npm-Abhängigkeiten oder Expo werden für die Nutzung dieses Pakets nicht benötigt. Das Startprogramm bindet ausschließlich an `127.0.0.1:4173`. Dies ist keine native Windows-EXE.

PC-Updates in einen neuen Ordner entpacken und das alte PULS-Startfenster zuerst schließen. Im selben Browser unter derselben lokalen Adresse bleiben die vorhandenen Daten verfügbar. Kein Privatmodus und keine Browserdaten löschen. PC- und Handy-Daten werden weiterhin nicht synchronisiert.
