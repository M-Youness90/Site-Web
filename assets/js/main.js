/* ==========================================================================
   Younes MSADDAK — Interactions du site
   Aucune dépendance externe. Script chargé en `defer`.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------------------------
     Thème clair / sombre
     ------------------------------------------------------------------------ */
  var themeToggle = document.getElementById('themeToggle');
  var metaThemeColor = document.getElementById('metaThemeColor');

  function applyTheme(theme) {
    var isLight = theme === 'light';
    root.setAttribute('data-theme', isLight ? 'light' : 'dark');

    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isLight ? '#f4f7fb' : '#060c16');
    }

    if (themeToggle) {
      var label = isLight ? 'Passer au thème sombre' : 'Passer au thème clair';
      themeToggle.setAttribute('aria-label', label);
      themeToggle.setAttribute('title', label);
    }
  }

  var storedTheme = 'dark';
  try {
    storedTheme = localStorage.getItem('theme') || 'dark';
  } catch (error) {
    storedTheme = 'dark';
  }
  applyTheme(storedTheme === 'light' ? 'light' : 'dark');

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var nextTheme = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(nextTheme);
      try {
        localStorage.setItem('theme', nextTheme);
      } catch (error) {
        /* Le thème reste appliqué pour la session si le stockage est indisponible. */
      }
    });
  }

  /* ------------------------------------------------------------------------
     En-tête au défilement
     ------------------------------------------------------------------------ */
  var header = document.getElementById('siteHeader');
  var backToTop = document.getElementById('backToTop');
  var scrollTicking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;

    if (header) {
      header.classList.toggle('is-scrolled', y > 8);
    }

    if (backToTop) {
      backToTop.classList.toggle('is-visible', y > 560);
    }

    updateActiveNav(y);
    scrollTicking = false;
  }

  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });

  /* ------------------------------------------------------------------------
     Navigation mobile
     ------------------------------------------------------------------------ */
  var menuToggle = document.getElementById('menuToggle');
  var primaryNav = document.getElementById('primaryNav');
  var navScrim = document.getElementById('navScrim');
  var mobileQuery = window.matchMedia('(max-width: 1140px)');

  function isMenuOpen() {
    return body.classList.contains('nav-open');
  }

  function openMenu() {
    if (!menuToggle || !primaryNav) return;

    body.classList.add('nav-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Fermer le menu');

    if (navScrim) {
      navScrim.hidden = false;
    }

    var firstLink = primaryNav.querySelector('.nav__link');
    if (firstLink) {
      window.setTimeout(function () {
        firstLink.focus({ preventScroll: true });
      }, 80);
    }
  }

  function closeMenu(restoreFocus) {
    if (!menuToggle) return;

    body.classList.remove('nav-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Ouvrir le menu');

    if (navScrim) {
      navScrim.hidden = true;
    }

    if (restoreFocus) {
      menuToggle.focus({ preventScroll: true });
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      if (isMenuOpen()) {
        closeMenu(true);
      } else {
        openMenu();
      }
    });
  }

  if (navScrim) {
    navScrim.addEventListener('click', function () {
      closeMenu(true);
    });
  }

  if (primaryNav) {
    primaryNav.addEventListener('click', function (event) {
      var link = event.target.closest('a');
      if (link && mobileQuery.matches) {
        closeMenu(false);
      }
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isMenuOpen()) {
      closeMenu(true);
    }
  });

  function handleNavBreakpoint() {
    if (!mobileQuery.matches && isMenuOpen()) {
      closeMenu(false);
    }
  }

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', handleNavBreakpoint);
  } else if (typeof mobileQuery.addListener === 'function') {
    mobileQuery.addListener(handleNavBreakpoint);
  }

  /* ------------------------------------------------------------------------
     Navigation active selon la section visible
     ------------------------------------------------------------------------ */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      var isActive = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-active', isActive);

      if (isActive) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function updateActiveNav(y) {
    if (!sections.length || !navLinks.length) return;

    var offset = (header ? header.offsetHeight : 76) + 120;
    var current = sections[0].id;
    var atBottom = y + window.innerHeight >= document.documentElement.scrollHeight - 4;

    if (atBottom) {
      current = sections[sections.length - 1].id;
    } else {
      sections.forEach(function (section) {
        if (section.offsetTop - offset <= y) {
          current = section.id;
        }
      });
    }

    setActiveLink(current);
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      var href = link.getAttribute('href');
      if (href && href.charAt(0) === '#') {
        setActiveLink(href.slice(1));
      }
    });
  });

  /* ------------------------------------------------------------------------
     Animations à l’apparition
     ------------------------------------------------------------------------ */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if ('IntersectionObserver' in window && revealItems.length) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var item = entry.target;
        var parent = item.parentElement;
        var index = 0;

        if (parent) {
          var siblings = Array.prototype.slice.call(parent.children).filter(function (child) {
            return child.classList.contains('reveal');
          });
          index = Math.min(siblings.indexOf(item), 3);
        }

        item.style.transitionDelay = index * 70 + 'ms';
        item.classList.add('is-visible');
        revealObserver.unobserve(item);
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.12
    });

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add('is-visible');
    });
  }

  /* ------------------------------------------------------------------------
     Retour en haut
     ------------------------------------------------------------------------ */
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion.matches ? 'auto' : 'smooth'
      });
    });
  }

  /* ------------------------------------------------------------------------
     Photo professionnelle : affichage progressif et repli monogramme
     ------------------------------------------------------------------------ */
  var portrait = document.getElementById('portraitImg');

  function showPortrait() {
    if (portrait) {
      portrait.classList.add('is-loaded');
    }
  }

  if (portrait) {
    if (portrait.complete) {
      if (portrait.naturalWidth > 0) {
        showPortrait();
      } else {
        portrait.remove();
      }
    } else {
      portrait.addEventListener('load', showPortrait);
      portrait.addEventListener('error', function () {
        portrait.remove();
      });
    }
  }

  /* ------------------------------------------------------------------------
     Année du pied de page
     ------------------------------------------------------------------------ */
  var year = document.getElementById('year');
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------------------------
     Initialisation
     ------------------------------------------------------------------------ */
  onScroll();
})();
