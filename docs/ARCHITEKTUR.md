# JLU Lead-Radar – Bauanleitung (zuerst lesen, dann nur die nötige Datei öffnen)

Live-Seite: https://claude.ai/artifact/8nZRrYfpZVmSMahFEVcVxE (claude.ai-Artefakt mit Datenbank `db`, Fähigkeiten `db`, `user`, `sample`).
Professur in allen Texten: **„Professur für Vertriebsmanagement“** (EN „Chair of Sales Management“), JLU Gießen, Prof. Dr. Alexander Haas.

## Dateien (lead-radar/)
| Datei | Inhalt | Öffnen, wenn … |
|---|---|---|
| `config.js` | **Alle Stellschrauben**: Gewichte, Kriterien, Regionen, Branchen, Angebote, Modelle, Standardwerte der Automatik, Simulation, Lernen | Regeln, Modelle, Texte der Angebote, Grenzwerte ändern |
| `index.html` | CSS (Design 1:1 nach etronixx-Muster, JLU-Blau) und Grundgerüst | Aussehen ändern |
| `core.js` | Hilfsfunktionen, Zustand, Punktzahl, Signale, Wochenrunde, Vorlagen für Entwürfe, Speichern, KI-Aufrufe, Lernen | Logik ändern |
| `radar.js` | Dashboard-Radar (interaktive Grafik, Filter, Rundgang) | Radar ändern |
| `views.js` | Alle Ansichten und Dialoge, `render()` | Inhalt einer Seite ändern |
| `events.js` | Klicks, Eingaben, Laden, Start | neue Knöpfe / Aktionen |
| `tests/smoke.js` + `tests/seed.js` | Rauchtest mit Schein-Datenbank: `node lead-radar/tests/smoke.js --shots` | nach jeder Änderung |

Alle Skripte sind klassische `<script>`-Dateien im selben globalen Bereich (keine Module).
Sprache: alle Texte über `L("deutsch","english")`; Werte aus der Datenbank sind deutsch gespeichert, `lbl()` übersetzt.

## Veröffentlichen
Artifact-Tool: `file_path` = `lead-radar/index.html`, `url` = Live-URL, `files` = `{"config.js": "lead-radar/config.js", "core.js": …, "radar.js": …, "views.js": …, "events.js": …}`. Fähigkeiten nicht angeben (bleiben erhalten).

## Automatik (geplante Aufgaben in Claude, Umgebung „Default“, freies Internet)
| Aufgabe | ID | Zeit | Modell | Anweisung im Repo |
|---|---|---|---|---|
| Suchlauf | `trig_01EhoKHAKdEoY9LWPXJ19k8U` | werktags 7:13 | Sonnet | `prompts/suchlauf.md` |
| Simulationslauf | `trig_013xBndhh3Hojd3SJ8NU4Dt3` | werktags 10:43, 13:43, 16:43 | Sonnet, Haiku für Personas | `prompts/simulation.md` |
Die Läufe lesen/schreiben die Datenbank mit dem Tool `ArtifactData`. Nach Änderung einer Anweisung: Datei im Repo ändern **und** `update_trigger` mit demselben Text.

## Datenmodell (Sammlungen der Artefakt-Datenbank)
- `firmen/<id>`: name, ort, region, branche, mitarbeiter, umsatz, website, status (`ziel|shortlist|kontakt|wv|nein|abgelehnt|partner`), stufe (`Angesprochen|Im Gespräch|Angebot besprochen|Zusage|Geparkt`), b2b, in_hessen, fit_signal(_en), noten{fit,region,size,evidence,timing}, begruendung(_en), quellen[{claim,url,verified,staerke}], ansprechpartner[{name,funktion,bereich(HR|Vertrieb|Geschäftsführung),quelle,linkedin,staerke}], stellen[{titel,bereich,datum,quelle}], kontakte{<person_key>:{status,kanal,datum,wer}}, updates[{id,datum,wer,kanal,text}], wiedervorlage, email_muster, runde_kw, importiert, angelegt, stand.
  - **`sim`** (nur Simulation, überlagert die echten Felder im Simulationsmodus): {status, stufe, kontakte, wiedervorlage, sperre, updates[], termine[{datum,art,notiz}], projekte[]}. Echte Felder werden von der Simulation **nie** verändert.
