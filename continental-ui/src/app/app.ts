import { Component, inject, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { SelectionService } from './core/selection.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="shell">
      <header class="topbar">
        <a routerLink="/" class="brand">
          <span class="glyph"></span>
          <span class="name">CONTINENTAL</span>
          <span class="sub">Financial Intelligence Tool</span>
        </a>

        <div class="status">
          <span class="dot"></span>
          <span class="mono">GLOBAL TRADE GRID</span>
          <span class="div">//</span>
          <span class="mono live">LIVE</span>
          <span class="div">//</span>
          <span class="mono">{{ clock() }}</span>
        </div>

        <div class="right">
          <span class="tag-class">UNCLASSIFIED · DEMO</span>
          <span class="sel-count mono">
            NODES <b>{{ sel.count() }}</b>/{{ sel.MAX }}
          </span>
        </div>
      </header>

      <main class="stage">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .shell { position: relative; z-index: 1; height: 100vh; display: flex; flex-direction: column; }
    .topbar {
      height: 54px; flex: none;
      display: flex; align-items: center; gap: 22px;
      padding: 0 18px;
      background: linear-gradient(180deg, #0c1421, #0a0f18);
      border-bottom: 1px solid var(--line-strong);
    }
    .brand { display: flex; align-items: baseline; gap: 11px; }
    .glyph {
      width: 14px; height: 14px; align-self: center;
      border: 2px solid var(--cyan); border-radius: 50%;
      box-shadow: 0 0 12px var(--cyan-dim);
      position: relative;
    }
    .glyph::after { content:""; position:absolute; inset:3px; background: var(--amber); border-radius:50%; }
    .name { font-family: var(--cond); font-weight: 700; font-size: 19px; letter-spacing: 0.26em; color: var(--t0); }
    .sub { font-family: var(--mono); font-size: 10px; letter-spacing: 0.14em; color: var(--t2); text-transform: uppercase; }

    .status { display: flex; align-items: center; gap: 10px; font-size: 11px; color: var(--t1); letter-spacing: 0.12em; }
    .status .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); box-shadow: 0 0 9px var(--green); animation: pulse 2s infinite; }
    .status .div { color: var(--t3); }
    .status .live { color: var(--green); }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }

    .right { margin-left: auto; display: flex; align-items: center; gap: 16px; }
    .sel-count { font-size: 11px; color: var(--t1); letter-spacing: 0.1em; }
    .sel-count b { color: var(--amber); }

    .stage { flex: 1; min-height: 0; overflow: hidden; position: relative; }

    @media (max-width: 760px){ .status { display: none; } .sub { display: none; } }
  `],
})
export class App {
  sel = inject(SelectionService);
  clock = signal(this.fmt());

  constructor() {
    setInterval(() => this.clock.set(this.fmt()), 1000);
  }
  private fmt(): string {
    return new Date().toISOString().slice(11, 19) + 'Z';
  }
}
