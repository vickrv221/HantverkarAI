const API_URL = 'http://localhost:5000/api/offers';
const headers = {
  'Content-Type': 'application/json',
  'x-auth-token': localStorage.getItem('token')
};

export const saveOffer = async (offerData) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(offerData)
    });
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getOffers = async () => {
  const response = await fetch(API_URL, {
    headers: headers
  });
  return await response.json();
};



export const deleteOffer = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: headers
  });
  return await response.json();
};