var currentSeoPageId = null;

function seoSetMeta(name, content, isProperty) {
  var attr = isProperty ? 'property' : 'name';
  var el = document.querySelector('meta[' + attr + '="' + name + '"]');
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function seoSetLink(rel, href) {
  var el = document.querySelector('link[rel="' + rel + '"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function initSeo(pageId, lang) {
  currentSeoPageId = pageId;
  updateSeoMeta(lang || 'ge');
}

function updateSeoMeta(lang) {
  if (!currentSeoPageId || !window.TAVLA_SEO) return;
  var page = TAVLA_SEO.pages[currentSeoPageId];
  if (!page) return;

  var l = lang || 'ge';
  var title = page.titles[l] || page.titles.ge;
  var desc = page.descriptions[l] || page.descriptions.ge;
  var url = TAVLA_SEO.SITE_URL + page.path;
  var img = TAVLA_SEO.SITE_URL + '/' + page.ogImage.replace(/^\//, '');
  var imgAlt = page.ogImageAlt
    ? (page.ogImageAlt[l] || page.ogImageAlt.ge)
    : 'Tavla, Tbilisi';

  var locales = { ge: 'ka_GE', en: 'en_US', ru: 'ru_RU' };

  document.title = title;
  seoSetMeta('description', desc, false);
  seoSetLink('canonical', url);

  seoSetMeta('og:locale', locales[l] || 'ka_GE', true);
  seoSetMeta('og:type', 'website', true);
  seoSetMeta('og:url', url, true);
  seoSetMeta('og:title', title, true);
  seoSetMeta('og:description', desc, true);
  seoSetMeta('og:image', img, true);
  seoSetMeta('og:image:alt', imgAlt, true);

  seoSetMeta('twitter:card', 'summary_large_image', false);
  seoSetMeta('twitter:title', title, false);
  seoSetMeta('twitter:description', desc, false);
  seoSetMeta('twitter:image', img, false);
}
