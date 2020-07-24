/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function () {
  var settingsElement = document.querySelector('head > script[type="application/json"][data-drupal-selector="drupal-settings-json"], body > script[type="application/json"][data-drupal-selector="drupal-settings-json"]');
  window.drupalSettings = {};

  if (settingsElement !== null) {
    window.drupalSettings = JSON.parse(settingsElement.textContent);
  }
})();;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

window.Drupal = {
  behaviors: {},
  locale: {}
};

(function (Drupal, drupalSettings, drupalTranslations, console, Proxy, Reflect) {
  Drupal.throwError = function (error) {
    setTimeout(function () {
      throw error;
    }, 0);
  };

  Drupal.attachBehaviors = function (context, settings) {
    context = context || document;
    settings = settings || drupalSettings;
    var behaviors = Drupal.behaviors;
    Object.keys(behaviors || {}).forEach(function (i) {
      if (typeof behaviors[i].attach === 'function') {
        try {
          behaviors[i].attach(context, settings);
        } catch (e) {
          Drupal.throwError(e);
        }
      }
    });
  };

  Drupal.detachBehaviors = function (context, settings, trigger) {
    context = context || document;
    settings = settings || drupalSettings;
    trigger = trigger || 'unload';
    var behaviors = Drupal.behaviors;
    Object.keys(behaviors || {}).forEach(function (i) {
      if (typeof behaviors[i].detach === 'function') {
        try {
          behaviors[i].detach(context, settings, trigger);
        } catch (e) {
          Drupal.throwError(e);
        }
      }
    });
  };

  Drupal.checkPlain = function (str) {
    str = str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    return str;
  };

  Drupal.formatString = function (str, args) {
    var processedArgs = {};
    Object.keys(args || {}).forEach(function (key) {
      switch (key.charAt(0)) {
        case '@':
          processedArgs[key] = Drupal.checkPlain(args[key]);
          break;

        case '!':
          processedArgs[key] = args[key];
          break;

        default:
          processedArgs[key] = Drupal.theme('placeholder', args[key]);
          break;
      }
    });
    return Drupal.stringReplace(str, processedArgs, null);
  };

  Drupal.stringReplace = function (str, args, keys) {
    if (str.length === 0) {
      return str;
    }

    if (!Array.isArray(keys)) {
      keys = Object.keys(args || {});
      keys.sort(function (a, b) {
        return a.length - b.length;
      });
    }

    if (keys.length === 0) {
      return str;
    }

    var key = keys.pop();
    var fragments = str.split(key);

    if (keys.length) {
      for (var i = 0; i < fragments.length; i++) {
        fragments[i] = Drupal.stringReplace(fragments[i], args, keys.slice(0));
      }
    }

    return fragments.join(args[key]);
  };

  Drupal.t = function (str, args, options) {
    options = options || {};
    options.context = options.context || '';

    if (typeof drupalTranslations !== 'undefined' && drupalTranslations.strings && drupalTranslations.strings[options.context] && drupalTranslations.strings[options.context][str]) {
      str = drupalTranslations.strings[options.context][str];
    }

    if (args) {
      str = Drupal.formatString(str, args);
    }

    return str;
  };

  Drupal.url = function (path) {
    return drupalSettings.path.baseUrl + drupalSettings.path.pathPrefix + path;
  };

  Drupal.url.toAbsolute = function (url) {
    var urlParsingNode = document.createElement('a');

    try {
      url = decodeURIComponent(url);
    } catch (e) {}

    urlParsingNode.setAttribute('href', url);
    return urlParsingNode.cloneNode(false).href;
  };

  Drupal.url.isLocal = function (url) {
    var absoluteUrl = Drupal.url.toAbsolute(url);
    var protocol = window.location.protocol;

    if (protocol === 'http:' && absoluteUrl.indexOf('https:') === 0) {
      protocol = 'https:';
    }

    var baseUrl = "".concat(protocol, "//").concat(window.location.host).concat(drupalSettings.path.baseUrl.slice(0, -1));

    try {
      absoluteUrl = decodeURIComponent(absoluteUrl);
    } catch (e) {}

    try {
      baseUrl = decodeURIComponent(baseUrl);
    } catch (e) {}

    return absoluteUrl === baseUrl || absoluteUrl.indexOf("".concat(baseUrl, "/")) === 0;
  };

  Drupal.formatPlural = function (count, singular, plural, args, options) {
    args = args || {};
    args['@count'] = count;
    var pluralDelimiter = drupalSettings.pluralDelimiter;
    var translations = Drupal.t(singular + pluralDelimiter + plural, args, options).split(pluralDelimiter);
    var index = 0;

    if (typeof drupalTranslations !== 'undefined' && drupalTranslations.pluralFormula) {
      index = count in drupalTranslations.pluralFormula ? drupalTranslations.pluralFormula[count] : drupalTranslations.pluralFormula.default;
    } else if (args['@count'] !== 1) {
      index = 1;
    }

    return translations[index];
  };

  Drupal.encodePath = function (item) {
    return window.encodeURIComponent(item).replace(/%2F/g, '/');
  };

  Drupal.deprecationError = function (_ref) {
    var message = _ref.message;

    if (drupalSettings.suppressDeprecationErrors === false && typeof console !== 'undefined' && console.warn) {
      console.warn("[Deprecation] ".concat(message));
    }
  };

  Drupal.deprecatedProperty = function (_ref2) {
    var target = _ref2.target,
        deprecatedProperty = _ref2.deprecatedProperty,
        message = _ref2.message;

    if (!Proxy || !Reflect) {
      return target;
    }

    return new Proxy(target, {
      get: function get(target, key) {
        if (key === deprecatedProperty) {
          Drupal.deprecationError({
            message: message
          });
        }

        for (var _len = arguments.length, rest = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          rest[_key - 2] = arguments[_key];
        }

        return Reflect.get.apply(Reflect, [target, key].concat(rest));
      }
    });
  };

  Drupal.theme = function (func) {
    if (func in Drupal.theme) {
      var _Drupal$theme;

      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      return (_Drupal$theme = Drupal.theme)[func].apply(_Drupal$theme, args);
    }
  };

  Drupal.theme.placeholder = function (str) {
    return "<em class=\"placeholder\">".concat(Drupal.checkPlain(str), "</em>");
  };
})(Drupal, window.drupalSettings, window.drupalTranslations, window.console, window.Proxy, window.Reflect);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

