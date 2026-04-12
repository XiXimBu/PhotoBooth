/**
 * Luồng "Chụp 8": đếm ngược 3-2-1, chụp vào canvas, lưu base64 trong RAM (rawPhotos).
 * Không localStorage / không upload ở bước này.
 */
(() => {
  const CAPTURE_TARGET = 8;

  /** @type {string[]} data URL base64 */
  let rawPhotos = [];

  const video = document.getElementById("pb-camera");
  const stillCanvas = document.getElementById("pb-still-canvas");
  const shutterBtn = document.getElementById("pb-shutter-btn");
  const progressEl = document.getElementById("pb-capture-progress");
  const controlsEl = document.getElementById("pb-capture-controls");
  const startWrap = document.getElementById("pb-start-session-wrap");
  const countdownOverlay = document.getElementById("pb-countdown-overlay");
  const countdownText = document.getElementById("pb-countdown-text");

  if (
    !(video instanceof HTMLVideoElement) ||
    !(stillCanvas instanceof HTMLCanvasElement) ||
    !shutterBtn ||
    !progressEl ||
    !countdownOverlay ||
    !countdownText
  ) {
    return;
  }

  const ctx = stillCanvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const sleep = (ms) =>
    new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });

  let cameraLive = false;

  const updateProgressUi = () => {
    const n = rawPhotos.length;
    progressEl.textContent = `Đã chụp ${n}/${CAPTURE_TARGET}`;
    const full = n >= CAPTURE_TARGET;
    const canShoot = cameraLive && !full && !capturing;
    shutterBtn.disabled = !canShoot;
    shutterBtn.setAttribute("aria-disabled", shutterBtn.disabled ? "true" : "false");
    if (full) {
      progressEl.setAttribute("data-full", "true");
    } else {
      progressEl.removeAttribute("data-full");
    }
  };

  const showCountdown = async () => {
    countdownOverlay.classList.remove("hidden");
    countdownOverlay.setAttribute("aria-hidden", "false");
    for (const step of [3, 2, 1]) {
      countdownText.textContent = String(step);
      await sleep(900);
    }
    countdownText.textContent = "";
    countdownOverlay.classList.add("hidden");
    countdownOverlay.setAttribute("aria-hidden", "true");
  };

  /**
   * Ghi frame từ video: bỏ mirror CSS (scale-x) để file giống ảnh chụp thật.
   */
  const captureFrameToDataUrl = () => {
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) {
      return null;
    }
    stillCanvas.width = w;
    stillCanvas.height = h;
    ctx.save();
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);
    ctx.restore();
    try {
      return stillCanvas.toDataURL("image/jpeg", 0.92);
    } catch {
      return null;
    }
  };

  let capturing = false;

  const onShutter = async () => {
    if (!cameraLive || capturing || rawPhotos.length >= CAPTURE_TARGET) {
      return;
    }
    if (video.readyState < 2 || !video.videoWidth) {
      return;
    }

    capturing = true;
    shutterBtn.disabled = true;

    await showCountdown();

    const dataUrl = captureFrameToDataUrl();
    if (dataUrl) {
      rawPhotos.push(dataUrl);
      updateProgressUi();
      if (rawPhotos.length >= CAPTURE_TARGET) {
        goToPickStep();
      }
    }

    capturing = false;
    updateProgressUi();
  };

  const goToPickStep = () => {
    window.dispatchEvent(new CustomEvent("pb:stop-grid-preview"));
    const stream = window.__pbCameraStream;
    if (stream && typeof stream.getTracks === "function") {
      stream.getTracks().forEach((t) => t.stop());
    }
    video.srcObject = null;
    const stepCap = document.getElementById("pb-step-capture");
    const stepPick = document.getElementById("pb-step-pick");
    if (stepCap) {
      stepCap.classList.add("hidden");
    }
    if (stepPick) {
      stepPick.classList.remove("hidden");
    }
    window.dispatchEvent(
      new CustomEvent("pb:eight-captured", {
        detail: { photos: rawPhotos.slice() },
      })
    );
  };

  shutterBtn.addEventListener("click", () => {
    void onShutter();
  });

  window.addEventListener("pb:camera-ready", () => {
    cameraLive = true;
    if (controlsEl) {
      controlsEl.classList.remove("hidden");
    }
    if (startWrap) {
      startWrap.classList.add("hidden");
    }
    updateProgressUi();
  });

  shutterBtn.disabled = true;
  updateProgressUi();
})();
