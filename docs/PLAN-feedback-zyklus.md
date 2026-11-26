# Plan: Feedback-Zyklus (Folgemails, Wiedervorlage, richtige Person, Fragen, Zeitraffer)

Stand 26.11.2026, geprüft von Opus. Umfang: ca. 1 Stunde Sonnet. Erst `docs/ARCHITEKTUR.md` lesen.
Ziel: Jede Nachricht hat eine nächste Handlung mit Datum. Jede Folgemail bringt etwas Neues. Alles agentisch, keine Aufgaben für Menschen.

## Regeln (verbindlich)
| Ergebnis | Handlung (Typ der Nachricht) | Fällig |
|---|---|---|
| keine Antwort | 1. Nachfassen `nachfass`, 40–90 Wörter, neuer Gedanke | Erstmail + `nachfassen_tage` (7) |
| weiter keine | 2. und letztes Nachfassen `nachfass`, neuer Anlass (neueste Stelle aus `stellen`, sonst anderes Angebot), „danach melden wir uns nicht wieder“; dann Ruhe | 1. Nachfassen + `FOLGE.nachfass2_tage` (14) |
| später | `wiedervorlage`: knüpft an („Sie hatten gebeten …“) und bringt etwas Neues | genanntes Datum, sonst + `FOLGE.wv_tage` (60) |
| falsche Person | `weiterleitung` an genannte Person („Frau X hat mich an Sie verwiesen“); keine genannt: nächste HR-/Vertriebsperson ohne Kontakt; sonst Vermerk „Ansprechperson fehlt“ | nächster Lauf |
| Rückfrage | `antwort`: beantwortet genau die Fragen (siehe Wissen), dann wieder die kleine Bitte | nächster Lauf |
| Interesse | `antwort` mit zwei Terminvorschlägen | nächster Lauf |
| Termin | sim.termine, nach dem Datum Gesprächsnotiz + Projektidee (generiert) | Termintag |
| Absage | Sperre, nie wieder anschreiben | – |
Grenzen: höchstens **2 Nachfassen je Person** (`FOLGE.nachfass_max`), höchstens 4 Runden je Thread (`SIM.max_runden`).
Alle Mails: „Sehr geehrte Frau/Sehr geehrter Herr Nachname,“ … „Liebe Grüße“ / „Team 3“ (EN „Kind regards“ / „Team 3“), über vorhandene `anredeFor()` und `sig()`.

