/*

╔╗ ┬ ┬  ╔╦╗┌─┐┌─┐┌┬┐  ╔╦╗┌─┐┬ ┬
╠╩╗└┬┘   ║ ├┤ ├─┤│││  ║║║├┤ │││
╚═╝ ┴    ╩ └─┘┴ ┴┴ ┴  ╩ ╩└─┘└┴┘
 ,  ,                            , _
/|_/        o  _|   _  ,_       /|/ \ ,_   _  ,   _  o |\ |\ o  _,
 |\   |  |  | / |  |/ /  |       |__//  | |/ / \_/   | |/ |/ | / |
 | \_/ \/|_/|/\/|_/|_/   |/o     |      |/|_/ \/ \__/|/|_/|_/|/\/|_/o
                                                                    /
 ()  _      |)   o  _      ()      ()_|_  _,   _
 /\ / \_|/\_|/\  | |/      /\/     /\ |  / |  /   |  |
/(_)\_/ |_/ |  |/|/|_/o    \/\    /(_)|_/\/|_/\__/ \/|/o
       (|             /                             (|
           Date de création: 09 Décembre 2025
           Dernière modification : 19 Décembre 2025

*/
//_____________La base du jeu (variables, constantes, et fonctions primordiales)

let score = 0;
let clickValue = 1;
let passiveValue = 0;
let currentSkinLevel = 0;
let totalEarned = 0;

const LEVEL_STEP = 10;
const buttonLv = document.querySelector(".button-lv");
const scoreDisplay = document.getElementById("score");
const guitarClick = document.querySelector(".onclick");
const sceneUpgradesContainer = document.querySelector(".scene-upgrades");

//_____________Formatage des nombres
function formatNumber(n) {
    if (n < 1000) return Math.floor(n).toString();
    if (n < 1000000) return (Math.floor(n / 100) / 10).toFixed(1) + 'K';
    if (n < 1000000000) return (Math.floor(n / 100000) / 10).toFixed(1) + 'M';
    return (Math.floor(n / 100000000) / 10).toFixed(1) + 'B';
}

//_____________Affichage
function updateDisplay() {
    scoreDisplay.textContent = formatNumber(score);

    const perSecondEl = document.getElementById('per-second');
    if (perSecondEl) perSecondEl.textContent = formatNumber(passiveValue) + ' notes/s';

    const perClickEl = document.getElementById('per-click');
    if (perClickEl) perClickEl.textContent = '+' + formatNumber(clickValue) + ' par clic';

    const totalEarnedEl = document.getElementById('total-earned');
    if (totalEarnedEl) totalEarnedEl.textContent = 'Total : ' + formatNumber(totalEarned);

    updateAllButtonStates();
}

//_____________États visuels des boutons (abordable / non abordable)
function updateAllButtonStates() {
    // Upgrades TALENT
    upgrades.forEach(up => {
        const btn = document.querySelector(`.${up.name}`);
        if (btn) {
            const affordable = score >= up.price;
            btn.setAttribute('data-affordable', affordable);
            if (btn.closest('.upgrade-card')) btn.closest('.upgrade-card').setAttribute('data-affordable', affordable);
        }
    });

    // Gains passifs
    const passiveItems = [
        { btn: cassette, price: cassettePrice },
        { btn: album, price: albumPrice },
        { btn: ticket, price: ticketPrice },
        { btn: placesConcert, price: placesConcertPrice },
        { btn: casque, price: casquePrice },
        { btn: worldTour, price: worldTourPrice }
    ];
    passiveItems.forEach(item => {
        if (item.btn) {
            const affordable = score >= item.price;
            item.btn.setAttribute('data-affordable', affordable);
            if (item.btn.closest('.upgrade-card')) item.btn.closest('.upgrade-card').setAttribute('data-affordable', affordable);
        }
    });
}

//_____________Click sur la guitare
guitarClick.addEventListener("click", (e) => {
    const isCritical = Math.random() < 0.05;
    const gained = isCritical ? clickValue * 10 : clickValue;
    score += gained;
    totalEarned += gained;
    updateDisplay();
    checkAchievements();
    spawnFloatingNumbers(e, gained, isCritical);
});

