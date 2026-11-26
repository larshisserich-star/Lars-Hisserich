# Bauplan: Simulation, Lernschleife, Dashboard (Stand 26.11.2026)

Vorher `docs/ARCHITEKTUR.md` lesen (Dateien, Datenmodell, Lernformel). Stellschrauben stehen schon in `lead-radar/config.js` (`MODELL`, `A_DEF`, `SIM`, `LERNEN`).

## Teil A – Seite (lead-radar/core.js, views.js, events.js, index.html)

### A1 Modus „Echt | Simulation“
- Umschalter in der Kopfleiste neben DE/EN: zwei Knöpfe `data-mode="echt"` / `data-mode="sim"` (Rauchtest klickt sie). Wahl in localStorage `lr-mode`, Standard `echt`.
- Im Simulationsmodus oben eine orange Leiste: „Simulationsmodus: Versand, Antworten und Gespräche sind generiert. Nichts davon ist echt oder verlassen die Seite.“ (+EN).
- `compute()`: Im Modus sim wird jede Firma als Kopie mit überlagerten Feldern aus `f.sim` (status, stufe, kontakte, wiedervorlage, updates, termine, projekte) verwendet; das Original bleibt in `f._real`. Im Modus echt wird `f.sim` ignoriert.
- Speichern: `saveF(f)` schreibt im Modus sim die überlagerten Felder zurück nach `sim` und lässt die echten Felder des Originals unverändert. Neue Aufgaben im Modus sim bekommen `sim:true`.
- Nachrichten und Aufgaben: Modus echt zeigt nur Einträge ohne `sim`, Modus sim nur Einträge mit `sim:true`. Virtuelle Vorlagen-Entwürfe gibt es in beiden Modi.
- Simulierte Absage (`kontakte[...].status==="Absage"` oder `sim.sperre`) → keine neuen Entwürfe für diese Person (Sperrliste). Gilt auch im echten Modus für echte Absagen.

### A2 Kennzeichnung
- Jede eingehende generierte Nachricht: Chip `warn` mit Text aus `SIM.marke` + Persona-Typ, z. B. „generiert – nicht von der echten Person · Persona: skeptisch“.
- Simulierter Versand: Chip „Simulation · an erika.beispiel@lahntal.test“.
- Trainingsdaten immer „generierte Firma“.

### A3 Gespräche
- Postausgang bekommt den Reiter „Gespräche“: je `thread_id` ein Block mit allen Nachrichten chronologisch (aus/ein), eingehende eingerückt mit grauem Hintergrund, Ergebnis-Chip (Absage ✕, später ◷, Rückfrage ?, Interesse ✓, Termin ✓).
- Personenprofil „Verlauf“ zeigt denselben Thread.
- Neuer Reiter „Eingang“ (status eingang) mit Filter nach Ergebnis.

### A4 Lernen (core.js)
- `lernDaten()`: sammelt Erstkontakte mit bekanntem Ergebnis aus `nachrichten` (aus, typ erst; Ergebnis = ergebnis der ersten eingehenden Antwort im Thread, sonst `keine` wenn älter als `nachfassen_tage`) und alle `training`-Zeilen. Gewicht echt = `LERNEN.gewicht_echt`, sim = 1. Merkmale: branche/region/groesse (aus Firma oder Trainingszeile; groesse: <250 klein, <1000 mittel, sonst gross), bereich, aufhaenger_typ, angebot (jedes Angebot einzeln).
- `lernStats()`: Basisquote, je Merkmal und Wert: n, Erfolg, geglättete Quote, Abweichung. Ergebnis zwischenspeichern, nur neu rechnen wenn sich Daten ändern.
- `lernZuschlag(f)`: Formel aus ARCHITEKTUR.md, nur Merkmale der Firma (branche, region, groesse; bereich/aufhaenger/angebot der besten Ansprechperson wenn bekannt). Begrenzung ±`LERNEN.max_zuschlag`.
- Rangliste/Sortierung „Höchste Punkte“: `_score + (A.lernen_in_rangliste ? _zus : 0)`. Anzeige überall: „4,60 (+0,12 gelernt)“; im Firmenprofil eine Zeile „Lernzuschlag“ mit den drei stärksten Gründen („Branche Maschinenbau: 31 % Erfolg statt 22 %, n = 140“).

