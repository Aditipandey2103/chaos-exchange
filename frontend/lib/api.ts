const API_URL = "https://chaos-exchange-api.onrender.com";

export async function getCompanies() {
  const response = await fetch(`${API_URL}/companies`);

  if (!response.ok) {
    throw new Error("Failed to fetch companies");
  }

  return response.json();
}