setInterval(() => {
    score += passiveValue;
    totalEarned += passiveValue;
    updateDisplay();
    checkAchievements();
}, 1000);

//_____________Bouton Level Up doit être activé

function checkLevelUp() {
    const commonLevel = getCommonLevel();
    const nextLevel = currentSkinLevel + LEVEL_STEP;

    if (commonLevel >= nextLevel) {
        buttonLv.disabled = false;
    } else {
        buttonLv.disabled = true;
    }
    updateProgressBar();
}

buttonLv.addEventListener("click", () => {
    if (buttonLv.disabled) return;

    currentSkinLevel += LEVEL_STEP;
    updateGuitarSkin();
    buttonLv.disabled = true;
    updateProgressBar();
});

//_____________Barre de progression
function updateProgressBar() {
    const bar = document.querySelector('.progress-bar');
    if (!bar) return;
    const commonLevel = getCommonLevel();
    const progress = (commonLevel % LEVEL_STEP) / LEVEL_STEP * 100;
    bar.style.width = progress + '%';
}

//_____________Affichage des nombres au click
const NOTE_SYMBOLS = ['♪', '♫', '♬', '🎵', '🎶'];

function spawnFloatingNumbers(e, value, isCritical) {
    const floatingText = document.createElement("span");
    floatingText.classList.add("floating-number");

    const note = NOTE_SYMBOLS[Math.floor(Math.random() * NOTE_SYMBOLS.length)];

    if (isCritical) {
        floatingText.textContent = `${note} +${formatNumber(value)} CRITIQUE!`;
        floatingText.style.color = '#f59e0b';
        floatingText.style.fontSize = '1.9rem';
        floatingText.style.textShadow = '0 0 12px rgba(245,158,11,.8), 0 0 24px rgba(239,68,68,.5)';
    } else {
        floatingText.textContent = `${note} +${formatNumber(value)}`;
    }

    floatingText.style.left = `${e.clientX}px`;
    floatingText.style.top = `${e.clientY}px`;
    const randomX = (Math.random() - 0.5) * 160;
    floatingText.style.setProperty('--rx', `${randomX}px`);

    const duration = isCritical ? 1500 : 1200;
    floatingText.style.animationDuration = duration + 'ms';

    document.body.appendChild(floatingText);
    setTimeout(() => {
        floatingText.remove();
    }, duration);
}


//_____________Variables amélioration par click
let mediatorLevel = 0;
let mediatorPrice = 15;
let mancheLevel = 0;
let manchePrice = 40;
let ampliLevel = 0;
let ampliPrice = 80;
let microLevel = 0;
let microPrice = 160;
let corpsLevel = 0;
let corpsPrice = 320;
let mecaniqueLevel = 0;
let mecaniquePrice = 640;
const upgrades = [
    { name: 'mediator', level: 0, price: 15 },
    { name: 'manche', level: 0, price: 40 },
    { name: 'ampli', level: 0, price: 80 },
    { name: 'micro', level: 0, price: 160 },
    { name: 'corps', level: 0, price: 320 },
    { name: 'mecanique', level: 0, price: 640 }
];
function getCurrentDecadeLimit() {
    const minLevel = Math.min(...upgrades.map(u => u.level));
    return Math.floor(minLevel / 10) * 10 + 10;
}
function canUpgrade(upgrade) {
    const limit = getCurrentDecadeLimit();
    return upgrade.level < limit;
}

//_____________Variables des gains passifs
let cassetteQuantity = 0;
let cassettePrice = 100;
let albumQuantity = 0;
let albumPrice = 500;
let ticketQuantity = 0;
let ticketPrice = 1500;
let placesConcertQuantity = 0;
let placesConcertPrice = 3000;
let casqueQuantity = 0;
let casquePrice = 6000;
let worldTourQuantity = 0;
let worldTourPrice = 10000;

//_____________Skins guitare par style musical et par niveau
// Chaque style a sa guitare de base + une version améliorée au niveau 10

