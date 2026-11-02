# PULS · KI-Fitness-Prototyp

Interaktive Fitness-App auf Deutsch mit React Native, Expo SDK 55, Expo Router und TypeScript. Für iOS, Android und Web. Keine Registrierung, kein Backend, keine API-Schlüssel. Der Coach arbeitet **lokal und regelbasiert**, nicht mit einem KI-Modell.

## Starten

Voraussetzung: Node.js 22 LTS oder neuer, npm. In der Cloud wurde Node 24.19 geprüft.

```sh
cd /workspace/AI-Sport  # auf deinem Rechner: in den Projektordner wechseln
npm ci
npm run web
```

Für das Smartphone: `npm start`, den QR-Code mit einer zur SDK-Version passenden Expo-Go-App öffnen. Computer und Smartphone müssen sich erreichen können. `npm run android` bzw. `npm run ios` benötigt einen lokal eingerichteten Android-Emulator bzw. macOS mit Xcode. Native Geräte-/Simulator-Tests wurden in dieser Linux-Umgebung nicht ausgeführt.

In einer eingeschränkten Cloud-Umgebung funktioniert der Web-Start ohne externe Expo-Dienste:

```sh
EXPO_NO_TELEMETRY=1 EXPO_OFFLINE=1 npm run web -- --localhost --port 8081
```

Die Browseradresse steht in der Ausgabe von Expo. Die App auf demselben Ursprung/Port öffnen, damit die lokalen Browserdaten wieder verfügbar sind. Keine Anmeldung oder Cloud-Verbindung erforderlich.

## Ausprobieren

1. Beim Erststart in drei kurzen Schritten Profil, Ziel, Rhythmus und Equipment wählen. Name, Körpergewicht und Einschränkungen sind freiwillig.
2. Unter **Training** den Plan ansehen. Satzanzahl, Zielwerte und Pausen ändern; Übungen gegen verfügbare Alternativen tauschen. Bei fehlenden Alternativen erscheint ein Leerzustand.
3. Auf **Heute → Training starten** tippen. Wiederholungen und optional Last eintragen, einen Satz bestätigen. Erst die Bestätigung macht daraus eine Leistung.
4. Die Einheit verlassen, zwischen Hauptbereichen wechseln oder die Seite neu laden. Über **Training fortsetzen** geht es weiter.
5. Über **Nachtragen & Abschluss** fehlende Sätze ergänzen. Offene Vorschläge einzeln bestätigen, auslassen oder ausdrücklich erklären, dass alle offenen Vorschläge geschafft wurden.
6. Einheit abschließen. Unter **Fortschritt** erscheinen Historie, Gewichtsbestwerte und Diagramm. Eine gespeicherte Einheit öffnen und korrigieren; Änderungen aktualisieren Statistiken sofort.
7. Im **Coach** die Empfehlung mit ihrer Begründung lesen oder eine der unterstützten Fragen stellen. Unter **Profil** Angaben ändern und einen neuen Plan erstellen. Historie und laufendes Training bleiben erhalten.

## Daten und Regeln

