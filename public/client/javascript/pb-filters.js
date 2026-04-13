/**
 * Preview lọc màu bằng CSS (video + canvas lưới); chuỗi filter trùng Canvas2D để chụp/ghép khớp preview.
 */
(() => {
  const PRESETS = {
    normal: { label: "Gốc", css: "none" },
    bw: { label: "Đen trắng", css: "grayscale(100%)" },
    vintage: { label: "Vintage", css: "sepia(80%) contrast(120%)" },
    cold: { label: "Lạnh", css: "hue-rotate(180deg) saturate(1.5)" },
  };

  /** @type {keyof typeof PRESETS | "custom"} */
  let mode = "normal";

  const custom = {
    brightness: 100,
    contrast: 100,
    saturate: 100,
    hue: 0,
  };

  const buildCustomFilter = () =>
    `brightness(${custom.brightness}%) contrast(${custom.contrast}%) saturate(${custom.saturate}%) hue-rotate(${custom.hue}deg)`;

  const getEffectiveCss = () => {
    if (mode === "custom") {
      return buildCustomFilter();
    }
    const p = PRESETS[mode];
    return p ? p.css : "none";
  };

  const applyPreview = () => {
    const raw = getEffectiveCss();
    const cssFilter = raw === "none" ? "none" : raw;
    const video = document.getElementById("pb-camera");
    const outCanvas = document.getElementById("pb-output-canvas");
    if (video instanceof HTMLVideoElement) {
      video.style.filter = cssFilter;
    }
    if (outCanvas instanceof HTMLCanvasElement) {
      outCanvas.style.filter = cssFilter;
    }
  };

  const syncPresetButtons = () => {
    const wrap = document.getElementById("pb-filter-presets");
    if (!wrap) {
      return;
    }
    wrap.querySelectorAll("[data-pb-filter]").forEach((btn) => {
      if (!(btn instanceof HTMLElement)) {
        return;
      }
      const key = btn.getAttribute("data-pb-filter");
      const active = key === mode || (mode === "custom" && key === "custom");
      btn.classList.toggle("ring-2", active);
      btn.classList.toggle("ring-pink-500", active);
      btn.classList.toggle("bg-pink-500/15", active);
    });
  };

  const syncSlidersFromState = () => {
    const map = [
      ["pb-filter-brightness", custom.brightness],
      ["pb-filter-contrast", custom.contrast],
      ["pb-filter-saturate", custom.saturate],
      ["pb-filter-hue", custom.hue],
    ];
    for (const [id, val] of map) {
      const el = document.getElementById(id);
      if (el instanceof HTMLInputElement) {
        el.value = String(val);
      }
    }
  };

  const toggleCustomPanel = () => {
    const panel = document.getElementById("pb-filter-custom");
    if (panel) {
      panel.classList.toggle("hidden", mode !== "custom");
    }
  };

  const init = () => {
    const wrap = document.getElementById("pb-filter-presets");
    if (wrap) {
      wrap.addEventListener("click", (e) => {
        const t = e.target;
        if (!(t instanceof Element)) {
          return;
        }
        const btn = t.closest("[data-pb-filter]");
        if (!(btn instanceof HTMLElement)) {
          return;
        }
        const key = btn.getAttribute("data-pb-filter");
        if (key === "custom") {
          mode = "custom";
        } else if (key && key in PRESETS) {
          mode = /** @type {keyof typeof PRESETS} */ (key);
        }
        toggleCustomPanel();
        syncPresetButtons();
        applyPreview();
      });
    }

    const onSlider = (ev) => {
      const t = ev.target;
      if (!(t instanceof HTMLInputElement)) {
        return;
      }
      const id = t.id;
      const v = Number(t.value);
      if (Number.isNaN(v)) {
        return;
      }
      mode = "custom";
      if (id === "pb-filter-brightness") {
        custom.brightness = v;
      } else if (id === "pb-filter-contrast") {
        custom.contrast = v;
      } else if (id === "pb-filter-saturate") {
        custom.saturate = v;
      } else if (id === "pb-filter-hue") {
        custom.hue = v;
      }
      syncPresetButtons();
      applyPreview();
    };

    ["pb-filter-brightness", "pb-filter-contrast", "pb-filter-saturate", "pb-filter-hue"].forEach(
      (id) => {
        document.getElementById(id)?.addEventListener("input", onSlider);
      }
    );

    toggleCustomPanel();
    syncPresetButtons();
    syncSlidersFromState();
    applyPreview();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.pbPhotoFilter = {
    /** Chuỗi dùng cho ctx.filter (giống CSS). */
    getCanvasFilter() {
      const s = getEffectiveCss();
      return s === "none" ? "none" : s;
    },
    getPresetKey() {
      return mode;
    },
    refreshPreview: applyPreview,
  };
})();
