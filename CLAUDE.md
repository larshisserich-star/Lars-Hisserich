# CLAUDE.md – JLU Lead-Radar

Spart Tokens: **Nicht den ganzen Code lesen.** Erst `docs/ARCHITEKTUR.md` (Dateikarte, Datenmodell, Veröffentlichen), dann nur die Datei öffnen, die die Aufgabe betrifft.

- Stellschrauben (Regeln, Modelle, Simulation, Lernen, Standardwerte): nur `lead-radar/config.js`.
- Nach jeder Änderung: `node lead-radar/tests/smoke.js --shots` (ohne Fehler, Bilder in `lead-radar/tests/out/` ansehen).
- Veröffentlichen: siehe ARCHITEKTUR.md → „Veröffentlichen“ (Live-URL behalten, Fähigkeiten nicht angeben).
- Automatik-Anweisungen: `prompts/*.md`; nach Änderung den passenden Trigger mit demselben Text aktualisieren.
- Arbeitsweise: Opus plant und prüft, Sonnet (Subagent `model: "sonnet"`) baut; Haiku für Massenaufgaben.
- Sprache der Seite und der Doku: Deutsch, einfache Sätze. Professur immer „Professur für Vertriebsmanagement“.
- Nie echte Mails versenden. Simulation nur mit `.test`-Adressen und sichtbarer Marke „generiert“.