- `WorkoutPlan` enthält künftige Sollwerte. Ein `WorkoutSession`-Entwurf erhält einen eigenen unveränderlichen Plan-Snapshot und editierbare Vorschläge aus der letzten bestätigten Leistung.
- `PerformedSet.status` ist `pending`, `confirmed` oder `skipped`. Ausschließlich `confirmed` fließt in Summen und Empfehlungen ein. Eingetragene Werte werden nicht allein durch ihre Eingabe bestätigt.
- Ein Abschluss verlangt mindestens einen bestätigten Satz und keine offenen Vorschläge. Die Session-ID dient als Upsert-Schlüssel; erneutes Speichern erzeugt kein Duplikat. Korrekturen behalten den ursprünglichen Abschlusszeitpunkt.
- Volumen = externe Last in kg × Wiederholungen. Körpergewicht, Übungen ohne externe Last und Haltezeiten sind ausgeschlossen. Ohne eingegebene Last zählt ein bestätigter Satz, aber kein Volumen.
- Dauer = verstrichene Zeit zwischen Start und Abschluss, einschließlich Pausen und Unterbrechungen. Es ist keine Messung aktiver Bewegungszeit.
- Der lokale Übungskatalog enthält 15 Übungen. Anfänger erhalten Ganzkörpertraining; Fortgeschrittene ab vier Tagen einen Ober-/Unterkörper-Split. Equipment begrenzt die Auswahl; gewünschte Ausdauer ergänzt eine Übung. Muskelaufbau verwendet 8–12, die übrigen Ziele 10–14 Wiederholungen; Umfang hängt von Zeit und Niveau ab. Gewichtsabnahme wird nicht durch einen berechneten Kalorienverbrauch versprochen. Die angegebenen Minuten sind Richtwerte, keine exakte Trainingssimulation.
- Körpergewicht wird nur im Profil gespeichert, nicht als Trainingslast eingesetzt. Einschränkungen werden als Notiz gespeichert und **nicht** medizinisch interpretiert. Bei Einschränkungen muss die Übungsauswahl fachlich geprüft werden.
- Coach-Regeln und Grenzwerte liegen zentral in `src/domain/coach.ts`: fehlende Daten → keine Steigerung; verfehlte Ziele → Belastung beibehalten/prüfen; zwei vollständige Leistungen derselben Übung bei gleicher Last und Satzanzahl → vorsichtiger Vorschlag von 2,5 %. Kein automatischer Planumbau, keine Diagnose.
- Es gibt keine simulierten Trainingsleistungen oder Demo-Historie. Diagramme entstehen aus deinen gespeicherten Leistungen.

## Architektur

| Verzeichnis              | Aufgabe                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------- |
| `app/`                   | Expo-Router-Einstiege für Heute, Training, Fortschritt, Coach, Profil und Session       |
| `src/components/`        | Designsystem, responsive Navigation, Onboarding und Trainingsoberflächen                |
| `src/data/exercises.ts`  | Lokale Übungsdaten mit Equipment, Bewegung, Schwierigkeit und Anleitung                 |
| `src/domain/types.ts`    | IDs, Beziehungen und Datenmodelle                                                       |
| `src/domain/training.ts` | Planerstellung, Session-Snapshots, Abschluss und Fortschrittsberechnung                 |
| `src/domain/coach.ts`    | Austauschbare `CoachService`-Schnittstelle und lokale Regeln                            |
| `src/storage/`           | Repository-Schnittstelle, AsyncStorage-Adapter, Schreibwarteschlange und Schema-Prüfung |
| `tests/`, `e2e/`         | Domänen-/Speichertests und Browser-Nutzerabläufe                                        |

`FitnessRepository` und `CoachService` bilden die Austauschgrenzen für spätere Implementierungen. Für Supabase/PostgreSQL werden Authentifizierung, Zugriffskontrollen, Synchronisierung, Konfliktauflösung, Migrationen und eine serverseitige Coach-API zusätzlich benötigt. Keine Schlüssel in die mobile App einbauen. Dieser Prototyp enthält keine fertige Cloud-Synchronisierung.

## Speicherung

Profil, Plan, Trainingsentwurf und Historie werden versioniert unter `puls:data:v1` mit AsyncStorage abgelegt (Web: localStorage). Schreibvorgänge sind serialisiert, damit ältere Schreibvorgänge neuere Änderungen nicht überschreiben. Die Oberfläche zeigt den Speicherstatus und eine Wiederholung bei Fehlern. Beschädigte oder unbekannte Daten werden nicht automatisch überschrieben. Ungültige Zahleneingaben zeigen einen Fehler; nur gültige Zahlen werden gespeichert.

Daten sind lokal und unverschlüsselt. Browser-/App-Daten löschen oder die App deinstallieren kann alle Daten entfernen. Kein Backup, keine geräteübergreifende Synchronisierung und keine Produktionsfreigabe für sensible Gesundheitsdaten. Bei Speicherfehlern die App offen lassen und den sichtbaren Wiederholen-Button verwenden.

## Prüfen

