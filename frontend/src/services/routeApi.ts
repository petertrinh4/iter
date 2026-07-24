const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("idToken");

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getMyRoutes() {
  try {
    const response = await fetch(`${API_URL}/api/routes/my-routes`, {
      headers: getAuthHeaders(),
    });

    // If backend returns an error (like 401 Unauthorized), return empty array
    if (!response.ok) return [];

    const data = await response.json();
    
    // Safely return the array
    return Array.isArray(data) ? data : (data.routes || []);
  } catch (err) {
    console.error("Error fetching routes:", err);
    return [];
  }
}

export async function searchRoutes(query: string) {
  try {
    // If the search bar is empty, just load all routes normally
    if (!query || query.trim() === "") {
      return getMyRoutes(); 
    }

    const response = await fetch(
      `${API_URL}/api/routes/search?q=${encodeURIComponent(query.trim())}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) return [];
    
    const data = await response.json();
    return Array.isArray(data) ? data : (data.routes || []);
  } catch (err) {
    console.error("Error searching routes:", err);
    return [];
  }
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