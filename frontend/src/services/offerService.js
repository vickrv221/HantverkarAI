/**
 * Service för API-kommunikation med backend för offerthantering
 * Hanterar CRUD-operationer för offerter
 */

const API_URL = 'http://localhost:5000/api/offers';

/**
 * Genererar HTTP-headers med autentiseringstoken
 */
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'x-auth-token': localStorage.getItem('token')
});

/**
 * Sparar ny offert till backend
 * @param {Object} offerData - Offertdata som ska sparas
 * @returns {Promise<Object>} - Sparad offert från backend
 */
export const saveOffer = async (offerData) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(offerData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving offer:', error);
    throw error;
  }
};

/**
 * Hämtar alla offerter för inloggad användare
 * @returns {Promise<Array>} - Array av offert-objekt
 */
export const getOffers = async () => {
  try {
    const response = await fetch(API_URL, {
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching offers:', error);
    throw error;
  }
};

/**
 * Uppdaterar befintlig offert
 * @param {string} id - Offert-ID
 * @param {Object} offerData - Uppdaterad offertdata
 * @returns {Promise<Object>} - Uppdaterad offert
 */
export const updateOffer = async (id, offerData) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(offerData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating offer:', error);
    throw error;
  }
};

/**
 * Uppdaterar endast status för en offert
 * @param {string} id - Offert-ID
 * @param {string} status - Ny status (draft, sent, accepted, rejected)
 * @returns {Promise<Object>} - Uppdaterad offert
 */
export const updateOfferStatus = async (id, status) => {
  try {
    const response = await fetch(`${API_URL}/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating offer status:', error);
    throw error;
  }
};

/**
 * Tar bort offert från backend
 * @param {string} id - Offert-ID som ska tas bort
 * @returns {Promise<Object>} - Bekräftelse från backend
 */
export const deleteOffer = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting offer:', error);
    throw error;
  }
};