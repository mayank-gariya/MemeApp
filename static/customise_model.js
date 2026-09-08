// Updated Mode and Selection Control inside customise_model.js
const $ = id => document.getElementById(id);

const previewGrid = $("previewGrid");
const imageCount = $("imageCount");
const memeNameInput = $("memeName");
const categoryStatus = $("categoryStatus");
const datasetStatus = $("datasetStatus");

let stream = null;
let totalImages =0;

const modes = {
    camera: $("cameraPanel"),
    gallery: $("uploadPanel")
};

function activateMode(mode) {
    ["camera", "gallery"].forEach(name => {
        if (modes[name]) {
            modes[name].classList.toggle("hidden", name !== mode);
        }
        if ($(name + "Mode")) {
            $(name + "Mode").classList.toggle("active", name === mode);
        }
    });

    if (mode !== "camera") stopCamera();
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
    }
    if ($("video")) {
        $("video").srcObject = null;
        $("video").style.display = "none";
        $("openCamera").innerText = "Open Camera";
    }
}

if ($("cameraMode")) $("cameraMode").onclick = () => activateMode("camera");
if ($("galleryMode")) $("galleryMode").onclick = () => activateMode("gallery");

if ($("openCamera")) {
    $("openCamera").onclick = async () => {
        if (stream) return stopCamera();
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            $("video").srcObject = stream;
            $("video").style.display = "block";
            $("openCamera").innerText = "Close Camera";
        } catch (err) {
            alert("Camera access denied or unavailable.");
        }
    };
}

if ($("captureBtn")) {
    $("captureBtn").onclick = () => {
        if (!stream) return alert("Open the camera first.");
        const canvas = $("canvas");
        const video = $("video");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
        addImage(canvas.toDataURL());
    };
}

function handleFiles(files) {
    [...files].forEach(file => {
        const reader = new FileReader();
        reader.onload = e => addImage(e.target.result);
        reader.readAsDataURL(file);
    });
}

if ($("uploadBtn")) {
    $("uploadBtn").onclick = e => {
        e.stopPropagation();
        $("imageUpload").click();
    };
}

if ($("gridUpload")) $("gridUpload").onchange = e => handleFiles(e.target.files);
if ($("imageUpload")) $("imageUpload").onchange = e => handleFiles(e.target.files);
if ($("uploadArea")) $("uploadArea").onclick = () => $("imageUpload").click();

// Custom target meme uploader handler
if ($("chooseMemeBtn")) $("chooseMemeBtn").onclick = () => $("memeUpload").click();

if ($("memeUpload")) {
    $("memeUpload").onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            $("memePreview").src = ev.target.result;
            $("memeStatus").innerText = "Custom Target";
        };
        reader.readAsDataURL(file);
    };
}

function addImage(src) {
    totalImages++;
    imageCount.innerText = totalImages;
    datasetStatus.innerText = `${totalImages} Samples`;

    const card = document.createElement("div");
    card.className = "preview-card";

    card.innerHTML = `
        <img src="${src}" alt="Training Sample">
        <button class="remove-preview" type="button">×</button>
    `;

    card.querySelector(".remove-preview").onclick = () => {
        card.remove();
        totalImages--;
        imageCount.innerText = totalImages;
        datasetStatus.innerText = totalImages ? `${totalImages} Samples` : "Empty";
    };

    previewGrid.insertBefore(card, previewGrid.firstChild);
}

if (memeNameInput) {
    memeNameInput.oninput = e => {
        if (categoryStatus) {
            categoryStatus.innerText = e.target.value.trim() || "—";
        }
    };
}

if ($("clearBtn")) {
    $("clearBtn").onclick = () => {
        previewGrid.querySelectorAll(".preview-card:not(.upload-preview)").forEach(c => c.remove());
        totalImages = 0;
        imageCount.innerText = 0;
        datasetStatus.innerText = "Empty";
    };
}

if ($("trainBtn")) {
    $("trainBtn").onclick = () => {
        if (memeNameInput && !memeNameInput.value.trim()) return alert("Enter a category name.");
        if (totalImages === 0) return alert("Add training images for your dataset.");
        if (!$("memePreview").src) return alert("Ensure a target meme outcome is selected.");

        alert("Training model pipeline initiated successfully with target output meme!");
    };
}

// Handling selection from library cards to act as the target meme output
document.querySelectorAll(".library-card").forEach(card => {
    card.onclick = () => {
        document.querySelectorAll(".library-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");

        const memeSrc = card.dataset.meme;
        $("memePreview").src = memeSrc;
        $("memeStatus").innerText = "Library Target";

        $("memePanel").scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    };
});

// Custom library dropzone functionality
const libraryDropzone = $("libraryDropzone");
const libraryUploadInput = $("libraryUploadInput");

if (libraryDropzone && libraryUploadInput) {
    libraryDropzone.onclick = () => libraryUploadInput.click();

    libraryUploadInput.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = ev => {
            const newCard = document.createElement("div");
            newCard.className = "library-card active";
            newCard.dataset.meme = ev.target.result;
            newCard.innerHTML = `<img src="${ev.target.result}" alt="Custom Meme Target">`;

            newCard.onclick = () => {
                document.querySelectorAll(".library-card").forEach(c => c.classList.remove("active"));
                newCard.classList.add("active");
                $("memePreview").src = ev.target.result;
                $("memeStatus").innerText = "Custom Library Target";
            };

            libraryDropzone.parentNode.insertBefore(newCard, libraryDropzone);

            $("memePreview").src = ev.target.result;
            $("memeStatus").innerText = "Custom Library Target";
        };
        reader.readAsDataURL(file);
    };
}

activateMode("camera");