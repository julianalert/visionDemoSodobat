"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDevisById, saveDevis, updateDevisStatus, type Devis, type DevisRecord } from "@/lib/store";

export default function DevisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [record, setRecord] = useState<DevisRecord | null>(null);
  const [devis, setDevis] = useState<Devis | null>(null);
  const [sent, setSent] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const r = getDevisById(id);
    if (!r) { setNotFound(true); return; }
    setRecord(r);
    setDevis(r.devis);
    if (r.status === "envoyé" || r.status === "accepté") setSent(true);
  }, [id]);

  function updateLigne(lotIdx: number, ligneIdx: number, field: "quantite" | "prixUnit", raw: string) {
    const val = parseFloat(raw.replace(",", ".")) || 0;
    setDevis((prev) => {
      if (!prev) return prev;
      const lots = prev.lots.map((lot, li) => {
        if (li !== lotIdx) return lot;
        const lignes = lot.lignes.map((ligne, ji) => {
          if (ji !== ligneIdx) return ligne;
          const updated = { ...ligne, [field]: val };
          updated.total = updated.quantite * updated.prixUnit;
          return updated;
        });
        return { ...lot, lignes };
      });
      const totalHT = lots.reduce((s, lot) => s + lot.lignes.reduce((ss, l) => ss + l.total, 0), 0);
      const totalTTC = totalHT * (1 + prev.tva / 100);
      return { ...prev, lots, totalHT, totalTTC };
    });
  }

  function handleSend() {
    if (!record || !devis) return;
    const updated: DevisRecord = { ...record, devis, status: "envoyé" };
    saveDevis(updated);
    updateDevisStatus(id, "envoyé");
    setSent(true);
  }

  function handleDownloadPDF() {
    window.print();
  }

  if (notFound) {
    return (
      <>
      <header>
        <div className="logo">
          <img src="/images/sodobat.jpeg" alt="Sodobat" className="logo-img" onClick={() => router.push("/")} />
        </div>
      </header>
      <div className="app">
        <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-text">Devis introuvable</div>
            <button className="btn btn-primary" onClick={() => router.push("/")}>← Dashboard</button>
          </div>
        </div>
      </>
    );
  }

  if (!devis) return null;

  return (
    <>
      <header>
        <div className="logo">
          <img src="/images/sodobat.jpeg" alt="Sodobat" className="logo-img" onClick={() => router.push("/")} />
        </div>
        <div className="header-badge">
          <div className="dot-live"></div>
          {devis.devisRef}
        </div>
      </header>

      <div className="app">
        <div className="panel active">
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-icon">📄</div>
              Devis — Vérification &amp; envoi
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => router.push("/")}>
                ← Dashboard
              </button>
            </div>
          </div>

          {!sent && (
            <div className="panel-body">
              <div className="edit-hint">
                ✏️ Tous les champs sont éditables — cliquez pour modifier avant envoi
              </div>


              <div className="devis-container">
                <div className="devis-top">
                  <div className="devis-top-grid">
                    <div>
                      <div className="devis-company">Groupe SDG — {devis.entity}</div>
                      <div className="devis-title-main" contentEditable suppressContentEditableWarning>
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
                        {devis.lots?.map((lot, loi) => {
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
                                  <td style={{ textAlign: "right" }}>
                                    <input
                                      type="number"
                                      value={l.quantite}
                                      onChange={(e) => updateLigne(loi, li, "quantite", e.target.value)}
                                      className="devis-num-input"
                                    />
                                  </td>
                                  <td style={{ textAlign: "right" }}>
                                    <input
                                      type="number"
                                      value={l.prixUnit}
                                      onChange={(e) => updateLigne(loi, li, "prixUnit", e.target.value)}
                                      className="devis-num-input"
                                    /> €
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
                      SODOBAT — Soc Donat de Bâtiment &nbsp;·&nbsp; SIRET 333 940 203
                      <br />
                      103 Allée Sébastien Vauban, 83600 Fréjus
                      <br />
                      Construction d&apos;autres bâtiments
                    </div>
                    <div />
                  </div>
                </div>
              </div>

              <div className="btn-row" style={{ marginTop: 28 }}>
                <button className="btn btn-accent" onClick={handleSend}>
                  ✉️ Envoyer au client
                </button>
                <button className="btn btn-primary" onClick={handleDownloadPDF}>
                  ⬇️ Télécharger en PDF
                </button>
                <button className="btn btn-outline" onClick={() => router.push("/")}>
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
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button className="btn btn-primary" onClick={() => router.push("/")}>
                  ← Dashboard
                </button>
                <button className="btn btn-outline" onClick={handleDownloadPDF}>
                  ⬇️ Télécharger PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
