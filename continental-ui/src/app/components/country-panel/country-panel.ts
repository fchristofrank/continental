import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SelectionService } from '../../core/selection.service';
import { CountryService } from '../../core/country.service';
import { CountryIndicators } from '../../core/models';
import { num, pct, compact } from '../../core/format';

@Component({
  selector: 'app-country-panel',
  template: `
    <aside class="panel ovl">
      <div class="ovl-head">
        <span class="label">{{ headLabel() }}</span>
        @if (count() > 0) {
          <span class="clear mono" (click)="sel.clear()">CLEAR ✕</span>
        }
      </div>

      @switch (mode()) {
        @case ('empty') {
          <div class="hint">
            <div class="hint-glyph">◴</div>
            <p class="mono">SELECT A NODE ON THE GRID</p>
            <span>Click a country to load fundamentals. Select 2 for a bilateral
            trade analysis, or up to {{ sel.MAX }} for a multi-node sweep.</span>
          </div>
        }

        @case ('single') {
          <div class="country-name mono">{{ ind()?.name ?? one()?.name }}</div>
          <div class="country-meta mono">
            {{ ind()?.region ?? '—' }} · {{ ind()?.capital ?? '—' }}
            @if (ind()?.currency?.code) { · {{ ind()?.currency?.code }} }
          </div>

          @if (loading()) {
            <div class="loading mono">QUERYING INDICATORS…</div>
          } @else if (ind(); as c) {
            <div class="scroll">
              <h4 class="sect-title">Population</h4>
              <div class="data-row"><span class="dr-key">Population (000s)</span><span class="dr-val">{{ num(c.population) }}</span></div>
              <div class="data-row"><span class="dr-key">Growth</span><span class="dr-val">{{ pct(c.pop_growth) }}</span></div>
              <div class="data-row"><span class="dr-key">Density /km²</span><span class="dr-val">{{ num(c.pop_density, 1) }}</span></div>
              <div class="data-row"><span class="dr-key">Urban</span><span class="dr-val">{{ pct(c.urban_population) }}</span></div>

              <h4 class="sect-title">Area</h4>
              <div class="data-row"><span class="dr-key">Surface (km²)</span><span class="dr-val">{{ num(c.surface_area) }}</span></div>
              <div class="data-row"><span class="dr-key">Forested</span><span class="dr-val">{{ pct(c.forested_area) }}</span></div>

              <h4 class="sect-title">People</h4>
              <div class="data-row"><span class="dr-key">Life exp. ♂ / ♀</span><span class="dr-val">{{ num(c.life_expectancy_male,1) }} / {{ num(c.life_expectancy_female,1) }}</span></div>
              <div class="data-row"><span class="dr-key">Fertility</span><span class="dr-val">{{ num(c.fertility,1) }}</span></div>
              <div class="data-row"><span class="dr-key">Infant mortality</span><span class="dr-val">{{ num(c.infant_mortality,1) }}</span></div>
              <div class="data-row"><span class="dr-key">Sex ratio</span><span class="dr-val">{{ num(c.sex_ratio,1) }}</span></div>

              <h4 class="sect-title">Demographics &amp; Economy</h4>
              <div class="data-row"><span class="dr-key">GDP (USD M)</span><span class="dr-val">{{ compact(c.gdp) }}</span></div>
              <div class="data-row"><span class="dr-key">GDP / capita</span><span class="dr-val">{{ num(c.gdp_per_capita) }}</span></div>
              <div class="data-row"><span class="dr-key">GDP growth</span><span class="dr-val">{{ pct(c.gdp_growth) }}</span></div>
              <div class="data-row"><span class="dr-key">Unemployment</span><span class="dr-val">{{ pct(c.unemployment) }}</span></div>
              <div class="data-row"><span class="dr-key">Internet users</span><span class="dr-val">{{ pct(c.internet_users) }}</span></div>
            </div>
          }
        }

        @case ('multi') {
          <div class="country-name mono">{{ count() }} NODES STAGED</div>
          <div class="country-meta mono">
            {{ count() === 2 ? 'BILATERAL CORRIDOR' : 'MULTI-NODE SWEEP' }}
          </div>
          <div class="scroll chips">
            @for (c of selected(); track c.id) {
              <span class="chip">
                <span class="dot"></span>{{ c.name }}
                <span class="x" (click)="sel.remove(c.id)">✕</span>
              </span>
            }
          </div>
        }
      }

      @if (count() > 0) {
        <button class="btn analyze" [class.amber]="count() >= 2" (click)="analyze()">
          ▸ {{ analyzeLabel() }}
        </button>
      }
    </aside>
  `,
  styles: [`
    .ovl {
      position: absolute; top: 16px; right: 16px; bottom: 16px; width: 340px;
      display: flex; flex-direction: column; padding: 16px 18px; z-index: 8;
      background: linear-gradient(180deg, rgba(14,22,34,0.97), rgba(8,12,20,0.97));
      backdrop-filter: blur(6px); box-shadow: var(--shadow);
    }
    .ovl-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .clear { font-size: 9.5px; letter-spacing: 0.14em; color: var(--t2); cursor: pointer; }
    .clear:hover { color: var(--red); }

    .hint { margin: auto 0; text-align: center; color: var(--t2); }
    .hint-glyph { font-size: 34px; color: var(--cyan); opacity: 0.6; margin-bottom: 12px; }
    .hint p { font-size: 11px; letter-spacing: 0.18em; color: var(--cyan); margin: 0 0 12px; }
    .hint span { font-size: 12px; line-height: 1.6; color: var(--t2); display: block; padding: 0 6px; }

    .country-name { font-family: var(--cond); font-weight: 700; font-size: 22px; letter-spacing: 0.05em; color: var(--t0); border-bottom: 1px solid var(--line-strong); padding-bottom: 8px; }
    .country-meta { font-size: 10px; letter-spacing: 0.08em; color: var(--t2); margin: 8px 0 4px; text-transform: uppercase; }

    .scroll { flex: 1; overflow-y: auto; padding-right: 4px; margin-top: 6px; }
    .scroll .sect-title { margin-top: 16px; }
    .scroll .sect-title:first-child { margin-top: 6px; }

    .chips { display: flex; flex-wrap: wrap; gap: 8px; align-content: flex-start; }
    .loading { font-size: 11px; letter-spacing: 0.16em; color: var(--cyan); margin: 24px 0; text-align: center; }

    .analyze { margin-top: 14px; width: 100%; }

    @media (max-width: 640px){ .ovl { width: auto; left: 16px; } }
  `],
})
export class CountryPanel {
  sel = inject(SelectionService);
  private country = inject(CountryService);
  private router = inject(Router);

