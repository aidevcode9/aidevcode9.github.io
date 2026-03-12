document.addEventListener("DOMContentLoaded", () => {
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

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

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
    } else if (href.includes("github.com/aidevcode9/evidence-doc-qa")) {
      eventName = "repo_click";
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
