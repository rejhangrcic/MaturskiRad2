const OPENWEATHER_API_KEY = "147c8211520c69d8ced30832541a0d42";
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

function setStatus(el, text, type = "info") {
  el.textContent = text || "";
  el.classList.remove("ok", "err", "info");
  if (text) el.classList.add(type);
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatNumber(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return "-";
  return n.toFixed(1);
}

function setLoading(btn, isLoading) {
  btn.disabled = isLoading;
  btn.dataset.originalText ??= btn.textContent;

  if (isLoading) {
    btn.innerHTML = `<span class="spinner"></span> Loading...`;
  } else {
    btn.textContent = btn.dataset.originalText;
  }
}

async function getWeather() {
  const cityInput = document.getElementById("cityInput");
  const statusEl = document.getElementById("weatherStatus");
  const resultEl = document.getElementById("weatherResult");
  const btn = document.getElementById("weatherBtn");

  const city = cityInput.value.trim();
  resultEl.innerHTML = "";

  if (!city) {
    setStatus(statusEl, "Enter a city name.", "err");
    return;
  }

  if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY.includes("INSERT_KEY")) {
    setStatus(statusEl, "Missing OpenWeather API key. Add it in script.js.", "err");
    return;
  }

  setLoading(btn, true);
  setStatus(statusEl, "Loading data...", "info");

  const url =
    `${OPENWEATHER_BASE_URL}?q=${encodeURIComponent(city)}` +
    `&appid=${encodeURIComponent(OPENWEATHER_API_KEY)}` +
    `&units=metric&lang=en`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      const msg = data?.message ? `Error: ${data.message}` : "City not found.";
      setStatus(statusEl, msg, "err");
      return;
    }

    const name = data.name;
    const country = data.sys?.country || "";
    const temp = data.main?.temp;
    const feels = data.main?.feels_like;
    const humidity = data.main?.humidity;
    const wind = data.wind?.speed;
    const desc = data.weather?.[0]?.description || "-";

    setStatus(statusEl, "Data successfully loaded.", "ok");

    resultEl.innerHTML = `
      <div class="kv">
        <div><strong>City</strong></div>
        <div>${escapeHtml(name)} ${country ? `<span class="badge">${escapeHtml(country)}</span>` : ""}</div>

        <div><strong>Description</strong></div><div>${escapeHtml(desc)}</div>
        <div><strong>Temperature</strong></div><div>${formatNumber(temp)} °C</div>
        <div><strong>Feels like</strong></div><div>${formatNumber(feels)} °C</div>
        <div><strong>Humidity</strong></div><div>${humidity ?? "-"} %</div>
        <div><strong>Wind</strong></div><div>${wind ?? "-"} m/s</div>
      </div>
    `;
  } catch (err) {
    setStatus(statusEl, "Error fetching data (check internet connection).", "err");
  } finally {
    setLoading(btn, false);
  }
}

async function getGitHubUser() {
  const userInput = document.getElementById("userInput");
  const statusEl = document.getElementById("githubStatus");
  const resultEl = document.getElementById("githubResult");
  const btn = document.getElementById("githubBtn");

  const username = userInput.value.trim();
  resultEl.innerHTML = "";

  if (!username) {
    setStatus(statusEl, "Enter a GitHub username.", "err");
    return;
  }

  setLoading(btn, true);
  setStatus(statusEl, "Loading data...", "info");

  const url = `https://api.github.com/users/${encodeURIComponent(username)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        setStatus(statusEl, "User not found.", "err");
      } else if (response.status === 403) {
        setStatus(statusEl, "Too many requests (rate limit). Try later.", "err");
      } else {
        setStatus(statusEl, "Error fetching data.", "err");
      }
      return;
    }

    setStatus(statusEl, "Data successfully loaded.", "ok");

    const name = data.name || "(not specified)";
    const login = data.login || username;
    const repos = data.public_repos ?? "-";
    const followers = data.followers ?? "-";
    const following = data.following ?? "-";
    const bio = data.bio || "";
    const avatar = data.avatar_url || "";
    const profile = data.html_url || "";

    resultEl.innerHTML = `
      <div class="userRow">
        <img class="avatar" src="${escapeHtml(avatar)}" alt="avatar">
        <div>
          <div><strong>${escapeHtml(name)}</strong> <span class="badge">@${escapeHtml(login)}</span></div>
          <div style="margin-top:6px; color:rgba(234,240,255,0.72);">${escapeHtml(bio)}</div>
          <div style="margin-top:10px;">
            <a href="${escapeHtml(profile)}" target="_blank" rel="noreferrer">Open GitHub profile</a>
          </div>
        </div>
      </div>

      <div style="margin-top:14px;" class="kv">
        <div><strong>Repositories</strong></div><div>${repos}</div>
        <div><strong>Followers</strong></div><div>${followers}</div>
        <div><strong>Following</strong></div><div>${following}</div>
      </div>
    `;
  } catch (err) {
    setStatus(statusEl, "Error fetching data (check internet connection).", "err");
  } finally {
    setLoading(btn, false);
  }
}

document.getElementById("weatherBtn").addEventListener("click", getWeather);
document.getElementById("githubBtn").addEventListener("click", getGitHubUser);

document.getElementById("cityInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") getWeather();
});

document.getElementById("userInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") getGitHubUser();
});