const STYLE_GUITARS = {
    lofi:      ['image/guitar-lofi.png'],
    jazz:      ['image/guitar-jazz.png'],
    kpop:      ['image/guitar-kpop.png'],
    rock:      ['image/guitar-rock.png'],
    electro:   ['image/guitar-electro.png'],
    classical: ['image/guitar-classical.png'],
};

//_____________Création des boutons amélioration par click
const mediator = document.querySelector(".mediator");
const manche = document.querySelector(".manche");
const ampli = document.querySelector(".ampli");
const micro = document.querySelector(".micro");
const corps = document.querySelector(".corps");
const mecanique = document.querySelector(".mecanique");

//_____________Création des boutons de gain passif
const cassette = document.querySelector(".cassette");
const album = document.querySelector(".album");
const ticket = document.querySelector(".ticket");
const placesConcert = document.querySelector(".placesConcert");
const casque = document.querySelector(".casque");
const worldTour = document.querySelector(".worldTour");

//_____________Gestion des améliorations par clic (TALENT)
upgrades.forEach((up, index) => {
    const buttonElement = document.querySelector(`.${up.name}`);

    if (buttonElement) {
        buttonElement.addEventListener("click", () => {
            // 1. Vérifier le score
            if (score < up.price) return;

            // 2. Vérifier la règle de palier (tous les éléments doivent monter ensemble)
            if (!canUpgrade(up)) {
                alert("Montez les autres éléments de talent pour débloquer ce niveau !");
                return;
            }

            // 3. Appliquer l'achat
            score -= up.price;
            up.level += 1;

            // 4. Synchroniser les anciennes variables pour les fonctions globales
            if (up.name === 'mediator') mediatorLevel = up.level;
            if (up.name === 'manche') mancheLevel = up.level;
            if (up.name === 'ampli') ampliLevel = up.level;
            if (up.name === 'micro') microLevel = up.level;
            if (up.name === 'corps') corpsLevel = up.level;
            if (up.name === 'mecanique') mecaniqueLevel = up.level;

            // 5. Calcul des gains
            clickValue += (index + 1);
            up.price = Math.floor(up.price * 1.15);

            // 6. Mise à jour UI
            refreshButtonInfo(buttonElement, up.level, up.price);
            updateDisplay();
            checkLevelUp();
            updateProgressBar();
            saveGame();
        });
    }
});

function addIconToScene(content) {
    let el;
    if (content.startsWith('image/')) {
        el = document.createElement("img");
        el.src = content;
    } else {
        el = document.createElement("span");
        el.textContent = content;
        el.style.fontSize = '2em';
        el.style.position = 'absolute';
        el.style.filter = 'drop-shadow(0 2px 8px rgba(0,0,0,.9))';
        el.style.userSelect = 'none';
        el.style.transition = 'transform .3s ease';
        el.addEventListener('mouseenter', () => el.style.transform = 'scale(1.15)');
        el.addEventListener('mouseleave', () => el.style.transform = 'scale(1)');
    }

    // Position aléatoire sur la scène (évite le centre où est la guitare)
    let randomX, randomY;
    do {
        randomX = Math.random() * 85;
        randomY = Math.random() * 75;
    } while (randomX > 35 && randomX < 65 && randomY > 40 && randomY < 80);

    el.style.left = `${randomX}%`;
    el.style.top = `${randomY}%`;

    sceneUpgradesContainer.appendChild(el);
}

//_____________Fonctions d'améliorations passives

cassette.addEventListener("click", () => {
    if (score < cassettePrice) return;

    score -= cassettePrice;
    cassetteQuantity += 1;
    passiveValue += 0.5 * clickValue;
    cassettePrice = Math.floor(cassettePrice * 1.15);
    addIconToScene("📼");
    refreshButtonInfo(cassette, cassetteQuantity, cassettePrice);
    updateDisplay();
    checkLevelUp();
    updateProgressBar();
    saveGame();
});

album.addEventListener("click", () => {
    if (score < albumPrice) return;

    score -= albumPrice;
    albumQuantity += 1;
    passiveValue += 1.0 * clickValue;
    albumPrice = Math.floor(albumPrice * 1.15);
    addIconToScene("💿");
    refreshButtonInfo(album, albumQuantity, albumPrice);
    updateDisplay();
    checkLevelUp();
    updateProgressBar();
    saveGame();
});

