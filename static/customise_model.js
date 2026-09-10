// ===============================
// Meme Lens - Custom Model Trainer
// ===============================

const $ = id => document.getElementById(id);

// ---------- Elements ----------

const previewGrid = $("previewGrid");
const imageCount = $("imageCount");
const memeNameInput = $("memeName");
const categoryStatus = $("categoryStatus");
const datasetStatus = $("datasetStatus");
const memeStatus = $("memeStatus");

const video = $("video");
const canvas = $("canvas");

const cameraPanel = $("cameraPanel");
const uploadPanel = $("uploadPanel");

const openCamera = $("openCamera");
const captureBtn = $("captureBtn");

const uploadBtn = $("uploadBtn");
const uploadArea = $("uploadArea");
const imageUpload = $("imageUpload");
const gridUpload = $("gridUpload");

const chooseMemeBtn = $("chooseMemeBtn");
const memeUpload = $("memeUpload");
const memePreview = $("memePreview");

const trainBtn = $("trainBtn");
const clearBtn = $("clearBtn");

const cameraMode = $("cameraMode");
const galleryMode = $("galleryMode");

const scrollTrainer = $("scrollTrainer");

// ---------- State ----------

let stream = null;
let totalImages = 0;
let trainingFiles = [];
let selectedMemeName = "newmeme1.png";

// ===============================
// Hero Scroll
// ===============================

if (scrollTrainer) {
    scrollTrainer.onclick = e => {
        e.preventDefault();
        $("meme-library").scrollIntoView({
            behavior: "smooth"
        });
    };
}

// ===============================
// Camera / Gallery Mode
// ===============================

function activateMode(mode){

    cameraMode.classList.remove("active");
    galleryMode.classList.remove("active");

    cameraPanel.classList.add("hidden");
    uploadPanel.classList.add("hidden");

    if(mode==="camera"){
        cameraMode.classList.add("active");
        cameraPanel.classList.remove("hidden");
    }

    if(mode==="gallery"){
        galleryMode.classList.add("active");
        uploadPanel.classList.remove("hidden");
        stopCamera();
    }
}

cameraMode.onclick=()=>activateMode("camera");
galleryMode.onclick=()=>activateMode("gallery");

// ===============================
// Camera
// ===============================

function stopCamera(){

    if(stream){
        stream.getTracks().forEach(track=>track.stop());
        stream=null;
    }

    video.srcObject=null;
    video.style.display="none";
    openCamera.innerText="Open Camera";
}

openCamera.onclick=async()=>{

    try{

        if(!stream){

            stream=await navigator.mediaDevices.getUserMedia({
                video:true
            });

            video.srcObject=stream;
            video.style.display="block";
            openCamera.innerText="Close Camera";

        }else{

            stopCamera();

        }

    }catch(err){

        console.error(err);
        alert("Unable to access camera.");

    }
};

// Capture image and store it as File

captureBtn.onclick=()=>{

    if(!stream){
        alert("Open the camera first.");
        return;
    }

    canvas.width=video.videoWidth;
    canvas.height=video.videoHeight;

    const ctx=canvas.getContext("2d");
    ctx.drawImage(video,0,0);

    canvas.toBlob(blob=>{

        const file=new File(
            [blob],
            `capture_${Date.now()}.png`,
            {type:"image/png"}
        );

        trainingFiles.push(file);

        addImage(URL.createObjectURL(file));

    },"image/png");
};

// ===============================
// Gallery Upload
// ===============================

function handleFiles(files){

    [...files].forEach(file=>{

        trainingFiles.push(file);

        const reader=new FileReader();

        reader.onload=e=>{
            addImage(e.target.result);
        };

        reader.readAsDataURL(file);

    });
}

uploadBtn.onclick=e=>{
    e.stopPropagation();
    imageUpload.click();
};

uploadArea.onclick=()=>imageUpload.click();

imageUpload.onchange=e=>handleFiles(e.target.files);

gridUpload.onchange=e=>handleFiles(e.target.files);

// ===============================
// Meme Upload
// ===============================

chooseMemeBtn.onclick=()=>memeUpload.click();

memeUpload.onchange=e=>{

    const file=e.target.files[0];

    if(!file) return;

    selectedMemeName=file.name;

    const reader=new FileReader();

    reader.onload=ev=>{

        memePreview.src=ev.target.result;
        memeStatus.innerText="Custom Meme";

    };

    reader.readAsDataURL(file);
};

// ===============================
// Meme Library
// ===============================

document.querySelectorAll(".library-card").forEach(card=>{

    card.onclick=()=>{

        document.querySelectorAll(".library-card")
            .forEach(c=>c.classList.remove("active"));

        card.classList.add("active");

        memePreview.src=card.dataset.meme;

        selectedMemeName=card.dataset.meme.split("/").pop();

        memeStatus.innerText="Library Meme";

        memePreview.scrollIntoView({
            behavior:"smooth",
            block:"center"
        });
    };
});

// ===============================
// Dataset
// ===============================

function updateCounter(){

    imageCount.innerText=totalImages;
    datasetStatus.innerText=
        totalImages===0
            ?"Empty"
            :`${totalImages} Samples`;

    if(categoryStatus){
        categoryStatus.innerText=
            memeNameInput.value.trim() || "—";
    }
}

function addImage(src){

    totalImages++;
    updateCounter();

    const card=document.createElement("div");
    card.className="preview-card";

    card.innerHTML=`
        <img src="${src}" alt="Training Sample">
        <button class="remove-preview" type="button">×</button>
    `;

    card.querySelector(".remove-preview").onclick=()=>{

        const index=[...previewGrid.children].indexOf(card)-1;

        if(index>=0){
            trainingFiles.splice(index,1);
        }

        card.remove();

        totalImages--;
        updateCounter();
    };

    previewGrid.insertBefore(card,previewGrid.firstChild);
}

memeNameInput.oninput=updateCounter;

// ===============================
// Clear Dataset
// ===============================

clearBtn.onclick=()=>{

    previewGrid
        .querySelectorAll(".preview-card:not(.upload-preview)")
        .forEach(card=>card.remove());

    trainingFiles=[];
    totalImages=0;

    updateCounter();
};

// ===============================
// Train Model
// ===============================

trainBtn.onclick=async()=>{

    if(!memeNameInput.value.trim()){
        alert("Enter a category name.");
        return;
    }

    if(trainingFiles.length===0){
        alert("Add training images.");
        return;
    }

    const formData = new FormData();

    formData.append("class_label",memeNameInput.value.trim());
    formData.append("data_size",trainingFiles.length);
    formData.append("meme_name",selectedMemeName);

    trainingFiles.forEach(file=>{
        formData.append("images",file);
    });

    try{

        trainBtn.disabled=true;
        trainBtn.innerText="Training...";

        const response=await fetch("/customise-model/train",{
            method:"POST",
            body:formData
        });

        const data=await response.json();

        if(response.ok){

            alert(data.message || "Model trained successfully!");

        }else{

            alert(data.error || "Training failed.");

        }

    }catch(err){

        console.error(err);
        alert("Something went wrong while training.");

    }finally{

        trainBtn.disabled=false;
        trainBtn.innerText="🚀 Train Model";
    }
};


activateMode("camera");
updateCounter();