const loadMoreBtn = document.getElementById('load-more-btn');
const memesGrid = document.getElementById('memes-grid');

const loadedMemeUrls = new Set();

// Populates initial page memes into the Set
document.querySelectorAll('.meme-image-wrapper img').forEach(img => {
    loadedMemeUrls.add(img.src);
});

loadMoreBtn.addEventListener('click', async () => {
    loadMoreBtn.innerText = "Loading...";
    loadMoreBtn.disabled = true;

    try {
        const response = await fetch('/api/memes');
        const newMemes = await response.json();

        newMemes.forEach(item => {
            // Only append if the meme isn't already on the page
            if (!loadedMemeUrls.has(item.url)) {
                loadedMemeUrls.add(item.url);

                const card = document.createElement('div');
                card.className = 'meme-card';
                card.innerHTML = `
                    <div class="meme-image-wrapper">
                        <img src="${item.url}" alt="${item.title}" loading="lazy" />
                    </div>
                    <div class="meme-details">
                        <h3 class="meme-title">${item.title}</h3>
                        <div class="meme-meta">
                            <span class="subreddit">r/${item.subreddit}</span>
                            <span class="author">u/${item.author}</span>
                        </div>
                        <a href="${item.postLink}" target="_blank" class="btn-recommend">
                            Get Recommendations ✨
                        </a>
                    </div>
                `;
                memesGrid.appendChild(card);
            }
        });
    } catch (error) {
        console.error('Error fetching memes:', error);
    } finally {
        loadMoreBtn.innerText = "Show More Memes 🚀";
        loadMoreBtn.disabled = false;
    }
});