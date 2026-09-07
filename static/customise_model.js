/* =========================
   ELEMENTS
========================= */

const cameraBtn = document.getElementById("cameraMode");
const galleryBtn = document.getElementById("galleryMode");
const memeBtn = document.getElementById("memeMode");

const cameraPanel = document.getElementById("cameraPanel");
const uploadPanel = document.getElementById("uploadPanel");
const memePanel = document.getElementById("memePanel");

const uploadArea = document.getElementById("uploadArea");
const uploadBtn = document.getElementById("uploadBtn");
const uploadInput = document.getElementById("imageUpload");

const memeUpload = document.getElementById("memeUpload");
const memePreview = document.getElementById("memePreview");
const chooseMemeBtn = document.getElementById("chooseMemeBtn");

const previewGrid = document.getElementById("previewGrid");
const imageCount = document.getElementById("imageCount");
const clearBtn = document.getElementById("clearBtn");
const trainBtn = document.getElementById("trainBtn");

const openCamera = document.getElementById("openCamera");
const captureBtn = document.getElementById("captureBtn");

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");

const scrollTrainer = document.getElementById("scrollTrainer");

/* =========================
   STATE
========================= */

let stream = null;
let totalImages = 0;
let memeImage = null;

/* =========================
   HERO BUTTON
========================= */

if (scrollTrainer) {
    scrollTrainer.addEventListener("click", () => {
        document.getElementById("trainer").scrollIntoView({
            behavior: "smooth"
        });
    });
}

/* =========================
   MODE SWITCHING
========================= */

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    video.srcObject = null;
    video.style.display = "none";
    openCamera.innerText = "Open Camera";
}

function activateMode(mode) {

    cameraBtn.classList.remove("active");
    galleryBtn.classList.remove("active");
    memeBtn.classList.remove("active");

    cameraPanel.classList.add("hidden");
    uploadPanel.classList.add("hidden");
    memePanel.classList.add("hidden");

    if (mode === "camera") {
        cameraBtn.classList.add("active");
        cameraPanel.classList.remove("hidden");
    }

    if (mode === "gallery") {
        galleryBtn.classList.add("active");
        uploadPanel.classList.remove("hidden");
        stopCamera();
    }

    if (mode === "meme") {
        memeBtn.classList.add("active");
        memePanel.classList.remove("hidden");
        stopCamera();
    }
}

cameraBtn.addEventListener("click", () => activateMode("camera"));
galleryBtn.addEventListener("click", () => activateMode("gallery"));
memeBtn.addEventListener("click", () => activateMode("meme"));

/* =========================
   CAMERA
========================= */

openCamera.addEventListener("click", async () => {

    try {

        if (!stream) {

            stream = await navigator.mediaDevices.getUserMedia({
                video: true
            });

            video.srcObject = stream;
            video.style.display = "block";

            openCamera.innerText = "Close Camera";

        } else {

            stopCamera();

        }

    } catch (err) {

        console.error(err);
        alert("Unable to access camera.");

    }

});

captureBtn.addEventListener("click", () => {

    if (!stream) {
        alert("Open the camera first.");
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    addImage(canvas.toDataURL("image/png"));

});

/* =========================
   GALLERY UPLOAD
========================= */

uploadBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    uploadInput.click();
});

uploadArea.addEventListener("click", () => uploadInput.click());

uploadInput.addEventListener("change", (e) => {

    [...e.target.files].forEach(file => {

        const reader = new FileReader();

        reader.onload = function (event) {
            addImage(event.target.result);
        };

        reader.readAsDataURL(file);

    });

    uploadInput.value = "";

});

/* =========================
   MEME TEMPLATE UPLOAD
========================= */

chooseMemeBtn.addEventListener("click", () => memeUpload.click());

memeUpload.addEventListener("change", (e) => {

    const file = e.target.files[0];

    if (!file) return;

    memeImage = file;

    const reader = new FileReader();

    reader.onload = function (event) {
        memePreview.src = event.target.result;
    };

    reader.readAsDataURL(file);

});

/* =========================
   DATASET
========================= */

function updateCounter() {
    imageCount.innerText = `${totalImages} Images Added`;
}

function addImage(src) {

    totalImages++;
    updateCounter();

    const card = document.createElement("div");
    card.className = "preview-card";

    card.innerHTML = `
        <img src="${src}" alt="Training Image">
        <button class="remove-preview">×</button>
    `;

    card.querySelector(".remove-preview").addEventListener("click", () => {

        card.remove();

        totalImages--;
        updateCounter();

    });

    previewGrid.appendChild(card);

}

clearBtn.addEventListener("click", () => {

    previewGrid.innerHTML = "";
    totalImages = 0;
    updateCounter();

});

/* =========================
   TRAIN BUTTON
========================= */

trainBtn.addEventListener("click", () => {

    const category = document.getElementById("memeName").value.trim();

    if (!category) {
        alert("Please enter a meme category.");
        return;
    }

    if (totalImages === 0) {
        alert("Please add training images.");
        return;
    }

    if (!memeImage) {
        alert("Please upload a meme template.");
        return;
    }

    console.log({
        category,
        trainingImages: totalImages,
        memeTemplate: memeImage.name
    });

    alert("Dataset ready! Connect this button to your Flask training endpoint.");

});


activateMode("camera");
updateCounter();