"use client";

import { useState, useRef } from "react";

type Ligne = {
  designation: string;
  detail: string;
  unite: string;
  quantite: number;
  prixUnit: number;
  total: number;
};

type Lot = {
  numero: string;
  titre: string;
  lignes: Ligne[];
};

type Devis = {
  devisRef: string;
  date: string;
  validite: string;
  entity: string;
  refCount: number;
  client: { nom: string; email: string; adresse: string };
  projet: { titre: string; localisation: string; surface: string; duree: string };
  lots: Lot[];
  totalHT: number;
  tva: number;
  totalTTC: number;
  conditions: { acompte: string; paiement: string; delai: string };
  note?: string;
};

const PROJECT_LABELS: Record<string, string> = {
  gros_oeuvre: "Gros œuvre",
  second_oeuvre: "Second œuvre",
  installation_chantier: "Installation de chantier",
  bureaux_modulaires: "Espaces modulaires",
  maitrise_oeuvre: "Maîtrise d'œuvre",
};

const LOADING_STEPS = [
  ["Analyse de la demande...", "Extraction des paramètres clés du projet"],
  ["Consultation de la base historique...", "Recherche parmi 847 devis similaires"],
  ["Matching & pricing...", "Calibrage des prix sur les projets comparables"],
  ["Structuration du devis...", "Mise en forme selon les standards Sodobat"],
];

const HISTORICAL_DB = `
BASE DE DONNÉES HISTORIQUE SODOBAT — DEVIS TYPES (extraits représentatifs)

## GROS ŒUVRE - TERTIAIRE
DEV-2023-0142 | Immeuble de bureaux R+5 | Paris 15e | 2 800m² SDP
Total HT : 550 000€ | TVA 10% | Délai : 8 mois

DEV-2023-0198 | Immeuble résidentiel R+7 | Vincennes | 3 400m²
Total HT : 668 000€ | Délai : 10 mois

DEV-2022-0089 | Réhabilitation immeuble tertiaire R+4 | Levallois | 1 200m²
Total HT : 218 000€ | Délai : 6 mois

DEV-2024-0011 | Centre commercial – Gros œuvre | Créteil | 5 200m²
Total HT : 815 000€ | Délai : 14 mois

## SECOND ŒUVRE - ADSO
DEV-2023-0201 | Aménagement bureaux open-space | La Défense | 650m²
Total HT : 90 000€ | Délai : 3 mois

## INSTALLATION CHANTIER - EASYMAT
DEV-2023-0310 | Installation chantier R+6 | Paris 17e | 36 mois
Total HT : 143 700€

## ESPACES MODULAIRES - EASY HOME
DEV-2023-0405 | Bureau de vente programme immobilier | Lyon | 18 mois
Total HT : 44 200€
`;

