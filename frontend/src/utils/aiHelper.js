import OpenAI from 'openai';

export const generateDescription = async (input, workType) => {
  try {
    console.log('Skickar till /api/ai/generate:', { input, workType });
    const response = await fetch('http://localhost:5000/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, workType })
    });

    const data = await response.json();
    return data.description || fallbackDescription(input, workType);
  } catch (error) {
    console.error('AI Error (generate):', error);
    return fallbackDescription(input, workType);
  }
};

export const suggestMaterials = async (description, workType) => {
  try {
    console.log('Skickar till /api/ai/materials:', { description, workType });
    const response = await fetch('http://localhost:5000/api/ai/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, workType })
    });

    const data = await response.json();

    if (!data || !Array.isArray(data.materials)) {
      console.warn('Ogiltigt AI-svar – använder fallback.');
      return fallbackMaterials(description, workType);
    }

    return {
      standardMaterial: data.materials,
      forbrukning: fallbackMaterials(description, workType).forbrukning
    };
  } catch (error) {
    console.error('AI Error (materials):', error);
    return fallbackMaterials(description, workType);
  }
};

const fallbackDescription = (input, workType) => {
  const commonTasks = {
    electrical: [
      'Säkerhetsgenomgång av befintlig installation',
      'Kontroll av kablage och anslutningar',
      'Installation och inkoppling',
      'Test och dokumentation av utfört arbete'
    ],
    plumbing: [
      'Inspektion av befintliga rör och anslutningar',
      'Täthetsprovning',
      'Installation/reparation av rörledningar',
      'Funktionstest av system'
    ],
    renovation: [
      'Förarbete och skyddsåtgärder',
      'Slipning och preparation av ytor',
      'Behandling och finish',
      'Städning och slutkontroll'
    ]
  };

  const workTypeNames = {
    electrical: 'Elarbete',
    plumbing: 'VVS-arbete',
    renovation: 'Renoveringsarbete'
  };

  const selectedTasks = commonTasks[workType] || ['Arbetsmoment saknas'];
  const tasksList = selectedTasks.map(task => `• ${task}`).join('\n');

  return `Omfattning: ${workTypeNames[workType] || 'Arbete'}
Uppskattad tidsåtgång: 2-3 arbetsdagar

Arbetet omfattar följande moment:
${tasksList}

Specifika åtgärder:
${input}`;
};

const fallbackMaterials = (description, workType) => {
  const materials = {
    electrical: [
      'Kabel och installationsrör',
      'Kopplingsdosor och uttag',
      'Säkringar och brytare',
      'Mätinstrument och verktyg'
    ],
    plumbing: [
      'Rör och kopplingar',
      'Tätningar och packningar',
      'Silikon och fogmassa',
      'Verktyg för rördragning'
    ],
    renovation: [
      'Slippapper olika kornstorlekar',
      'Träolja/lack efter behov',
      'Skyddstäckning',
      'Rengöringsmedel'
    ]
  };

  const selectedMaterials = materials[workType] || ['Standardmaterial'];

  return {
    standardMaterial: selectedMaterials,
    forbrukning: [
      'Rengöringsmedel',
      'Skyddsutrustning',
      'Tejp och märkning',
      'Städmaterial'
    ]
  };
};
