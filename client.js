/**
 * Client half of `dsh-compact-panel-nav`.
 *
 * 1. The global panel navigation (Plugins / Automations / More) becomes one
 *    compact line of three equal cells instead of three stacked rows.
 * 2. The full-width "New Session" button is lifted out of the flow and placed
 *    as an icon-only control at the right end of the brand row, so its own row
 *    (~50px) goes back to the workspace list as well.
 *
 * Both adjustments apply to the expanded sidebar only. The collapsed 56px rail
 * keeps the shipped layout: the navigation rows show glyphs, and New Session
 * stays in its own place under the brand.
 *
 * How the New Session move stays safe: nothing is reparented, and no sibling's
 * inline style is written. The button itself is switched to `position: absolute`,
 * measured once against the column that owns it (the nav's parent), and all of
 * its geometry is set inline, so there is no selector that has to match for the
 * placement to happen. Every precondition — a button sibling before the nav, a
 * brand strip above it that holds no button of its own, an icon inside the
 * button — is checked first; if any check fails, the plugin leaves the button
 * exactly as shipped. Releasing (collapse, plugin disabled) restores the saved
 * inline style text.
 *
 * The navigation rules key off the nav's accessible name, which the sidebar
 * derives from its own `panels.label` dictionary — "全局面板" for the shipped
 * Chinese locale, "Global panels" for English — plus a `:has()` guard for the
 * icon + title pair that only the expanded sidebar renders.
 */
