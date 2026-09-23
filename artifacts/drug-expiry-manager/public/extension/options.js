(function () {
  const input = document.getElementById("apiBaseUrl");
  const saveButton = document.getElementById("save");
  const status = document.getElementById("status");

  chrome.storage.sync.get({ apiBaseUrl: "" }, (settings) => {
    input.value = settings.apiBaseUrl || "";
  });

  saveButton.addEventListener("click", () => {
    const value = input.value.trim().replace(/\/$/, "");
    if (!value || !/^https?:\/\//i.test(value)) {
      status.textContent = "Enter a full URL starting with http:// or https://.";
      status.style.color = "#b33d38";
      return;
    }
    chrome.storage.sync.set({ apiBaseUrl: value }, () => {
      status.textContent = "Connection saved.";
      status.style.color = "#287a43";
    });
  });
})();