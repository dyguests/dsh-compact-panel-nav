/**
 * Client half of `dsh-compact-panel-nav`.
 *
 * The shipped sidebar renders every registered global panel as its own row and
 * adds a third "More" row for the panel-list actions, which costs ~112px of the
 * column before the workspace browser starts. This plugin keeps that navigation
 * landmark intact (same buttons, same order, same keyboard and menu behaviour)
 * and only changes its layout to a single line of three equal cells.
 *
 * Scope: the rules target the navigation landmark by its accessible name, which
 * the sidebar derives from its own `panels.label` dictionary — "全局面板" for the
 * shipped Chinese locale and "Global panels" for English. The `:has()` guard
 * requires an icon + title pair inside a row, which only happens in the expanded
 * sidebar, so the collapsed 56px rail keeps its vertical icon stack.
 *
 * Deliberately CSS-only: nothing else in the sidebar is marked, moved, or
 * restyled, so the brand row, the New Session button and the three rows'
 * original prominence stay exactly as shipped.
 */
window.__ModuleLoader__.load({
  id: 'dsh-compact-panel-nav',
  factory() {
    const STYLE_KEY = 'dsh-compact-panel-nav';

    /** The panel navigation landmark, while its rows still render a title. */
    const NAV = 'nav:is([aria-label="全局面板"], [aria-label="Global panels"]):has(> button > span + span)';

    const CSS = [
      `/* One row instead of three: Plugins / Automations / More. */`,
      `${NAV} {`,
      `  flex-direction: row;`,
      `  align-items: center;`,
      `  gap: 4px;`,
      `  padding: 0 2px;`,
      `}`,
      ``,
      `/* Every cell — a panel row or the More menu anchor — takes an equal share. */`,
      `${NAV} > * {`,
      `  flex: 1 1 0;`,
      `  min-width: 0;`,
      `}`,
      ``,
      `/* Compact, centered row buttons so three labels fit side by side. */`,
      `${NAV} button {`,
      `  box-sizing: border-box;`,
      `  width: 100%;`,
      `  min-width: 0;`,
      `  min-height: 32px;`,
      `  margin: 0;`,
      `  padding: 5px 6px;`,
      `  gap: 6px;`,
      `  justify-content: center;`,
      `  font-size: 13px;`,
      `  line-height: 20px;`,
      `}`,
      ``,
      `/* Keep a long label on one line inside its cell rather than wrapping. */`,
      `${NAV} button > span + span {`,
      `  white-space: nowrap;`,
      `}`,
    ].join('\n');

    return {
      inject: [],
      apply(ctx) {
        ctx.effect(() => {
          // Heal leftovers from the previous version, which moved the New
          // Session button into the brand row: drop its marker and give back
          // the row space it borrowed. No styling of its own uses these here.
          for (const marked of document.querySelectorAll('[data-dsh-brand-new-session]')) {
            const row = marked.previousElementSibling;
            if (row instanceof HTMLElement) {
              row.style.removeProperty('padding-right');
              if (row.style.position === 'relative') row.style.removeProperty('position');
            }
            marked.removeAttribute('data-dsh-brand-new-session');
          }

          const style = document.createElement('style');
          style.dataset.plugin = 'dsh-compact-panel-nav';
          style.dataset.pluginCss = STYLE_KEY;
          style.textContent = CSS;
          document.head.appendChild(style);
          return () => {
            style.remove();
          };
        }, 'compact-panel-nav: styles');
      },
    };
  },
});
