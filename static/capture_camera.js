const openCamera = document.getElementById("openCamera");
const captureBtn = document.getElementById("captureBtn");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const preview = document.getElementById("preview");
const result = document.getElementById('result');

let stream = null;
let cameraOpen = false;
let ImageCapture = false;

async function openStream() {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play();

    video.style.display = "block";
    preview.style.display = "none";

    cameraOpen = true;
    openCamera.innerText = "Close Camera";
}

function closeStream() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    video.srcObject = null;
    video.style.display = "none";

    cameraOpen = false;
    openCamera.innerText = "Open Camera";
}

openCamera.addEventListener("click", async () => {
    try {
        if (!cameraOpen) {
            await openStream();
        } else {
            closeStream();
        }
    } catch (err) {
        console.error(err);
        alert("Camera permission denied.");
    }
});

captureBtn.addEventListener("click", async () => {
    if (!ImageCapture) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);

        preview.src = canvas.toDataURL("image/png");
        preview.style.display = "block";

        canvas.toBlob(async (blob) => {
            const formData = new FormData();
            formData.append("image", blob, "capture.png");

            const response = await fetch("/meme/predict/", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            const memeName = data.result.split(": ")[1];
            result.setAttribute("src", `/static/MemeImgs/${memeName}.png`);
            result.style.display = "block";
        }, "image/png");
    }
});

canvas.toBlob(async (blob) => {
    const formData = new FormData();
    formData.append("image", blob, "capture.png");

    const response = await fetch("/meme/predict", {
        method: "POST",
        body: formData
    });

    const data = await response.json();
    console.log(data.result);
}, "image/png");