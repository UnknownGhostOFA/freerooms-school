

(function () {
    const overlay = document.getElementById('page-intro');
    if (!overlay) return;

    const container = overlay.querySelector('.page-intro-lottie');

    const INTRO_PATH = './RESSOURCES/RESSOURCES/MusicIntro/intro_white_page.json';
    const PLAY_COUNT = 1;

    let anim = null;
    let dispatched = false;

    function notifyDone() {
        if (dispatched) return;
        dispatched = true;
        window.dispatchEvent(new CustomEvent('site-intro-done'));
    }

    function dismiss() {
        if (overlay.classList.contains('is-gone')) return;
        overlay.classList.add('is-gone');

        notifyDone();
        removeSkipListeners();
        setTimeout(() => {
            if (anim) { try { anim.destroy(); } catch (_) {} }
            overlay.remove();
        }, 750);
    }

    function onPointer() { dismiss(); }
    function onKey() {
        const tag = (document.activeElement && document.activeElement.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        dismiss();
    }
    function addSkipListeners() {
        overlay.style.pointerEvents = 'auto';

        overlay.style.cursor = 'none';
        overlay.addEventListener('pointerdown', onPointer);
        overlay.addEventListener('touchstart', onPointer, { passive: true });
        window.addEventListener('keydown', onKey);
    }
    function removeSkipListeners() {
        overlay.removeEventListener('pointerdown', onPointer);
        overlay.removeEventListener('touchstart', onPointer);
        window.removeEventListener('keydown', onKey);
    }
    addSkipListeners();

    const reduceMotion = window.matchMedia &&
                         window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) { dismiss(); return; }

    if (!window.lottie || !container) { dismiss(); return; }

    anim = window.lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: INTRO_PATH
    });

    let plays = 0;
    anim.addEventListener('loopComplete', () => {
        plays++;
        if (plays >= PLAY_COUNT) {
            anim.stop();
            dismiss();
        }
    });

    anim.addEventListener('data_failed', dismiss);
    setTimeout(() => { if (!dispatched) dismiss(); }, 8000);
})();
