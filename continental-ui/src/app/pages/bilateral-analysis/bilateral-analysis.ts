import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TradeService } from '../../core/trade.service';
import { SelectionService } from '../../core/selection.service';
import { Bilateral, CountryRef, TradeCategory } from '../../core/models';
import { compact, num } from '../../core/format';

interface Row {
  name: string;
  total: number;
  items: { name: string; value: number }[];
}

@Component({
  selector: 'app-bilateral-analysis',
  imports: [RouterLink],
  template: `
    <div class="page">
      <div class="page-head">
        <a routerLink="/" class="back mono">◂ GRID</a>
        <div class="corridor">
          <span class="label">Bilateral corridor</span>
          <h1>
            <span>{{ data()?.a?.name ?? ('#' + aId()) }}</span>
            <span class="arrows">⇄</span>
            <span>{{ data()?.b?.name ?? ('#' + bId()) }}</span>
          </h1>
        </div>
        <span class="tag-class">HS-SECTION RESOLUTION</span>
      </div>

      @if (data(); as d) {
        <div class="kpi-grid">
          <div class="kpi"><div class="k-label">{{ d.a.name }} → {{ d.b.name }}</div><div class="k-value accent">{{ compact(d.aToB.exportWithCurrentPartner) }}</div><div class="k-sub">exports to partner</div></div>
          <div class="kpi"><div class="k-label">{{ d.a.name }} ← {{ d.b.name }}</div><div class="k-value">{{ compact(d.aToB.importWithCurrentPartner) }}</div><div class="k-sub">imports from partner</div></div>
          <div class="kpi"><div class="k-label">Bilateral volume</div><div class="k-value">{{ compact(volume()) }}</div><div class="k-sub">total two-way</div></div>
          <div class="kpi"><div class="k-label">Balance · {{ d.a.name }}</div><div class="k-value" [class.pos]="balance()>=0" [class.neg]="balance()<0">{{ compact(balance()) }}</div><div class="k-sub">{{ balance()>=0 ? 'surplus' : 'deficit' }}</div></div>
          <div class="kpi"><div class="k-label">{{ d.a.name }} total exports</div><div class="k-value">{{ compact(d.aToB.totalExport) }}</div><div class="k-sub">partner = {{ shareExp() }}%</div></div>
          <div class="kpi"><div class="k-label">{{ d.a.name }} total imports</div><div class="k-value">{{ compact(d.aToB.totalImport) }}</div><div class="k-sub">partner = {{ shareImp() }}%</div></div>
        </div>

        <!-- two-way balance bar -->
        <div class="flow panel">
          <div class="flow-side">
            <span class="mono">{{ d.a.name }} → {{ d.b.name }}</span>
            <b class="accent">{{ compact(d.aToB.exportWithCurrentPartner) }}</b>
          </div>
          <div class="flow-bar">
            <div class="seg exp" [style.flex]="d.aToB.exportWithCurrentPartner || 1"></div>
            <div class="seg imp" [style.flex]="d.aToB.importWithCurrentPartner || 1"></div>
          </div>
          <div class="flow-side right">
            <span class="mono">{{ d.b.name }} → {{ d.a.name }}</span>
            <b>{{ compact(d.aToB.importWithCurrentPartner) }}</b>
          </div>
        </div>

        <div class="cols-2" style="margin-top:24px;">
          <section class="panel pad">
            <h3 class="sect-title">Exports · {{ d.a.name }} → {{ d.b.name }}</h3>
            @for (r of exportRows(); track r.name) {
              <div class="cat" (click)="toggle('e:' + r.name)">
                <div class="bar-head">
                  <span class="bar-name">
                    <span class="caret" [class.open]="open().has('e:' + r.name)">▸</span>{{ r.name }}
                  </span>
                  <span class="bar-num">{{ num(r.total, 1) }}</span>
                </div>
                <div class="bar-track"><div class="bar-fill amber" [style.width.%]="pctOf(r.total, exportMax())"></div></div>
                @if (open().has('e:' + r.name)) {
                  <div class="items">
                    @for (it of r.items; track it.name) {
                      <div class="item"><span>{{ it.name }}</span><span class="mono">{{ num(it.value, 1) }}</span></div>
                    }
                  </div>
                }
              </div>
            }
          </section>

          <section class="panel pad">
            <h3 class="sect-title">Imports · {{ d.a.name }} ← {{ d.b.name }}</h3>
            @for (r of importRows(); track r.name) {
              <div class="cat" (click)="toggle('i:' + r.name)">
                <div class="bar-head">
                  <span class="bar-name">
                    <span class="caret" [class.open]="open().has('i:' + r.name)">▸</span>{{ r.name }}
                  </span>
                  <span class="bar-num">{{ num(r.total, 1) }}</span>
                </div>
                <div class="bar-track"><div class="bar-fill" [style.width.%]="pctOf(r.total, importMax())"></div></div>
                @if (open().has('i:' + r.name)) {
                  <div class="items">
                    @for (it of r.items; track it.name) {
                      <div class="item"><span>{{ it.name }}</span><span class="mono">{{ num(it.value, 1) }}</span></div>
                    }
                  </div>
                }
              </div>
            }
          </section>
        </div>
      } @else {
        <div class="loading mono">RESOLVING TRADE CORRIDOR · DUAL-DIRECTION QUERY…</div>
      }
    </div>
  `,
  styles: [`
    .page { height: 100%; overflow-y: auto; padding: 24px 30px 40px; }
    .page-head { display: flex; align-items: center; gap: 22px; margin-bottom: 22px; }
    .back { color: var(--t2); letter-spacing: 0.14em; font-size: 11px; }
    .back:hover { color: var(--cyan); }
    .corridor h1 { font-family: var(--cond); font-weight: 700; font-size: 30px; letter-spacing: 0.03em; margin: 4px 0 0; display: flex; gap: 16px; align-items: center; }
    .arrows { color: var(--cyan); font-size: 24px; }
    .page-head .tag-class { margin-left: auto; }
    .panel.pad { padding: 18px 20px; }

    .flow { margin-top: 22px; padding: 16px 20px; display: flex; align-items: center; gap: 18px; }
    .flow-side { display: flex; flex-direction: column; gap: 4px; min-width: 150px; }
    .flow-side.right { text-align: right; align-items: flex-end; }
    .flow-side span { font-size: 10px; color: var(--t2); letter-spacing: 0.08em; }
    .flow-side b { font-family: var(--mono); font-size: 18px; }
    .flow-bar { flex: 1; height: 12px; display: flex; border-radius: 3px; overflow: hidden; }
    .seg.exp { background: linear-gradient(90deg,#b9760a,var(--amber)); }
    .seg.imp { background: linear-gradient(90deg,#1b9c9c,var(--cyan)); }

    .cat { padding: 9px 0; border-bottom: 1px dashed var(--line); cursor: pointer; }
    .cat:last-child { border-bottom: none; }
    .caret { display: inline-block; color: var(--t2); margin-right: 7px; transition: transform .15s; }
    .caret.open { transform: rotate(90deg); color: var(--cyan); }
    .items { margin: 8px 0 4px 18px; border-left: 1px solid var(--line); padding-left: 12px; }
    .item { display: flex; justify-content: space-between; font-size: 11.5px; color: var(--t1); padding: 3px 0; gap: 12px; }
    .item .mono { color: var(--t0); }

    .loading { color: var(--cyan); letter-spacing: 0.18em; margin-top: 40px; }
  `],
})
export class BilateralAnalysis {
  a = input.required<string>();
  b = input.required<string>();
  private trade = inject(TradeService);
  private sel = inject(SelectionService);

