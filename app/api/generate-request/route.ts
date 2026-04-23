import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST() {
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 500,
      system: `Tu génères de fausses demandes client réalistes pour Sodobat, une entreprise de BTP française.
Réponds UNIQUEMENT en JSON valide, sans backticks, sans markdown:
{
  "clientName": "Nom société cliente",
  "clientEmail": "email@exemple.fr",
  "projectType": "gros_oeuvre|second_oeuvre|installation_chantier|bureaux_modulaires|maitrise_oeuvre",
  "location": "Ville, région",
  "description": "Description détaillée du projet (3-4 phrases avec surfaces, contraintes, délais)"
}`,
      messages: [
        {
          role: "user",
          content:
            "Génère une demande client réaliste et variée pour un projet BTP situé dans le Var (83), en Provence-Alpes-Côte d'Azur. Autour de Fréjus-Saint-Rapahel, dans un rayon de 35km. La localisation doit être une ville du Var",
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleaned);
    return NextResponse.json(data);
  } catch (err) {
    console.error("generate-request error:", err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}
