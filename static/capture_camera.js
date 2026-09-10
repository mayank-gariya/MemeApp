const openCamera=document.getElementById("openCamera");
const captureBtn=document.getElementById("captureBtn");

const video=document.getElementById("video");
const canvas=document.getElementById("canvas");

const preview=document.getElementById("preview");
const result=document.getElementById("result");

let stream=null;
let cameraOpen=false;

async function openStream(){

    stream=await navigator.mediaDevices.getUserMedia({
        video:true
    });

    video.srcObject=stream;

    await video.play();

    video.style.display="block";
    preview.style.display="none";

    cameraOpen=true;
    openCamera.innerText="Close Camera";
}

function closeStream(){

    if(stream){
        stream.getTracks().forEach(t=>t.stop());
        stream=null;
    }

    video.srcObject=null;
    video.style.display="none";

    cameraOpen=false;
    openCamera.innerText="Open Camera";
}

openCamera.onclick=async()=>{

    try{

        if(cameraOpen)
            closeStream();
        else
            await openStream();

    }catch(err){

        console.error(err);
        alert("Camera permission denied.");

    }
};

captureBtn.onclick=()=>{

    if(!cameraOpen){
        alert("Open camera first.");
        return;
    }

    canvas.width=video.videoWidth;
    canvas.height=video.videoHeight;

    canvas.getContext("2d").drawImage(video,0,0);

    preview.src=canvas.toDataURL("image/png");
    preview.style.display="block";

    canvas.toBlob(async blob=>{

        const fd=new FormData();

        fd.append("image",blob,"capture.png");

        const response=await fetch("/meme/predict/",{
            method:"POST",
            body:fd
        });

        const data=await response.json();

        console.log(data);

        const prediction=data.result;

        if(prediction.type==="custom"){

            result.src=`/static/MemeImgs/${prediction.meme}`;

        }else if(prediction.type==="pretrained"){

            result.src=`/static/MemeImgs/${prediction.meme}`;

        }else{

            alert(prediction.display);
            return;

        }

        result.style.display="block";

    },"image/png");
};