  data = signal<Bilateral | null>(null);
  open = signal<Set<string>>(new Set());

  compact = compact; num = num;

  aId = computed(() => +this.a());
  bId = computed(() => +this.b());

  constructor() {
    queueMicrotask(() => {
      const refA = this.ref(this.aId());
      const refB = this.ref(this.bId());
      this.trade.getBilateral(refA, refB).subscribe((d) => this.data.set(d));
    });
  }

  private ref(id: number): CountryRef {
    return this.sel.byId(id) ?? { id, name: `#${id}` };
  }

  private rows(rec: Record<string, TradeCategory> | undefined): Row[] {
    if (!rec) return [];
    return Object.entries(rec)
      .map(([name, c]) => ({
        name,
        total: c.total,
        items: Object.entries(c.items)
          .map(([n, v]) => ({ name: n, value: v }))
          .sort((x, y) => y.value - x.value),
      }))
      .sort((x, y) => y.total - x.total);
  }

  exportRows = computed(() => this.rows(this.data()?.aToB.exports));
  importRows = computed(() => this.rows(this.data()?.aToB.imports));
  exportMax = computed(() => Math.max(1, ...this.exportRows().map((r) => r.total)));
  importMax = computed(() => Math.max(1, ...this.importRows().map((r) => r.total)));

  volume = computed(() => {
    const d = this.data();
    return d ? d.aToB.exportWithCurrentPartner + d.aToB.importWithCurrentPartner : 0;
  });
  balance = computed(() => {
    const d = this.data();
    return d ? d.aToB.exportWithCurrentPartner - d.aToB.importWithCurrentPartner : 0;
  });
  shareExp = computed(() => {
    const d = this.data();
    if (!d || !d.aToB.totalExport) return '0.00';
    return ((d.aToB.exportWithCurrentPartner / d.aToB.totalExport) * 100).toFixed(4);
  });
  shareImp = computed(() => {
    const d = this.data();
    if (!d || !d.aToB.totalImport) return '0.00';
    return ((d.aToB.importWithCurrentPartner / d.aToB.totalImport) * 100).toFixed(4);
  });

  pctOf(v: number, max: number): number {
    return Math.max(2, (v / max) * 100);
  }
  toggle(key: string): void {
    const s = new Set(this.open());
    s.has(key) ? s.delete(key) : s.add(key);
    this.open.set(s);
  }
}
