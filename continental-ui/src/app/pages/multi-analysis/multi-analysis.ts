import { Component, computed, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { SelectionService } from '../../core/selection.service';

@Component({
  selector: 'app-multi-analysis',
  imports: [RouterLink],
  template: `
    <div class="page">
      <div class="page-head">
        <a routerLink="/" class="back mono">◂ GRID</a>
        <div>
          <span class="label">Multi-node sweep</span>
          <h1>{{ nodes().length }} NODES STAGED</h1>
        </div>
        <span class="tag-class">DESIGN PENDING</span>
      </div>

      @if (nodes().length) {
        <section class="panel pad notice">
          <div class="ico">◫</div>
          <div>
            <h3>Multi-country component is not yet planned</h3>
            <p>Per the spec, the multi-node view (3–{{ sel.MAX }} countries) has no finalised
            layout. Below is a corridor matrix scaffold you can wire to the trade API
            — each non-diagonal cell would call <code>getDirectional(exporter, importer)</code>.</p>
          </div>
        </section>

        <section class="panel pad" style="margin-top:22px;">
          <h3 class="sect-title">Bilateral corridor matrix · scaffold</h3>
          <div class="matrix" [style.grid-template-columns]="'140px repeat(' + nodes().length + ', 1fr)'">
            <div class="cell corner mono">EXP ＼ IMP</div>
            @for (col of nodes(); track col.id) {
              <div class="cell head mono">{{ col.name }}</div>
            }
            @for (row of nodes(); track row.id) {
              <div class="cell rowhead mono">{{ row.name }}</div>
              @for (col of nodes(); track col.id) {
                @if (row.id === col.id) {
                  <div class="cell diag">—</div>
                } @else {
                  <div class="cell link" (click)="pair(row.id, col.id)" title="Open bilateral">▸</div>
                }
              }
            }
          </div>
          <p class="hint mono">CLICK A CELL TO OPEN THAT DIRECTED CORRIDOR</p>
        </section>

        <section class="panel pad" style="margin-top:22px;">
          <h3 class="sect-title">Staged nodes</h3>
          <div class="chips">
            @for (n of nodes(); track n.id) {
              <span class="chip"><span class="dot"></span>{{ n.name }}
                <span class="x" (click)="sel.remove(n.id)">✕</span></span>
            }
          </div>
        </section>
      } @else {
        <div class="loading mono">NO NODES STAGED · RETURN TO GRID TO SELECT</div>
      }
    </div>
  `,
  styles: [`
    .page { height: 100%; overflow-y: auto; padding: 24px 30px 40px; }
    .page-head { display: flex; align-items: center; gap: 22px; margin-bottom: 22px; }
    .back { color: var(--t2); letter-spacing: 0.14em; font-size: 11px; }
    .back:hover { color: var(--cyan); }
    .page-head h1 { font-family: var(--cond); font-weight: 700; font-size: 30px; letter-spacing: 0.04em; margin: 4px 0 0; }
    .page-head .tag-class { margin-left: auto; }
    .panel.pad { padding: 18px 20px; }

    .notice { display: flex; gap: 18px; align-items: flex-start; }
    .notice .ico { font-size: 30px; color: var(--amber); }
    .notice h3 { margin: 0 0 8px; font-size: 15px; color: var(--t0); }
    .notice p { margin: 0; color: var(--t1); font-size: 12.5px; line-height: 1.65; max-width: 640px; }
    .notice code { font-family: var(--mono); color: var(--cyan); font-size: 11.5px; }

    .matrix { display: grid; gap: 1px; background: var(--line); border: 1px solid var(--line); }
    .cell { background: var(--bg-2); padding: 10px 8px; font-size: 11px; text-align: center; color: var(--t1); display:flex; align-items:center; justify-content:center; }
    .cell.head, .cell.rowhead { color: var(--cyan); letter-spacing: 0.06em; }
    .cell.rowhead { justify-content: flex-start; }
    .cell.corner { color: var(--t2); letter-spacing: 0.1em; justify-content: flex-start; }
    .cell.diag { color: var(--t3); }
    .cell.link { color: var(--amber); cursor: pointer; }
    .cell.link:hover { background: var(--bg-4); }

    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .hint { font-size: 9.5px; letter-spacing: 0.16em; color: var(--t2); margin: 12px 0 0; }
    .loading { color: var(--cyan); letter-spacing: 0.18em; margin-top: 40px; }
  `],
})
export class MultiAnalysis {
  sel = inject(SelectionService);
  private router = inject(Router);
  nodes = computed(() => this.sel.selected());

  pair(exporter: number, importer: number): void {
    this.router.navigate(['/analyze/bilateral', exporter, importer]);
  }
}
