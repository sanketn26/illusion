// Chapter pages: fill the previous/next links from the generated catalogue's library order.
(function () {
  const C = window.ILLUSION_CATALOG, nav = document.querySelector('.pager');
  if (!C || !nav) return;
  const slug = location.pathname.split('/').pop().replace('.html', '');
  const byId = Object.fromEntries(C.topics.map(t => [t.id, t]));
  const order = C.library.map(id => byId[id]);
  const i = order.findIndex(t => t.slug === slug);
  if (i < 0) return;
  nav.textContent = '';
  const link = (t, label) => { const a = document.createElement('a'); a.href = t ? t.slug + '.html' : '../index.html#library'; a.textContent = label(t); return a; };
  nav.append(link(order[i - 1], t => t ? '← ' + t.title : '← Library'), link(order[i + 1], t => t ? t.title + ' →' : 'Library →'));
})();