window.__ModuleLoader__.load({
  id: 'dsh-compact-panel-nav',
  factory() {
    const STYLE_KEY = 'dsh-compact-panel-nav';
    const MARK = 'data-dsh-brand-new-session';

    /** The panel navigation landmark, in either shipped locale. */
    const NAV_SELECTOR = 'nav:is([aria-label="全局面板"], [aria-label="Global panels"])';
    /** The same nav while its rows still render a title (= expanded sidebar). */
    const NAV = `${NAV_SELECTOR}:has(> button > span + span)`;
    /** Edge of the icon-only New Session control, matching the sidebar toggle. */
    const ICON_SIZE = 28;

    const CSS = [
      `/* 1. Panel navigation on one row: Plugins / Automations / More. */`,
      `${NAV} {`,
      `  flex-direction: row;`,
      `  align-items: center;`,
      `  gap: 4px;`,
      `  padding: 0 2px;`,
      `}`,
      `${NAV} > * {`,
      `  flex: 1 1 0;`,
      `  min-width: 0;`,
      `}`,
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
      `${NAV} button > span + span {`,
      `  white-space: nowrap;`,
      `}`,
      ``,
      `/* 2. New Session as an icon-only control in the brand row. */`,
      `/* Geometry is inline; this only carries the look that needs to react`,
      `   to hover, and it is scoped to the marker, so it always matches. */`,
      `[${MARK}] {`,
      `  background: transparent !important;`,
      `  border: none !important;`,
      `}`,
      `[${MARK}]:hover {`,
      `  background: var(--dsw-alias-interactive-bg-hover) !important;`,
      `  color: var(--dsw-alias-label-primary) !important;`,
      `}`,
      `/* Drop the composer width-query unit and center the lone icon. */`,
      `[${MARK}] > span:first-child {`,
      `  width: 100% !important;`,
      `  flex: 1 1 auto !important;`,
      `}`,
      `[${MARK}] > span > span {`,
      `  width: auto !important;`,
      `  gap: 0 !important;`,
      `  justify-content: center !important;`,
      `}`,
      `/* Hide the visible label; the accessible name stays on the button. */`,
      `[${MARK}] > span > span > span {`,
      `  display: none !important;`,
      `}`,
      `/* Hide the inline ⌘N hint that appears on hover: at 28px it competes`,
      `   with the icon and both get clipped. The tooltip still lists the keys. */`,
      `[${MARK}] > span + span {`,
      `  display: none !important;`,
      `}`,
    ].join('\n');

    return {
      inject: [],
      apply(ctx) {
        ctx.effect(() => {
          // Heal leftovers from the 1.1.0 experiment, which padded the brand
          // row to make room for a pill that never rendered.
          for (const marked of document.querySelectorAll(`[${MARK}]`)) {
            const row = marked.previousElementSibling;
            if (row instanceof HTMLElement) {
              row.style.removeProperty('padding-right');
              if (row.style.position === 'relative') row.style.removeProperty('position');
            }
            marked.removeAttribute(MARK);
          }

          const style = document.createElement('style');
          style.dataset.plugin = 'dsh-compact-panel-nav';
          style.dataset.pluginCss = STYLE_KEY;
          style.textContent = CSS;
          document.head.appendChild(style);

          /** Saved inline state while the button is lifted into the brand row. */
          let applied = null;
          let frame = 0;

          const observer = new MutationObserver(() => {
            if (frame !== 0) return;
            frame = requestAnimationFrame(() => {
              frame = 0;
              sync();
            });
          });

          /** Narrow the observer to the current column, or to the document. */
          const watch = (column) => {
            observer.disconnect();
            if (column instanceof HTMLElement) {
              observer.observe(column, { attributes: true, attributeFilter: ['class'], childList: true });
            } else {
              observer.observe(document.body ?? document.documentElement, { childList: true, subtree: true });
            }
          };

          const release = () => {
            if (applied === null) return;
            applied.button.style.cssText = applied.cssText;
            applied.button.removeAttribute(MARK);
            applied.column.style.position = applied.columnPosition;
            applied = null;
          };

          const sync = () => {
            const nav = document.querySelector(NAV_SELECTOR);

            if (!(nav instanceof HTMLElement)) {
              watch(null);
              release();
              return;
            }
            // Expanded sidebar only: its rows carry an icon and a title.
            if (nav.querySelector(':scope > button > span + span') === null) {
              watch(nav.parentElement);
              release();
              return;
            }

            const button = nav.previousElementSibling;
            const row = button?.previousElementSibling ?? null;
            // The positioning context is the button's own parent: whatever it
            // is, `position: absolute` below resolves against it.
            const column = button instanceof HTMLElement ? button.parentElement : null;
            watch(column);

            if (!(button instanceof HTMLButtonElement) || button.nextElementSibling !== nav) {
              release();
              return;
            }
            if (!(column instanceof HTMLElement)) {
              release();
              return;
            }
            // The brand strip sits directly above New Session and holds no
            // button of its own; the macOS window-control strip does, so this
            // also rejects the wrong strip.
            if (!(row instanceof HTMLElement) || row.tagName !== 'DIV' || row.querySelector('button') !== null) {
              release();
              return;
            }
            if (button.querySelector('svg') === null) {
              release();
              return;
            }
            if (applied !== null && applied.button === button && applied.column === column) return;

            release();

            const columnRect = column.getBoundingClientRect();
            const rowRect = row.getBoundingClientRect();
            if (rowRect.height < ICON_SIZE) {
              release();
              return;
            }

            applied = {
              button,
              column,
              cssText: button.style.cssText,
              columnPosition: column.style.position,
            };
            column.style.position = 'relative';
            button.setAttribute(MARK, '');

            const inline = button.style;
            inline.position = 'absolute';
            inline.top = `${Math.round(rowRect.top - columnRect.top + (rowRect.height - ICON_SIZE) / 2)}px`;
            inline.right = `${Math.round(columnRect.right - rowRect.right)}px`;
            inline.width = `${ICON_SIZE}px`;
            inline.height = `${ICON_SIZE}px`;
            inline.minWidth = '0';
            inline.minHeight = '0';
            inline.margin = '0';
            inline.padding = '0';
            inline.gap = '0';
            inline.display = 'inline-flex';
            inline.alignItems = 'center';
            inline.justifyContent = 'center';
            inline.boxSizing = 'border-box';
            inline.overflow = 'hidden';
            inline.zIndex = '1';
            inline.containerType = 'normal';
            inline.color = 'var(--dsw-alias-label-secondary)';
            inline.setProperty('-webkit-app-region', 'no-drag');
          };

          sync();
          // One retry in case the shell renders without a mutation after this
          // module applied (the observer covers every later change).
          const retry = window.setTimeout(sync, 300);

          return () => {
            window.clearTimeout(retry);
            if (frame !== 0) cancelAnimationFrame(frame);
            observer.disconnect();
            release();
            style.remove();
          };
        }, 'compact-panel-nav: sidebar layout');
      },
    };
  },
});
