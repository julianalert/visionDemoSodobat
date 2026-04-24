import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST() {
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 600,
      system: `Tu génères de fausses demandes client réalistes pour SODOBAT, entreprise BTP basée à Fréjus (Var, 83).
Réponds UNIQUEMENT avec un texte naturel en français, comme si c'était un email ou un message d'un client.
Le texte doit inclure naturellement : nom de la société cliente, email de contact, type de travaux, localisation dans le Var (rayon 50km autour de Fréjus/Saint-Raphaël), surface approximative, contraintes et délai souhaité.
Varie les types de projets : gros œuvre, réhabilitation, aménagement intérieur, installation chantier, espaces modulaires.
Ton naturel, professionnel, 3-5 phrases. Pas de JSON, pas de structure, juste le texte brut.`,
      messages: [
        {
          role: "user",
          content: "Génère une demande client réaliste et variée.",
        },
      ],
    });

    const message =
      response.content[0].type === "text" ? response.content[0].text.trim() : "";
    return NextResponse.json({ message });
  } catch (err) {
    console.error("generate-request error:", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
