"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDevisList, type DevisRecord, type DevisStatus } from "@/lib/store";

const STATUS_LABEL: Record<DevisStatus, string> = {
  brouillon: "Brouillon",
  "envoyé": "Envoyé",
  "accepté": "Accepté",
  "refusé": "Refusé",
};

const STATUS_COLOR: Record<DevisStatus, string> = {
  brouillon: "badge-draft",
  "envoyé": "badge-sent",
  "accepté": "badge-accepted",
  "refusé": "badge-refused",
};

export default function Dashboard() {
  const router = useRouter();
  const [records, setRecords] = useState<DevisRecord[]>([]);

  useEffect(() => {
    setRecords(getDevisList());
  }, []);

  const totalMontant = records.reduce((s, r) => s + r.devis.totalTTC, 0);
  const nbEnvoyes = records.filter((r) => r.status === "envoyé").length;
  const nbAcceptes = records.filter((r) => r.status === "accepté").length;

  return (
    <>
      <header>
        <div className="logo">
          <img src="/images/sodobat.jpeg" alt="Sodobat" className="logo-img" onClick={() => router.push("/")} />
        </div>
        <div className="header-badge">
          <div className="dot-live"></div>
          Création &amp; gestion de devis
        </div>
      </header>

      <div className="app">
        <div className="dashboard-topbar">
          <div>
            <h1 className="dashboard-title">Tableau de bord</h1>
            <p className="dashboard-sub">Gestion des devis — Groupe SDG</p>
          </div>
          <button className="btn btn-accent" onClick={() => router.push("/nouveau")}>
            + Nouveau devis
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total devis</div>
            <div className="stat-value">{records.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Volume total TTC</div>
            <div className="stat-value stat-value--accent">
              {totalMontant.toLocaleString("fr-FR")} €
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">En attente de réponse</div>
            <div className="stat-value stat-value--blue">{nbEnvoyes}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Acceptés</div>
            <div className="stat-value stat-value--green">{nbAcceptes}</div>
          </div>
        </div>

        <div className="panel active" style={{ marginTop: 0 }}>
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-icon">📁</div>
              Devis récents
            </div>
          </div>

          {records.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <div className="empty-text">Aucun devis pour l&apos;instant</div>
              <button className="btn btn-primary" onClick={() => router.push("/nouveau")}>
                Créer le premier devis
              </button>
            </div>
          ) : (
            <table className="list-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Client</th>
                  <th>Projet</th>
                  <th>Entité</th>
                  <th style={{ textAlign: "right" }}>Montant TTC</th>
                  <th>Date</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr
                    key={r.id}
                    className="list-row"
                    onClick={() => router.push(`/devis/${r.id}`)}
                  >
                    <td className="list-ref">{r.devis.devisRef}</td>
                    <td>
                      <div className="list-client-name">{r.devis.client.nom}</div>
                      <div className="list-client-email">{r.devis.client.email}</div>
                    </td>
                    <td className="list-projet">{r.devis.projet.titre}</td>
                    <td>
                      <span className="entity-badge">{r.devis.entity}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className="list-amount">
                        {r.devis.totalTTC.toLocaleString("fr-FR")} €
                      </span>
                    </td>
                    <td className="list-date">{r.devis.date}</td>
                    <td>
                      <span className={`status-badge ${STATUS_COLOR[r.status]}`}>
                        {STATUS_LABEL[r.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
