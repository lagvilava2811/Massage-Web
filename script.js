const header = document.getElementById("header");
// Desktop browsers may have no telephone handler. Always show the number
// and alternatives there; touch devices retain the native tel: link.
const callCopy = {
  ka: [
    "დაუკავშირდით ნინოს",
    "კომპიუტერიდან დარეკვას ზარების აპი სჭირდება. შეგიძლიათ ნომერი დააკოპიროთ ან WhatsApp-ში მოგვწეროთ.",
    "ნომრის კოპირება",
    "დაკოპირებულია",
    "დარეკვა აპით",
    "დახურვა",
  ],
  en: [
    "Contact Nino",
    "Calling from a computer requires a calling app. Copy the number or message us on WhatsApp.",
    "Copy number",
    "Copied",
    "Call with an app",
    "Close",
  ],
  ru: [
    "Связаться с Нино",
    "Для звонка с компьютера нужно приложение для звонков. Скопируйте номер или напишите в WhatsApp.",
    "Копировать номер",
    "Скопировано",
    "Позвонить через приложение",
    "Закрыть",
  ],
};
const callLabels = callCopy[document.documentElement.lang] || callCopy.en;
const callDialog = document.createElement("dialog");
callDialog.className = "call-dialog";
callDialog.setAttribute("aria-labelledby", "call-title");
callDialog.innerHTML = `<form method="dialog"><button class="call-close" aria-label="${callLabels[5]}">×</button></form><h2 id="call-title">${callLabels[0]}</h2><p class="call-number">+995 571 088 021</p><p>${callLabels[1]}</p><div class="call-actions"><button type="button" class="btn btn-outline" data-copy-phone>${callLabels[2]}</button><a class="btn btn-dark" href="https://wa.me/995571088021" target="_blank" rel="noopener noreferrer">WhatsApp</a><a class="call-native" href="tel:+995571088021">${callLabels[4]}</a></div><p role="status" class="call-status"></p>`;
document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    event.preventDefault();
    callDialog.showModal();
  });
});
document.body.append(callDialog);
callDialog
  .querySelector("[data-copy-phone]")
  .addEventListener("click", async () => {
    const status = callDialog.querySelector(".call-status");
    try {
      await navigator.clipboard.writeText("+995571088021");
      status.textContent = callLabels[3];
    } catch {
      status.textContent = "+995571088021";
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(status);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });
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