- `nachrichten/<id>`: firma_id, firma, person, person_key, bereich, kanal(`mail|req|msg`), sprache, betreff, text, status(`entwurf|freigegeben|versendet|antwort|verworfen|eingang`), typ(`erst|nachfass|antwort|wiedervorlage|weiterleitung`), nachfass_nr(1|2), neu (ein Satz: was ist neu), ausloeser (id der Nachricht, auf die reagiert wird), verweist_auf (eingehend, Name), quelle(`vorlage|suchlauf|ki|hand|simulation`), grund, erstellt_am, versendet_am, antwort_am, folge_von.
  - Simulation zusätzlich: **sim:true**, richtung(`aus|ein`), thread_id, an_adresse (`vorname.nachname@firma.test`, nie echt), variante(`A|B`), experiment_id, merkmale{aufhaenger_typ(`stelle|ausbau|kooperation|groesse|produkt|sonstiges`), angebote[], laenge_woerter}, qualitaet{punkte 0–10, kriterien{sinn,logik,bezug,laenge,ton,neu (nur Folgemails, 0–2)}}, warum (Begründung der Auswahl).
  - Eingehende simulierte Antworten: richtung `ein`, status `eingang`, **generiert:true**, ergebnis(`absage|spaeter|rueckfrage|interesse|termin|falsche_person`), persona{typ,beschreibung}.
- `aufgaben/<id>`: titel, owner, faellig, erledigt, erledigt_am, firma_id, automatisch, **sim** (Aufgaben aus der Simulation).
- `dossier/<firma_id>`: Tiefenrecherche (lage, aufhaenger, personen[{name,funktion,chance,chance_grund,themen[],gespraech[]}], stand, …).
- `auftraege/<firma_id>`: Warteschlange Tiefenrecherche {angefordert, von, herkunft(`shortlist|klick|signal`), erledigt}.
- `lauf/<datum>`: Bericht je Suchlauf {schwerpunkt, region_fokus, kurz, zahlen, eintraege[] (= Signale)}.
- `protokoll/<id>`: **Entscheidungsprotokoll** {zeit, datum, lauf(`suchlauf|simulation|seite`), art(`auswahl|versand|antwort|aktion|recherche|wiedervorlage|lernen|training`), firma_id, firma, person, text (was), warum (Begründung), sim}.
- `training/<id>`: kompakte Trainingskontakte der Massen-Simulation mit **generierten Firmen** {sim:true, datum, branche, region, groesse(`klein|mittel|gross`), bereich, variante, experiment_id, merkmale, qualitaet{punkte}, ergebnis(`keine|absage|spaeter|rueckfrage|interesse|termin`)}.
- `lernen/stand`: {aktualisiert, regeln[{text,belege,seit}], hinweise_entwurf (Text für die nächsten Entwürfe), experimente[{id,frage,A,B,n_A,pos_A,n_B,pos_B,status(läuft|entschieden),ergebnis}], wochenbericht}.
- `lernen/wissen` {quelle, stand, fakten[{thema,text,url}], offene_fragen[{thema,frage,anzahl}]}: Fakten der Professurseite für Antworten auf Rückfragen (nur der Lauf schreibt).
- `einstellungen/zeitraffer` {tage (0 = aus), seit, von}: nur Simulation, Standard aus; `today()`/`plus()` rechnen nur bei `MODE==="sim"` mit +ZR. Nie in `einstellungen/automatik`.
- `ansprechpartner[]`: optional `verwiesen_von`, `quelle:"generiert"` (Simulation). Protokoll-Art `folgemail`.
- Folgemails: `geplant()` in core.js (Regeln in `docs/PLAN-feedback-zyklus.md`, Werte in `config.js` → `FOLGE`); fällige erscheinen über `outbox()` als virtuelle Entwürfe.
- `einstellungen/team` {namen[]}, `einstellungen/automatik` (Standardwerte in `config.js` → `A_DEF`).

## Lernen (in core.js, Formel-Parameter in config.js → LERNEN)
Erfolg eines Kontakts laut `config.js` → `LERNEN.erfolg` (termin/interesse 1, rueckfrage 0,5, spaeter 0,2, sonst 0; keine Antwort nach `nachfassen_tage` = 0). Gewicht: echt × `LERNEN.gewicht_echt`, simuliert × 1.
Je Merkmal (branche, region, groesse, bereich, aufhaenger_typ, angebot) geglättete Quote `(pos + k·basis)/(n + k)`, k = `LERNEN.glaettung`. Lernzuschlag einer Firma = Summe der relativen Abweichungen ihrer Merkmale × `LERNEN.faktor`, begrenzt auf ±`LERNEN.max_zuschlag`. Grundpunktzahl (Gewichte Tobias Weiß) bleibt sichtbar; Rangliste = Grundpunktzahl + Lernzuschlag, wenn `lernen_in_rangliste`.

## Regeln, die immer gelten
Nichts verschicken (echte Mails nur von Menschen). Simulation nur in DB, Adressen `.test`, alles Generierte sichtbar markiert („generiert, nicht von der echten Person“). Nichts erfinden bei echten Daten, Quellen gelesen. Zu Personen nur Berufliches. Absage = nie wieder anschreiben.