### A5 Dashboard (neuer Menüpunkt unter Überblick, nach Heute: „Dashboard“, Route `dashboard`)
Zum Anschauen für alle. Inhalte (Tafeln im Design):
1. Kennzahlen (Raster g3): Kontakte simuliert / echt, Antwortquote, positive Quote, Termine, laufende Gespräche, Trainingskontakte gesamt.
2. Verlauf je Kalenderwoche (letzte 8): einfache horizontale Balken (`.bar`) für Kontakte und positive Quote, getrennt Simulation/echt.
3. „Was der Radar zuletzt gemacht hat“: Zeitleiste aus `protokoll` (neueste 30), je Zeile Zeit, Lauf, Art-Chip, Firma/Person, „was“ und aufklappbar „warum“. Filter: alle / Auswahl / Versand / Antworten / Aktionen / Lernen.
4. Lernstand: Tabelle der Merkmalswerte mit größter positiver und negativer Abweichung (je 5), n, Quote, Zuschlag; Werte mit n < `LERNEN.min_n` grau. Darunter `lernen/stand.regeln` (Text + Belege) und `hinweise_entwurf`.
5. Experimente (A/B): je Experiment Frage, A vs. B mit n, Erfolg in %, Status.
6. Wochenbericht aus `lernen/stand.wochenbericht`.
7. Hinweis: „Simulierte Ergebnisse beruhen auf Annahmen in config.js (SIM). Echte Antworten zählen 5-fach.“

### A6 Einstellungen → Tafel „Simulation und Lernen“
Felder: sim_aktiv (Haken), sim_tageslimit (0–200), sim_training_pro_lauf (0–200), ab_test (Haken), lernen_in_rangliste (Haken). Knopf „Simulation zurücksetzen“ (zweimal klicken zur Bestätigung): löscht alle `nachrichten` mit sim, alle `aufgaben` mit sim, alle `protokoll` mit sim, alle `training`, `lernen/stand`, und entfernt das Feld `sim` aus allen Firmen (Firma neu speichern ohne `sim`). `aClean` muss die neuen Felder prüfen.

### A7 Heute
Im Modus sim zusätzlich Zeile „Neue simulierte Antworten (n)“ → Postausgang/Eingang. Kennzahl-Karten bleiben.

### A8 Laden
`load()` lädt zusätzlich `protokoll`, `training`, `lernen/stand` (fehlt = leer). KI-Aufrufe auf der Seite nutzen `MODELL` aus config.js (KI-Entwurf: plan = `denken`, Text = `schreiben`). Im KI-Entwurf `lernen/stand.hinweise_entwurf` mitgeben.

### Abnahme
`node lead-radar/tests/smoke.js --shots` ohne Fehler, beide Modi, Desktop + Handy ohne waagerechtes Scrollen, linke Leiste ohne Scrollleiste. Bilder ansehen. Seed in tests/seed.js bei Bedarf erweitern.

## Teil B – Anweisungen für die geplanten Läufe (prompts/)

### B1 prompts/suchlauf.md
Aktuelle Anweisung (siehe Trigger `trig_01EhoKHAKdEoY9LWPXJ19k8U`) übernehmen und anpassen: Modelle Sonnet (selbst) + Subagent `sonnet` für Texte; Feld `sim` der Firmen und alle Dokumente mit `sim:true` nie verändern; jede Auswahl-Entscheidung (neue Firma, Shortlist, Tiefenrecherche) als `protokoll`-Eintrag mit `warum` (lauf `suchlauf`, sim false); Entwürfe nutzen `lernen/stand.hinweise_entwurf`; Entwürfe merken sich `merkmale` (aufhaenger_typ, angebote, laenge_woerter); `einstellungen/automatik.ab_test` → bei zwei ähnlichen Firmen Varianten A/B nach laufendem Experiment.

