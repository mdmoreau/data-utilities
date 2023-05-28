import focusLock from 'dom-focus-lock';

export default (trigger) => {
  const root = document.documentElement;
  const parent = trigger.parentElement;
  const type = trigger.getAttribute('data-expand');
  const tabsRoot = trigger.closest('[data-expand-tabs]');
  let tabs = tabsRoot?.querySelectorAll('[data-expand="tab"]') || [];
  tabs = [...tabs].filter((tab) => tab.closest('[data-expand-tabs]') === tabsRoot);

  const reflow = () => root.offsetWidth;

  const expanded = (trigger) => trigger.getAttribute('aria-expanded') === 'true';

  const setHeight = (trigger) => {
    const target = trigger.nextElementSibling;

    target.style.setProperty('--height', `${target.scrollHeight}px`);
  };

  const update = async (trigger) => {
    const type = trigger.getAttribute('data-expand');
    const name = trigger.getAttribute('data-expand-name');
    const target = trigger.nextElementSibling;

    if (expanded(trigger)) {
      type === 'popup' && focusLock.on(parent);
      name && root.setAttribute(`data-expand-${name}`, '');
      await Promise.allSettled(target.getAnimations().map((animation) => animation.finished));
    } else {
      type === 'popup' && focusLock.off(parent);
      name && root.removeAttribute(`data-expand-${name}`);
    }

    reflow();
    target.style.removeProperty('--height');
  };

  setHeight(trigger);
  !trigger.hasAttribute('aria-expanded') && trigger.setAttribute('aria-expanded', false);
  update(trigger);

  trigger.addEventListener('click', () => {
    setHeight(trigger);
    trigger.setAttribute('aria-expanded', !expanded(trigger));
    update(trigger);

    for (const tab of tabs) {
      setHeight(tab);
      tab.setAttribute('aria-expanded', tab === trigger);
      update(tab);
    }
  });

  if (type === 'popup') {
    const close = () => {
      setHeight(trigger);
      trigger.setAttribute('aria-expanded', false);
      update(trigger);
    };

    document.addEventListener('click', (e) => {
      if (expanded(trigger) && !parent.contains(e.target)) {
        close();
        e.target.focus();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (expanded(trigger) && e.key === 'Escape') {
        close();
        trigger.focus();
      }
    });
  }
};
