(function () {
  "use strict";

  const ALERT_ID = "lavabms-drug-expiry-alert";
  const SEARCH_DELAY = 350;
  let searchTimer;
  let lastQuery = "";
  let lastResults = [];

  function getApiBaseUrl(callback) {
    chrome.storage.sync.get(
      { apiBaseUrl: "https://YOUR-PUBLISHED-APP/api" },
      (settings) => callback(String(settings.apiBaseUrl).replace(/\/$/, "")),
    );
  }

  function getTextFromTarget(target) {
    if (!target) return "";
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      return target.value || "";
    }
    if (target.isContentEditable) return target.innerText || target.textContent || "";
    return "";
  }

  function formatExpiry(dateValue) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Expiry date unavailable";
    return new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  function statusLabel(drug) {
    if (drug.status === "expired") return "Expired";
    if (drug.status === "expiring") return "Close to expiry";
    return "Good date";
  }

  function showResults(results) {
    let alert = document.getElementById(ALERT_ID);
    if (!results.length) {
      if (alert) alert.remove();
      return;
    }

    if (!alert) {
      alert = document.createElement("aside");
      alert.id = ALERT_ID;
      alert.setAttribute("role", "status");
      document.documentElement.appendChild(alert);
    }

    alert.className = "lavabms-alert-shell";
    alert.innerHTML =
      '<div class="lavabms-alert-header">' +
      "<div><strong>Drug expiry check</strong><span>" +
      results.length +
      (results.length === 1 ? " match" : " matches") +
      "</span></div>" +
      '<button type="button" aria-label="Close alert">×</button></div>' +
      '<div class="lavabms-alert-list">' +
      results
        .slice(0, 4)
        .map(
          (drug) =>
            '<section class="lavabms-drug-card lavabms-status-' +
            drug.status +
            '">' +
            '<div class="lavabms-drug-card-top"><strong>' +
            escapeHtml(drug.name) +
            "</strong><span>" +
            escapeHtml(statusLabel(drug)) +
            "</span></div>" +
            '<div class="lavabms-drug-meta">Matched: <b>' +
            escapeHtml(drug.matchedTerm) +
            "</b></div>" +
            '<div class="lavabms-drug-date">' +
            (drug.daysUntilExpiry < 0
              ? Math.abs(drug.daysUntilExpiry) + " days past expiry"
              : drug.daysUntilExpiry + " days remaining") +
            " · " +
            escapeHtml(formatExpiry(drug.expiryDate)) +
            "</div>" +
            "</section>",
        )
        .join("") +
      "</div>" +
      (results.length > 4
        ? '<div class="lavabms-alert-more">Showing the first 4 matches</div>'
        : "");

    alert.querySelector("button").addEventListener("click", () => alert.remove());
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function search(query) {
    const cleanedQuery = query.trim();
    if (cleanedQuery.length < 2 || cleanedQuery === lastQuery) return;
    lastQuery = cleanedQuery;

    getApiBaseUrl(async (apiBaseUrl) => {
      try {
        const response = await fetch(
          apiBaseUrl + "/drugs/search?q=" + encodeURIComponent(cleanedQuery),
          { headers: { Accept: "application/json" } },
        );
        if (!response.ok) throw new Error("Search request failed");
        const results = await response.json();
        lastResults = Array.isArray(results) ? results : [];
        showResults(lastResults);
      } catch (_error) {
        // Do not interrupt POS entry if the manager is offline.
        if (lastResults.length) showResults(lastResults);
      }
    });
  }

  document.addEventListener(
    "input",
    (event) => {
      const query = getTextFromTarget(event.target);
      if (!query) return;
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(() => search(query), SEARCH_DELAY);
    },
    true,
  );

  document.addEventListener(
    "change",
    (event) => {
      const query = getTextFromTarget(event.target);
      if (query) search(query);
    },
    true,
  );
})();