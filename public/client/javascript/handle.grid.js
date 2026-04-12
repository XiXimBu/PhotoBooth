(() => {
  const listEl = document.getElementById("pb-layout-list");
  const canvas = document.getElementById("pb-output-canvas");
  const video = document.getElementById("pb-camera");
  const layoutDataEl = document.getElementById("pb-layouts-data");

  if (
    !listEl ||
    !(canvas instanceof HTMLCanvasElement) ||
    !(video instanceof HTMLVideoElement) ||
    !layoutDataEl
  ) {
    return;
  }

  let layouts = [];
  try {
    layouts = JSON.parse(layoutDataEl.textContent || "[]");
  } catch (_error) {
    layouts = [];
  }

  if (!Array.isArray(layouts) || !layouts.length) {
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  let selectedIndex = 0;
  let rafId = null;

  const updateActiveButton = () => {
    const items = listEl.querySelectorAll(".pb-layout-item");
    items.forEach((item, idx) => {
      item.classList.toggle("border-pink-500", idx === selectedIndex);
      item.classList.toggle("ring-2", idx === selectedIndex);
      item.classList.toggle("ring-pink-400/40", idx === selectedIndex);
    });
  };

  /** Layout đã chọn quyết định canvas cuối + lọc khung (API frames-by-layout / overlay resize). */
  const emitSelectedLayout = () => {
    const layout = layouts[selectedIndex];
    if (!layout) {
      return;
    }
    window.pbSelectedLayout = layout;
    window.dispatchEvent(
      new CustomEvent("pb:selected-layout", { detail: { layout } })
    );
  };

  /** Slot từ server: tỉ lệ 0→1 → pixel theo canvas preview */
  const slotToPixels = (layout, slot) => {
    const cw = layout.canvasW;
    const ch = layout.canvasH;
    return {
      x: slot.x * cw,
      y: slot.y * ch,
      w: slot.w * cw,
      h: slot.h * ch,
    };
  };

  const drawCoverImage = (layout, slot) => {
    const slotPx = slotToPixels(layout, slot);
    const slotAspect = slotPx.w / slotPx.h;
    const videoAspect = video.videoWidth / video.videoHeight;

    let sx = 0;
    let sy = 0;
    let sWidth = video.videoWidth;
    let sHeight = video.videoHeight;

    if (videoAspect > slotAspect) {
      sWidth = video.videoHeight * slotAspect;
      sx = (video.videoWidth - sWidth) / 2;
    } else {
      sHeight = video.videoWidth / slotAspect;
      sy = (video.videoHeight - sHeight) / 2;
    }

    // Flip ngang để kết quả trùng với preview webcam.
    ctx.save();
    ctx.translate(slotPx.x + slotPx.w, slotPx.y);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, slotPx.w, slotPx.h);
    ctx.restore();
  };

  const drawSelectedLayout = () => {
    const layout = layouts[selectedIndex];
    if (!layout) {
      return;
    }

    canvas.width = layout.canvasW;
    canvas.height = layout.canvasH;

    ctx.fillStyle = "#121214";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
      return;
    }

    for (const slot of layout.slots || []) {
      drawCoverImage(layout, slot);
    }
  };

  const renderLoop = () => {
    drawSelectedLayout();
    rafId = requestAnimationFrame(renderLoop);
  };

  const startRenderLoop = () => {
    if (rafId !== null) {
      return;
    }
    renderLoop();
  };

  listEl.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const button = target.closest(".pb-layout-item");
    if (!button) {
      return;
    }

    const idx = Number(button.getAttribute("data-layout-index"));
    if (Number.isNaN(idx) || !layouts[idx]) {
      return;
    }

    selectedIndex = idx;
    updateActiveButton();
    drawSelectedLayout();
    emitSelectedLayout();
  });

  const stopRenderLoop = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  window.addEventListener("pb:camera-ready", startRenderLoop);
  video.addEventListener("loadeddata", startRenderLoop);
  window.addEventListener("pb:stop-grid-preview", stopRenderLoop);

  updateActiveButton();
  drawSelectedLayout();
  emitSelectedLayout();
})();
