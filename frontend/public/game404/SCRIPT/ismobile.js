function isMobile() {
    return window.innerWidth <= 767 && window.innerHeight > window.innerWidth;
}

oldmobile = isMobile();

const _isHomePage = (() => {
    const p = (location.pathname || '').toLowerCase();
    return p === '/' || p === '' || p.endsWith('/index.html') || p.endsWith('/index');
})();
const _reloadOnResizeDisabled =
    !_isHomePage ||
    (typeof window !== 'undefined' && window.__noReloadOnResize === true) ||
    (typeof location !== 'undefined' && /[?&]noreload\b/.test(location.search));

let _resizeReloadTimer = null;
if (!_reloadOnResizeDisabled) {
    window.addEventListener("resize", () => {
        if (oldmobile != isMobile()) {
            document.location.reload();
            return;
        }
        if (isMobile()) return;
        clearTimeout(_resizeReloadTimer);
        _resizeReloadTimer = setTimeout(() => document.location.reload(), 500);
    });
}