export default function Home() {
  const [step, setStep] = useState(1);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [projectType, setProjectType] = useState("");
  const [location, setLocation] = useState("");
  const [requestDesc, setRequestDesc] = useState("");
  const [devis, setDevis] = useState<Devis | null>(null);
  const [loadingIdx, setLoadingIdx] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [sent, setSent] = useState(false);
  const [showDB, setShowDB] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function handleGenerateRequest() {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-request", { method: "POST" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setClientName(data.clientName || "");
      setClientEmail(data.clientEmail || "");
      setProjectType(data.projectType || "");
      setLocation(data.location || "");
      setRequestDesc(data.description || "");
    } catch {
      setClientName("Nexity Développement");
      setClientEmail("f.martin@nexity.fr");
      setProjectType("gros_oeuvre");
      setLocation("Toulon, Var");
      setRequestDesc(
        "Nous souhaitons construire un immeuble de bureaux de 6 étages (R+5) sur un terrain de 800m² à Issy-les-Moulineaux. Surface plancher totale : 3 200m². Contraintes : terrain argileux, proximité voie ferrée. Livraison souhaitée sous 12 mois. Démarrage envisagé en septembre 2024."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleGoToGeneration() {
    if (!clientName.trim() || !requestDesc.trim() || !projectType) {
      alert("Merci de remplir au minimum : nom client, type de projet et description.");
      return;
    }
    setStep(2);
    setLoadingIdx(0);
    let si = 0;
    intervalRef.current = setInterval(() => {
      si++;
      if (si < LOADING_STEPS.length) setLoadingIdx(si);
    }, 1800);

    try {
      const res = await fetch("/api/generate-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          clientEmail,
          location,
          typeLabel: PROJECT_LABELS[projectType] || projectType,
          desc: requestDesc,
        }),
      });
      const data = await res.json();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (data.error) throw new Error(data.error);
      setDevis(data);
      setStep(3);
    } catch (e) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      alert("Erreur lors de la génération : " + (e as Error).message);
      setStep(1);
    }
  }

  function handleSend() {
    setSent(true);
  }

  function handleReset() {
    setClientName("");
    setClientEmail("");
    setProjectType("");
    setLocation("");
    setRequestDesc("");
    setDevis(null);
    setSent(false);
    setStep(1);
  }

  const stepClass = (n: number) => {
    if (n < step) return "step done";
    if (n === step) return "step active";
    return "step";
  };

  return (
    <>
      <header>
        <div className="logo">
          <div className="logo-mark">SDG</div>
          <div>
            <div className="logo-name">SODOBAT</div>
            <div className="logo-tag">Générateur de devis IA</div>
          </div>
        </div>
        <div className="header-badge">
          <div className="dot-live"></div>
          Prototype IA — Demo
        </div>
        <button
          onClick={() => setShowDB(true)}
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "0.5px",
            background: "none",
            border: "none",
            cursor: "pointer",
            position: "absolute",
            bottom: 6,
            right: 44,
          }}
          title="Base de données"
        >
          ◈ db
        </button>
      </header>

      <div className="app">
        {/* STEPPER */}
        <div className="stepper">
          <div className={stepClass(1)}>
            <div className="step-num">1</div>
            <span className="step-label">Demande client</span>
          </div>
          <div className={stepClass(2)}>
            <div className="step-num">2</div>
            <span className="step-label">Génération du devis</span>
          </div>
          <div className={stepClass(3)}>
            <div className="step-num">3</div>
            <span className="step-label">Validation &amp; envoi</span>
          </div>
        </div>

        {/* PANEL 1 */}
        <div className={`panel ${step === 1 ? "active" : ""}`}>
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-icon">📋</div>
              Nouvelle demande client
            </div>
            <button
              className="btn btn-generate"
              onClick={handleGenerateRequest}
              disabled={generating}
            >
              {generating ? "⏳ Génération..." : "✨ Générer une demande test"}
            </button>
          </div>
          <div className="panel-body">
            <div className="form-row">
              <div className="form-group">
                <label>Nom du client / Société</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="ex. Nexity Développement"
                />
              </div>
              <div className="form-group">
                <label>Email du contact</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="contact@client.fr"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Type de projet</label>
                <select value={projectType} onChange={(e) => setProjectType(e.target.value)}>
                  <option value="">— Sélectionner —</option>
                  <option value="gros_oeuvre">Gros œuvre (SODOBAT)</option>
                  <option value="second_oeuvre">Second œuvre (ADSO)</option>
                  <option value="installation_chantier">Installation chantier (EASYMAT)</option>
                  <option value="bureaux_modulaires">Espaces modulaires (EASY HOME)</option>
                  <option value="maitrise_oeuvre">Maîtrise d&apos;œuvre (EASY INGENIERIE)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Localisation du chantier</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="ex. Paris 13e, Île-de-France"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description de la demande</label>
              <textarea
                value={requestDesc}
                onChange={(e) => setRequestDesc(e.target.value)}
                placeholder="Décrivez le projet : nature des travaux, surfaces, contraintes particulières, délais souhaités..."
              />
            </div>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={handleGoToGeneration}>
                Générer le devis →
              </button>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                L&apos;IA analysera la demande et consultera la base de devis historiques
              </span>
            </div>
          </div>
        </div>

        {/* PANEL 2 */}
        <div className={`panel ${step === 2 ? "active" : ""}`}>
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-icon">⚙️</div>
              Analyse en cours
            </div>
          </div>
          <div className="loading-overlay active">
            <div className="spinner"></div>
            <div className="loading-text">{LOADING_STEPS[loadingIdx][0]}</div>
            <div className="loading-sub">{LOADING_STEPS[loadingIdx][1]}</div>
          </div>
        </div>

        {/* PANEL 3 */}
        <div className={`panel ${step === 3 ? "active" : ""}`}>
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-icon">📄</div>
              Devis généré — Vérification &amp; envoi
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" onClick={handleReset}>
                ← Nouveau devis
              </button>
            </div>
          </div>

          {!sent && devis && (
            <div className="panel-body">
              <div className="edit-hint">
                ✏️ Tous les champs sont éditables — cliquez pour modifier avant envoi
              </div>
              <div className="ref-badge" style={{ marginBottom: 20 }}>
                🗂️ Généré à partir de{" "}
                <strong>{devis.refCount || 12} devis similaires</strong> trouvés dans la base historique
              </div>

              <div className="devis-container">
                <div className="devis-top">
                  <div className="devis-top-grid">
                    <div>
                      <div className="devis-company">Groupe SDG — {devis.entity}</div>
                      <div
                        className="devis-title-main"
                        contentEditable
                        suppressContentEditableWarning
                      >
                        {devis.projet?.titre || "Devis travaux"}
                      </div>
                      <div className="devis-ref">
                        Réf. <strong>{devis.devisRef}</strong> &nbsp;·&nbsp; Émis le {devis.date}{" "}
                        &nbsp;·&nbsp; Validité {devis.validite}
                      </div>
                    </div>
                    <div className="devis-meta">
                      <strong contentEditable suppressContentEditableWarning>
                        {devis.client?.nom}
                      </strong>
                      <span contentEditable suppressContentEditableWarning>
                        {devis.client?.email}
                      </span>
                      <br />
                      <span contentEditable suppressContentEditableWarning>
                        {devis.client?.adresse || ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="devis-body">
                  <div className="devis-section">
                    <div className="devis-section-title">Objet du projet</div>
                    <div className="conditions-grid">
                      <div className="condition-item">
                        <div className="condition-label">Localisation</div>
                        <div className="condition-value" contentEditable suppressContentEditableWarning>
                          {devis.projet?.localisation}
                        </div>
                      </div>
                      <div className="condition-item">
                        <div className="condition-label">Surface concernée</div>
                        <div className="condition-value" contentEditable suppressContentEditableWarning>
                          {devis.projet?.surface}
                        </div>
                      </div>
                      <div className="condition-item">
                        <div className="condition-label">Durée estimée</div>
                        <div className="condition-value" contentEditable suppressContentEditableWarning>
                          {devis.projet?.duree}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="devis-section">
                    <div className="devis-section-title">Détail des prestations</div>
                    <table className="devis-table">
                      <thead>
                        <tr>
                          <th style={{ width: "40%" }}>Désignation</th>
                          <th>Unité</th>
                          <th>Quantité</th>
                          <th>Prix unit. HT</th>
                          <th>Total HT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {devis.lots?.map((lot) => {
                          const lotTotal = lot.lignes.reduce((s, l) => s + l.total, 0);
                          return (
                            <>
                              <tr key={`lot-header-${lot.numero}`} className="subtotal-row">
                                <td colSpan={6} style={{ padding: "10px 14px 6px" }}>
                                  <span className="lot-badge">Lot {lot.numero}</span> {lot.titre}
                                </td>
                              </tr>
                              {lot.lignes.map((l, li) => (
                                <tr key={`lot-${lot.numero}-line-${li}`}>
                                  <td>
                                    <div contentEditable suppressContentEditableWarning>{l.designation}</div>
                                    <div className="item-desc" contentEditable suppressContentEditableWarning>
                                      {l.detail || ""}
                                    </div>
                                  </td>
                                  <td contentEditable suppressContentEditableWarning>{l.unite}</td>
                                  <td contentEditable suppressContentEditableWarning style={{ textAlign: "right" }}>
                                    {l.quantite.toLocaleString("fr-FR")}
                                  </td>
                                  <td contentEditable suppressContentEditableWarning style={{ textAlign: "right" }}>
                                    {l.prixUnit.toLocaleString("fr-FR")} €
                                  </td>
                                  <td style={{ textAlign: "right", fontWeight: 600 }}>
                                    {l.total.toLocaleString("fr-FR")} €
                                  </td>
                                </tr>
                              ))}
                              <tr key={`lot-footer-${lot.numero}`} className="subtotal-row">
                                <td colSpan={4} style={{ textAlign: "right", padding: "8px 14px" }}>
                                  Sous-total {lot.titre}
                                </td>
                                <td style={{ textAlign: "right", fontWeight: 700, padding: "8px 14px" }}>
                                  {lotTotal.toLocaleString("fr-FR")} €
                                </td>
                              </tr>
                            </>
                          );
                        })}
                        <tr className="subtotal-row">
                          <td colSpan={4} style={{ textAlign: "right", padding: "12px 14px", fontWeight: 700 }}>
                            Total HT
                          </td>
                          <td style={{ textAlign: "right", padding: "12px 14px", fontWeight: 700 }}>
                            {devis.totalHT.toLocaleString("fr-FR")} €
                          </td>
                        </tr>
                        <tr className="subtotal-row">
                          <td colSpan={4} style={{ textAlign: "right", padding: "8px 14px", color: "var(--text-muted)" }}>
                            TVA {devis.tva}%
                          </td>
                          <td style={{ textAlign: "right", padding: "8px 14px", color: "var(--text-muted)" }}>
                            {(devis.totalTTC - devis.totalHT).toLocaleString("fr-FR")} €
                          </td>
                        </tr>
                        <tr className="total-row">
                          <td colSpan={4} style={{ textAlign: "right" }}>TOTAL TTC</td>
                          <td style={{ textAlign: "right", fontSize: 18 }}>
                            {devis.totalTTC.toLocaleString("fr-FR")} €
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="devis-section">
                    <div className="devis-section-title">Conditions contractuelles</div>
                    <div className="conditions-grid">
                      <div className="condition-item">
                        <div className="condition-label">Acompte</div>
                        <div className="condition-value" contentEditable suppressContentEditableWarning>
                          {devis.conditions?.acompte}
                        </div>
                      </div>
                      <div className="condition-item">
                        <div className="condition-label">Paiements</div>
                        <div className="condition-value" contentEditable suppressContentEditableWarning>
                          {devis.conditions?.paiement}
                        </div>
                      </div>
                      <div className="condition-item">
                        <div className="condition-label">Délai d&apos;exécution</div>
                        <div className="condition-value" contentEditable suppressContentEditableWarning>
                          {devis.conditions?.delai}
                        </div>
                      </div>
                    </div>
                  </div>

                  {devis.note && (
                    <div className="devis-section">
                      <div className="devis-section-title">Remarques &amp; cadrage</div>
                      <div className="note-box" contentEditable suppressContentEditableWarning>
                        {devis.note}
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: 24,
                      paddingTop: 20,
                      borderTop: "1px solid var(--border)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.8 }}>
                      SODOBAT SAS — Groupe SDG
                      <br />
                      Assurance décennale AXA — Police n°FR-BTP-2019-SDG-447
                      <br />
                      Siège : 12 rue du Bâtiment, 75015 Paris
                    </div>
                    <div />
                  </div>
                </div>
              </div>

              <div className="btn-row" style={{ marginTop: 28 }}>
                <button className="btn btn-accent" onClick={handleSend}>
                  ✉️ Envoyer au client
                </button>
                <button className="btn btn-outline" onClick={handleReset}>
                  Annuler
                </button>
              </div>
            </div>
          )}

          {sent && (
            <div className="success-screen active">
              <div className="success-icon">✅</div>
              <div className="success-title">Devis envoyé !</div>
              <div className="success-sub">
                Le devis a été transmis par email au client. Un suivi automatique sera déclenché dans 5 jours ouvrés.
              </div>
              <button className="btn btn-primary" onClick={handleReset} style={{ marginTop: 8 }}>
                Nouveau devis
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DB MODAL */}
      {showDB && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setShowDB(false)}
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: "var(--radius-lg)",
              maxWidth: 780,
              width: "90%",
              maxHeight: "80vh",
              overflow: "hidden",
              boxShadow: "var(--shadow-lg)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: "var(--accent2)",
                color: "white",
                padding: "18px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15 }}>
                  Base de données historique
                </div>
                <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>
                  847 devis archivés — Groupe SDG 2019–2024
                </div>
              </div>
              <button
                onClick={() => setShowDB(false)}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  color: "white",
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>
            <div
              style={{
                padding: 24,
                overflowY: "auto",
                fontSize: 12.5,
                lineHeight: 1.8,
                color: "var(--text)",
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                {[
                  { label: "Devis archivés", value: "847", color: "var(--accent)", bg: "var(--accent-light)" },
                  { label: "Période couverte", value: "2019–2024", color: "var(--accent2)", bg: "#EEF3F8" },
                  { label: "Volume total", value: "€ 142M", color: "var(--green)", bg: "var(--green-light)" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      background: stat.bg,
                      borderRadius: "var(--radius)",
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.8px",
                        textTransform: "uppercase",
                        color: stat.color,
                        fontWeight: 700,
                      }}
                    >
                      {stat.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Syne',sans-serif",
                        fontWeight: 800,
                        fontSize: 22,
                        color: stat.color,
                      }}
                    >
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 12,
                  color: "var(--text-muted)",
                  background: "var(--surface2)",
                  padding: 16,
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                }}
              >
                {HISTORICAL_DB.trim()}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
