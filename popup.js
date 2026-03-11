document.addEventListener("DOMContentLoaded", () => {

  chrome.storage.local.get(["stats"], (data) => {

    const s = data.stats || { detections: 0, blocked: 0 };

    const status = document.querySelector(".status");

    if (status) {
      status.innerHTML =
        "Detections: " + s.detections +
        "<br>Blocked: " + s.blocked;
    }

  });

});