// Home page: domain tiles built from the generated catalogue.
(function () {
  const L = window.ILLUSION_CATALOG, list = document.getElementById('library-list');
  if (L && list) {
    const byId = Object.fromEntries(L.topics.map(t => [t.id, t])), dom = Object.fromEntries(L.domains.map(d => [d.code, d.name]));
    for (const id of L.library) {
      const t = byId[id], li = document.createElement('li'), a = document.createElement('a');
      a.href = 'topics/' + t.slug + '.html';
      const idx = document.createElement('span'); idx.className = 'card-index'; idx.textContent = t.id + ' · ' + dom[t.domain];
      const h3 = document.createElement('h3'); h3.textContent = t.title;
      const hook = document.createElement('p'); hook.className = 'illusion'; hook.textContent = t.hook;
      const bel = document.createElement('p'); bel.textContent = 'Breaks the belief: ' + t.illusion + '.';
      const go = document.createElement('span'); go.className = 'go'; go.textContent = 'Read & run ↗';
      a.append(idx, h3, hook, bel, go); li.append(a); list.append(li);
    }
  }
  const C = window.ILLUSION_CATALOG, host = document.getElementById('teaser');
  if (!C || !host) return;
  for (const d of C.domains) {
    const n = C.topics.filter(t => t.domain === d.code);
    const a = document.createElement('a');
    a.href = 'roadmap.html#d-' + d.code;
    a.textContent = d.name;
    const small = document.createElement('small');
    small.textContent = n.length + ' topics' + (n.some(t => t.status === 'shipped') ? ' · ' + n.filter(t => t.status === 'shipped').length + ' shipped' : '');
    a.append(small);
    const li = document.createElement('li'); li.append(a); host.append(li);
  }
})();
