const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("idToken");

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getMyRuns() {
  const response = await fetch(`${API_URL}/api/runs/my-runs`, {
    headers: getAuthHeaders(),
  });

  return response.json();
}