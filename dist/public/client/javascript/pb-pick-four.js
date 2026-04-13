/**
 * Chọn 4 trong 8: thứ tự 1–4 trên ảnh, FIFO khi chọn tấm thứ 5.
 */
(() => {
  const NEED = 4;

  const gridEl = document.getElementById("pb-pick-grid");
  const hintEl = document.getElementById("pb-pick-hint");
  const confirmBtn = document.getElementById("pb-confirm-pick");

  if (!gridEl || !hintEl || !confirmBtn) {
    return;
  }

  /** @type {string[]} */
  let sourcePhotos = [];
  /** Thứ tự index vào sourcePhotos (FIFO) */
  let pickQueue = [];

  const updateHint = () => {
    hintEl.textContent = `Đã chọn ${pickQueue.length}/${NEED} ảnh.`;
    const ok = pickQueue.length === NEED;
    confirmBtn.disabled = !ok;
    confirmBtn.setAttribute("aria-disabled", ok ? "false" : "true");
  };

  const renderBadges = () => {
    const items = gridEl.querySelectorAll("[data-pick-index]");
    items.forEach((el) => {
      const idx = Number(el.getAttribute("data-pick-index"));
      const pos = pickQueue.indexOf(idx);
      const badge = el.querySelector(".pb-pick-badge");
      if (badge instanceof HTMLElement) {
        if (pos === -1) {
          badge.classList.add("hidden");
          badge.textContent = "";
        } else {
          badge.classList.remove("hidden");
          badge.textContent = String(pos + 1);
        }
      }
      el.classList.toggle("ring-2", pos !== -1);
      el.classList.toggle("ring-pink-500", pos !== -1);
    });
  };

  const togglePick = (index) => {
    const at = pickQueue.indexOf(index);
    if (at !== -1) {
      pickQueue.splice(at, 1);
    } else {
      if (pickQueue.length >= NEED) {
        pickQueue.shift();
      }
      pickQueue.push(index);
    }
    updateHint();
    renderBadges();
  };

  const buildGrid = (photos) => {
    sourcePhotos = photos;
    pickQueue = [];
    gridEl.innerHTML = "";
    photos.forEach((dataUrl, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("data-pick-index", String(index));
      btn.className =
        "group relative aspect-square rounded-xl overflow-hidden border-2 border-outline-variant/40 bg-surface-container-highest focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 transition";
      const img = document.createElement("img");
      img.src = dataUrl;
      img.alt = `Ảnh ${index + 1}`;
      img.className = "w-full h-full object-cover";
      const badge = document.createElement("span");
      badge.className =
        "pb-pick-badge hidden absolute top-2 right-2 flex h-9 min-w-9 items-center justify-center rounded-full bg-pink-500 px-2 text-lg font-black text-white shadow-md tabular-nums";
      btn.appendChild(img);
      btn.appendChild(badge);
      btn.addEventListener("click", () => togglePick(index));
      gridEl.appendChild(btn);
    });
    updateHint();
    renderBadges();
  };

  window.addEventListener("pb:eight-captured", (ev) => {
    const photos = ev.detail && Array.isArray(ev.detail.photos) ? ev.detail.photos : [];
    buildGrid(photos);
  });

  confirmBtn.addEventListener("click", () => {
    if (pickQueue.length !== NEED) {
      return;
    }
    const photos = pickQueue.map((i) => sourcePhotos[i]);
    window.dispatchEvent(
      new CustomEvent("pb:four-selected", {
        detail: { photos, indices: pickQueue.slice() },
      })
    );
    document.getElementById("pb-step-pick")?.classList.add("hidden");
    document.getElementById("pb-step-frames")?.classList.remove("hidden");
  });
})();
