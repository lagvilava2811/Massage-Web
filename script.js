const header = document.getElementById("header");
const menuBtn = document.getElementById("menuBtn");
const mobileNav = document.getElementById("mobileNav");
const mobileClose = document.getElementById("mobileClose");
let previousFocus = null;
let backgroundState = [];
const setHeader = () =>
  header?.classList.toggle("scrolled", window.scrollY > 32);
const closeNav = (restoreFocus = true) => {
  if (!mobileNav?.classList.contains("open")) return;
  mobileNav.classList.remove("open");
  mobileNav.inert = true;
  mobileNav.setAttribute("aria-hidden", "true");
  menuBtn?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("nav-open");
  backgroundState.forEach(([element, wasInert]) => {
    element.inert = wasInert;
  });
  backgroundState = [];
  if (restoreFocus && previousFocus?.isConnected) previousFocus.focus();
};
const openNav = () => {
  if (!mobileNav || mobileNav.classList.contains("open")) return;
  previousFocus = document.activeElement;
  mobileNav.inert = false;
  mobileNav.setAttribute("aria-hidden", "false");
  mobileNav.classList.add("open");
  menuBtn?.setAttribute("aria-expanded", "true");
  document.body.classList.add("nav-open");
  backgroundState = [...document.body.children]
    .filter(
      (element) =>
        element !== mobileNav && !["SCRIPT", "STYLE"].includes(element.tagName),
    )
    .map((element) => [element, element.inert]);
  backgroundState.forEach(([element]) => {
    element.inert = true;
  });
  mobileClose?.focus();
};
setHeader();
window.addEventListener("scroll", setHeader, { passive: true });
if (menuBtn && mobileNav && mobileClose) {
  document.documentElement.classList.add("nav-ready");
  menuBtn.addEventListener("click", openNav);
  mobileClose.addEventListener("click", () => closeNav());
  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeNav(false);
      const href = link.getAttribute("href");
      if (href?.startsWith("#")) {
        const section = document.getElementById(href.slice(1));
        if (section) {
          section.setAttribute("tabindex", "-1");
          section.focus({ preventScroll: true });
        }
      }
    });
  });
  document.addEventListener("keydown", (event) => {
    if (!mobileNav.classList.contains("open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeNav();
    }
    if (event.key === "Tab") {
      const focusable = [
        ...mobileNav.querySelectorAll("a[href], button:not([disabled])"),
      ];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  });
  matchMedia("(min-width: 1025px)").addEventListener("change", (event) => {
    if (event.matches) closeNav(false);
  });
}
