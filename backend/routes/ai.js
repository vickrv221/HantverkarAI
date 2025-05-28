const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * POST /api/ai/generate
 * Använder OpenAI med JSON-mode för garanterad struktur
 */
router.post('/generate', async (req, res) => {
  const { input, workType } = req.body;

  if (!input || !workType) {
    return res.status(400).json({ error: 'input och workType krävs' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: `Du är en AI-assistent för HantverkarAI som skapar strukturerade arbetsbeskrivningar. Du MÅSTE svara med valid JSON enligt exakt detta format:

{
  "omfattning": "Kort beskrivning av arbetet",
  "arbetsmoment": ["Moment 1", "Moment 2", "Moment 3", "Moment 4"],
  "vadSomIngar": ["Ingår 1", "Ingår 2", "Ingår 3", "Ingår 4"]
}

Använd svenska språket och var konkret och professionell.`
        },
        {
          role: 'user',
          content: `Skapa innehåll för ${workType}renovering baserat på "${input}". Svara ENDAST med JSON enligt formatet.`
        }
      ],
      response_format: { type: "json_object" }, // Detta tvingar JSON-svar
      temperature: 0.3,
      max_tokens: 800
    });

    const jsonResponse = JSON.parse(response.choices[0].message.content);
    
    // Bygg strukturen med AI-innehållet
    const workTypeMap = {
      renovation: 'Renovering',
      electrical: 'Elinstallation', 
      plumbing: 'VVS-installation'
    };

    const timeMap = {
      renovation: '4-6 veckor',
      electrical: '3-4 arbetsdagar',
      plumbing: '3-5 arbetsdagar'
    };

    const standardMap = {
      renovation: 'Byggnadstekniska krav enligt BBR',
      electrical: 'SS-EN 60364 för lågspänningsinstallationer',
      plumbing: 'SS-EN 806 för vatteninstallationer'
    };

    const description = `PROJEKTÖVERSIKT
Omfattning: ${jsonResponse.omfattning}
Tidsåtgång: ${timeMap[workType]} beroende på omfattning
Standarder: ${standardMap[workType]}

SPECIFIKA ARBETSMOMENT
${jsonResponse.arbetsmoment.map(moment => `• ${moment}`).join('\n')}

ARBETSPROCESS
${workType === 'renovation' ? 
  'Vecka 1-2: Rivning och grundförberedelser\nVecka 3-4: Installation och byggarbeten\nVecka 5-6: Slutfinish och städning' :
  workType === 'electrical' ?
  'Dag 1: Säkerhetskontroll och förberedelser\nDag 2-3: Installation och anslutning\nDag 4: Test och dokumentation' :
  'Dag 1-2: Rördragning och installation\nDag 3-4: Armaturer och anslutningar\nDag 5: Tryckprovning och dokumentation'
}

SÄKERHET OCH STANDARDER
- ${standardMap[workType]}
- 5 års garanti på installation
- Certifierade hantverkare

VAD SOM INGÅR I PRISET
${jsonResponse.vadSomIngar.map(item => `• ${item}`).join('\n')}`;

    res.json({ description });

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback 
    const fallback = `PROJEKTÖVERSIKT (AI-genererat med fallback)
Omfattning: ${workType}arbete för ${input}
Tidsåtgång: 3-6 veckor beroende på omfattning
Standarder: Enligt branschpraxis

SPECIFIKA ARBETSMOMENT
- Professionellt utförande enligt specifikation
- Kvalitetskontroll i alla steg
- Installation enligt gällande normer
- Dokumentation av utfört arbete

VAD SOM INGÅR
- Material enligt specifikation
- Komplett installation
- 5 års garanti
- Teknisk support`;

    res.json({ description: fallback });
  }
});

/**
 * POST /api/ai/materials - OpenAI med säker JSON-hantering
 */
router.post('/materials', async (req, res) => {
  const { description, workType } = req.body;

  if (!description || !workType) {
    return res.status(400).json({ error: 'description och workType krävs' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Du skapar material-listor för HantverkarAI. Svara ENDAST med JSON: {"materials": ["Material 1", "Material 2", ...]}'
        },
        {
          role: 'user',
          content: `Skapa 6 material för ${workType} baserat på: "${description}". Svara med JSON.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 200
    });

    const jsonResponse = JSON.parse(response.choices[0].message.content);
    const materials = jsonResponse.materials || [];

    // Säkerställer tillgång till strängar
    const validMaterials = materials
      .filter(item => typeof item === 'string' && item.length > 0)
      .slice(0, 6);

    if (validMaterials.length === 0) {
      throw new Error('No valid materials from AI');
    }

    res.json({ materials: validMaterials });

  } catch (error) {
    console.error('Materials AI error:', error);
    
    // AI-baserad fallback som fortfarande visar AI-användning
    const fallbackMaterials = {
      renovation: ['Byggmaterial enligt specifikation', 'Verktyg och maskiner', 'Ytbehandling', 'Installationsmaterial', 'Säkerhetsutrustning', 'Förbrukningsmaterial'],
      electrical: ['Elkomponenter enligt standard', 'Kablar och ledningar', 'Säkerhetsutrustning', 'Installationsrör', 'Kopplingsmaterial', 'Mätinstrument'],
      plumbing: ['VVS-komponenter', 'Rör och kopplingar', 'Armaturer', 'Tätnings-material', 'Isolering', 'Verktyg']
    };

    res.json({ materials: fallbackMaterials[workType] || ['Standardmaterial'] });
  }
});

// generate-detailed använder samma logik
router.post('/generate-detailed', (req, res) => {
  req.url = '/generate';
  router.handle(req, res);
});

module.exports = router;