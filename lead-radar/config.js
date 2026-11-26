/* ============================================================
   config.js – ALLE Stellschrauben des JLU Lead-Radar an einem Ort.
   Wer etwas an Regeln, Modellen, Angeboten oder Standardwerten ändern will,
   ändert es HIER. Kein anderer Code muss dafür gelesen werden.
   ============================================================ */
/* ---------- Regeln (fest) ---------- */
const GEW={fit:.35,region:.25,size:.15,evidence:.15,timing:.10};
const KRIT=[["fit","Passung zur Professur","Fit with the professorship"],["region","Nähe zu Mittelhessen","Proximity to Central Hesse"],["size","Größe","Size"],["evidence","Qualität der Belege","Quality of evidence"],["timing","Zeitpunkt","Timing"]];
const REGIONEN=["Mittelhessen","Rhein-Main","Südhessen","Nordhessen","Osthessen"];
const BRANCHEN=["Maschinenbau","Automotive","Industrie und Fertigung","Pharma, Chemie und Medizintechnik","IT und Software","B2B-Dienstleistung","Sonstige"];
const BEREICHE=["HR","Vertrieb","Geschäftsführung"];
const STUFEN=["Angesprochen","Im Gespräch","Angebot besprochen","Zusage","Geparkt"];
const KSTAT=["Noch nicht angeschrieben","Angeschrieben","Nachgefasst","Antwort erhalten","Gespräch vereinbart","Absage"];
const TR={"Mittelhessen":"Central Hesse","Rhein-Main":"Rhine-Main","Südhessen":"Southern Hesse","Nordhessen":"Northern Hesse","Osthessen":"Eastern Hesse","Maschinenbau":"Mechanical engineering","Industrie und Fertigung":"Industry and manufacturing","Pharma, Chemie und Medizintechnik":"Pharma, chemicals and medtech","IT und Software":"IT and software","B2B-Dienstleistung":"B2B services","Sonstige":"Other",
  "Vertrieb":"Sales","Geschäftsführung":"Management","Angesprochen":"Contacted","Im Gespräch":"In conversation","Angebot besprochen":"Offer discussed","Zusage":"Committed","Geparkt":"Parked",
  "Noch nicht angeschrieben":"Not contacted yet","Angeschrieben":"Contacted","Nachgefasst":"Followed up","Antwort erhalten":"Reply received","Gespräch vereinbart":"Call scheduled","Absage":"Declined"};
const lbl=v=>LANG==="en"?(TR[v]||v):v;
const STATUS=()=>[["ziel",L("Zielfirma","Target company")],["shortlist","Shortlist"],["kontakt",L("Im Kontakt","In contact")],["wv",L("Wiedervorlage (30 Tage)","Resubmission (30 days)")],["nein",L("Nicht interessant","Not interested")],["abgelehnt",L("Hat abgelehnt","Declined")],["partner",L("Schon Partner","Already a partner")]];
const ANG={talent:[["Talentvermittlung","Sie bekommen vorausgewählte Kandidatinnen und Kandidaten für Praktika und den Direkteinstieg."],["Talent placement","You get pre-selected candidates for internships and direct entry."]],
  vortraege:[["Gastvorträge","Talentierte Studierende werden auf Ihr Unternehmen aufmerksam, noch bevor sie sich bewerben."],["Guest lectures","Talented students notice your company before they apply anywhere."]],
  master:[["Praxisrelevante Masterarbeiten","Eine konkrete Frage Ihres Unternehmens wird unter Betreuung der Professur bearbeitet."],["Practice-oriented master's theses","A concrete question of your company is worked on under the chair's supervision."]],
  academy:[["Marketing Academy","Ihr Team bekommt aktuelles Wissen zu Marketing und Vertrieb aus der Forschung."],["Marketing Academy","Your team gets current marketing and sales knowledge from research."]],
  insights:[["Marketing Insights","Sie bekommen eine Studie, die genau Ihre Frage beantwortet, als Entscheidungshilfe."],["Marketing Insights","You get a study that answers exactly your question, as decision support."]],
  lab:[["Marketing Innovation Lab","Rund 20 abschlussnahe Studierende erarbeiten in etwa vier Monaten Daten und neue Lösungen zu Ihrer Frage."],["Marketing Innovation Lab","About 20 students close to graduation spend roughly four months building data and new solutions for your question."]]};
const ANG_ZU={HR:["talent","vortraege","master"],Vertrieb:["academy","insights","lab"],"Geschäftsführung":["insights","lab","academy"]};
/* KI-Modelle auf der Seite: Sonnet denkt und schreibt, Haiku für schnelle Massenaufgaben (günstig). Fällt ein Modell aus, nimmt die Plattform die passende Stufe. */
const MODELL={denken:{model:"claude-sonnet-5-5",modelTier:"default",effort:"high"},schreiben:{model:"claude-sonnet-5-5",modelTier:"default",effort:"medium"},schnell:{model:"claude-haiku-5-5",modelTier:"quick",effort:"low"}};


