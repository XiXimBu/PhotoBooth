/**
 * Preview Photobooth: overlay PNG do server Sharp resize đúng canvasW×canvasH của layout đã chọn.
 * GET /api/frames-by-layout + GET /api/frames/:id/overlay.png?layoutId=...
 */
(() => {
  const listEl = document.getElementById("pb-frame-list");
  const canvas = document.getElementById("pb-final-canvas");
  const loadingEl = document.getElementById("pb-frames-loading");
  const errEl = document.getElementById("pb-frames-error");
  const aspectHintEl = document.getElementById("pb-frames-aspect-hint");
  const downloadBtn = document.getElementById("pb-download-final");

  if (!listEl || !(canvas instanceof HTMLCanvasElement)) {
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  /** @type {string[]} data URL */
  let selectedPhotos = [];
  /** @type {unknown[]} */
  let cachedFrames = [];

  const apiForLayoutUrl = (layoutId) => {
    const base = `${window.location.origin}/api/frames-by-layout`;
    return `${base}?layoutId=${encodeURIComponent(layoutId)}`;
  };

  const overlayPngUrl = (frameId, layoutId) => {
    const base = `${window.location.origin}/api/frames/${frameId}/overlay.png`;
    return `${base}?layoutId=${encodeURIComponent(layoutId)}&misfit=contain`;
  };

  const loadImage = (src, crossOrigin) =>
    new Promise((resolve, reject) => {
      const im = new Image();
      if (crossOrigin) {
        im.crossOrigin = "anonymous";
      }
      im.onload = () => resolve(im);
      im.onerror = () => reject(new Error("Không tải được ảnh"));
      im.src = src;
    });

  /**
   * Giống Sharp fit=contain: scale đều, căn giữa trong destW×destH (nền trong suốt).
   */
  function drawImageContain(ctx2d, img, destW, destH) {
    const ow = img.naturalWidth || img.width;
    const oh = img.naturalHeight || img.height;
    if (!ow || !oh || destW <= 0 || destH <= 0) {
      return;
    }
    const scale = Math.min(destW / ow, destH / oh);
    const dw = ow * scale;
    const dh = oh * scale;
    const dx = (destW - dw) / 2;
    const dy = (destH - dh) / 2;
    ctx2d.imageSmoothingEnabled = true;
    ctx2d.imageSmoothingQuality = "high";
    ctx2d.drawImage(img, 0, 0, ow, oh, dx, dy, dw, dh);
  }

  function drawCoverImage(ctx2d, img, rect) {
    const rw = rect.width;
    const rh = rect.height;
    if (rw <= 0 || rh <= 0) {
      return;
    }
    const slotAspect = rw / rh;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) {
      return;
    }
    const imgAspect = iw / ih;
    let sx = 0;
    let sy = 0;
    let sw = iw;
    let sh = ih;
    if (imgAspect > slotAspect) {
      sw = ih * slotAspect;
      sx = (iw - sw) / 2;
    } else {
      sh = iw / slotAspect;
      sy = (ih - sh) / 2;
    }
    ctx2d.imageSmoothingEnabled = true;
    ctx2d.imageSmoothingQuality = "high";
    ctx2d.drawImage(img, sx, sy, sw, sh, rect.left, rect.top, rw, rh);
  }

  /** Slot 0→1; nếu DB còn pixel thì chia theo canvas mẫu của layout */
  function normalizeSlots(slots, layout) {
    const cw = Number(layout && layout.canvasW) || 0;
    const ch = Number(layout && layout.canvasH) || 0;
    return slots.map((s) => {
      const x = Number(s.x);
      const y = Number(s.y);
      const w = Number(s.w);
      const h = Number(s.h);
      const legacy = x > 1 || y > 1 || w > 1 || h > 1;
      if (legacy && cw > 0 && ch > 0) {
        return { x: x / cw, y: y / ch, w: w / cw, h: h / ch };
      }
      return { x, y, w, h };
    });
  }

  const ASPECT_EPS = 0.004;
  /** API Sharp có thể lệch 1px; coi như khớp layout */
  const DIM_EPS = 1.5;

  function slotToOverlayPixelRect(slot, layoutMeta, bitmapW, bitmapH) {
    const yShift = Number(layoutMeta && layoutMeta.previewSlotYShift) || 0;

    const nx = slot.x;
    let ny = slot.y + yShift;
    const nw = slot.w;
    const nh = slot.h;
    ny = Math.max(0, Math.min(1 - nh, ny));

    const W = bitmapW;
    const H = bitmapH;

    return {
      left: nx * W,
      top: ny * H,
      width: nw * W,
      height: nh * H,
    };
  }

  /**
   * @param {{ overlayDrawnWithContain?: boolean }} [opts]
   *   — khi overlay nhỏ hơn canvas (vd. 707×1644 trong 707×2000) đã vẽ bằng contain, không cảnh báo.
   */
  function updateAspectHint(layoutMeta, bitmapW, bitmapH, opts) {
    if (!aspectHintEl) {
      return;
    }
    const cw = Number(layoutMeta && layoutMeta.canvasW) || 0;
    const ch = Number(layoutMeta && layoutMeta.canvasH) || 0;
    if (!cw || !ch || !bitmapW || !bitmapH) {
      aspectHintEl.classList.add("hidden");
      aspectHintEl.textContent = "";
      return;
    }
    if (opts && opts.overlayDrawnWithContain) {
      aspectHintEl.classList.add("hidden");
      aspectHintEl.textContent = "";
      return;
    }
    const dimOk =
      Math.abs(bitmapW - cw) <= DIM_EPS && Math.abs(bitmapH - ch) <= DIM_EPS;
    if (dimOk) {
      aspectHintEl.classList.add("hidden");
      aspectHintEl.textContent = "";
      return;
    }
    const arL = cw / ch;
    const arB = bitmapW / bitmapH;
    if (Math.abs(arL - arB) <= ASPECT_EPS) {
      aspectHintEl.classList.add("hidden");
      aspectHintEl.textContent = "";
      return;
    }
    aspectHintEl.textContent =
      `Tỉ lệ layout (${cw}×${ch}) khác kích thước ảnh overlay (${Math.round(bitmapW)}×${Math.round(bitmapH)}). ` +
      "Kiểm tra API resize hoặc layout trong DB.";
    aspectHintEl.classList.remove("hidden");
  }

  function fitCanvasDisplay(bitmapW, bitmapH) {
    const wrap = document.getElementById("pb-final-canvas-wrap");
    if (!wrap || bitmapW <= 0 || bitmapH <= 0) {
      return;
    }
    let maxW = wrap.clientWidth;
    if (maxW < 8) {
      maxW = Math.min(
        document.documentElement?.clientWidth ?? window.innerWidth,
        1200
      );
    }
    const maxH = Math.min(window.innerHeight * 0.85, 900);
    const scale = Math.min(maxW / bitmapW, maxH / bitmapH);
    const dw = Math.max(1, Math.round(bitmapW * scale));
    const dh = Math.max(1, Math.round(bitmapH * scale));
    canvas.style.width = `${dw}px`;
    canvas.style.height = `${dh}px`;
    canvas.style.maxWidth = "100%";
    canvas.style.boxSizing = "border-box";
    wrap.style.width = "100%";
    wrap.style.maxWidth = "100%";
    wrap.style.display = "flex";
    wrap.style.justifyContent = "center";
  }

  /**
   * @param {unknown} frame — document Frame + populate layoutId
   * @param {string[]} photoDataUrls
   */
  async function drawComposite(frame, photoDataUrls) {
    const layoutMeta = frame && frame.layoutId;
    if (!layoutMeta || !Array.isArray(layoutMeta.slots)) {
      throw new Error("Khung thiếu layout.");
    }

    const sel = window.pbSelectedLayout;
    const layoutId = sel && sel.id ? String(sel.id) : "";
    if (!layoutId) {
      throw new Error("Chưa có layout đã chọn (pbSelectedLayout).");
    }

    const frameId = String(frame._id ?? frame.id ?? "");
    if (!frameId) {
      throw new Error("Khung không có id.");
    }

    const overlaySrc = overlayPngUrl(frameId, layoutId);
    const overlay = await loadImage(overlaySrc, false);

    const W =
      Number(layoutMeta.canvasW) ||
      overlay.naturalWidth ||
      overlay.width;
    const H =
      Number(layoutMeta.canvasH) ||
      overlay.naturalHeight ||
      overlay.height;
    if (!W || !H) {
      throw new Error("Không xác định được kích thước canvas.");
    }

    const slots = normalizeSlots(layoutMeta.slots, layoutMeta);
    const photoImages = await Promise.all(
      photoDataUrls.map((u) => loadImage(u, false))
    );

    canvas.width = W;
    canvas.height = H;
    // Không tô nền đen — chừa trong suốt để PNG khung (viền/decoration) khớp thiết kế, không bị viền đen quanh.
    ctx.clearRect(0, 0, W, H);

    const n = Math.min(slots.length, photoImages.length);
    for (let i = 0; i < n; i++) {
      const slot = slots[i];
      const rect = slotToOverlayPixelRect(slot, layoutMeta, W, H);
      drawCoverImage(ctx, photoImages[i], rect);
    }

    const ow = overlay.naturalWidth || overlay.width || W;
    const oh = overlay.naturalHeight || overlay.height || H;
    const overlayDrawnWithContain =
      Math.abs(ow - W) > DIM_EPS || Math.abs(oh - H) > DIM_EPS;
    drawImageContain(ctx, overlay, W, H);
    updateAspectHint(layoutMeta, ow, oh, {
      overlayDrawnWithContain,
    });
    setError("");
    fitCanvasDisplay(W, H);
    if (downloadBtn) {
      downloadBtn.disabled = false;
      downloadBtn.removeAttribute("aria-disabled");
    }
  }

  const setError = (msg) => {
    if (!errEl) {
      return;
    }
    if (msg) {
      errEl.textContent = msg;
      errEl.classList.remove("hidden");
    } else {
      errEl.textContent = "";
      errEl.classList.add("hidden");
    }
  };

  const renderFrameList = () => {
    listEl.innerHTML = "";
    cachedFrames.forEach((frame, idx) => {
      const f = frame;
      const url = typeof f.overlayUrl === "string" ? f.overlayUrl : "";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.frameIndex = String(idx);
      btn.setAttribute("aria-label", `Khung ${idx + 1}`);
      btn.className =
        "group flex flex-col rounded-xl border-2 border-outline-variant/30 bg-surface-container-highest overflow-hidden text-left transition hover:border-pink-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400/50";
      const thumbWrap = document.createElement("div");
      thumbWrap.className =
        "aspect-square w-full bg-[#121214] overflow-hidden border-outline-variant/20";
      const thumb = document.createElement("img");
      thumb.src = url;
      thumb.alt = "";
      thumb.className = "w-full h-full object-contain p-1";
      thumb.loading = "lazy";
      thumbWrap.appendChild(thumb);
      btn.appendChild(thumbWrap);
      listEl.appendChild(btn);
    });
  };

  const onPickFrame = async (index) => {
    const frame = cachedFrames[index];
    if (!frame || !selectedPhotos.length) {
      return;
    }
    try {
      await drawComposite(frame, selectedPhotos);
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : "Không vẽ được preview.";
      setError(msg);
      if (downloadBtn) {
        downloadBtn.disabled = true;
        downloadBtn.setAttribute("aria-disabled", "true");
      }
    }
  };

  listEl.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) {
      return;
    }
    const btn = t.closest("[data-frame-index]");
    if (!btn) {
      return;
    }
    const ix = Number(btn.getAttribute("data-frame-index"));
    if (Number.isNaN(ix)) {
      return;
    }
    void onPickFrame(ix);
  });

  const fetchFrames = async () => {
    setError("");
    const sel = window.pbSelectedLayout;
    const layoutId = sel && sel.id ? String(sel.id) : "";

    if (!layoutId) {
      setError("Chọn lưới (layout) ở bước trước — chưa có layoutId.");
      listEl.innerHTML =
        "<p class=\"col-span-full text-sm text-on-surface-variant\">Chọn lưới trước khi xem khung.</p>";
      return;
    }

    if (loadingEl) {
      loadingEl.classList.remove("hidden");
    }
    try {
      const res = await fetch(apiForLayoutUrl(layoutId), {
        credentials: "same-origin",
      });
      const ct = (res.headers.get("content-type") || "").toLowerCase();
      const raw = await res.text();
      if (!ct.includes("application/json")) {
        throw new Error(
          res.status === 404
            ? "Không tìm thấy API khung (404). Restart `npm start` và mở /api/frames-by-layout?layoutId=... (route đăng ký trong index.ts)."
            : "Server trả về HTML thay vì JSON — kiểm tra URL API và cổng backend."
        );
      }
      let json;
      try {
        json = JSON.parse(raw);
      } catch {
        throw new Error("Phản hồi không phải JSON hợp lệ.");
      }
      if (!res.ok) {
        throw new Error(json.message || `Lỗi HTTP ${res.status}`);
      }
      if (!json.success || !Array.isArray(json.data)) {
        throw new Error(json.message || "API trả về lỗi.");
      }
      cachedFrames = json.data;
      if (cachedFrames.length === 0) {
        listEl.innerHTML =
          "<p class=\"col-span-full text-sm text-on-surface-variant\">Chưa có khung nào cho layout đã chọn.</p>";
      } else {
        renderFrameList();
        void onPickFrame(0);
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Không tải được danh sách khung."
      );
      listEl.innerHTML = "";
    } finally {
      if (loadingEl) {
        loadingEl.classList.add("hidden");
      }
    }
  };

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      const w = canvas.width;
      const h = canvas.height;
      if (w > 0 && h > 0) {
        fitCanvasDisplay(w, h);
      }
    }, 120);
  });

  window.addEventListener("pb:four-selected", (ev) => {
    const photos =
      ev.detail && Array.isArray(ev.detail.photos) ? ev.detail.photos : [];
    selectedPhotos = photos;
    void fetchFrames();
  });

  window.addEventListener("pb:selected-layout", () => {
    if (selectedPhotos.length) {
      void fetchFrames();
    }
  });

  if (downloadBtn) {
    downloadBtn.disabled = true;
    downloadBtn.setAttribute("aria-disabled", "true");
    downloadBtn.addEventListener("click", () => {
      if (!canvas.width || !canvas.height) {
        return;
      }
      try {
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = `photobooth-${Date.now()}.png`;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Không xuất được ảnh (canvas tainted?)."
        );
      }
    });
  }
})();
