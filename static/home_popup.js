document.addEventListener("DOMContentLoaded", () => {
    const sound1 = document.getElementById('meme-sound-1');
    const image = document.getElementById('modi-meme-img');

    if (image && sound1) {
        image.addEventListener('click', () => {
            sound1.currentTime = 0;
            sound1.play()
                .then(() => console.log("Audio playing successfully!"))
                .catch(err => console.error("Playback failed:", err));
        });
    } else {
        if (!image) console.error("Missing #modi-meme-img element in HTML");
        if (!sound1) console.error("Missing #meme-sound-1 audio element in HTML");
    }
});