  selected = this.sel.selected;
  count = this.sel.count;
  one = computed(() => (this.count() === 1 ? this.selected()[0] : undefined));

  ind = signal<CountryIndicators | null>(null);
  loading = signal(false);

  mode = computed<'empty' | 'single' | 'multi'>(() => {
    const n = this.count();
    return n === 0 ? 'empty' : n === 1 ? 'single' : 'multi';
  });

  headLabel = computed(() => (this.count() <= 1 ? 'NODE DOSSIER' : 'STAGED NODES'));
  analyzeLabel = computed(() => {
    const n = this.count();
    if (n === 1) return 'ANALYZE NODE';
    if (n === 2) return 'BILATERAL ANALYSIS';
    return `MULTI-NODE ANALYSIS (${n})`;
  });

  // expose formatters to template
  num = num;
  pct = pct;
  compact = compact;

  constructor() {
    effect((onCleanup) => {
      const c = this.one();
      if (!c) {
        this.ind.set(null);
        return;
      }
      this.loading.set(true);
      this.ind.set(null);
      const sub = this.country.getIndicators(c.iso2 ?? c.id, c.name).subscribe((data) => {
        this.ind.set(data);
        this.loading.set(false);
      });
      onCleanup(() => sub.unsubscribe());
    });
  }

  analyze(): void {
    const list = this.selected();
    if (list.length === 1) {
      this.router.navigate(['/analyze/single', list[0].iso2 ?? list[0].id]);
    } else if (list.length === 2) {
      this.router.navigate(['/analyze/bilateral', list[0].id, list[1].id]);
    } else if (list.length > 2) {
      this.router.navigate(['/analyze/multi']);
    }
  }
}
