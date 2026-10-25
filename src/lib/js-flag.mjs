// Runs inline in <head> before first paint, so the hero can hide what it is about to animate without a flash.
// Its SHA-256 is allowed in the CSP (astro.config.mjs); change the text and the hash follows automatically.
export const JS_FLAG = "document.documentElement.classList.add('js')";
