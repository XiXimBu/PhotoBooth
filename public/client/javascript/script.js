(function initPhotoBoothCamera() {
  const video = document.getElementById("pb-camera");
  const placeholder = document.getElementById("pb-camera-placeholder");
  const errBox = document.getElementById("pb-camera-client-error");
  const errMsg = document.getElementById("pb-camera-client-error-msg");
  const startBtn = document.getElementById("pb-btn-start-camera");

  if (!video || !(video instanceof HTMLVideoElement)) {
    return;
  }

  const showClientError = (message) => {
    if (placeholder) placeholder.classList.add("hidden");
    if (errMsg) errMsg.textContent = message;
    if (errBox) errBox.classList.remove("hidden");
  };

  const hidePlaceholder = () => {
    if (placeholder) placeholder.classList.add("hidden");
  };

  if (!navigator.mediaDevices?.getUserMedia) {
    showClientError("Trình duyệt không hỗ trợ truy cập camera.");
    if (startBtn) startBtn.disabled = true;
    return;
  }

  let cameraStarting = false;

  const startCamera = () => {
    if (cameraStarting) {
      return;
    }
    cameraStarting = true;
    if (startBtn) {
      startBtn.disabled = true;
      startBtn.setAttribute("aria-busy", "true");
    }

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      .then((stream) => {
        video.srcObject = stream;
        hidePlaceholder();
        window.__pbCameraStream = stream;
        window.dispatchEvent(
          new CustomEvent("pb:camera-ready", { detail: { stream } })
        );
        return video.play().catch(() => undefined);
      })
      .catch((err) => {
        cameraStarting = false;
        if (startBtn) {
          startBtn.disabled = false;
          startBtn.removeAttribute("aria-busy");
        }
        const message =
          err instanceof Error ? err.message : "Không thể lấy luồng camera.";
        showClientError(message);
      });
  };

  if (startBtn) {
    startBtn.addEventListener("click", startCamera);
  }
})();
