let currentLanguage = 'id';

async function translatePageContent(targetLang) {
    currentLanguage = targetLang;
    const textElements = document.querySelectorAll('h1, h2, h3, p, .manga-card .info h3, .latest');
    
    for(const element of textElements) {
        const originalText = element.getAttribute('data-original') || element.innerText;
        if(!element.getAttribute('data-original')) {
            element.setAttribute('data-original', originalText);
        }
        
        const translated = await translateText(originalText, targetLang);
        if(translated && translated !== originalText) {
            element.innerText = translated;
        }
    }
}

async function translateText(text, targetLang) {
    // Multiple translation API endpoints (fallback system)
    const apis = [
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`,
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetLang}`
    ];
    
    for(const api of apis) {
        try {
            const response = await fetch(api);
            const data = await response.json();
            
            // Parse Google Translate response
            if(data[0] && data[0][0] && data[0][0][0]) {
                return data[0][0][0];
            }
            // Parse MyMemory response
            if(data.responseData && data.responseData.translatedText) {
                return data.responseData.translatedText;
            }
        } catch(e) {
            console.log('Translation API failed, trying next...');
        }
    }
    
    return text; // Fallback to original
}

// Translate manga dialog/text bubbles
async function translateMangaDialogue(text, targetLang) {
    const lines = text.split('\n');
    const translatedLines = await Promise.all(
        lines.map(line => translateText(line, targetLang))
    );
    return translatedLines.join('\n');
}
