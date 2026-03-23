/*  ╔══════════════════════════════════════════════════════╗
    ║  MELODY FACTORY — Music Engine v3                   ║
    ║  Kevin MacLeod — CC BY 3.0 (incompetech.com)        ║
    ╚══════════════════════════════════════════════════════╝

  Tracks utilisés (Creative Commons Attribution 3.0) :
  • lofi.mp3      — "Easy Lemon"         by Kevin MacLeod
  • kpop.mp3      — "Digital Lemonade"   by Kevin MacLeod
  • jazz.mp3      — "Hot Swing"          by Kevin MacLeod
  • rock.mp3      — "Big Rock"           by Kevin MacLeod
  • electro.mp3   — "Club Diver"         by Kevin MacLeod
  • classical.mp3 — "Aurea Carmina"      by Kevin MacLeod
  Licence : https://incompetech.com/music/royalty-free/licenses/
*/

const MusicEngine = (() => {

    const TRACKS = {
        lofi:      'music/lofi.mp3',
        kpop:      'music/kpop.mp3',
        jazz:      'music/jazz.mp3',
        rock:      'music/rock.mp3',
        electro:   'music/electro.mp3',
        classical: 'music/classical.mp3',
    };

    let audio   = new Audio();
    audio.loop  = true;
    audio.volume = 0.5;

    let _style   = null;
    let _playing = false;
    let _volume  = 0.5;

    /* ── API publique ─────────────────────────────────── */

    function play(styleId) {
        const src = TRACKS[styleId] || TRACKS.lofi;

        /* Même track déjà en lecture → rien à faire */
        if (_playing && _style === styleId) return;

        /* Nouveau style : fade out → swap → fade in */
        if (_playing) {
            _fadeOut(() => _load(src, styleId));
        } else {
            _load(src, styleId);
        }
    }

    function stop() {
        _playing = false;
        audio.pause();
        audio.currentTime = 0;
        _style = null;
    }

    function pause() {
        if (_playing) {
            audio.pause();
            _playing = false;
        }
    }

    function resume() {
        if (!_playing && audio.src) {
            audio.play().catch(() => {});
            _playing = true;
        }
    }

    function setVolume(v) {
        _volume = Math.max(0, Math.min(1, v));
        audio.volume = _volume;
    }

    function isPlaying() {
        return _playing;
    }

    /* ── Internes ─────────────────────────────────────── */

    function _load(src, styleId) {
        audio.src = src;
        audio.volume = 0;
        audio.play()
            .then(() => {
                _style   = styleId;
                _playing = true;
                _fadeIn();
            })
            .catch(err => {
                console.warn('[MusicEngine] lecture bloquée :', err);
            });
    }

    function _fadeOut(cb) {
        const target  = 0;
        const step    = 0.05;
        const interval = setInterval(() => {
            const next = Math.max(target, audio.volume - step);
            audio.volume = next;
            if (next <= target) {
                clearInterval(interval);
                audio.pause();
                if (cb) cb();
            }
        }, 40);
    }

    function _fadeIn() {
        const target  = _volume;
        const step    = 0.04;
        const interval = setInterval(() => {
            const next = Math.min(target, audio.volume + step);
            audio.volume = next;
            if (next >= target) clearInterval(interval);
        }, 40);
    }

    return { play, stop, pause, resume, setVolume, isPlaying };

})();
