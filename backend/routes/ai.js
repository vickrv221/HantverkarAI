const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Fallbackbeskrivningar
const fallbackDescriptions = {
  renovation: `Omfattning: Renoveringsarbete
Uppskattad tidsåtgång: 2–3 arbetsdagar

Arbetet omfattar följande moment:
• Förarbete och skyddsåtgärder
• Slipning och preparation av ytor
• Behandling och finish
• Städning och slutkontroll

Specifika åtgärder:
Slipjobb`,
  electrical: `Omfattning: Elarbete
Uppskattad tidsåtgång: 1–2 arbetsdagar

Moment:
• Säkerhetsgenomgång
• Installation
• Test och dokumentation`,
  plumbing: `Omfattning: VVS-arbete
Uppskattad tidsåtgång: 2 arbetsdagar

Moment:
• Rördragning
• Tätning
• Test och felsökning`
};

// Fallbackmaterial
const fallbackMaterials = {
  renovation: [
    'Slippapper olika kornstorlekar',
    'Träolja eller lack',
    'Skyddsplast',
    'Rengöringsmedel'
  ],
  electrical: [
    'Kabel och installationsrör',
    'Kopplingsdosor och uttag',
    'Säkringar och brytare',
    'Mätinstrument'
  ],
  plumbing: [
    'Rör och kopplingar',
    'Tätningsmassa',
    'Ventiler',
    'Fogmaterial'
  ]
};

// POST /api/ai/generate
router.post('/generate', async (req, res) => {
  const { input, workType } = req.body;

  if (!input || !workType) {
    return res.status(400).json({ error: 'input och workType krävs' });
  }

  const prompt = `Skriv en arbetsbeskrivning för en offert. Arbetet gäller kategorin "${workType}" och ska baseras på följande kundinformation: "${input}". 

Texten ska:
- Vara skriven från företagets perspektiv till kunden
- Inte vara formulerad som en platsannons eller innehålla fraser som "vi söker", "du ska", "CV", "ansökan"
- Inte rikta sig till arbetssökande
- Ha professionell och tydlig ton
- Vara skriven på svenska
- Inkludera en kort beskrivning av arbetets omfattning, uppskattad tidsåtgång och de huvudsakliga arbetsmomenten`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'Du är ett byggföretag som skriver arbetsbeskrivningar i offerter riktade till kunder. Du får aldrig skriva platsannonser eller texter riktade till arbetssökande.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const description = response.choices?.[0]?.message?.content?.trim();
    res.json({ description });
  } catch (error) {
    console.error('/generate OpenAI error:', error.status, error.message);

    if (error.status === 429) {
      const fallback = fallbackDescriptions[workType] || `Beskrivning: ${input}`;
      return res.json({ description: fallback });
    }

    res.status(500).json({ error: 'AI Service Error' });
  }
});


// POST /api/ai/materials
router.post('/materials', async (req, res) => {
  const { description, workType } = req.body;

  if (!description || !workType) {
    return res.status(400).json({ error: 'description och workType krävs' });
  }

  const prompt = `Föreslå en lista med byggmaterial som behövs för ett arbete inom ${workType}. Beskrivning: ${description}. Returnera som JSON-array.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }]
    });

    const raw = response.choices?.[0]?.message?.content?.trim();
    let materials;

    try {
      materials = JSON.parse(raw);
    } catch {
      materials = raw.split('\n').filter(Boolean);
    }

    res.json({ materials });
  } catch (error) {
    console.error('/materials OpenAI error:', error.status, error.message);

    if (error.status === 429) {
      return res.json({ materials: fallbackMaterials[workType] || [] });
    }

    res.status(500).json({ error: 'AI Service Error' });
  }
});

module.exports = router;
