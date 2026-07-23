const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("idToken");

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getMyRoutes() {
  const response = await fetch(`${API_URL}/api/routes/my-routes`, {
    headers: getAuthHeaders(),
  });

  return response.json();
}

export async function searchRoutes(query: string) {
  const response = await fetch(
    `${API_URL}/api/routes/search?q=${encodeURIComponent(query)}`,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.json();
}

export async function saveRoute(data: {
  routeName: string;
  distanceMiles: number;
  waypoints: number[][];
}) {
  return fetch(`${API_URL}/api/routes/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
}

export async function deleteRoute(id: string) {
  return fetch(`${API_URL}/api/routes/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}