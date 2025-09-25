import { type App, type Directive } from 'vue';

export const tooltipDirective: Directive = {
  mounted(el, binding) {
    const popper = document.createElement('div');
    popper.className = 'v-tooltip-popper';
    popper.textContent = binding.value;

    const show = () => {
      document.body.appendChild(popper);
      const { top, left, height, width } = el.getBoundingClientRect();
      popper.style.top = `${top - popper.offsetHeight - 5}px`;
      popper.style.left = `${left + width / 2 - popper.offsetWidth / 2}px`;
      popper.classList.add('is-visible');
    };

    const hide = () => {
      popper.classList.remove('is-visible');
      if (document.body.contains(popper)) {
        document.body.removeChild(popper);
      }
    };

    el._show = show;
    el._hide = hide;

    el.addEventListener('mouseenter', show);
    el.addEventListener('mouseleave', hide);
  },
  unmounted(el) {
    el.removeEventListener('mouseenter', el._show);
    el.removeEventListener('mouseleave', el._hide);
  },
};

export const setupTooltipDirective = (app: App) => {
  app.directive('tooltip', tooltipDirective);
};
