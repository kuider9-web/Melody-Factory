/* ═══════════════════════════════════════════════════════
   MELODY FACTORY — Community Stats (Firebase)
   ═══════════════════════════════════════════════════════
   • Tracking  : tous les visiteurs (invisible)
   • Affichage : admin seulement — Ctrl+Shift+S pour se connecter
   ═══════════════════════════════════════════════════════ */

/* ── Mot de passe admin (à changer !) ────────────────── */
const ADMIN_PASSWORD = 'melody2026';

const FIREBASE_CONFIG = {
    apiKey:            "AIzaSyBLhyKeV6QK7FIbpjaALmUautG3KWgCxu8",
    authDomain:        "melody-factory.firebaseapp.com",
    databaseURL:       "https://melody-factory-default-rtdb.europe-west1.firebasedatabase.app",
    projectId:         "melody-factory",
    storageBucket:     "melody-factory.firebasestorage.app",
    messagingSenderId: "900044688688",
    appId:             "1:900044688688:web:86a51f8a0027ff61c70cf5"
};

/* ── Init Firebase ───────────────────────────────────── */
try { firebase.initializeApp(FIREBASE_CONFIG); }
catch (e) { console.warn('[Stats] Firebase déjà initialisé ou config manquante'); }
const db = firebase.database();

/* ── Présence temps réel (pour tout le monde) ─────────── */
const _sid = Math.random().toString(36).slice(2, 10);
const _presRef = db.ref(`presence/${_sid}`);
_presRef.set(true);
_presRef.onDisconnect().remove();
const _hb = setInterval(() => _presRef.set(true), 25000);
window.addEventListener('beforeunload', () => { clearInterval(_hb); _presRef.remove(); });

db.ref('presence').on('value', snap => {
    const el = document.getElementById('stat-active');
    if (el) el.textContent = Math.max(0, snap.numChildren());
});

/* ── Tracking visiteurs (1× par navigateur/jour) ─────── */
(function _trackVisit() {
    const today = _toKey(new Date());
    if (localStorage.getItem(`mf_visit_${today}`)) return;
    localStorage.setItem(`mf_visit_${today}`, '1');
    db.ref(`visits/${today}`).transaction(n => (n || 0) + 1);
})();

/* ── Tracking joueurs (1er clic guitare, 1× par jour) ─── */
let _tracked = false;
function _trackPlay() {
    if (_tracked) return; _tracked = true;
    const today = _toKey(new Date());
    if (localStorage.getItem(`mf_played_${today}`)) return;
    localStorage.setItem(`mf_played_${today}`, '1');
    db.ref(`plays/${today}`).transaction(n => (n || 0) + 1);
}
document.querySelector('.onclick')?.addEventListener('click', _trackPlay, { once: true });

/* ══════════════════════════════════════════════════════
   ADMIN — affichage des stats (mode protégé)
   ══════════════════════════════════════════════════════ */

function _enableAdmin() {
    document.documentElement.dataset.admin = 'true';
    _loadStats();
    _statsInterval = setInterval(_loadStats, 5 * 60 * 1000);
}

let _statsInterval = null;

/* Vérification au chargement */
if (localStorage.getItem('mf_admin') === ADMIN_PASSWORD) {
    _enableAdmin();
}

/* Raccourci Ctrl + Shift + S */
document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyS') {
        e.preventDefault();
        _openAdminModal();
    }
});

function _openAdminModal() {
    document.getElementById('admin-overlay')?.classList.remove('hidden');
    document.getElementById('admin-modal')?.classList.remove('hidden');
    setTimeout(() => document.getElementById('admin-pwd-input')?.focus(), 80);
}

function _closeAdminModal() {
    document.getElementById('admin-overlay')?.classList.add('hidden');
    document.getElementById('admin-modal')?.classList.add('hidden');
    const inp = document.getElementById('admin-pwd-input');
    if (inp) inp.value = '';
}

function _tryLogin() {
    const input = document.getElementById('admin-pwd-input');
    if (!input) return;
    if (input.value === ADMIN_PASSWORD) {
        localStorage.setItem('mf_admin', ADMIN_PASSWORD);
        _enableAdmin();
        _closeAdminModal();
    } else {
        input.style.animation = 'admin-shake .35s ease';
        input.value = '';
        setTimeout(() => { input.style.animation = ''; input.focus(); }, 400);
    }
}

document.getElementById('admin-login-btn')
    ?.addEventListener('click', _tryLogin);
document.getElementById('admin-pwd-input')
    ?.addEventListener('keydown', e => { if (e.key === 'Enter') _tryLogin(); });
document.getElementById('admin-close-btn')
    ?.addEventListener('click', _closeAdminModal);
document.getElementById('admin-overlay')
    ?.addEventListener('click', _closeAdminModal);

document.getElementById('admin-logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('mf_admin');
    document.documentElement.removeAttribute('data-admin');
    clearInterval(_statsInterval);
});

/* ── Lecture historique ──────────────────────────────── */
function _loadStats() {
    Promise.all([
        db.ref('visits').once('value'),
        db.ref('plays').once('value')
    ]).then(([vSnap, pSnap]) => {
        const V = vSnap.val() || {};
        const P = pSnap.val() || {};
        const sum = (data, keys) => keys.reduce((s, k) => s + (data[k] || 0), 0);

        [
            { keys: _mondayKeys(), elV: 'stat-week-v',  elP: 'stat-week-p'  },
            { keys: _monthKeys(),  elV: 'stat-month-v', elP: 'stat-month-p' },
            { keys: _yearKeys(),   elV: 'stat-year-v',  elP: 'stat-year-p'  },
        ].forEach(({ keys, elV, elP }) => {
            const v = document.getElementById(elV);
            const p = document.getElementById(elP);
            if (v) v.textContent = _fmt(sum(V, keys));
            if (p) p.textContent = _fmt(sum(P, keys));
        });
    });
}

/* ── Helpers ─────────────────────────────────────────── */
function _toKey(d) { return d.toISOString().split('T')[0]; }

function _dayKeys(startDate) {
    const keys = [], now = new Date();
    now.setHours(0,0,0,0);
    const cur = new Date(startDate);
    while (cur <= now) { keys.push(_toKey(cur)); cur.setDate(cur.getDate() + 1); }
    return keys;
}

function _mondayKeys() {
    const d = new Date();
    d.setDate(d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1));
    d.setHours(0,0,0,0);
    return _dayKeys(d);
}
function _monthKeys() { return _dayKeys(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); }
function _yearKeys()  { return _dayKeys(new Date(new Date().getFullYear(), 0, 1)); }

function _fmt(n) {
    if (n < 1000)    return n.toString();
    if (n < 1000000) return (n / 1000).toFixed(1) + 'K';
    return (n / 1000000).toFixed(1) + 'M';
}
