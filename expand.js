import focusLock from 'dom-focus-lock';

export default (target) => {
  const root = document.documentElement;

  const expanded = (target) => target.getAttribute('aria-expanded') === 'true';

  const update = (target) => {
    const type = target.getAttribute('data-expand');
    const name = target.getAttribute('data-expand-name');

    if (expanded(target)) {
      type === 'popup' && focusLock.on(target.parentNode);
      name && root.setAttribute(`data-expand-${name}`, '');
    } else {
      type === 'popup' && focusLock.off(target.parentNode);
      name && root.removeAttribute(`data-expand-${name}`);
    }
  };

  const type = target.getAttribute('data-expand');
  const container = target.closest('[data-expand-tabs]');
  let tabs = container?.querySelectorAll('[data-expand="tab"]') || [];
  tabs = [...tabs].filter((tab) => tab.closest('[data-expand-tabs]') === container);

  !target.hasAttribute('aria-expanded') && target.setAttribute('aria-expanded', false);
  update(target);

  target.addEventListener('click', () => {
    target.setAttribute('aria-expanded', !expanded(target));
    update(target);

    for (const tab of tabs) {
      tab.setAttribute('aria-expanded', tab === target);
      update(tab);
    }
  });

  if (type === 'popup') {
    const close = () => {
      target.setAttribute('aria-expanded', false);
      update(target);
    };

    document.addEventListener('click', (e) => {
      if (expanded(target) && !target.parentNode.contains(e.target)) {
        close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (expanded(target) && e.key === 'Escape') {
        close();
      }
    });
  }
};