ticket.addEventListener("click", () => {
    if (score < ticketPrice) return;

    score -= ticketPrice;
    ticketQuantity += 1;
    passiveValue += 1.5 * clickValue;
    ticketPrice = Math.floor(ticketPrice * 1.15);
    addIconToScene("🎫");
    refreshButtonInfo(ticket, ticketQuantity, ticketPrice);
    updateDisplay();
    checkLevelUp();
    updateProgressBar();
    saveGame();
});

placesConcert.addEventListener("click", () => {
    if (score < placesConcertPrice) return;

    score -= placesConcertPrice;
    placesConcertQuantity += 1;
    passiveValue += 2.0 * clickValue;
    placesConcertPrice = Math.floor(placesConcertPrice * 1.15);
    addIconToScene("🏟️");
    refreshButtonInfo(placesConcert, placesConcertQuantity, placesConcertPrice);
    updateDisplay();
    checkLevelUp();
    updateProgressBar();
    saveGame();
});

casque.addEventListener("click", () => {
    if (score < casquePrice) return;

    score -= casquePrice;
    casqueQuantity += 1;
    passiveValue += 2.5 * clickValue;
    casquePrice = Math.floor(casquePrice * 1.15);
    addIconToScene("🎧");
    refreshButtonInfo(casque, casqueQuantity, casquePrice);
    updateDisplay();
    checkLevelUp();
    updateProgressBar();
    saveGame();
});

worldTour.addEventListener("click", () => {
    if (score < worldTourPrice) return;

    score -= worldTourPrice;
    worldTourQuantity += 1;
    passiveValue += 3.0 * clickValue;
    worldTourPrice = Math.floor(worldTourPrice * 1.15);
    addIconToScene("🌍");
    refreshButtonInfo(worldTour, worldTourQuantity, worldTourPrice);
    updateDisplay();
    checkLevelUp();
    updateProgressBar();
    saveGame();
});

function refreshButtonInfo(buttonEl, level, price) {
    const levelSpan = buttonEl.querySelector('.level');
    const priceSpan = buttonEl.querySelector('.price');

    if (levelSpan) levelSpan.textContent = `Niv ${level}`;
    if (priceSpan) priceSpan.textContent = `${formatNumber(price)} 💰`;
}

//_____________Fonction pour calculer le niveau global

function getCommonLevel() {
    return Math.min(
        mediatorLevel,
        mancheLevel,
        ampliLevel,
        microLevel,
        corpsLevel,
        mecaniqueLevel
    );
}

//_____________Fonction de mise à jour du skin

const guitarImg = document.querySelector(".button-guitar");

function updateGuitarSkin() {
    const style = localStorage.getItem('melodyStyle') || 'lofi';
    const skins = STYLE_GUITARS[style] || STYLE_GUITARS.lofi;
    const level = getCommonLevel();
    const idx   = Math.min(Math.floor(level / LEVEL_STEP), skins.length - 1);
    const newSrc = skins[idx];

    if (guitarImg.src.endsWith(newSrc)) return; // déjà la bonne image

    // Animation de swap
    guitarImg.classList.add('skin-change');
    setTimeout(() => {
        guitarImg.src = newSrc;
        guitarImg.classList.remove('skin-change');
    }, 200);
}

// ================== SAUVEGARDE localStorage ==================

function saveGame() {
    const saveData = {
        score,
        clickValue,
        passiveValue,
        currentSkinLevel,
        totalEarned,
        upgrades: upgrades.map(u => ({ level: u.level, price: u.price })),
        cassetteQuantity, cassettePrice,
        albumQuantity, albumPrice,
        ticketQuantity, ticketPrice,
        placesConcertQuantity, placesConcertPrice,
        casqueQuantity, casquePrice,
        worldTourQuantity, worldTourPrice,
        unlockedAchievements: Array.from(unlockedAchievements)
    };
    localStorage.setItem('melodyFactorySave', JSON.stringify(saveData));
    showSaveToast();
}

function showSaveToast() {
    const existing = document.querySelector('.save-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'save-toast';
    toast.textContent = 'Sauvegardé !';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1500);
}

