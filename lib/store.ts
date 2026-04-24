export type DevisStatus = "brouillon" | "envoyé" | "accepté" | "refusé";

export type Ligne = {
  designation: string;
  detail: string;
  unite: string;
  quantite: number;
  prixUnit: number;
  total: number;
};

export type Lot = {
  numero: string;
  titre: string;
  lignes: Ligne[];
};

export type Devis = {
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

export type DevisRecord = {
  id: string;
  status: DevisStatus;
  createdAt: string;
  devis: Devis;
};

const STORAGE_KEY = "sodobat_devis_v3";

const FAKE_DB: DevisRecord[] = [
  {
    id: "sdg-2024-0847",
    status: "brouillon",
    createdAt: "2024-11-15T10:23:00Z",
    devis: {
      devisRef: "SDG-2024-0847",
      date: "15/11/2024",
      validite: "60 jours",
      entity: "SODOBAT",
      refCount: 12,
      client: { nom: "Nexity Développement", email: "f.martin@nexity.fr", adresse: "Saint-Raphaël, Var (83700)" },
      projet: { titre: "Construction immeuble de bureaux R+5", localisation: "Saint-Raphaël", surface: "3 200 m²", duree: "12 mois" },
      lots: [
        {
          numero: "01",
          titre: "Fondations & Terrassement",
          lignes: [
            { designation: "Terrassement général", detail: "Décapage, fouilles en grande masse", unite: "m³", quantite: 480, prixUnit: 95, total: 45600 },
            { designation: "Béton de propreté", detail: "Béton maigre dosé 150kg/m³", unite: "m²", quantite: 320, prixUnit: 28, total: 8960 },
            { designation: "Fondations semelles filantes", detail: "Béton armé dosé 350kg/m³", unite: "m³", quantite: 180, prixUnit: 420, total: 75600 },
          ],
        },
        {
          numero: "02",
          titre: "Structure béton armé",
          lignes: [
            { designation: "Poteaux béton armé", detail: "Section 40×40cm, hauteur plancher 3,5m", unite: "ml", quantite: 480, prixUnit: 380, total: 182400 },
            { designation: "Dalles béton armé", detail: "Épaisseur 22cm, charge 250kg/m²", unite: "m²", quantite: 3200, prixUnit: 145, total: 464000 },
            { designation: "Voiles de refend", detail: "Épaisseur 20cm, double nappes armatures", unite: "m²", quantite: 680, prixUnit: 210, total: 142800 },
          ],
        },
        {
          numero: "03",
          titre: "Façades & Couverture",
          lignes: [
            { designation: "Façade béton architectonique", detail: "Béton matricé, isolation ITE 14cm", unite: "m²", quantite: 1800, prixUnit: 185, total: 333000 },
            { designation: "Étanchéité toiture-terrasse", detail: "Bicouche asphalte, isolation 12cm", unite: "m²", quantite: 640, prixUnit: 115, total: 73600 },
          ],
        },
      ],
      totalHT: 1325960,
      tva: 10,
      totalTTC: 1458556,
      conditions: { acompte: "30% à la commande", paiement: "Situations mensuelles", delai: "12 mois après OS" },
      note: "Terrain argileux : étude géotechnique G2 obligatoire. Proximité voie ferrée : plan vibratoire requis.",
    },
  },
  {
    id: "sdg-2024-0831",
    status: "brouillon",
    createdAt: "2024-10-28T14:05:00Z",
    devis: {
      devisRef: "SDG-2024-0831",
      date: "28/10/2024",
      validite: "60 jours",
      entity: "ADSO",
      refCount: 8,
      client: { nom: "Bouygues Immobilier", email: "p.leclerc@bouygues-immo.fr", adresse: "Draguignan, Var (83300)" },
      projet: { titre: "Réhabilitation immeuble tertiaire R+4", localisation: "Draguignan", surface: "1 200 m²", duree: "6 mois" },
      lots: [
        {
          numero: "01",
          titre: "Démolition & Dépose",
          lignes: [
            { designation: "Dépose sélective cloisons existantes", detail: "Tri et évacuation déchet inertes", unite: "m²", quantite: 640, prixUnit: 28, total: 17920 },
            { designation: "Démolition faux-plafonds", detail: "Dalles 60×60 existantes", unite: "m²", quantite: 1200, prixUnit: 12, total: 14400 },
          ],
        },
        {
          numero: "02",
          titre: "Second œuvre neuf",
          lignes: [
            { designation: "Cloisons amovibles vitrées", detail: "Cloisons double vitrage 10mm, cadre alu", unite: "ml", quantite: 280, prixUnit: 420, total: 117600 },
            { designation: "Faux-plafonds dalles minérales", detail: "Dalles 60×60 Armstrong, plenum 55cm", unite: "m²", quantite: 1200, prixUnit: 52, total: 62400 },
            { designation: "Revêtement sols stratifié", detail: "Parquet stratifié chêne, pose sur silent", unite: "m²", quantite: 850, prixUnit: 68, total: 57800 },
          ],
        },
        {
          numero: "03",
          titre: "Peinture & Finitions",
          lignes: [
            { designation: "Peinture lisse intérieure", detail: "2 couches, preparation enduit", unite: "m²", quantite: 3200, prixUnit: 22, total: 70400 },
            { designation: "Menuiseries intérieures", detail: "Portes pleines chêne 83×204, quincaillerie inox", unite: "u", quantite: 32, prixUnit: 780, total: 24960 },
          ],
        },
      ],
      totalHT: 365480,
      tva: 10,
      totalTTC: 402028,
      conditions: { acompte: "30% à la commande", paiement: "Situations mensuelles", delai: "6 mois après OS" },
      note: "Bâtiment occupé pendant les travaux : planning de phase obligatoire. Accès restreint WE.",
    },
  },
  {
    id: "sdg-2024-0819",
    status: "brouillon",
    createdAt: "2024-10-10T09:15:00Z",
    devis: {
      devisRef: "SDG-2024-0819",
      date: "10/10/2024",
      validite: "60 jours",
      entity: "SODOBAT",
      refCount: 15,
      client: { nom: "Sogeprom", email: "d.mallet@sogeprom.fr", adresse: "Sainte-Maxime, Var (83120)" },
      projet: { titre: "Centre commercial – Gros œuvre", localisation: "Sainte-Maxime", surface: "5 200 m²", duree: "14 mois" },
      lots: [
        {
          numero: "01",
          titre: "Terrassement & VRD",
          lignes: [
            { designation: "Terrassement + décaissement", detail: "Fouilles générales, évacuation terres", unite: "m³", quantite: 1800, prixUnit: 85, total: 153000 },
            { designation: "VRD réseaux enterrés", detail: "Eau, assainissement, électricité", unite: "fft", quantite: 1, prixUnit: 48000, total: 48000 },
          ],
        },
        {
          numero: "02",
          titre: "Structure béton préfabriqué",
          lignes: [
            { designation: "Poteaux préfa béton", detail: "Section 50×50, hauteur 6m, pose grue", unite: "u", quantite: 48, prixUnit: 3800, total: 182400 },
            { designation: "Poutres béton précontraintes", detail: "Portée 14m, charge exploitation 500kg/m²", unite: "u", quantite: 36, prixUnit: 5200, total: 187200 },
            { designation: "Planchers préfabriqués", detail: "Dalles alvéolaires 20cm", unite: "m²", quantite: 5200, prixUnit: 95, total: 494000 },
          ],
        },
        {
          numero: "03",
          titre: "Dallage & Fondations",
          lignes: [
            { designation: "Fondations isolées poteaux", detail: "Béton armé C30/37", unite: "m³", quantite: 320, prixUnit: 440, total: 140800 },
            { designation: "Dallage industriel 25cm", detail: "Béton fibré, traitement surface durcisseur", unite: "m²", quantite: 5200, prixUnit: 82, total: 426400 },
          ],
        },
      ],
      totalHT: 1631800,
      tva: 10,
      totalTTC: 1794980,
      conditions: { acompte: "30% à la commande", paiement: "Situations mensuelles", delai: "14 mois après OS" },
    },
  },
  {
    id: "sdg-2024-0805",
    status: "brouillon",
    createdAt: "2024-09-22T16:40:00Z",
    devis: {
      devisRef: "SDG-2024-0805",
      date: "22/09/2024",
      validite: "60 jours",
      entity: "EASYMAT",
      refCount: 6,
      client: { nom: "Kaufman & Broad", email: "r.simon@kb.fr", adresse: "Fréjus, Var (83600)" },
      projet: { titre: "Installation chantier logements R+8", localisation: "Fréjus", surface: "4 500 m²", duree: "24 mois" },
      lots: [
        {
          numero: "01",
          titre: "Grue & Levage",
          lignes: [
            { designation: "Grue à tour MD 365", detail: "Location 24 mois, hauteur 65m, montage/démontage inclus", unite: "mois", quantite: 24, prixUnit: 2600, total: 62400 },
            { designation: "Monte-matériaux", detail: "Capacité 1 500kg, installation comprises", unite: "mois", quantite: 24, prixUnit: 850, total: 20400 },
          ],
        },
        {
          numero: "02",
          titre: "Bases de vie",
          lignes: [
            { designation: "Réfectoire modulaire 40m²", detail: "Bungalow réfectoire, équipé cuisine, WC", unite: "mois", quantite: 24, prixUnit: 480, total: 11520 },
            { designation: "Bureaux de chantier", detail: "2 modules 20m², réseaux data & élec", unite: "mois", quantite: 24, prixUnit: 380, total: 9120 },
            { designation: "Vestiaires sanitaires", detail: "4 modules, douches, WC, casiers", unite: "mois", quantite: 24, prixUnit: 560, total: 13440 },
          ],
        },
        {
          numero: "03",
          titre: "Clôtures & Signalétique",
          lignes: [
            { designation: "Clôtures palissades bois", detail: "H=2m, panneaux normalisés", unite: "ml", quantite: 180, prixUnit: 65, total: 11700 },
            { designation: "Signalétique réglementaire", detail: "Panneaux NF, plan installation, procédures", unite: "fft", quantite: 1, prixUnit: 3800, total: 3800 },
          ],
        },
      ],
      totalHT: 132380,
      tva: 20,
      totalTTC: 158856,
      conditions: { acompte: "30% à la commande", paiement: "Facturation trimestrielle", delai: "24 mois" },
    },
  },
  {
    id: "sdg-2024-0792",
    status: "brouillon",
    createdAt: "2024-09-05T11:20:00Z",
    devis: {
      devisRef: "SDG-2024-0792",
      date: "05/09/2024",
      validite: "60 jours",
      entity: "EASY HOME",
      refCount: 4,
      client: { nom: "ICADE Promotion", email: "s.bernard@icade.fr", adresse: "Roquebrune-sur-Argens, Var (83520)" },
      projet: { titre: "Bureau de vente programme immobilier", localisation: "Roquebrune-sur-Argens", surface: "60 m²", duree: "18 mois" },
      lots: [
        {
          numero: "01",
          titre: "Bureau de vente modulaire",
          lignes: [
            { designation: "Bungalow bureau 60m²", detail: "2 modules assemblés, isolation RT2020", unite: "fft", quantite: 1, prixUnit: 38000, total: 38000 },
            { designation: "Aménagement intérieur showroom", detail: "Cloisons vitrées, mobilier, signalétique", unite: "fft", quantite: 1, prixUnit: 9500, total: 9500 },
          ],
        },
        {
          numero: "02",
          titre: "Raccordements & Logistique",
          lignes: [
            { designation: "Raccordements VRD", detail: "Eau, électricité, data, assainissement", unite: "fft", quantite: 1, prixUnit: 4200, total: 4200 },
            { designation: "Transport, pose & dépose", detail: "Livraison site, installation, dépose fin de chantier", unite: "fft", quantite: 1, prixUnit: 5200, total: 5200 },
          ],
        },
      ],
      totalHT: 56900,
      tva: 20,
      totalTTC: 68280,
      conditions: { acompte: "30% à la commande", paiement: "50% pose, 20% dépose", delai: "18 mois" },
      note: "Devis refusé : concurrent retenu. Relance possible si révision prix bureaux modulaires.",
    },
  },
];

function isClient() {
  return typeof window !== "undefined";
}

function loadFromStorage(): DevisRecord[] {
  if (!isClient()) return FAKE_DB;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(FAKE_DB));
      return FAKE_DB;
    }
    return JSON.parse(raw) as DevisRecord[];
  } catch {
    return FAKE_DB;
  }
}

function saveToStorage(records: DevisRecord[]) {
  if (!isClient()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getDevisList(): DevisRecord[] {
  return loadFromStorage().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getDevisById(id: string): DevisRecord | null {
  return loadFromStorage().find((r) => r.id === id) ?? null;
}

export function saveDevis(record: DevisRecord): void {
  const records = loadFromStorage();
  const idx = records.findIndex((r) => r.id === record.id);
  if (idx >= 0) {
    records[idx] = record;
  } else {
    records.unshift(record);
  }
  saveToStorage(records);
}

export function updateDevisStatus(id: string, status: DevisStatus): void {
  const records = loadFromStorage();
  const idx = records.findIndex((r) => r.id === id);
  if (idx >= 0) {
    records[idx].status = status;
    saveToStorage(records);
  }
}

export function generateId(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(800 + Math.random() * 200);
  return `sdg-${year}-${num}${Math.floor(Math.random() * 9)}`;
}