```sh
npm run typecheck
npm test
EXPO_NO_TELEMETRY=1 EXPO_OFFLINE=1 npm run build:web
npm run test:e2e
```

Die Browser-Tests starten den Expo-Server bei Bedarf selbst oder verwenden einen bereits laufenden Server auf Port 8081. Sie nutzen Chromium, falls `/usr/bin/chromium` existiert. Andernfalls einmal `npx playwright install chromium` ausführen. Alternativ den ausführbaren Browser mit `CHROMIUM_PATH` angeben. In der Cloud brauchen Browser und Node-Unterprozesse die entsprechenden Ausführungsrechte.

Die automatisierten Abläufe prüfen Erststart, Planerstellung, Live-Erfassung, Verlassen/Fortsetzen, Neuladen eines Entwurfs, Nachtragen, Abschließen, spätere Korrektur, aktualisierte Fortschrittsdaten sowie Wiederherstellung abgeschlossener Einheiten. Zusätzlich: Übungstausch, Planänderungen und Ablehnung unbestätigter Abschlüsse. Logiktests prüfen Volumen, Snapshots, Doppelabschlüsse, Speicherfehler, Reihenfolge konkurrierender Schreibvorgänge, beschädigte Daten und Coach-Regeln.

## Bewusste Grenzen

Der Prototyp benötigt keine kostenpflichtigen Dienste. Ernährung ist als Ausblick gekennzeichnet. Es gibt keine Barcode-Erkennung, echten KI-Chat, Konten, Push-Nachrichten, verschlüsselte Cloud-Speicherung oder Store-Veröffentlichung. Der Pausentimer wird aus einem gespeicherten Endzeitpunkt rekonstruiert, löst aber keine Hintergrundbenachrichtigung aus. iOS-/Android-Builds und echte Geräte bleiben gesondert zu prüfen.

## Eigenständige Android-Test-App (APK)

Die APK enthält das JavaScript-Bundle und funktioniert ohne Expo Go, Terminal oder Rechner. Internet ist für die lokalen Trainingsfunktionen nicht erforderlich. Paket-ID: `com.aisport.puls`, Version 1.0.0 / VersionCode 1. Erforderlich ist Android 7.0 oder neuer. Der Test-Build unterstützt ARM64- und ARMv7-Geräte.

Auf dem Handy die APK herunterladen, öffnen und der verwendeten Download-/Datei-App bei Bedarf die Installation aus dieser Quelle erlauben. Anschließend PULS wie jede andere App öffnen. Daten aus Expo Go oder einem Browser werden nicht automatisch in die installierte App übertragen. Die Deinstallation löscht lokale Trainingsdaten.

### APK erneut bauen

Voraussetzungen: Node.js, ein vollständiges JDK 17 (vom React-Native-Gradle-Plugin benötigt) und ein Android SDK (Platform 36, Build Tools 36.0.0, NDK 27.1.12297006 und CMake 3.22.1). `JAVA_HOME` und `ANDROID_HOME` passend setzen. Das Android-SDK kann über Android Studio eingerichtet werden. Auf Windows das Bash-Skript mit WSL oder Git Bash ausführen.

```sh
npm ci
npm run build:android:apk
```

Ergebnis: `artifacts/PULS-Android-Test.apk`. Das Skript erzeugt `android/` aus Expo-Konfiguration und installiert keine zusätzlichen npm-Abhängigkeiten. Generierte native Verzeichnisse und APKs gehören nicht ins Git-Repository. Bei Änderungen an den nativen Einstellungen das Prebuild-Skript erneut ausführen.

Diese private Testversion verwendet den öffentlichen Entwicklungs-Testschlüssel des Expo-Android-Templates. Sie ist kein Play-Store-Release. Für eine Veröffentlichung werden ein eigener geschützter Signierschlüssel, Store-Konfiguration und eine geprüfte Release-Pipeline benötigt. Für spätere Test-Updates denselben Paketnamen und Testschlüssel beibehalten; vor einem Wechsel des Schlüssels Datenmigration/Backup planen.
