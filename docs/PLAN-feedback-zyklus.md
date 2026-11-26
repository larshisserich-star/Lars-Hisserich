# Plan: Feedback-Zyklus (Folgemails, Wiedervorlage, richtige Person, Fragen beantworten)

Stand 26.11.2026. Noch nicht gebaut. Erst `docs/ARCHITEKTUR.md` lesen. Ziel: Jede Nachricht bekommt eine passende nächste Handlung mit Termin, und **jede Folgemail bringt etwas Neues** (Antwort, neuer Anlass, neue Person, neues Angebot).

## Regeln: Ergebnis → nächste Handlung

| Ergebnis | Handlung | Termin |
|---|---|---|
| keine Antwort | 1. Nachfassen (kurz, neuer Gedanke, kein „Haben Sie meine Mail gesehen?“) | nach 7 Tagen |
| weiter keine Antwort | 2. und letztes Nachfassen, mit neuem Anlass (z. B. neue Stelle aus dem Suchlauf), danach ruhen | weitere 14 Tage |
| später / keine Zeit | Wiedervorlage; Folgemail knüpft ausdrücklich an („Sie hatten gebeten, mich im Januar zu melden“) und bringt etwas Neues | genanntes Datum, sonst 60 Tage |
| falsche Person | Mail an die genannte Person („Frau X hat mich an Sie verwiesen“); wird keine genannt: nächste HR-/Vertriebsperson der Firma; höfliche Dankesmail an die erste Person ist optional | sofort bzw. am nächsten Lauf |
| Rückfrage | Die nächste Mail beantwortet genau die gestellten Fragen, danach wieder die kleine Bitte | am nächsten Lauf |
| Interesse | zwei Terminvorschläge | am nächsten Lauf |
| Termin | Vorbereitungsaufgabe, nach dem Termin Gesprächsnotiz und Projektidee | am Termintag |
| Absage | Sperre, nie wieder anschreiben; Grund fließt ins Lernen ein | – |

Höchstens 4 Runden je Thread, höchstens 2 Nachfass-Mails je Person.

## Fragen beantworten (Wissensbasis)
- Neue Sammlung `lernen/wissen`: Fakten zu Angeboten und Professur, **nur** aus der Professurseite (https://www.uni-giessen.de/de/fbz/fb02/fb/professuren/bwl/marketing-verkaufsmanagement/unternehmen) und den Beschreibungen in `config.js`. Der Lauf liest die Seite, speichert Auszug mit Datum und Link, nicht mehr als nötig.
- Antworten nutzen nur diese Fakten. Ist eine Frage damit nicht zu beantworten (Preise, Termine, Zusagen, Details): **nicht raten**, sondern Aufgabe für einen Menschen („Frage von X beantworten“) und in der Mail ehrlich sagen, dass die Professur das im Gespräch klärt.
- Lernen: Fragen werden gezählt (Thema: Aufwand, Dauer, Kosten, Ablauf, Datenschutz, Ansprechperson). Wird ein Thema oft gefragt, nennt schon die Erstmail die Antwort (Eintrag in `hinweise_entwurf`).

## Qualität der Folgemail
Zusätzliches Kriterium in der Qualitätsprüfung: **„neu“ (0–2)**. Enthält die Mail nichts Neues gegenüber der vorigen, wird sie neu geschrieben oder nicht verschickt. Dashboard zeigt je Folgemail-Art, was sie gebracht hat (Antwort, Termin).

## Zeitraffer
Damit nicht echte Wochen vergehen müssen: Einstellung `sim_datum` (virtuelles Heute der Simulation) und Knopf „Simulation +7 Tage“ in den Einstellungen. Fälligkeiten, Wiedervorlagen und Nachfassen richten sich im Simulationsmodus nach `sim_datum`. Ein Lauf kann so mehrere Wochen in Minuten durchspielen und Trends zeigen.

## Datenmodell (Ergänzungen)
- `nachrichten.typ`: `erst | nachfass | antwort | wiedervorlage | weiterleitung`; neue Felder `ausloeser` (id der Nachricht, auf die reagiert wird), `faellig_am`, `thema`, `neu` (was ist neu, ein Satz).
- Aufgaben mit `art: "mail_faellig"`, `nachricht_plan` (Zielperson, Thema, Auslöser) für geplante Folgemails.
- `lernen/wissen`: {quelle, stand, fakten[{thema, text}], offene_fragen[{frage, anzahl}]}.
- Protokoll: eigene Art `folgemail` mit `warum` („weil X am … um Wiedervorlage im Januar bat“).

## Seite
- Postausgang: Reiter „Folgemails fällig“ (geplant, mit Datum und Grund), im Gesprächs-Reiter der Auslöser sichtbar.
- Dashboard: Zyklus-Trichter Erstmail → Antwort → Folgemail → Termin; Liste „Offene Fragen an Menschen“; Zeitraffer-Stand.
- Einstellungen: `sim_datum`, Knopf +7 Tage, Maximalzahl Nachfassen.

## Bauplan (Modelle)
Opus plant (diese Datei), Sonnet baut Seite und aktualisiert `prompts/simulation.md` (Schritte 4 und 5), Haiku schreibt simulierte Antworten und bewertet Qualität. Erst nach der Vorstellung bauen; danach Simulationslauf wieder einschalten (Schreibrechte vorher einmal testen, unbeaufsichtigte Läufe wurden schon einmal vom Berechtigungssystem gestoppt).
