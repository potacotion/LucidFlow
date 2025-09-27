import { type App, type Directive } from 'vue';

export const tooltipDirective: Directive = {
  mounted(el, binding) {
    if (!binding.value) {
      return;
    }
    const popper = document.createElement('div');
    popper.className = 'v-tooltip-popper';
    popper.textContent = binding.value;

    const show = () => {
      document.body.appendChild(popper);
      const { top, left, height, width } = el.getBoundingClientRect();

      // Get popper dimensions
      const popperHeight = popper.offsetHeight;
      const popperWidth = popper.offsetWidth;

      // Check if there is enough space at the top
      if (top - popperHeight - 5 < 0) {
        // Not enough space, show below
        popper.style.top = `${top + height + 5}px`;
      } else {
        // Enough space, show above
        popper.style.top = `${top - popperHeight - 5}px`;
      }

      popper.style.left = `${left + width / 2 - popperWidth / 2}px`;
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
