let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;
let autoReadActive = false;
let currentReadingIndex = 0;

// Voice options untuk berbagai bahasa
const VOICES = {
    'id': ['Google Bahasa Indonesia', 'Microsoft Andika - Indonesian (Indonesia)'],
    'en': ['Google US English', 'Microsoft David - English (United States)'],
    'ja': ['Google 日本語', 'Microsoft Haruka - Japanese (Japan)'],
    'zh': ['Google 普通话（中国大陆）', 'Microsoft Xiaoxiao - Chinese (China)']
};

function speakText(text, lang = 'id') {
    if(!text || text.trim() === '') return;
    
    // Stop current speech
    if(speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Set voice
    const availableVoices = speechSynthesis.getVoices();
    const preferredVoices = VOICES[lang] || VOICES['id'];
    
    for(const preferred of preferredVoices) {
        const voice = availableVoices.find(v => v.name === preferred);
        if(voice) {
            utterance.voice = voice;
            break;
        }
    }
    
    utterance.onend = () => {
        if(autoReadActive) {
            readNextParagraph();
        }
    };
    
    speechSynthesis.speak(utterance);
    currentUtterance = utterance;
}

function startAutoTTS() {
    autoReadActive = true;
    currentReadingIndex = 0;
    readNextParagraph();
}

function stopAutoTTS() {
    autoReadActive = false;
    if(speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
}

function readNextParagraph() {
    if(!autoReadActive) return;
    
    const paragraphs = document.querySelectorAll('.chapter-text p, .dialogue');
    if(currentReadingIndex < paragraphs.length) {
        const text = paragraphs[currentReadingIndex].innerText;
        speakText(text, document.getElementById('translateLang')?.value || 'id');
        currentReadingIndex++;
        
        // Scroll ke paragraf yang sedang dibaca
        paragraphs[currentReadingIndex - 1].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    } else {
        // Loop back or stop
        if(autoReadActive) {
            currentReadingIndex = 0;
            readNextParagraph();
        }
    }
}

// Load voices when ready
if(speechSynthesis) {
    speechSynthesis.onvoiceschanged = () => {
        console.log('Voices loaded:', speechSynthesis.getVoices().map(v => v.name));
    };
}

// Read specific selected text
function readSelectedText() {
    const selection = window.getSelection();
    const text = selection.toString();
    if(text) {
        speakText(text);
    }
}

// Add floating read button
function addFloatingReadButton() {
    const btn = document.createElement('div');
    btn.innerHTML = '🔊';
    btn.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: #4ecdc4;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 1000;
        font-size: 24px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;
    btn.onclick = () => {
        const selected = window.getSelection().toString();
        if(selected) {
            speakText(selected);
        } else {
            readNextParagraph();
        }
    };
    document.body.appendChild(btn);
}

document.addEventListener('DOMContentLoaded', addFloatingReadButton);
