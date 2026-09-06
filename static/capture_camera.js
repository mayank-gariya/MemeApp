const openCamera = document.getElementById("openCamera");
const captureBtn = document.getElementById("captureBtn");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const preview = document.getElementById("preview");

let stream = null;
let cameraOpen = false;

openCamera.addEventListener("click", async () => {
    try {
        if (!cameraOpen) {
            // Open camera
            stream = await navigator.mediaDevices.getUserMedia({
                video: true
            });

            video.srcObject = stream;
            video.style.display = "block";
            openCamera.innerText = "Close Camera";
            cameraOpen = true;
        } else {
            // Close camera
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
            video.style.display = "none";
            openCamera.innerText = "Open Camera";
            cameraOpen = false;
        }
    } catch (err) {
        console.error(err);
        alert("Camera permission denied or camera unavailable.");
    }
});

captureBtn.addEventListener("click", () => {
    if (!stream) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    preview.src = canvas.toDataURL("image/png");
    preview.style.display = "block";

    // Stop camera
    stream.getTracks().forEach(track => track.stop());
    video.style.display = "none";

    canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append("image", blob, "capture.png");

        const response = await fetch("/predict", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        console.log(result);
    }, "image/png");
});