/**
 * AI Helper för att generera arbetsbeskrivningar och materialförslag
 * Använder backend API som kommunicerar med OpenAI
 */

/**
 * Genererar arbetsbeskrivning med AI baserat på användarinput
 * @param {string} input - Användarens beskrivning av arbetet
 * @param {string} workType - Typ av arbete (renovation, electrical, plumbing)
 * @returns {Promise<string>} - Genererad arbetsbeskrivning
 */
export const generateDescription = async (input, workType) => {
  try {
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

/**
 * Genererar detaljerad arbetsbeskrivning med förbättrad struktur
 * @param {string} input - Användarens beskrivning av arbetet
 * @param {string} workType - Typ av arbete (renovation, electrical, plumbing)
 * @param {Object} customerInfo - Kundinformation (namn, etc.)
 * @returns {Promise<Object>} - Detaljerad arbetsbeskrivning
 */
export const generateDetailedDescription = async (input, workType, customerInfo = {}) => {
  if (!input?.trim() || !workType?.trim()) {
    throw new Error('Arbetsbeskrivning och typ av arbete krävs');
  }
  try {
    const response = await fetch('http://localhost:5000/api/ai/generate-detailed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, workType, customerInfo })
    });

    const data = await response.json();

    if (!data || !data.description) {
      console.warn('Ingen beskrivning från AI - använder fallback');
      return fallbackDetailedDescription(input, workType);
    }

    return {
      description: data.description,
      template: data.template || 'detailed',
      workType: data.workType,
      isFallback: data.fallback || false,
      timestamp: data.timestamp
    };
  } catch (error) {
    console.error('AI Error (generate-detailed):', error);
    return fallbackDetailedDescription(input, workType);
  }
};

// MATERIAL AI (robust och flexibel för AI-format)
export const suggestMaterials = async (description, workType) => {
  if (!description?.trim() || !workType?.trim()) {
    throw new Error('Arbetsbeskrivning och typ av arbete krävs');
  }
  try {
    const response = await fetch('http://localhost:5000/api/ai/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, workType })
    });

    const data = await response.json();

    // Om AI ger nytt format (t.ex. objekt), hantera båda!
    if (
      !data || 
      (!Array.isArray(data.materials) && !data.standardMaterial)
    ) {
      console.warn('Ogiltigt AI-svar – använder fallback.');
      return fallbackMaterials(description, workType);
    }

    // Om AI ger "materials": []
    if (Array.isArray(data.materials)) {
      return {
        standardMaterial: data.materials.slice(0, 6),
        forbrukning: fallbackMaterials(description, workType).forbrukning
      };
    }
    // Om AI redan ger standardMaterial/förbrukning
    return {
      standardMaterial: Array.isArray(data.standardMaterial) ? data.standardMaterial.slice(0, 6) : [],
      forbrukning: Array.isArray(data.forbrukning) ? data.forbrukning : fallbackMaterials(description, workType).forbrukning
    };
  } catch (error) {
    console.error('AI Error (materials):', error);
    return fallbackMaterials(description, workType);
  }
};


/**
 * Fallback-funktion för arbetsbeskrivning när AI inte är tillgängligt
 * @param {string} input - Användarens input
 * @param {string} workType - Typ av arbete
 * @returns {string} - Grundläggande arbetsbeskrivning
 */
const fallbackDescription = (input, workType) => {
  const workTypeNames = {
    electrical: 'Elarbete',
    plumbing: 'VVS-arbete', 
    renovation: 'Renovering'
  };

  const workName = workTypeNames[workType] || 'Arbete';
  
  return `${workName} omfattar ${input.toLowerCase()}. Arbetet utförs enligt gällande föreskrifter och branschstandard. Alla moment inkluderar materialhantering, installation och slutkontroll.`;
};

/**
 * Fallback för detaljerad beskrivning när AI inte är tillgängligt
 * @param {string} input - Användarens input
 * @param {string} workType - Typ av arbete
 * @returns {Object} - Detaljerad fallback-beskrivning
 */
