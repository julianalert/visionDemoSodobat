import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const HISTORICAL_DB = `
BASE DE DONNÉES HISTORIQUE SODOBAT — DEVIS TYPES (extraits représentatifs)

## GROS ŒUVRE - TERTIAIRE

**DEV-2023-0142** | Immeuble de bureaux R+5 | Paris 15e | 2 800m² SDP
- Fondations : 65 000€ (fouilles, béton de propreté, semelles filantes)
- Structure béton armé : 320 000€ (poteaux, dalles, voiles, aciers)
- Façades béton : 85 000€
- Maçonnerie périphérique : 42 000€
- Charpente acier couverture : 38 000€
- Total HT : 550 000€ | TVA 10% | Délai : 8 mois

**DEV-2023-0198** | Immeuble résidentiel R+7 | Vincennes | 3 400m²
- Fondations profondes (pieux) : 95 000€
- Structure béton armé R+7 : 480 000€
- Voiles de refend : 65 000€
- Toiture-terrasse : 28 000€
- Total HT : 668 000€ | Délai : 10 mois

**DEV-2022-0089** | Réhabilitation immeuble tertiaire R+4 | Levallois | 1 200m²
- Dépose sélective : 18 000€
- Reprise en sous-œuvre : 55 000€
- Restructuration béton : 145 000€
- Total HT : 218 000€ | Délai : 6 mois

**DEV-2024-0011** | Centre commercial – Gros œuvre | Créteil | 5 200m²
- Terrassement + VRD : 120 000€
- Fondations dalles sur sol : 145 000€
- Structure béton préfabriqué : 550 000€
- Total HT : 815 000€ | Délai : 14 mois

## SECOND ŒUVRE - ADSO

**DEV-2023-0201** | Aménagement bureaux open-space | La Défense | 650m²
- Cloisons amovibles : 38 000€
- Faux-plafonds : 22 000€
- Revêtements sols (moquette + carrelage) : 18 000€
- Peinture : 12 000€
- Total HT : 90 000€ | Délai : 3 mois

**DEV-2022-0156** | Rénovation salle de réunion + espaces communs | Neuilly | 280m²
- Démolitions légères : 8 000€
- Cloisons plâtre : 15 000€
- Revêtements : 9 500€
- Menuiseries intérieures : 11 000€
- Total HT : 43 500€ | Délai : 6 semaines

## INSTALLATION CHANTIER - EASYMAT

**DEV-2023-0310** | Installation chantier R+6 | Paris 17e | 36 mois
- Grue à tour location : 85 000€
- Bases vie (réfectoire, vestiaires, bureaux) : 32 000€
- Clôtures + palissades : 14 000€
- Éclairage chantier + groupe électrogène : 9 500€
- Signalétique réglementaire : 3 200€
- Total HT : 143 700€

**DEV-2024-0044** | Installation chantier logements R+4 | Bobigny | 18 mois
- Grue télescopique : 42 000€
- Bases vie modulaires : 18 500€
- Alimentation eau + énergie : 7 200€
- Total HT : 67 700€

## ESPACES MODULAIRES - EASY HOME

**DEV-2023-0405** | Bureau de vente programme immobilier | Lyon | 18 mois
- Bungalow bureau de vente 40m² : 28 000€ (location)
- Aménagement intérieur & signalétique : 8 500€
- Raccordements VRD : 3 500€
- Livraison + pose + dépose : 4 200€
- Total HT : 44 200€

## MAÎTRISE D'ŒUVRE - EASY INGENIERIE

**DEV-2023-0501** | MOe immeuble tertiaire R+5 | Paris | 3 200m²
- Mission complète (DPC → réception) : 4,2% du coût travaux
- Estimatif travaux : 1 100 000€ → Honoraires : 46 200€

TARIFS UNITAIRES DE RÉFÉRENCE (mis à jour T1 2024)
- Béton armé coulé en place : 380–450€/m³
- Maçonnerie parpaing : 85–110€/m²
- Dallage béton 20cm : 65–85€/m²
- Cloisons plâtre BA13 : 55–75€/m²
- Faux-plafond dalle 60x60 : 45–65€/m²
- Peinture lisse : 18–28€/m²
- Grue à tour / mois : 2 200–2 800€/mois
- Bungalow base vie / mois : 350–550€/mois

CONDITIONS GÉNÉRALES SODOBAT
- Acompte : 30% à la commande
- Paiements échelonnés : sur situations mensuelles
- Validité devis : 60 jours
- Assurance décennale : AXA – Police n°FR-BTP-2019-SDG-447
- Garanties : parfait achèvement 1 an, bon fonctionnement 2 ans, décennale 10 ans
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientName, clientEmail, location, typeLabel, desc } = body;

    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4000,
      system: `Tu es un expert deviseur BTP pour le Groupe SDG (SODOBAT, ADSO, EASYMAT, EASY HOME, EASY INGENIERIE) en France.
Tu génères des devis professionnels précis et réalistes, basés sur la base de données historique fournie.

IMPORTANT: Réponds UNIQUEMENT avec du JSON brut valide. Aucun texte avant ou après. Aucun backtick. Aucun markdown. Commence directement par { et termine par }.

Structure exacte à respecter:
{
  "devisRef": "SDG-2024-XXXX",
  "date": "JJ/MM/AAAA",
  "validite": "60 jours",
  "entity": "SODOBAT",
  "refCount": 18,
  "client": {
    "nom": "Nom du client",
    "email": "email@client.fr",
    "adresse": "Ville, département"
  },
  "projet": {
    "titre": "Intitulé court",
    "localisation": "Ville",
    "surface": "XXX m²",
    "duree": "X mois"
  },
  "lots": [
    {
      "numero": "01",
      "titre": "Nom lot",
      "lignes": [
        {
          "designation": "Prestation",
          "detail": "détail technique",
          "unite": "m²",
          "quantite": 100,
          "prixUnit": 450,
          "total": 45000
        }
      ]
    }
  ],
  "totalHT": 45000,
  "tva": 10,
  "totalTTC": 49500,
  "conditions": {
    "acompte": "30% à la commande",
    "paiement": "Situations mensuelles",
    "delai": "8 mois après OS"
  },
  "note": "Remarque importante"
}

Génère 2 à 3 lots maximum avec 2 à 4 lignes chacun. Prix réalistes marché BTP 2024. totalHT = somme exacte de tous les total des lignes. totalTTC = totalHT * 1.10 (arrondi).`,
      messages: [
        {
          role: "user",
          content: `BASE HISTORIQUE:\n${HISTORICAL_DB}\n\nDEMANDE CLIENT:\nClient: ${clientName} (${clientEmail})\nType: ${typeLabel}\nLocalisation: ${location}\nDescription: ${desc}\n\nGénère le devis complet.`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const devis = JSON.parse(cleaned);
    return NextResponse.json(devis);
  } catch (err) {
    console.error("generate-quote error:", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