function loadGame() {
    const raw = localStorage.getItem('melodyFactorySave');
    if (!raw) return;
    try {
        const data = JSON.parse(raw);

        score = data.score ?? 0;
        clickValue = data.clickValue ?? 1;
        passiveValue = data.passiveValue ?? 0;
        currentSkinLevel = data.currentSkinLevel ?? 0;
        totalEarned = data.totalEarned ?? 0;

        if (data.upgrades) {
            data.upgrades.forEach((saved, i) => {
                upgrades[i].level = saved.level;
                upgrades[i].price = saved.price;
            });
            mediatorLevel = upgrades[0].level;
            mancheLevel = upgrades[1].level;
            ampliLevel = upgrades[2].level;
            microLevel = upgrades[3].level;
            corpsLevel = upgrades[4].level;
            mecaniqueLevel = upgrades[5].level;
        }

        cassetteQuantity = data.cassetteQuantity ?? 0;
        cassettePrice = data.cassettePrice ?? 100;
        albumQuantity = data.albumQuantity ?? 0;
        albumPrice = data.albumPrice ?? 200;
        ticketQuantity = data.ticketQuantity ?? 0;
        ticketPrice = data.ticketPrice ?? 400;
        placesConcertQuantity = data.placesConcertQuantity ?? 0;
        placesConcertPrice = data.placesConcertPrice ?? 800;
        casqueQuantity = data.casqueQuantity ?? 0;
        casquePrice = data.casquePrice ?? 1600;
        worldTourQuantity = data.worldTourQuantity ?? 0;
        worldTourPrice = data.worldTourPrice ?? 3200;

        if (data.unlockedAchievements) {
            data.unlockedAchievements.forEach(id => unlockedAchievements.add(id));
        }
    } catch (e) {
        console.error('Erreur chargement sauvegarde :', e);
    }
}

// Sauvegarde automatique toutes les 10 secondes
setInterval(saveGame, 10000);

// ================== ACHIEVEMENTS ==================

const ACHIEVEMENTS = [
    { id: 'a100', threshold: 100, text: '🎵 Premier accord !' },
    { id: 'a1000', threshold: 1000, text: '🎸 Guitariste en herbe' },
    { id: 'a10000', threshold: 10000, text: '🎤 Star montante' },
    { id: 'a100000', threshold: 100000, text: '🌟 Superstar' },
    { id: 'a1000000', threshold: 1000000, text: '🏆 Légende de la musique' }
];

const unlockedAchievements = new Set();

function checkAchievements() {
    for (const ach of ACHIEVEMENTS) {
        if (!unlockedAchievements.has(ach.id) && totalEarned >= ach.threshold) {
            unlockedAchievements.add(ach.id);
            showAchievementToast(ach.text);
        }
    }
}

function showAchievementToast(text) {
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ================== PARAMÈTRES / LUMINOSITÉ / RESET ==================
// Tout géré par le script inline dans index.html

// ================== AUDIO ==================
// ================== AUDIO ==================
// Géré par MusicEngine (music-engine.js) + index.html

// ================== INITIALISATION (DOMContentLoaded) ==================

window.addEventListener('DOMContentLoaded', () => {
    // Charger la sauvegarde
    loadGame();

    // Boutons d'amélioration par clic
    upgrades.forEach(up => {
        const btn = document.querySelector(`.${up.name}`);
        if (btn) refreshButtonInfo(btn, up.level, up.price);
    });

    // Boutons de gain passif
    refreshButtonInfo(cassette, cassetteQuantity, cassettePrice);
    refreshButtonInfo(album, albumQuantity, albumPrice);
    refreshButtonInfo(ticket, ticketQuantity, ticketPrice);
    refreshButtonInfo(placesConcert, placesConcertQuantity, placesConcertPrice);
    refreshButtonInfo(casque, casqueQuantity, casquePrice);
    refreshButtonInfo(worldTour, worldTourQuantity, worldTourPrice);

    // Mettre à jour le skin guitare
    updateGuitarSkin();

    // Mettre à jour l'affichage complet
    updateDisplay();
    checkLevelUp();
    updateProgressBar();
});