if (window.jQuery) {
  jQuery.noConflict();
}

document.documentElement.className += ' js';

(function (Drupal, drupalSettings) {
  var domReady = function domReady(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      var listener = function listener() {
        callback();
        document.removeEventListener('DOMContentLoaded', listener);
      };

      document.addEventListener('DOMContentLoaded', listener);
    }
  };

  domReady(function () {
    Drupal.attachBehaviors(document, drupalSettings);
  });
})(Drupal, window.drupalSettings);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function (Drupal) {
  Drupal.theme.checkbox = function () {
    return '<input type="checkbox" class="form-checkbox form-boolean form-boolean--type-checkbox"/>';
  };
})(Drupal);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = function (callback, thisArg) {
    thisArg = thisArg || window;
    for (var i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}

if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
};
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function () {
  window.drupalSettings = window.drupalSettings || {};
  window.drupalSettings.olivero = window.drupalSettings.olivero || {};

  document.documentElement.classList.add('js');

  function isDesktopNav() {
    var navButtons = document.querySelector('.mobile-buttons');
    return window.getComputedStyle(navButtons).getPropertyValue('display') === 'none';
  }

  drupalSettings.olivero.isDesktopNav = isDesktopNav;

  var wideNavButton = document.querySelector('.nav-primary__button');
  var siteHeaderFixable = document.querySelector('.site-header__fixable');

  function wideNavIsOpen() {
    return wideNavButton.getAttribute('aria-expanded') === 'true';
  }

  function showWideNav() {
    if (isDesktopNav()) {
      wideNavButton.setAttribute('aria-expanded', 'true');
      siteHeaderFixable.classList.add('is-expanded');
    }
  }

  function hideWideNav() {
    if (isDesktopNav()) {
      wideNavButton.setAttribute('aria-expanded', 'false');
      siteHeaderFixable.classList.remove('is-expanded');
    }
  }

  if ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype) {
    var fixables = document.querySelectorAll('.fixable');

    function toggleDesktopNavVisibility(entries) {
      if (!isDesktopNav()) return;

      entries.forEach(function (entry) {
        if (entry.intersectionRatio < 1) {
          fixables.forEach(function (el) {
            return el.classList.add('js-fixed');
          });
        } else {
          fixables.forEach(function (el) {
            return el.classList.remove('js-fixed');
          });
        }
      });
    }

    function getRootMargin() {
      var rootMarginTop = 72;
      var _document = document,
          body = _document.body;


      if (body.classList.contains('toolbar-fixed')) {
        rootMarginTop -= 39;
      }

      if (body.classList.contains('toolbar-horizontal') && body.classList.contains('toolbar-tray-open')) {
        rootMarginTop -= 40;
      }

      return rootMarginTop + 'px 0px 0px 0px';
    }

    function monitorNavPosition() {
      var primaryNav = document.querySelector('.site-header');
      var options = {
        rootMargin: getRootMargin(),
        threshold: [0.999, 1]
      };

      var observer = new IntersectionObserver(toggleDesktopNavVisibility, options);
      observer.observe(primaryNav);
    }

    wideNavButton.addEventListener('click', function () {
      if (!wideNavIsOpen()) {
        showWideNav();
      } else {
        hideWideNav();
      }
    });

    siteHeaderFixable.querySelector('.site-header__inner').addEventListener('focusin', showWideNav);

    document.querySelector('.skip-link').addEventListener('click', hideWideNav);

    monitorNavPosition();
  }

  document.addEventListener('keyup', function (e) {
    if (e.keyCode === 27) {
      if ('toggleSearchVisibility' in drupalSettings.olivero && 'searchIsVisible' in drupalSettings.olivero && drupalSettings.olivero.searchIsVisible()) {
        drupalSettings.olivero.toggleSearchVisibility(false);
      } else {
          hideWideNav();
        }
    }
  });
})();;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function () {
  var isDesktopNav = drupalSettings.olivero.isDesktopNav;


  var mobileNavButton = document.querySelector('.mobile-nav-button');
  var mobileNavWrapperId = 'header-nav';
  var mobileNavWrapper = document.getElementById(mobileNavWrapperId);
  var body = document.querySelector('body');
  var overlay = document.querySelector('.overlay');

  var focusableNavElements = mobileNavWrapper.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  var firstFocusableEl = focusableNavElements[0];
  var lastFocusableEl = focusableNavElements[focusableNavElements.length - 1];

  function init() {
    mobileNavButton.setAttribute('aria-controls', mobileNavWrapperId);
    mobileNavButton.setAttribute('aria-expanded', 'false');
  }

  function isMobileNavOpen() {
    return mobileNavWrapper.classList.contains('is-active');
  }

  function toggleMobileNav(state) {
    var value = !!state;
    mobileNavButton.setAttribute('aria-expanded', value);

    if (value) {
      body.classList.add('js-overlay-active');
      body.classList.add('js-fixed');
      mobileNavWrapper.classList.add('is-active');
    } else {
      body.classList.remove('js-overlay-active');
      body.classList.remove('js-fixed');
      mobileNavWrapper.classList.remove('is-active');
    }
  }

  init();

  mobileNavButton.addEventListener('click', function () {
    toggleMobileNav(!isMobileNavOpen());
  });

  document.addEventListener('keyup', function (e) {
    if (e.keyCode === 27) {
      if (drupalSettings.olivero.areAnySubnavsOpen()) {
        drupalSettings.olivero.closeAllSubNav();
      } else {
        toggleMobileNav(false);
      }
    }
  });

  overlay.addEventListener('click', function () {
    toggleMobileNav(false);
  });

  overlay.addEventListener('touchstart', function () {
    toggleMobileNav(false);
  });

  mobileNavWrapper.addEventListener('keydown', function (e) {
    if (e.key === 'Tab' || e.keyCode === 9) {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusableEl && !isDesktopNav()) {
          mobileNavButton.focus();
          e.preventDefault();
        }
      } else if (document.activeElement === lastFocusableEl && !isDesktopNav()) {
          mobileNavButton.focus();
          e.preventDefault();
        }
    }
  });

  window.addEventListener('resize', function () {
    if (isDesktopNav()) {
      toggleMobileNav(false);
      body.classList.remove('js-overlay-active', 'js-fixed');
    }
  });
})();;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function () {
  var isDesktopNav = drupalSettings.olivero.isDesktopNav;

  var secondLevelNavMenus = document.querySelectorAll('.primary-nav__menu-item--has-children');

  function toggleSubNav(topLevelMenuITem, toState) {
    var button = topLevelMenuITem.querySelector('.primary-nav__button-toggle, .primary-nav__menu-link--button');
    var state = toState !== undefined ? toState : button.getAttribute('aria-expanded') !== 'true';

    if (state) {
      button.setAttribute('aria-expanded', 'true');
      topLevelMenuITem.querySelector('.primary-nav__menu--level-2').classList.add('is-active');
    } else {
      button.setAttribute('aria-expanded', 'false');
      topLevelMenuITem.querySelector('.primary-nav__menu--level-2').classList.remove('is-active');
    }
  }

  drupalSettings.olivero.toggleSubNav = toggleSubNav;

  secondLevelNavMenus.forEach(function (el) {
    var button = el.querySelector('.primary-nav__button-toggle, .primary-nav__menu-link--button');

    button.removeAttribute('aria-hidden');
    button.removeAttribute('tabindex');

    button.addEventListener('click', function (e) {
      var topLevelMenuITem = e.currentTarget.parentNode;
      toggleSubNav(topLevelMenuITem);
    });

    el.addEventListener('mouseover', function (e) {
      if (isDesktopNav()) {
        toggleSubNav(e.currentTarget, true);
      }
    });

    el.addEventListener('mouseout', function (e) {
      if (isDesktopNav()) {
        toggleSubNav(e.currentTarget, false);
      }
    });
  });

  function closeAllSubNav() {
    secondLevelNavMenus.forEach(function (el) {
      toggleSubNav(el, false);
    });
  }

  drupalSettings.olivero.closeAllSubNav = closeAllSubNav;

  function areAnySubnavsOpen() {
    var subNavsAreOpen = false;

    secondLevelNavMenus.forEach(function (el) {
      var button = el.querySelector('.primary-nav__button-toggle');
      var state = button.getAttribute('aria-expanded') === 'true';

      if (state) {
        subNavsAreOpen = true;
      }
    });

    return subNavsAreOpen;
  }

  drupalSettings.olivero.areAnySubnavsOpen = areAnySubnavsOpen;

  document.addEventListener('keyup', function (e) {
    if (e.keyCode === 27 && isDesktopNav()) {
      closeAllSubNav();
    }
  });
})();;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function (Drupal) {
  function init(el) {
    var tabs = el.querySelector('.tabs');
    var expandedClass = 'is-expanded';
    var activeTab = tabs.querySelector('.is-active');

    function isTabsMobileLayout() {
      return tabs.querySelector('.tabs__trigger').clientHeight > 0;
    }

    function handleTriggerClick(e) {
      if (!tabs.classList.contains(expandedClass)) {
        e.currentTarget.setAttribute('aria-expanded', 'true');
        tabs.classList.add(expandedClass);
      } else {
        e.currentTarget.setAttribute('aria-expanded', 'false');
        tabs.classList.remove(expandedClass);
      }
    }

    if (isTabsMobileLayout() && !activeTab.matches('.tabs__tab:first-child')) {
      var newActiveTab = activeTab.cloneNode(true);
      var firstTab = tabs.querySelector('.tabs__tab:first-child');
      tabs.insertBefore(newActiveTab, firstTab);
      tabs.removeChild(activeTab);
    }

    tabs.querySelector('.tabs__trigger').addEventListener('click', handleTriggerClick);
  }

  Drupal.behaviors.tabs = {
    attach: function attach(context) {
      context.querySelectorAll('[data-drupal-nav-tabs]').forEach(function (el) {
        return init(el);
      });
    }
  };
})(Drupal);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function () {
  var searchWideButton = document.querySelector('.header-nav__search-button');
  var searchWideWrapper = document.querySelector('.search-wide__wrapper');

  function searchIsVisible() {
    return searchWideWrapper.classList.contains('is-active');
  }
  drupalSettings.olivero.searchIsVisible = searchIsVisible;

  function handleFocus() {
    if (searchIsVisible()) {
      searchWideWrapper.querySelector('input[type="search"]').focus();
    } else {
      searchWideButton.focus();
    }
  }

  function toggleSearchVisibility(visibility) {
    searchWideButton.setAttribute('aria-expanded', visibility === true);
    searchWideWrapper.addEventListener('transitionend', handleFocus, {
      once: true
    });

    if (visibility === true) {
      searchWideWrapper.classList.add('is-active');
    } else {
      searchWideWrapper.classList.remove('is-active');
    }
  }

  drupalSettings.olivero.toggleSearchVisibility = toggleSearchVisibility;

  document.addEventListener('click', function (e) {
    if (e.target.matches('.header-nav__search-button, .header-nav__search-button *')) {
      toggleSearchVisibility(!searchIsVisible());
    } else if (searchIsVisible() && !e.target.matches('.search-wide__wrapper, .search-wide__wrapper *')) {
      toggleSearchVisibility(false);
    }
  });
})();;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function () {
  function toggleLogo(isChecked) {
    var headerInner = document.querySelector('.site-branding__inner');
    if (headerInner) {
      var currentLogo = headerInner.querySelector('.site-branding__logo');

      if (isChecked) {
        var logoHTML = '\n        <a href="/" rel="home" class="site-branding__logo">\n          <img src="/themes/contrib/olivero/logo.svg" alt="Home">\n        </a>';

        if (currentLogo) {
          headerInner.removeChild(currentLogo);
        }

        headerInner.innerHTML = logoHTML + headerInner.innerHTML;
      } else if (currentLogo) {
        headerInner.removeChild(currentLogo);
      }
    }

    sessionStorage.setItem('olivero.debug.toggleLogo', isChecked);
  }

  function toggleRequiredAttr(isChecked) {
    var requiredFormElements = document.querySelectorAll('[required]');

    if (isChecked) {
      requiredFormElements.forEach(function (el) {
        el.removeAttribute('required');
        el.setAttribute('data-required', 'true');
      });
    } else {
      document.querySelectorAll('[data-required="true"]').forEach(function (el) {
        el.removeAttribute('data-required');
        el.setAttribute('required', 'true');
      });
    }

    sessionStorage.setItem('olivero.debug.toggleRequiredAttr', isChecked);
  }

  function toggleEditableSiteName(isChecked) {
    var siteNameText = document.querySelector('.site-branding__name a');
    if (siteNameText) {
      siteNameText.contentEditable = isChecked;

      if (isChecked) {
        siteNameText.dataset.origtext = siteNameText.textContent;
        siteNameText.textContent = 'Edit Me!';
      } else if (siteNameText.dataset.origtext) {
        siteNameText.textContent = siteNameText.dataset.origtext;
      }
    }

    sessionStorage.setItem('olivero.debug.toggleEditableSiteName', isChecked);
  }

  function toggleRtl(isChecked) {
    var html = document.querySelector('html');

    if (isChecked) {
      html.setAttribute('dir', 'rtl');
    } else {
      html.setAttribute('dir', 'ltr');
    }

    sessionStorage.setItem('olivero.debug.toggleRtl', isChecked);
  }

  function toggleAlwaysOnMobileNav(isChecked) {
    var body = document.querySelector('body');

    if (isChecked) {
      body.classList.add('is-always-mobile-nav');
    } else {
      body.classList.remove('is-always-mobile-nav');
    }

    sessionStorage.setItem('olivero.debug.toggleAlwaysOnMobileNav', isChecked);
  }

  function handleChange(e) {
    switch (e.target.id) {
      case 'logo-toggle':
        toggleLogo(e.target.checked);
        break;
      case 'edit-name-toggle':
        toggleEditableSiteName(e.target.checked);
        break;
      case 'rtl-toggle':
        toggleRtl(e.target.checked);
        break;
      case 'nav-toggle':
        toggleAlwaysOnMobileNav(e.target.checked);
        break;
      case 'required-toggle':
        toggleRequiredAttr(e.target.checked);
        break;
    }
  }

  function init() {
    var debugElement = document.createElement('div');
    debugElement.classList.add('olivero-debug');
    debugElement.innerHTML = '\n      <h2 class="visually-hidden">Theme debug options</h2>\n      <div><input id="logo-toggle" type="checkbox"><label for="logo-toggle">Logo</label></div>\n      <div><input id="edit-name-toggle" type="checkbox"><label for="edit-name-toggle">Editable Site Name</label></div>\n      <div><input id="rtl-toggle" type="checkbox"><label for="rtl-toggle">RTL</label></div>\n      <div><input id="nav-toggle" type="checkbox"><label for="nav-toggle">Always on mobile nav</label></div>\n      <div><input id="required-toggle" type="checkbox"><label for="required-toggle">Clear required attribute on form elements</label></div>\n      <div class="description">Disable debug in <a href="' + window.drupalSettings.path.baseUrl + 'admin/appearance/settings/olivero">Theme Settings</a>.</div>\n    ';
    document.querySelector('body').appendChild(debugElement);
    document.querySelector('.olivero-debug').addEventListener('change', handleChange);

    if (sessionStorage.getItem('olivero.debug.toggleLogo') != null) {
      toggleLogo(sessionStorage.getItem('olivero.debug.toggleLogo') === 'true');
    }

    if (sessionStorage.getItem('olivero.debug.toggleRequiredAttr') === 'true') {
      toggleRequiredAttr(true);
    }

    if (sessionStorage.getItem('olivero.debug.toggleEditableSiteName') != null) {
      toggleEditableSiteName(sessionStorage.getItem('olivero.debug.toggleEditableSiteName') === 'true');
    }

    if (sessionStorage.getItem('olivero.debug.toggleRtl') != null) {
      toggleRtl(sessionStorage.getItem('olivero.debug.toggleRtl') === 'true');
    }

    if (sessionStorage.getItem('olivero.debug.toggleAlwaysOnMobileNav') != null) {
      toggleAlwaysOnMobileNav(sessionStorage.getItem('olivero.debug.toggleAlwaysOnMobileNav') === 'true');
    }

    if (document.querySelector('.site-branding__logo')) {
      document.getElementById('logo-toggle').checked = true;
    }

    if (sessionStorage.getItem('olivero.debug.toggleRequiredAttr') === 'true') {
      document.getElementById('required-toggle').checked = true;
    }

    if (document.querySelector('.site-branding__name a') && document.querySelector('.site-branding__name a').contentEditable === 'true') {
      document.getElementById('edit-name-toggle').checked = true;
    }

    if (document.querySelector('html').getAttribute('dir') === 'rtl') {
      document.getElementById('rtl-toggle').checked = true;
    }

    if (document.querySelector('body').classList.contains('is-always-mobile-nav')) {
      document.getElementById('nav-toggle').checked = true;
    }
  }

  init();
})();;
