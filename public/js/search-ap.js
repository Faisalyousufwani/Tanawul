const input = document.getElementById("search-box");
const suggestionsDiv = document.getElementById("suggestions");

console.log("hhhhh")
// Debounce function to limit API calls
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Fetch suggestions from Nominatim
async function fetchSuggestions(query) {
  if (query.length < 3) return []; // Avoid short queries
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`,
      {
        headers: {
          "User-Agent": "MyLocationAutocompleteApp/1.0 (your.email@example.com)" // Required for Nominatim
        }
      }
    );
    if (!response.ok) throw new Error("Network error");
    return await response.json();
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
}

// Display suggestions in the dropdown
function displaySuggestions(results) {
  suggestionsDiv.innerHTML = "";
  suggestionsDiv.style.display = results.length > 0 ? "block" : "none";

  results.forEach((result) => {
    const div = document.createElement("li");
    div.textContent = result.display_name; // Full address (e.g., "Paris, France")
    div.addEventListener("click", () => {
      input.value = result.display_name;
      suggestionsDiv.innerHTML = "";
      suggestionsDiv.style.display = "none";
    });
    suggestionsDiv.appendChild(div);
  });
}

// Handle input event with debouncing
input.addEventListener(
  "input",
  debounce(async function () {
    const query = this.value.trim();
    console.log(query)
    if (query) {
      const results = await fetchSuggestions(query);
      displaySuggestions(results);
    } else {
      suggestionsDiv.innerHTML = "";
      suggestionsDiv.style.display = "none";
    }
  }, 300)
);

// Hide suggestions when clicking outside
document.addEventListener("click", (e) => {
  if (!input.contains(e.target) && !suggestionsDiv.contains(e.target)) {
    suggestionsDiv.style.display = "none";
  }
});