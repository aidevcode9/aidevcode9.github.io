document.addEventListener("DOMContentLoaded", () => {
  /* ---- Analytics ---- */
  const emitAnalyticsEvent = (name, params = {}) => {
    const detail = {
      name,
      ...params,
      path: window.location.pathname
    };

    window.dispatchEvent(new CustomEvent("site:analytics", { detail }));

    if (typeof window.gtag === "function") {
      window.gtag("event", name, detail);
    }

    if (typeof window.plausible === "function") {
      window.plausible(name, { props: detail });
    }
  };

  /* ---- Mobile Menu ---- */
  const menuButton = document.querySelector(".menu-button");
  const siteNav = document.getElementById("site-nav");

  if (menuButton && siteNav) {
    const closeMenu = () => {
      menuButton.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
    };

    menuButton.addEventListener("click", () => {
      const expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      siteNav.classList.toggle("is-open");
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
      if (!siteNav.contains(event.target) && !menuButton.contains(event.target)) {
        closeMenu();
      }
    });
  }

  /* ---- Theme Toggle ---- */
  const themeSwitch = document.querySelector(".theme-switch");

  if (themeSwitch) {
    themeSwitch.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      updateThemeColor(next);
    });
  }

  // Listen for OS-level preference changes (only if user hasn't manually chosen)
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      const next = e.matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      updateThemeColor(next);
    }
  });

  function updateThemeColor(theme) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#0c0f14" : "#f8f9fb");
    }
  }

  /* ---- Scroll Reveal ---- */
  const revealItems = document.querySelectorAll(".reveal");
  if (revealItems.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 40, 220)}ms`;
      observer.observe(item);
    });
  }

  /* ---- Dynamic Year ---- */
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  /* ---- Link Analytics ---- */
  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href") || "";
    let eventName = "";

    if (href.includes("cal.com/chuck-h-cll6vj/15min")) {
      eventName = "book_intro_click";
    } else if (href.startsWith("mailto:")) {
      eventName = "email_click";
    } else if (href.includes("linkedin.com/in/chuck-hernandez")) {
      eventName = "linkedin_click";
    } else if (href.endsWith("for-hiring.html")) {
      eventName = "for_hiring_click";
    } else if (href.endsWith("selected-work.html")) {
      eventName = "selected_work_click";
    } else if (
      href.endsWith("evidence-bound-document-qa.html") ||
      href.endsWith("kairosys-agentic-platform.html") ||
      href.endsWith("ai-learning-platform.html")
    ) {
      eventName = "project_brief_click";
    }

    if (!eventName) {
      return;
    }

    link.addEventListener("click", () => {
      emitAnalyticsEvent(eventName, {
        href,
        label: (link.textContent || "").trim().slice(0, 80)
      });
    });
  });
});
