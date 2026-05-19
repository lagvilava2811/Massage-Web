const header = document.getElementById("header");
const menuBtn = document.getElementById("menuBtn");
const mobileNav = document.getElementById("mobileNav");
const mobileClose = document.getElementById("mobileClose");
const cursor = document.getElementById("cursor");

const setHeader = () => {
  header?.classList.toggle("scrolled", window.scrollY > 32);
};

const openNav = () => {
  mobileNav?.classList.add("open");
  menuBtn?.setAttribute("aria-expanded", "true");
  document.body.classList.add("nav-open");
};

const closeNav = () => {
  mobileNav?.classList.remove("open");
  menuBtn?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("nav-open");
};

setHeader();
window.addEventListener("scroll", setHeader, { passive: true });
menuBtn?.addEventListener("click", openNav);
mobileClose?.addEventListener("click", closeNav);
mobileNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
  );

  revealItems.forEach((item) => {
    observer.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

if (cursor && matchMedia("(pointer:fine)").matches) {
  window.addEventListener(
    "pointermove",
    (event) => {
      document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
    },
    { passive: true },
  );

  document.querySelectorAll("a, button").forEach((element) => {
    element.addEventListener("mouseenter", () => cursor.classList.add("expand"));
    element.addEventListener("mouseleave", () => cursor.classList.remove("expand"));
  });
}
