const API = "https://countriesnow.space/api/v0.1/countries";

export async function getStates() {
  const response = await fetch(`${API}/states`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      country: "India",
    }),
  });

  const data = await response.json();

  return data.data.states;
}

export async function getCities(state) {
  const response = await fetch(`${API}/state/cities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      country: "India",
      state,
    }),
  });

  const data = await response.json();

  return data.data;
}