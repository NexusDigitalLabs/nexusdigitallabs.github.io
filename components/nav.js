/**
 * NexusDigitalLabs — Centralized Navigation Component
 * Drop-in self-injecting nav. No dependencies, no frameworks.
 *
 * Usage on any page:
 *   <div id="site-nav"></div>
 *   <script src="/components/nav.js"></script>
 */
(function () {
  'use strict';

  var path = window.location.pathname;

  // ── Active link detection ────────────────────────────────────────────────
  function isActive(href) {
    if (href === '/about/'    && path === '/about/')    return true;
    if (href === '/about/'    && path === '/about/index.html') return true;
    if (href === '/contact/'  && path === '/contact/')  return true;
    if (href === '/contact/'  && path === '/contact/index.html') return true;
    if (href === '/#tools'    && path.startsWith('/tools/'))    return true;
    if (href === '/#articles' && path.startsWith('/articles/')) return true;
    if (href === '/games/'    && path.startsWith('/games/'))    return true;
    return false;
  }

  // ── Page-context badge ────────────────────────────────────────────────────
  var BADGES = {
    '/tools/prompt-architect/':  { label: 'Prompt Architect',  color: 'violet'  },
    '/tools/invoice-generator/': { label: 'Invoice Generator', color: 'emerald' },
    '/tools/debt-optimizer/':    { label: 'Debt Optimizer',    color: 'sky'     },
    '/games/2048/':              { label: '2048',              color: 'amber'   },
    '/games/snake/':             { label: 'Snake',             color: 'amber'   },
    '/games/blackjack/':         { label: 'Blackjack',         color: 'amber'   },
    '/games/':                   { label: 'Games',             color: 'amber'   },
    '/articles/':                { label: 'Article',           color: 'blue'    },
    '/about/':                   { label: 'About',             color: 'slate'   },
    '/contact/':                 { label: 'Contact',           color: 'slate'   },
  };
  var BADGE_COLORS = {
    violet:  { fg: '#a78bfa', bg: 'rgba(139,92,246,0.12)',  bd: 'rgba(139,92,246,0.25)'  },
    emerald: { fg: '#34d399', bg: 'rgba(6,78,59,0.28)',     bd: 'rgba(52,211,153,0.25)'  },
    sky:     { fg: '#38bdf8', bg: 'rgba(14,165,233,0.12)',  bd: 'rgba(56,189,248,0.25)'  },
    amber:   { fg: '#fbbf24', bg: 'rgba(245,158,11,0.12)',  bd: 'rgba(251,191,36,0.28)'  },
    blue:    { fg: '#60a5fa', bg: 'rgba(37,99,235,0.12)',   bd: 'rgba(59,130,246,0.25)'  },
    slate:   { fg: '#94a3b8', bg: 'rgba(15,23,42,0.4)',     bd: 'rgba(71,85,105,0.4)'    },
  };

  function detectBadge() {
    var match = null;
    Object.keys(BADGES).forEach(function (prefix) {
      if (path.startsWith(prefix)) match = BADGES[prefix];
    });
    return match;
  }

  // ── Build link HTML ──────────────────────────────────────────────────────
  function link(href, label) {
    var active = isActive(href);
    return '<a href="' + href + '" class="ndl-nav-link' + (active ? ' ndl-nav-link--active' : '') + '">' + label + '</a>';
  }

  function mlink(href, label, external) {
    var extra = external ? ' target="_blank" rel="noopener noreferrer"' : '';
    return '<a href="' + href + '" class="ndl-mobile-link"' + extra + '>' + label + '</a>';
  }

  // ── Badge HTML ────────────────────────────────────────────────────────────
  var badge = detectBadge();
  var badgeHTML = '';
  if (badge) {
    var c = BADGE_COLORS[badge.color];
    badgeHTML = '<span class="ndl-badge" style="color:' + c.fg + ';background:' + c.bg + ';border:1px solid ' + c.bd + ';">'
      + badge.label + '</span>';
  }

  // ── CSS ───────────────────────────────────────────────────────────────────
  var css = [
    '#ndl-nav{position:sticky;top:0;z-index:9999;border-bottom:1px solid rgba(30,41,59,0.8);background:rgba(11,15,25,0.93);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);}',
    '.ndl-inner{max-width:80rem;margin:0 auto;padding:0 2.5rem;height:4rem;display:flex;align-items:center;gap:1.5rem;}',
    '.ndl-logo{display:flex;align-items:center;gap:0.625rem;text-decoration:none;flex-shrink:0;}',
    '.ndl-logo-icon{width:2rem;height:2rem;border-radius:0.5rem;background:linear-gradient(135deg,#2563eb,#6366f1);display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:0.875rem;box-shadow:0 4px 14px rgba(37,99,235,0.28);}',
    '.ndl-logo-text{font-size:0.875rem;font-weight:600;letter-spacing:-0.025em;color:#fff;}',
    '.ndl-links{flex:1;display:flex;align-items:center;justify-content:center;gap:2.25rem;}',
    '.ndl-nav-link{font-size:0.875rem;color:#94a3b8;text-decoration:none;transition:color 0.2s;position:relative;}',
    '.ndl-nav-link::after{content:"";position:absolute;bottom:-2px;left:0;width:0;height:1px;background:#3b82f6;transition:width 0.25s;}',
    '.ndl-nav-link:hover{color:#fff;}',
    '.ndl-nav-link:hover::after{width:100%;}',
    '.ndl-nav-link--active{color:#fff !important;}',
    '.ndl-nav-link--active::after{width:100% !important;}',
    '.ndl-right{margin-left:auto;display:flex;align-items:center;gap:0.75rem;flex-shrink:0;}',
    '.ndl-badge{display:inline-flex;align-items:center;gap:0.375rem;font-size:0.75rem;font-weight:500;padding:0.375rem 0.75rem;border-radius:0.5rem;white-space:nowrap;}',
    '.ndl-gh{display:inline-flex;align-items:center;gap:0.375rem;font-size:0.75rem;font-weight:500;color:#cbd5e1;text-decoration:none;border:1px solid rgba(71,85,105,0.8);background:rgba(15,23,42,0.4);border-radius:0.5rem;padding:0.375rem 0.875rem;transition:all 0.2s;}',
    '.ndl-gh:hover{color:#fff;border-color:rgba(100,116,139,0.8);background:rgba(30,41,59,0.6);}',
    '.ndl-hamburger{display:none;background:none;border:none;cursor:pointer;padding:0.5rem;color:#94a3b8;line-height:0;}',
    '.ndl-hamburger:hover{color:#fff;}',
    '.ndl-mobile{display:none;border-top:1px solid rgba(30,41,59,0.6);background:rgba(8,9,18,0.5);}',
    '.ndl-mobile-inner{max-width:80rem;margin:0 auto;padding:1.25rem 2.5rem;display:flex;flex-direction:column;gap:1rem;}',
    '.ndl-mobile-link{font-size:0.875rem;color:#cbd5e1;text-decoration:none;transition:color 0.2s;}',
    '.ndl-mobile-link:hover{color:#fff;}',
    '@media(max-width:767px){',
    '  .ndl-links,.ndl-badge,.ndl-gh-desktop{display:none !important;}',
    '  .ndl-hamburger{display:block;}',
    '  .ndl-inner{padding:0 1.5rem;}',
    '  .ndl-mobile-inner{padding:1.25rem 1.5rem;}',
    '}',
  ].join('');

  // ── Full nav HTML ─────────────────────────────────────────────────────────
  var GH_ICON = '<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.165c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>';
  var MENU_ICON  = '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>';
  var CLOSE_ICON = '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';

  var html = '<style>' + css + '</style>'
    + '<nav id="ndl-nav">'
    +   '<div class="ndl-inner">'
    +     '<a href="/" class="ndl-logo">'
    +       '<div class="ndl-logo-icon">N</div>'
    +       '<span class="ndl-logo-text">NexusDigitalLabs</span>'
    +     '</a>'
    +     '<div class="ndl-links">'
    +       link('/#tools',    'Tools')
    +       link('/#articles', 'Articles')
    +       link('/games/',    'Games')
    +       link('/about/',    'About')
    +       link('/contact/',  'Contact')
    +     '</div>'
    +     '<div class="ndl-right">'
    +       badgeHTML
    +       '<a href="https://github.com/NexusDigitalLabs" target="_blank" rel="noopener noreferrer" class="ndl-gh ndl-gh-desktop">'
    +         GH_ICON + ' GitHub'
    +       '</a>'
    +       '<button class="ndl-hamburger" id="ndl-hamburger" aria-label="Toggle menu">'
    +         '<span id="ndl-icon-menu">'  + MENU_ICON  + '</span>'
    +         '<span id="ndl-icon-close" style="display:none;">' + CLOSE_ICON + '</span>'
    +       '</button>'
    +     '</div>'
    +   '</div>'
    +   '<div class="ndl-mobile" id="ndl-mobile">'
    +     '<div class="ndl-mobile-inner">'
    +       mlink('/#tools',    'Tools')
    +       mlink('/#articles', 'Articles')
    +       mlink('/games/',    'Games')
    +       mlink('/about/',    'About')
    +       mlink('/contact/',  'Contact')
    +       mlink('https://github.com/NexusDigitalLabs', 'GitHub ↗', true)
    +     '</div>'
    +   '</div>'
    + '</nav>';

  // ── Inject into placeholder or top of body ────────────────────────────────
  var placeholder = document.getElementById('site-nav');
  if (placeholder) {
    placeholder.outerHTML = html;
  } else {
    document.body.insertAdjacentHTML('afterbegin', html);
  }

  // ── Wire mobile toggle ────────────────────────────────────────────────────
  function wireNav() {
    var btn    = document.getElementById('ndl-hamburger');
    var mobile = document.getElementById('ndl-mobile');
    var iMenu  = document.getElementById('ndl-icon-menu');
    var iClose = document.getElementById('ndl-icon-close');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var open = mobile.style.display === 'block';
      mobile.style.display = open ? 'none' : 'block';
      iMenu.style.display  = open ? ''     : 'none';
      iClose.style.display = open ? 'none' : '';
    });

    // Close on any mobile link click
    var mLinks = mobile.querySelectorAll('a');
    for (var i = 0; i < mLinks.length; i++) {
      mLinks[i].addEventListener('click', closeMobileMenu);
    }
  }

  // Exported so page scripts can call it directly
  window.closeMobileMenu = function () {
    var mobile = document.getElementById('ndl-mobile');
    var iMenu  = document.getElementById('ndl-icon-menu');
    var iClose = document.getElementById('ndl-icon-close');
    if (mobile) mobile.style.display = 'none';
    if (iMenu)  iMenu.style.display  = '';
    if (iClose) iClose.style.display = 'none';
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireNav);
  } else {
    wireNav();
  }

})();