const fallbackDetailedDescription = (input, workType) => {
  const workTypeNames = {
    electrical: 'Elarbete',
    plumbing: 'VVS-arbete', 
    renovation: 'Renovering'
  };

  const workName = workTypeNames[workType] || 'Arbete';
  
  const detailedTemplates = {
    electrical: `PROJEKTÖVERSIKT
${workName} omfattar ${input.toLowerCase()}. Installation utförs enligt SS-EN 60364 standard för lågspänningsinstallationer.

TIDSÅTGÅNG
Beräknad tid: 3-4 arbetsdagar beroende på omfattning och komplexitet

SPECIFIKA INSTALLATIONER
- Nya elledningar och kabeldragning
- Installation av kopplingsdosor och uttag
- Belysningsarmaturer enligt IP-klassning
- Jordfelsbrytare och säkerhetsutrustning
- Anslutning till befintligt elsystem

ARBETSPROCESS
Dag 1: Säkerhetskontroll och förberedande arbeten
Dag 2-3: Installation av kablar och elektriska komponenter
Dag 4: Testning, mätning och dokumentation

SÄKERHET OCH STANDARDER
- SS-EN 60364 (Lågspänningsinstallationer)
- Elsäkerhetsverkets föreskrifter
- Installationsbevis och besiktningsprotokoll
- Säkerhetsmätningar enligt standard

GARANTIER
5 års garanti på allt utfört arbete och installerat material

VAD SOM INGÅR
- Kvalitetsmaterial från välkända leverantörer
- Installation av auktoriserad elektriker
- Funktionstest och säkerhetsmätningar
- Teknisk dokumentation
- Städning efter arbetet`,

    plumbing: `PROJEKTÖVERSIKT
${workName} omfattar ${input.toLowerCase()}. Installation enligt SS-EN 806 standard för vatteninstallationer.

TIDSÅTGÅNG
Beräknad tid: 3-4 arbetsdagar inklusive torktid och provtryckning

SPECIFIKA INSTALLATIONER
- Vattenledningar i koppar eller PEX-rör
- Avloppsinstallationer och anslutningar
- Kranar, ventiler och avstängningar
- Isolering och värmeskydd
- Anslutning till befintligt VA-system

ARBETSPROCESS
Dag 1: Förberedelser och rördragning
Dag 2-3: Installation och anslutning av armaturer
Dag 4: Tryckprovning och slutkontroll

SÄKERHET OCH STANDARDER
- SS-EN 806 (Vatteninstallationer)
- Byggnadstekniska krav enligt BBR
- Tryckprovning enligt branschstandard
- Dokumentation av utfört arbete

GARANTIER
5 års garanti på installation och 2 års utökad garanti på rörarbeten

VAD SOM INGÅR
- Kvalitetsmaterial och komponenter
- Installation av behörig rörmokare
- Tryckprovning och täthetskontroll
- Teknisk dokumentation
- Städning och färdigställande`,

    renovation: `PROJEKTÖVERSIKT
${workName} omfattar ${input.toLowerCase()}. Arbetet utförs enligt byggnadstekniska krav i BBR.

TIDSÅTGÅNG
Beräknad tid: 4-6 arbetsdagar beroende på omfattning och materialval

SPECIFIKA ARBETSMOMENT
- Rivning och bortforsling av gammalt material
- Underlagsberedning och kontroll
- Installation av nya material och komponenter
- Ytbehandling och finishing
- Kvalitetskontroll av slutresultat

ARBETSPROCESS
Dag 1-2: Rivning och förberedande arbeten
Dag 3-4: Installation och byggarbeten
Dag 5-6: Ytbehandling och slutfinish

SÄKERHET OCH STANDARDER
- Byggnadstekniska krav enligt BBR
- Arbetsmiljöverkets säkerhetsföreskrifter
- CE-märkt material enligt standard
- Kvalitetskontroll enligt branschpraxis

GARANTIER
5 års garanti på utfört arbete och 3 års materialgaranti

VAD SOM INGÅR
- Rivning och återställning
- Kvalitetsmaterial av erkända märken
- Professionellt hantverksarbete
- Grundbehandling och finish
- Slutstädning och besiktning`
  };

  const defaultTemplate = `PROJEKTÖVERSIKT
${workName} omfattar ${input.toLowerCase()}. Arbetet utförs enligt gällande föreskrifter och branschstandard.

TIDSÅTGÅNG
Beräknad tid: 3-4 arbetsdagar beroende på omfattning

ARBETSPROCESS
- Förberedelser och säkerhetskontroll
- Huvudarbete enligt specifikation
- Testning och kvalitetskontroll
- Dokumentation och överlämning

GARANTIER
5 års garanti på allt utfört arbete och material

VAD SOM INGÅR
- Professionellt utförande
- Kvalitetsmaterial
- Städning efter arbetet
- Komplett dokumentation`;

  return {
    description: detailedTemplates[workType] || defaultTemplate,
    template: 'detailed',
    workType: workType,
    isFallback: true,
    timestamp: new Date().toISOString()
  };
};

/**
 * Fallback-funktion för material när AI inte är tillgängligt
 * @param {string} description - Arbetsbeskrivning
 * @param {string} workType - Typ av arbete
 * @returns {Object} - Objekt med standardmaterial och förbrukningsmaterial
 */
const fallbackMaterials = (description, workType) => {
  const materials = {
    electrical: [
      'Kabel och ledningar',
      'Kopplingsdosor', 
      'Uttag och brytare',
      'Säkringar',
      'Installationsrör',
      'Jordledare'
    ],
    plumbing: [
      'Rör och kopplingar',
      'Tätningar',
      'Kranar och ventiler', 
      'Fogmassa',
      'Isolering',
      'Avloppsdelar'
    ],
    renovation: [
      'Gipsskiva',
      'Träreglar',
      'Isolering',
      'Färg och spackel',
      'Golmaterial',
      'Kakel'
    ]
  };

  const selectedMaterials = materials[workType] || ['Standardmaterial'];

  return {
    standardMaterial: selectedMaterials,
    forbrukning: [
      'Förbrukningsmaterial',
      'Skyddsutrustning', 
      'Verktyg',
      'Städmaterial'
    ]
  };
};