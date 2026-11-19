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
 * What the sidebar renders (DeepSeek Harness 0.2.2-rc.5):
 *
 *   div.root                         <- the column; our positioning context
 *     div.topStrip[data-window-drag] (macOS traffic-light strip, holds toggle)
 *     div.logoRow[data-window-drag]  <- the brand row we measure
 *     div.newSessionRow
 *       [data-slot="sidebar.session.action"]  (display: contents anchor)
 *         button.newSession
 *     div.scrollRegion > div.scrollArea
 *       nav[aria-label="全局面板"]     <- the panel list
 *         div                          <- entry wrapper that paints the row fill
 *           button                     <- the row itself: glyph span + title span
 *         div                          <- More launcher (has aria-haspopup)
 *
 * 0.2.1 rendered a flatter column: the New Session button was the nav's own
 * previous sibling and the rows were direct `nav > button` children. The
 * selectors below accept both shapes; a row is identified by carrying a glyph
 * `span`, which is also what keeps the 28px unpin control out of the layout.
 *
 * How the New Session move stays safe: nothing is reparented, and no sibling's
 * inline style is written. The button itself is switched to `position: absolute`,
 * measured against the column that owns it, and all of its geometry is set
 * inline, so there is no selector that has to match for the placement to happen.
 * Every precondition — a button under a row before the nav, a brand strip above
 * that row which holds no button of its own, an icon inside the button — is
 * checked first; if any check fails, the plugin leaves the button exactly as
 * shipped. Releasing (collapse, plugin disabled) restores the saved inline style
 * text.
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
    const NAV = `${NAV_SELECTOR}:has(button > span + span)`;
    /** A navigation row: it carries its glyph in a span. The unpin control does not. */
    const NAV_ROW = `${NAV} button:has(> span)`;
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
      `  border-inline: 0;`,
      `}`,
      `${NAV} > * > * {`,
      `  min-width: 0;`,
      `}`,
      `${NAV_ROW} {`,
      `  box-sizing: border-box;`,
      `  width: 100%;`,
      `  min-width: 0;`,
      `  min-height: 32px;`,
      `  margin: 0;`,
      `  /* The expanded entry reserves 38px on the right for the unpin control;`,
      `     in a third of the sidebar there is no room for both, so drop it. */`,
      `  padding: 5px 6px !important;`,
      `  gap: 6px;`,
      `  justify-content: center;`,
      `  font-size: 13px;`,
      `  line-height: 20px;`,
      `  border-inline: 0;`,
      `}`,
      `${NAV_ROW} > span + span {`,
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
      `  width: 100%;`,
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

    /**
     * Find the New Session control and the row it should move into.
     *
     * The current column wraps the control in a row (`newSessionRow`) that sits
     * two levels above the nav, under a `display: contents` slot anchor; 0.2.1
     * put the button directly before the nav. Walk outwards for the first
     * ancestor preceded by a row that holds a button, then fall back to the flat
     * shape. Everything is checked by the caller before anything is touched.
     *
     * @param nav - the panel navigation landmark.
     * @returns the control, its row, the column owning it, and the brand row
     *   above it; or null when the column has no such control.
     */
    const findNewSession = (nav) => {
      let region = nav.parentElement;
      // Two levels: the scroll area, then the region that owns the New Session
      // row. Stopping there keeps a column without that row from reaching past
      // the sidebar and matching some unrelated button outside it.
      for (let depth = 0; region instanceof HTMLElement && depth < 2; depth += 1) {
        const row = region.previousElementSibling;
        if (row instanceof HTMLElement && row.tagName === 'DIV') {
          const candidate = row.querySelector('button');
          if (candidate instanceof HTMLButtonElement && candidate.querySelector('svg') !== null) {
            return {
              button: candidate,
              brandRow: row.previousElementSibling,
              column: row.parentElement,
            };
          }
        }
        region = region.parentElement;
      }

      const legacy = nav.previousElementSibling;
      if (legacy instanceof HTMLButtonElement && legacy.nextElementSibling === nav) {
        return { button: legacy, brandRow: legacy.previousElementSibling, column: legacy.parentElement };
      }
      return null;
    };

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
          let scheduled = false;
          let raf = 0;
          let timer = 0;
          let watched = null;

          /** Run the pending sync once, whichever trigger gets here first. */
          const flush = () => {
            if (!scheduled) return;
            scheduled = false;
            cancelAnimationFrame(raf);
            window.clearTimeout(timer);
            sync();
          };

          // A frame is the cheap trigger, but a window that is hidden or fully
          // occluded stops producing frames; without the timer fallback a
          // single scheduled sync would then stay pending and the plugin would
          // stop reacting until the next frame.
          const observer = new MutationObserver(() => {
            if (scheduled) return;
            scheduled = true;
            raf = requestAnimationFrame(flush);
            timer = window.setTimeout(flush, 120);
          });

          /** Narrow the observer to the current column, or to the document. */
          const watch = (column) => {
            const next = column instanceof HTMLElement ? column : (document.body ?? document.documentElement);
            if (next === watched) return;
            observer.disconnect();
            watched = next;
            observer.observe(next, next === document.body
              ? { childList: true, subtree: true }
              : { attributes: true, attributeFilter: ['class'], childList: true, subtree: true });
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

            // Resolve the control before the width guard so the column stays
            // the observed node in the rail too: its collapse class is the
            // first sign that the placement has to be given back.
            const session = findNewSession(nav);
            const column = session?.column;
            watch(column instanceof HTMLElement ? column : nav.parentElement);

            // Expanded sidebar only: its rows carry an icon and a title.
            if (nav.querySelector('button > span + span') === null) {
              release();
              return;
            }
            if (session === null) {
              release();
              return;
            }

            const { button, brandRow } = session;
            if (!(column instanceof HTMLElement) || !(brandRow instanceof HTMLElement)) {
              release();
              return;
            }
            // The brand strip holds no button of its own; the macOS window-
            // control strip and the Windows caption row both do, so this also
            // rejects the wrong strip.
            if (brandRow.tagName !== 'DIV' || brandRow.querySelector('button') !== null) {
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
            const rowRect = brandRow.getBoundingClientRect();
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
            scheduled = false;
            cancelAnimationFrame(raf);
            window.clearTimeout(timer);
            observer.disconnect();
            release();
            style.remove();
          };
        }, 'compact-panel-nav: sidebar layout');
      },
    };
  },
});
