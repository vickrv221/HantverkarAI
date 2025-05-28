/**
 * Hämtar nuvarande företagsnamn från localStorage.
 * Om inget är valt returneras 'Hantverkar-AI'.
 */
export const getCompanyName = () =>
    localStorage.getItem('companyName') || 'Hantverkar-AI';
  