### B2 prompts/simulation.md (neuer Lauf, werktags 10:43, 13:43, 16:43 Europe/Berlin)
Ablauf:
1. Einstellungen lesen; `sim_aktiv` false → nur Protokoll „Simulation aus“ und Ende. Tageslimit `sim_tageslimit` für simulierten Versand.
2. **Versand (Simulation)**: Shortlist-Firmen; je Person ohne Sperre und ohne simulierten Erstkontakt einen Entwurf nehmen (vorhandenen `entwurf`, sonst neu schreiben lassen). Qualitätsprüfung (Sonnet, Kriterien sinn/logik/bezug/laenge/ton, 0–10); unter 7 → einmal neu schreiben mit Kritik. A/B: laufendes Experiment aus `lernen/stand.experimente`, sonst neues Experiment anlegen (eine klare Frage, z. B. Einstieg Stelle vs. Ausbau, kurz vs. lang, ein vs. zwei Angebote). Speichern als NEUE Nachricht `sim:true, richtung aus, status versendet, quelle simulation, an_adresse vorname.nachname@<firmenkurzname>.test, thread_id = eigene id, variante, experiment_id, merkmale, qualitaet, warum`. Echte Entwürfe NICHT verändern. In `firmen.sim`: status kontakt, stufe Angesprochen, kontakte[key] Angeschrieben. Aufgabe `sim:true` „Nachfassen …“ fällig in nachfassen_tage. Protokoll `versand`.
3. **Antworten simulieren** (Haiku-Subagent, ein Aufruf für bis zu 20 Fälle als JSON): für simulierte Nachrichten ohne Antwort, deren Antwortzeitpunkt erreicht ist (zufällig `SIM.antwort_nach_tagen`, beim Versand als `antwort_faellig_am` speichern). Persona je Kontakt zufällig nach `SIM.personas[].anteil` (einmal je Person festlegen, in `firmen.sim.kontakte[key].persona` merken). Ergebnis zufällig aus `basis` der Persona, positive Ergebnisse multipliziert mit den zutreffenden `SIM.annahmen` (Qualität, Angebot passt zum Bereich, konkreter Aufhänger, Mittelhessen), danach normieren. Der Zufall wird im Lauf per Skript (python) gezogen, nicht vom Modell. Haiku schreibt nur den Antworttext in der Rolle der Person passend zu Persona, Ergebnis und Firmenlage (2–6 Sätze, realistisch, keine erfundenen Zahlen). Bei `keine`: keine Nachricht, nur nach nachfassen_tage zählt der Kontakt als „keine Antwort“. Speichern: `richtung ein, status eingang, generiert:true, sim:true, ergebnis, persona, thread_id`; ursprüngliche Nachricht → `status antwort, antwort_am`.
4. **Reagieren** (wie ein Mensch, aber automatisch, alles `sim`): absage → kontakte Absage, sperre, alle Person abgesagt → sim.status abgelehnt; spaeter → sim.wiedervorlage (genanntes Datum, sonst +60 Tage), Aufgabe; rueckfrage → Sonnet beantwortet sachlich (Angebote aus config, nichts zusagen), neue Nachricht im Thread `typ antwort`, max `SIM.max_runden`; interesse → Antwort mit zwei Terminvorschlägen; termin → sim.stufe „Im Gespräch“, termine[] mit Datum, Aufgabe „Gespräch vorbereiten“, danach (nächster Lauf) simulierte Gesprächsnotiz und Projekt in sim.projekte; falsche_person → neue Person nur wenn in der Antwort genannt (generiert, markiert), sonst Firma auf „Ansprechperson fehlt“. Erledigte Aufgaben automatisch abhaken (Nachfassen bei Antwort, Vorbereiten nach Termin). Bei interesse/termin und fehlender Tiefenrecherche → `auftraege` herkunft `signal` mit Begründung, oder direkt Tiefenrecherche (echte Webrecherche, echte Daten in dossier). Jede Aktion → protokoll mit warum.
5. **Nachfassen**: simulierte Erstkontakte ohne Antwort nach nachfassen_tage → ein simuliertes Nachfassen (Sonnet), Aufgabe abhaken.
6. **Training** (Masse, `sim_training_pro_lauf` Zeilen): generierte Firmen (Branche/Region/Größe gestreut, als „generierte Firma“), Merkmale je Variante, Qualität per Haiku-Bewertung einer Kurzfassung, Ergebnis per Zufall wie in 3. Speichern in `training` (batch je 50). Kein Text nötig.
7. **Lernen**: alle Ergebnisse (nachrichten + training) per Skript auswerten (Formel ARCHITEKTUR.md), Experimente mit n ≥ 30 je Seite und klarer Differenz (≥ 8 Prozentpunkte) als entschieden markieren. Sonnet formuliert 3–7 Regeln mit Belegen und `hinweise_entwurf` (konkrete Schreibhinweise). Freitags im letzten Lauf: `wochenbericht`. Schreiben nach `lernen/stand`. Protokoll `lernen`.
Harte Regeln: nie echte Mails, nie echte Felder der Firmen ändern (nur `sim`), alles Generierte markiert, echte Daten nicht erfinden.

## Teil C – Bauvorgehen
Opus plant (diese Datei). Sonnet baut A und B. Opus prüft, testet, veröffentlicht, legt den Simulations-Trigger an und aktualisiert den Suchlauf.
