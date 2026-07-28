import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateLocalChatReply(userQuery: string, budgetContext: any): string {
  const query = (userQuery || "").toLowerCase().trim();

  const totalBudget = budgetContext?.totalBudget || 0;
  const days = budgetContext?.daysCount || 30;
  const periodLabel = budgetContext?.periodLabel || (budgetContext?.period === 'year' ? '9 mois' : '30 jours');
  const cantineTotal = budgetContext?.categories?.cantine?.amount || budgetContext?.categories?.cantine?.total || 0;
  const foodTotal = budgetContext?.categories?.food?.amount || budgetContext?.categories?.food?.total || budgetContext?.categories?.foodLife?.total || 0;
  const transportSchoolTotal = budgetContext?.categories?.transport_school?.amount || budgetContext?.categories?.transport_school?.total || 0;
  const transportTotal = budgetContext?.categories?.transport?.amount || budgetContext?.categories?.transport?.total || 0;
  const papotteTotal = budgetContext?.categories?.papotte?.amount || budgetContext?.categories?.papotte?.total || 0;
  const remaining = budgetContext?.remainingAmount || 0;

  const cantineDaily = Math.round(cantineTotal / days);
  const foodDaily = Math.round(foodTotal / days);

  // A. Frustration / complaint / same question check
  if (query.includes('menerve') || query.includes('énerve') || query.includes('nulle') || query.includes('même question') || query.includes('meme question') || query.includes('reponds bien') || query.includes('réponds bien') || query.includes('inutile') || query.includes('mauvais') || query.includes('stupide')) {
    return `Je te présente mes sincères excuses ! 🙏 Je suis l'IA STADJAI et je suis là pour t'écouter attentivement.

Rappelle-moi exactement ce que tu souhaites savoir ou calculer, et je vais te répondre directement avec précision !

Voici les sujets sur lesquels je peux t'aider immédiatement :
1. **Calculs de repas personnalisés** (ex: manger à 500F le soir, cantine à midi à 200F, petit-déjeuner à 100F).
2. **Gestion du budget mensuel** (${totalBudget.toLocaleString('fr-FR')} FCFA sur ${periodLabel}).
3. **Conseils pour le Resto U, les cités et la vie à Bondoukou**.
4. **Conseils d'études, d'examens et spiritualité**.

Pose-moi ta question de manière précise, je t'écoute ! 😊`;
  }

  // B. Greetings
  if (query.includes('bonjour') || query.includes('salut') || query.includes('coucou') || query.includes('qui es tu') || query.includes('qui es-tu') || query.includes('tu es qui') || query.includes('présente toi') || query.includes('presente toi')) {
    return `Bonjour mon cher étudiant ! 👋

Je suis **L'IA STADJAI**, ton assistant virtuel et conseiller financier, académique et spirituel dédié aux étudiants de l'Université de Bondoukou.

Je suis programmé pour :
- Calculer exactement tes plafonds de dépenses quotidiens et mensuels.
- T'aider à équilibrer tes repas entre le Resto U (CROU-B) et la vie étudiante (Garba/Maquis).
- Te donner des astuces concrètes pour réussir tes examens et bien gérer ton budget.

Comment puis-je t'aider aujourd'hui ? Pose-moi n'importe quelle question ! 😊`;
  }

  // C. Specific Scenario: 500F meal at night + Resto U at noon + breakfast
  if (
    query.includes('500') &&
    (query.includes('soir') || query.includes('maquis') || query.includes('garba') || query.includes('plat'))
  ) {
    const petitDejDaily = 100; // Ticket petit dej ou bouillie
    const midiCantineDaily = 200; // Ticket Resto U midi
    const soirVieEtudianteDaily = 500; // Plats vie étudiante (Garba/Maquis) à partir de 500F

    const dailyFoodTarget = petitDejDaily + midiCantineDaily + soirVieEtudianteDaily; // 800F / jour
    const monthlyFoodTarget = dailyFoodTarget * 30; // 24 000F / mois

    const currentTotalFoodAllocated = cantineTotal + foodTotal;
    const difference = currentTotalFoodAllocated - monthlyFoodTarget;

    let budgetAnalysis = "";
    if (currentTotalFoodAllocated >= monthlyFoodTarget) {
      budgetAnalysis = `✅ **Excellente nouvelle !** Ton budget nourriture actuel (**${currentTotalFoodAllocated.toLocaleString('fr-FR')} FCFA**) couvre largement cet objectif de **${monthlyFoodTarget.toLocaleString('fr-FR')} FCFA / mois**. Il te reste même une marge de **${difference.toLocaleString('fr-FR')} FCFA** !`;
    } else {
      const missing = monthlyFoodTarget - currentTotalFoodAllocated;
      budgetAnalysis = `⚠️ **Ajustement recommandé :** Ton budget nourriture actuel est de **${currentTotalFoodAllocated.toLocaleString('fr-FR')} FCFA**. Pour manger le soir à 500F, midi au Resto U à 200F et le matin à 100F (**800 FCFA/jour = 24 000 FCFA/mois**), il te manque **${missing.toLocaleString('fr-FR')} FCFA**. Tu peux prélever cette différence sur ta réserve de sécurité (${remaining.toLocaleString('fr-FR')} FCFA).`;
    }

    return `🎯 **Analyse de ton plan repas : Midi Resto U (200F) + Soir Maquis (500F) + Matin (100F)**

Voici la décomposition budgétaire exacte :

📊 **Coût Quotidien :**
• Matin (Petit-déjeuner/Bouillie) : **100 FCFA**
• Midi (Resto U CROU-B) : **200 FCFA**
• Soir (Plat vie étudiante/Garba à 500F) : **500 FCFA**
👉 **Total par jour : 800 FCFA / jour**

💵 **Coût Mensuel (sur 30 jours) :**
• 800 F × 30 jours = **24 000 FCFA / mois**

🔍 **Statut par rapport à ton budget configuré :**
${budgetAnalysis}

💡 **Conseil STADJAI :** Achète tes souches Resto U pour le midi et le matin en début de mois (9 000 FCFA au total), et garde 15 000 FCFA en monnaie liquide pour tes plats du soir !`;
  }

  // D. Studies / Exams / Revision / Classes
  if (query.includes('examen') || query.includes('cours') || query.includes('revision') || query.includes('révision') || query.includes('note') || query.includes('prof') || query.includes('étude') || query.includes('etude') || query.includes('reussite') || query.includes('réussite') || query.includes('fac')) {
    return `📚 **Conseils pour réussir tes études à l'Université de Bondoukou :**

1. **Régularité des révisions :** Relis tes cours le soir même après la journée d'amphi. Ne laisse pas les polycopiés s'accumuler jusqu'aux examens.
2. **Travail en groupe :** Forme un petit groupe d'étude de 3 à 4 camarades sérieux à la bibliothèque ou en cité U pour retravailler les travaux dirigés (TD).
3. **Hygiène de vie :** Dormir au moins 7 heures par nuit et bien manger au Resto U garantit la concentration pendant les épreuves.
4. **Gestion du temps :** Consacre au moins 2 heures d'étude personnelle par jour en dehors des heures de cours.

*« Applique ton cœur à l'instruction, et tes oreilles aux paroles de la science. » (Proverbes 23:12)*`;
  }

  // E. Housing / Logement / Room / Cité U
  if (query.includes('logement') || query.includes('chambre') || query.includes('cite') || query.includes('cité') || query.includes('quartier') || query.includes('loyer') || query.includes('bail') || query.includes('residence')) {
    return `🏠 **Conseils Logement & Hébergement à Bondoukou :**

1. **Résidences Universitaires CROU-B :** Renseigne-toi auprès de la direction de la cité U pour les critères d'attribution des chambres.
2. **Logements en quartier (Hors Campus) :** Si tu es en location privée en ville ou au quartier, évite de louer seul si ton budget est serré. La colocation permet de diviser le loyer, l'électricité (CIE) et l'eau (SODECI) par deux.
3. **Entretien de la chambre :** Achète ton matériel d'hygiène (savon, javel, balai) dès le début du mois avec ton budget "La Papotte".`;
  }

  // F. Resto U / Cantine / Ticket / Souche
  if (query.includes('resto') || query.includes('cantine') || query.includes('crou') || query.includes('ticket') || query.includes('souche')) {
    return `🍱 **Tout sur le Resto U de l'Université de Bondoukou (CROU-B) :**

• **Petit-Déjeuner (Matin) :** 1 ticket = **100 FCFA** (Souche de 10 tickets = 1 000 FCFA).
• **Déjeuner & Dîner (Midi & Soir) :** 1 ticket = **200 FCFA** (Souche de 10 tickets = 2 000 FCFA).

💡 **Astuce d'or :** Achète toujours tes souches de tickets au guichet du CROU-B dès la première semaine du mois. Ainsi, ta nourriture est garantie jusqu'à la fin du mois sans risque de disette !`;
  }

  // G. Transport / Taxi / Moving around
  if (query.includes('transport') || query.includes('ecole') || query.includes('école') || query.includes('cours') || query.includes('taxi') || query.includes('bus') || query.includes('déplacement') || query.includes('deplacement') || query.includes('ville')) {
    return `🚌 **Conseils Transport à Bondoukou (École & Ville) :**

1. **Transport École (Lundi au Vendredi) :**
   • **Prix :** 500 FCFA Aller + 500 FCFA Retour = **1 000 FCFA / jour de cours**.
   • **Par mois (~20 jours de cours) :** **20 000 FCFA / mois** (Budget alloué : ${transportSchoolTotal.toLocaleString('fr-FR')} FCFA).
   • **Astuce :** Organise-toi avec tes camarades de classe pour privatiser un taxi ou marcher ensemble si tu es proche du campus !

2. **Transport Religieux & Ville :**
   • Budget alloué : **${transportTotal.toLocaleString('fr-FR')} FCFA**.
   • **A pied :** La marche pour aller au culte ou en ville est économique et garde en forme !`;
  }

  // H. Budget breakdown / General finances
  if (query.includes('budget') || query.includes('dépense') || query.includes('depense') || query.includes('argent') || query.includes('calcul') || query.includes('combien') || query.includes('plafond') || query.includes('epargne') || query.includes('épargne') || query.includes('reste')) {
    return `💰 **Synthèse de ton Budget STADJAI :**

• **Budget Total :** **${totalBudget.toLocaleString('fr-FR')} FCFA** pour **${periodLabel}**.
• **Cantine Resto U :** ${cantineTotal.toLocaleString('fr-FR')} FCFA (${cantineDaily} F/jour).
• **Alimentation Hors Cantine :** ${foodTotal.toLocaleString('fr-FR')} FCFA (${foodDaily} F/jour).
• **Transport :** ${transportTotal.toLocaleString('fr-FR')} FCFA.
• **Hygiène & Papotte :** ${papotteTotal.toLocaleString('fr-FR')} FCFA.
• **Réserve de Sécurité :** **${remaining.toLocaleString('fr-FR')} FCFA**.

Reste rigoureux au quotidien pour garder ton épargne intacte !`;
  }

  // I. Default fallback: Answer the user's explicit question dynamically
  return `Mon cher étudiant, concernant ta question : **"${userQuery}"**

Voici l'analyse personnalisée de l'IA STADJAI :

1. **Analyse de ta demande :**
   Tu as un budget total configuré de **${totalBudget.toLocaleString('fr-FR')} FCFA** pour **${periodLabel}**.
2. **Priorité absolue :**
   Assure d'abord tes besoins fondamentaux (nourriture Resto U à 100F/200F, logement, produits d'hygiène).
3. **Plafonds quotidiens recommandés :**
   • Repas Cantine : ~${cantineDaily} F / jour
   • Nourriture Vie Étudiante : ~${foodDaily} F / jour
   • Réserve d'urgence intouchable : **${remaining.toLocaleString('fr-FR')} FCFA**.

N'hésite pas à me poser une question plus précise sur tes cours, tes repas du soir, tes tickets ou tes astuces d'épargne ! 😊`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Dynamic Biblical Wisdom Advice from Gemini AI
  app.post("/api/wisdom", async (req, res) => {
    try {
      const { amount, period, categories, remaining } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(200).json({
          success: false,
          fallback: true,
          message: "API Key non configurée. Utilisation du moteur de sagesse biblique intégré."
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const durationText = period === "year" ? "une année académique de 9 mois" : "un mois";

      const prompt = `
Tu es le conseiller sage et spirituel de l'application "STADJAI", dédiée aux étudiants de l'Université de Bondoukou (Côte d'Ivoire).
Un étudiant vient de saisir un budget total de ${amount} FCFA pour ${durationText}.

Voici la répartition de son budget :
- Tickets de Cantine (CROU-B) : ${categories.cantine?.total || 0} FCFA
- Nourriture de la vie étudiante (Maquis/Garba/Allocodrome) : ${categories.foodLife?.total || 0} FCFA
- Nourriture de la boulangerie (Pain/Petits déjeuners) : ${categories.boulangerie?.total || 0} FCFA
- Transport (Aller-retour Église/Mosquée/Ville à 1000F) : ${categories.transport?.total || 0} FCFA
- La Papotte (Pack Hygiène : Savon, liquide, dentifrice, parfum) : ${categories.papotte?.total || 0} FCFA
- Réserve / Épargne restante : ${remaining} FCFA

TÂCHE :
Génère un conseil très très sage, encourageant et fraternel en te basant fortement sur la BIBLE (Proverbes, Ecclésiaste, Évangiles, etc.).
Insiste fortement sur les points suivants :
1. Ne pas gaspiller son argent dans des futilités.
2. Penser à DEMAIN (l'épargne de précaution, la prévoyance).
3. Être un bon gestionnaire des ressources que Dieu accorde pendant la vie universitaire à Bondoukou.
4. Un mot d'encouragement spécifique pour sa vie d'étudiant à Bondoukou.

Réponds sous forme d'un objet JSON strict valide avec la structure exacte suivante (sans markdown wrapper autour) :
{
  "reference": "Livre Chapitre:Verset (ex: Proverbes 21:20)",
  "verseText": "Texte exact ou fidèle du verset biblique",
  "spiritualAdvice": "Explication spirituelle et conseil de gestion bienveillant et profond (3 à 4 phrases).",
  "antiWasteTip": "Astuce très concrète pour éviter le gaspillage au quotidien à l'Université de Bondoukou.",
  "encouragement": "Mise en garde fraternelle et bénédiction pour son avenir."
}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text?.trim() || "";
      let parsed = null;
      try {
        parsed = JSON.parse(responseText);
      } catch (e) {
        console.error("JSON parse error from Gemini output:", responseText);
      }

      if (parsed) {
        return res.json({ success: true, wisdom: parsed });
      } else {
        return res.json({ success: false, fallback: true });
      }
    } catch (err: any) {
      console.error("Error generating wisdom via Gemini:", err);
      return res.status(200).json({ success: false, fallback: true, error: err.message });
    }
  });

  // API Route: Interactive Chatbot Advisor for Students (IA STADJAI - Powered by Claude / Gemini)
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, budgetContext } = req.body;
      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      const geminiKey = process.env.GEMINI_API_KEY;

      // Extract latest user query
      let userQuery = "Conseil sur mon budget et mes dépenses";
      if (Array.isArray(messages) && messages.length > 0) {
        const lastUser = [...messages].reverse().find((m: any) => m.role === "user" || m.sender === "user");
        if (lastUser && lastUser.text) {
          userQuery = lastUser.text;
        }
      }

      const citeStatusText = budgetContext?.isCiteUniversitaire
        ? "Cité Universitaire (Sur le campus : 0 FCFA de transport école)"
        : "Hors Cité / En Ville (500F Aller / 500F Retour = 1000F/jour de cours = 20 000 FCFA/mois)";

      const budgetSummaryText = budgetContext ? `
BUDGET ACTUEL DE L'ÉTUDIANT :
- Budget Total : ${budgetContext.totalBudget || 0} FCFA
- Période : ${budgetContext.periodLabel || budgetContext.period || '30 jours'}
- Nombre de jours : ${budgetContext.daysCount || 30} jours
- Résidence / Logement : ${citeStatusText}
- Transport École (Lundi-Vendredi) : ${budgetContext.categories?.transport_school?.total || budgetContext.categories?.transport_school?.amount || 0} FCFA
- Cantine CROU-B : ${budgetContext.categories?.cantine?.total || budgetContext.categories?.cantine?.amount || 0} FCFA (Plafond/jour: ${Math.round((budgetContext.categories?.cantine?.total || budgetContext.categories?.cantine?.amount || 0) / (budgetContext.daysCount || 30))} F)
- Nourriture Vie Étudiante : ${budgetContext.categories?.food?.total || budgetContext.categories?.food?.amount || budgetContext.categories?.foodLife?.total || 0} FCFA (Plafond/jour: ${Math.round((budgetContext.categories?.food?.total || budgetContext.categories?.food?.amount || budgetContext.categories?.foodLife?.total || 0) / (budgetContext.daysCount || 30))} F)
- Transport (Églises/Mosquées/Ville) : ${budgetContext.categories?.transport?.total || budgetContext.categories?.transport?.amount || 0} FCFA
- La Papotte (Hygiène & Entretien) : ${budgetContext.categories?.papotte?.total || budgetContext.categories?.papotte?.amount || 0} FCFA
- Réserve de Sécurité : ${budgetContext.remainingAmount || 0} FCFA
      ` : "Aucun budget calculé pour l'instant.";

      const systemInstruction = `
Tu es "L'IA STADJAI" — le conseiller financier, spirituel, académique et assistant de vie ultra-performant dédié aux étudiants de l'Université de Bondoukou (Côte d'Ivoire).
Ton rôle est d'être d'une précision chirurgicale, chaleureux, hautement intelligent et capable de répondre à TOUTE QUESTION complexe sur :
1. Les calculs financiers sur-mesure, objectifs mensuels, arbitrages repas (ex: cantine à midi seulement = 200F, petit-déjeuner = 100F, plat du soir vie étudiante = 500F+, total = 800F/jour = 24 000F/mois).
2. La vie sur le campus de Bondoukou, les résidences, les cours, la réussite aux examens, la gestion du stress et du temps.
3. La sagesse biblique, l'éthique, la prévoyance financière et le développement personnel.

${budgetSummaryText}

DIRECTIVES STRICTES DE RÉPONSE :
- Réponds TOUJOURS précisément à la NOUVELLE QUESTION posée par l'étudiant, en tenant compte de ses mots exacts !
- Si l'étudiant te pose une question générale, un bonjour ou exprime son agacement, réponds directement avec empathie et intelligence.
- Si l'étudiant te donne des conditions particulières de repas ou de budget, fais les calculs exacts et compare cela à son budget.
- Utilise un ton fraternel, bienveillant, sage et motivant ("Mon cher étudiant", "Mon frère / ma sœur").
- Structure ta réponse avec des titres en gras, des listes à puces et des emojis appropriés.
- Termine par un court verset biblique inspirant (ex: Proverbes, Ecclésiaste) ou une parole de bénédiction.
      `;

      // 1. Try Anthropic Claude API if key exists and is valid
      if (anthropicKey && anthropicKey !== "MY_ANTHROPIC_API_KEY" && anthropicKey.trim().length > 10) {
        try {
          const anthropic = new Anthropic({ apiKey: anthropicKey });

          const formattedMessages: Array<{ role: "user" | "assistant"; content: string }> = [];
          if (Array.isArray(messages)) {
            for (const msg of messages) {
              const role: "user" | "assistant" = (msg.role === "user" || msg.sender === "user") ? "user" : "assistant";
              const text = msg.text || "";
              if (!text.trim()) continue;

              if (formattedMessages.length > 0 && formattedMessages[formattedMessages.length - 1].role === role) {
                formattedMessages[formattedMessages.length - 1].content += "\n" + text;
              } else {
                formattedMessages.push({ role, content: text });
              }
            }
          }

          while (formattedMessages.length > 0 && formattedMessages[0].role !== "user") {
            formattedMessages.shift();
          }

          if (formattedMessages.length === 0) {
            formattedMessages.push({ role: "user", content: userQuery });
          }

          const response = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            system: systemInstruction,
            messages: formattedMessages,
          });

          const firstBlock = response.content[0];
          if (firstBlock && firstBlock.type === "text" && firstBlock.text.trim()) {
            return res.json({ success: true, reply: firstBlock.text });
          }
        } catch (anthropicErr) {
          console.error("Claude API error, trying Gemini fallback:", anthropicErr);
        }
      }

      // 2. Try Gemini API if key exists and is valid
      if (geminiKey && geminiKey.trim().length > 5) {
        try {
          const ai = new GoogleGenAI({ apiKey: geminiKey });

          const formattedContents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
          if (Array.isArray(messages)) {
            for (const msg of messages) {
              const role: "user" | "model" = (msg.role === "user" || msg.sender === "user") ? "user" : "model";
              const text = msg.text || "";
              if (!text.trim()) continue;

              if (formattedContents.length > 0 && formattedContents[formattedContents.length - 1].role === role) {
                formattedContents[formattedContents.length - 1].parts[0].text += "\n" + text;
              } else {
                formattedContents.push({ role, parts: [{ text }] });
              }
            }
          }

          while (formattedContents.length > 0 && formattedContents[0].role !== "user") {
            formattedContents.shift();
          }

          if (formattedContents.length === 0) {
            formattedContents.push({ role: "user", parts: [{ text: userQuery }] });
          }

          const response = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: formattedContents,
            config: {
              systemInstruction: systemInstruction,
            },
          });

          if (response.text && response.text.trim()) {
            return res.json({ success: true, reply: response.text });
          }
        } catch (geminiErr) {
          console.error("Gemini API error, falling back to smart local advisor:", geminiErr);
        }
      }

      // 3. Smart local advisor fallback
      const localReply = generateLocalChatReply(userQuery, budgetContext);
      return res.status(200).json({ success: true, reply: localReply, fallback: true });
    } catch (err: any) {
      console.error("Error in /api/chat route:", err);
      const fallbackReply = generateLocalChatReply("Conseils généraux", req.body?.budgetContext);
      return res.status(200).json({
        success: true,
        reply: fallbackReply,
        fallback: true
      });
    }
  });

  // Health route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "STADJAI - Université de Bondoukou" });
  });

  // Vite middleware for development vs Static in production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`STADJAI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

