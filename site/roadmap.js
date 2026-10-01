// Renders the topic catalogue (topics-data.js, generated from docs/catalog.txt).
(function () {
  const C = window.ILLUSION_CATALOG;
  if (!C) return;
  const byId = Object.fromEntries(C.topics.map(t => [t.id, t]));
  const $ = id => document.getElementById(id);

  function el(tag, props, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v; else n.setAttribute(k, v);
    }
    for (const kid of kids) if (kid) n.append(kid);
    return n;
  }
  const href = t => (t.slug ? 'topics/' + t.slug + '.html' : '#' + t.id);

  const shipped = C.topics.filter(t => t.status === 'shipped').length;
  $('summary').textContent = C.topics.length + ' topics across ' + C.domains.length + ' domains, ' +
    shipped + ' shipped so far. Every topic names the intuition it breaks and the everyday scene it starts from.';

  // Learning paths
  const paths = $('paths');
  for (const p of C.paths) {
    const steps = el('ol', { class: 'path-steps' });
    for (const id of p.ids) {
      const t = byId[id];
      steps.append(el('li', {}, el('a', { href: href(t), text: t.title }), el('span', { class: 'lv', text: t.level })));
    }
    const det = el('details', { class: 'path' }, el('summary', {}, el('strong', { text: p.name }), el('span', { class: 'muted', text: ' · ' + p.ids.length + ' steps' })), el('p', { class: 'muted', text: p.blurb }), steps);
    paths.append(el('li', {}, det));
  }

  // Filters
  const level = $('level');
  for (const [k, v] of Object.entries(C.levels)) level.append(el('option', { value: k, text: k + ' · ' + v }));
  const nav = $('domain-nav');
  for (const d of C.domains) nav.append(el('a', { href: '#d-' + d.code, text: d.name }));

  const host = $('domains');
  const sections = C.domains.map(d => {
    const list = el('ol', { class: 'topic-list' });
    const sec = el('section', { class: 'domain', id: 'd-' + d.code }, el('h3', { text: d.name }), el('p', { class: 'muted', text: d.blurb }), list);
    host.append(sec);
    const rows = C.topics.filter(t => t.domain === d.code).map(t => {
      const title = t.status === 'shipped' ? el('a', { href: href(t), text: t.title }) : el('span', { text: t.title });
      const needs = el('p', { class: 'needs' });
      if (t.needs.length) {
        needs.append('Needs: ');
        t.needs.forEach((n, i) => { if (i) needs.append(', '); needs.append(el('a', { href: href(byId[n]), title: byId[n].title, text: n })); });
      }
      const li = el('li', { class: 'topic', id: t.id },
        el('div', { class: 'topic-head' }, el('span', { class: 'tid', text: t.id }), el('h4', {}, title),
          el('span', { class: 'lv lv-' + t.level, title: C.levels[t.level], text: t.level }),
          t.status === 'shipped' ? el('span', { class: 'badge', text: 'Read & run' }) : null),
        el('p', { class: 'illusion', text: 'Illusion: ' + t.illusion }),
        el('p', { class: 'hook', text: t.hook }), needs);
      list.append(li);
      return { t, li, hay: (t.id + ' ' + t.title + ' ' + t.illusion + ' ' + t.hook).toLowerCase() };
    });
    return { sec, rows };
  });

  function apply() {
    const q = $('q').value.trim().toLowerCase(), lv = level.value, st = $('status').value;
    let shown = 0;
    for (const { sec, rows } of sections) {
      let any = 0;
      for (const r of rows) {
        const ok = (!q || r.hay.includes(q)) && (!lv || r.t.level === lv) && (!st || r.t.status === st);
        r.li.hidden = !ok; if (ok) any++;
      }
      sec.hidden = !any; shown += any;
    }
    $('count').textContent = 'Showing ' + shown + ' of ' + C.topics.length + ' topics';
  }
  ['q', 'level', 'status'].forEach(id => $(id).addEventListener('input', apply));
  apply();
  if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
})();