/* Standardwerte der Automatik (werden von einstellungen/automatik in der Datenbank überschrieben) */
const A_DEF={pausiert:false,neue_firmen_pro_tag:6,region_ziel:25,tiefen_pro_tag:3,longlist_min:3.5,shortlist_modus:"vorschlag",shortlist_schwelle:4,kontakte_pro_firma:1,entwurf_sprache:"de",entwurf_kanal:"auto",ki_entwuerfe:true,nachfassen_tage:7,gmail_entwuerfe:false,antworten_pruefen:false,sim_aktiv:true,sim_tageslimit:20,sim_training_pro_lauf:25,ab_test:true,lernen_in_rangliste:true};

/* Folgemails: höchstens nachfass_max Nachfassen je Person; 2. Nachfassen nachfass2_tage nach dem 1.; Wiedervorlage ohne genanntes Datum nach wv_tage. (1. Nachfassen: A_DEF.nachfassen_tage) */
const FOLGE={nachfass_max:2,nachfass2_tage:14,wv_tage:60};

/* Simulation: Personas wie in der Forschung (Anteil = Häufigkeit), Antwortverhalten und Annahmen.
   WICHTIG: Was das System aus der Simulation lernt, kann nur so gut sein wie diese Annahmen. Echte Antworten korrigieren sie (LERNEN.gewicht_echt). */
const SIM={
  domain:".test",                      /* Fake-Adressen: vorname.nachname@firma.test – .test ist reserviert, darüber geht nie eine Mail raus */
  marke:["generiert – nicht von der echten Person","generated – not from the real person"],
  personas:[
    {typ:"vielbeschaeftigt",anteil:.35,beschreibung:"Volles Postfach, liest nur Betreff und erste Zeilen",basis:{keine:.75,absage:.08,spaeter:.07,rueckfrage:.05,interesse:.04,termin:.01}},
    {typ:"offen",anteil:.20,beschreibung:"Offen für Hochschulkooperation, sucht Nachwuchs",basis:{keine:.35,absage:.05,spaeter:.10,rueckfrage:.20,interesse:.20,termin:.10}},
    {typ:"skeptisch",anteil:.20,beschreibung:"Fragt nach Aufwand und Nutzen, misstraut Werbung",basis:{keine:.50,absage:.20,spaeter:.05,rueckfrage:.15,interesse:.08,termin:.02}},
    {typ:"nicht_zustaendig",anteil:.15,beschreibung:"Falsche Person, verweist weiter oder antwortet nicht",basis:{keine:.55,absage:.05,spaeter:.0,rueckfrage:.05,interesse:.0,termin:.0,falsche_person:.35}},
    {typ:"spaeter",anteil:.10,beschreibung:"Grundsätzlich interessiert, aber gerade keine Zeit",basis:{keine:.30,absage:.05,spaeter:.50,rueckfrage:.08,interesse:.05,termin:.02}}],
  /* Annahmen, wie Mail-Qualität und Passung die Chancen verschieben (Faktor auf positive Ergebnisse) */
  annahmen:{qualitaet_ab_8:1.4,qualitaet_unter_6:.6,angebot_passt_zum_bereich:1.3,konkreter_aufhaenger:1.3,mittelhessen:1.15},
  antwort_nach_tagen:[0,3],            /* simulierte Antworten kommen 0–3 Tage nach dem Versand */
  max_runden:4                         /* höchstens so viele Hin-und-her-Nachrichten pro Gespräch */
};

/* Lernen aus Ergebnissen (Simulation und echt). Siehe docs/ARCHITEKTUR.md → Lernen. */
const LERNEN={
  erfolg:{termin:1,interesse:1,rueckfrage:.5,spaeter:.2,keine:0,absage:0,falsche_person:0},
  gewicht_echt:5,                      /* eine echte Antwort zählt so viel wie 5 simulierte */
  glaettung:20,                        /* k: so viele „Durchschnittskontakte“ werden je Merkmal dazugerechnet, damit wenig Daten wenig bewirken */
  faktor:.6,                           /* wie stark die relative Abweichung in Punkte umgerechnet wird */
  max_zuschlag:.5,                     /* Lernzuschlag höchstens ±0,5 Punkte */
  merkmale:["branche","region","groesse","bereich","aufhaenger_typ","angebot"],
  min_n:5                              /* Merkmalswerte mit weniger Kontakten werden im Lernstand nur grau gezeigt */
};