## Fragen beantworten (agentisch, nur im Lauf)
- Lauf liest die Professurseite (https://www.uni-giessen.de/de/fbz/fb02/fb/professuren/bwl/marketing-verkaufsmanagement/unternehmen) per WebFetch, wenn `lernen/wissen.stand` fehlt oder älter als 7 Tage ist. Speichert kurze Fakten mit Link. Dazu die Angebotstexte aus der Anweisung.
- Antwort nutzt nur diese Fakten. Nichts gefunden: ehrlich sagen („Dazu kann ich Ihnen gerade keine verlässliche Auskunft geben; das besprechen wir gern im Gespräch.“). Nie Preise, Termine, Zusagen erfinden.
- Jede Frage wird mit Thema gezählt (`offene_fragen`), wenn unbeantwortet. Keine Aufgabe für Menschen.

## Zeitraffer (nur Simulation, Standard aus)
- Eigenes Dokument `einstellungen/zeitraffer` {tage (0 = aus), seit, von}. Nie in `einstellungen/automatik`.
- Seite: `today()`/`plus()` rechnen nur bei `MODE==="sim"` mit `+ZR` Tagen. Echter Modus sieht den Zeitraffer nie.
- Einstellungen → Simulation: Knöpfe „+7 Tage“, „+14 Tage“, „Zurück zur echten Zeit“ (tage 0). „Simulation zurücksetzen“ setzt tage ebenfalls 0.
- Banner im Simulationsmodus bei ZR>0: „Zeitraffer: virtuelles Heute 10.12.2026 (+14 Tage). Zurück zur echten Zeit“.
- Lauf: HEUTE = echtes Datum + `einstellungen/zeitraffer.tage` (fehlt = 0), gilt für alle sim-Daten und Vergleiche.

## Datenmodell (Ergänzungen)
- `nachrichten.typ` zusätzlich `wiedervorlage | weiterleitung`; neue Felder `nachfass_nr` (1|2), `neu` (ein Satz: was ist neu), `ausloeser` (id der Nachricht, auf die reagiert wird).
- `ansprechpartner[]` (bzw. `sim.ansprechpartner`): optional `verwiesen_von`, `quelle:"generiert"` in der Simulation.
- `lernen/wissen` {quelle, stand, fakten[{thema,text,url}], offene_fragen[{thema,frage,anzahl}]}.
- `qualitaet.kriterien.neu` (0–2) nur bei Folgemails; Summe dann auf 10 skaliert.
- Protokoll: Art `folgemail` mit `warum` („weil … am … um Wiedervorlage im Januar bat“).

## Änderungen je Datei
- **config.js**: `const FOLGE={nachfass_max:2,nachfass2_tage:14,wv_tage:60};`
- **core.js**
  - `let ZR=0;` `today`/`plus` mit Versatz `MODE==="sim"?ZR:0` (eine Stelle, Zeile 9).
  - `nachfass(m,nr,f)`: nr 2 = letzter Text mit neuem Anlass (neueste `f.stellen` nach `m.versendet_am`, nur echte Quelle; sonst Hinweis auf ein weiteres Angebot); setzt `nachfass_nr`, `neu`.
  - neu `wvText(f,m)`: Wiedervorlage-Vorlage, nennt das Datum der Bitte.
  - neu `geplant()`: Liste {firma_id, firma, person, art(nachfass1|nachfass2|wiedervorlage|weiterleitung), faellig_am, grund, folge_von} – auch zukünftige.
  - `outbox()`: aus `geplant()` alle mit `faellig_am<=today()` als virtuelle Entwürfe (ersetzt die bisherige Nachfass-Schleife); Zählung je `firma_id|person_key` → nie mehr als 2 Nachfassen; nichts bei Sperre, Antwort oder Absage. Personen mit `verwiesen_von` umgehen `kontakte_pro_firma`.
  - `simReset()`: am Ende `einstellungen/zeitraffer` auf tage 0.
- **views.js**
  - `vPostausgang`: neuer Reiter „Folgemails geplant“ (`geplant()`, sortiert nach Datum, Abzeichen „fällig“ / „in X Tagen“, Grund, Auslöser).
  - `vEinstellungen` (Simulationsbereich): Zeitraffer-Knöpfe und Stand. Banner in `render()` bei sim+ZR>0.
  - Hinweis im Reiter „Gesendet“: „Nach 7 und weiteren 14 Tagen je ein Nachfassen, höchstens 2.“
- **events.js**: Laden von `einstellungen/zeitraffer` in `ZR`; Aktionen `zr-plus` (data-tage), `zr-aus` (put, dann `compute(); render()`).
- **prompts/simulation.md** (danach `update_trigger trig_013xBndhh3Hojd3SJ8NU4Dt3` mit demselben Text):
  - Schritt 1: HEUTE wie oben; Skript L bekommt HEUTE als 3. Argument (`dt.date.today()` ersetzen).
  - Schritt 3/4: Wissen laden/auffrischen; Rückfrage nur aus Fakten oder ehrlich; falsche_person → Person in `sim.ansprechpartner` (generiert, `verwiesen_von`) + `weiterleitung`; spaeter → bei Fälligkeit `wiedervorlage`.
  - Schritt 5: zwei Nachfassen (7 / +14 Tage), Qualitätskriterium „neu“, unter 1 Punkt „neu“ neu schreiben.
  - Keine Aufgaben „für Menschen“ mehr anlegen; vorhandene Nachfass-Aufgaben nur abhaken.

## Testschritte
1. `tests/seed.js` ergänzen (alle sim:true, `.test`): Erstmail vor 8 Tagen (→ Nachfassen 1), Nachfassen 1 vor 15 Tagen (→ Nachfassen 2), Person mit 2 Nachfassen (→ nichts), Firma `wv` mit vergangenem Datum (→ Wiedervorlage), Person mit `verwiesen_von`.
2. In `tests/smoke.js` nach dem Laden prüfen (`page.evaluate`): Anzahl virtueller Entwürfe je Typ stimmt; nie `nachfass_nr>2`; Anrede „Sehr geehrte“, Gruß „Liebe Grüße“ + „Team 3“.
3. Zeitraffer: `ZR=7` setzen → Erstmail von vor 1 Tag wird fällig; Modus „echt“ → `today()` = echtes Datum; „Zurück zur echten Zeit“ → ZR 0.
4. `node lead-radar/tests/smoke.js --shots` ohne Fehler; Bilder Postausgang/Einstellungen (desk + phone) ansehen; EN-Umschaltung prüfen.
5. Veröffentlichen laut ARCHITEKTUR.md. Lauf einmal von Hand (`fire_trigger`) mit Zeitraffer +7, Protokoll und `.test`-Adressen prüfen, danach zurück auf 0.

## Verbesserungen Automatik/UI (priorisiert, je klein)
1. Postausgang-Reiter „Folgemails geplant“ (oben enthalten) – größter Nutzen.
2. Zeitraffer-Banner mit Ein-Klick „Zurück zur echten Zeit“ (oben enthalten) – verhindert Verwechslung.
3. Dashboard: Zyklus-Trichter Erstmail → Antwort → Nachfassen 1/2 → Termin, je Stufe Anzahl und Quote (aus `N`, nur Zählen).
4. Dashboard: „Offene Fragen“ aus `lernen/wissen.offene_fragen` (nur lesen) – zeigt, was die Professurseite nicht beantwortet.
5. Heute-Seite: Zeile „X Folgemails heute fällig“ mit Link zum Reiter.
6. Lauf-Zusammenfassung um „Folgemails nach Art“ und „Fragen ohne Antwort“ ergänzen.
Bewusst gestrichen: Lauf spult selbst Wochen vor (zu riskant, schwer prüfbar); Dankesmail an die erste Person; eigene Aufgabenart `mail_faellig` (ersetzt durch `geplant()`).
