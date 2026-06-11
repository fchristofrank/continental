import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CountryService } from '../../core/country.service';
import { SelectionService } from '../../core/selection.service';
import { CountryIndicators } from '../../core/models';
import { num, pct, compact, toNumber } from '../../core/format';

@Component({
  selector: 'app-single-analysis',
  imports: [RouterLink],
  template: `
    <div class="page">
      <div class="page-head">
        <a routerLink="/" class="back mono">◂ GRID</a>
        <div>
          <span class="label">Single-node assessment</span>
          <h1>{{ c()?.name ?? code() }}</h1>
        </div>
        <span class="tag-class">{{ c()?.region ?? 'REGION —' }}</span>
      </div>

      @if (c(); as d) {
        <div class="kpi-grid">
          <div class="kpi"><div class="k-label">GDP · USD M</div><div class="k-value accent">{{ compact(d.gdp) }}</div><div class="k-sub">growth {{ pct(d.gdp_growth) }}</div></div>
          <div class="kpi"><div class="k-label">GDP / capita</div><div class="k-value">{{ num(d.gdp_per_capita) }}</div><div class="k-sub">{{ d.currency?.code }}</div></div>
          <div class="kpi"><div class="k-label">Population · 000s</div><div class="k-value">{{ num(d.population) }}</div><div class="k-sub">growth {{ pct(d.pop_growth) }}</div></div>
          <div class="kpi"><div class="k-label">Life expectancy</div><div class="k-value">{{ num(avgLife(d),1) }}</div><div class="k-sub">♂ {{ num(d.life_expectancy_male,1) }} · ♀ {{ num(d.life_expectancy_female,1) }}</div></div>
          <div class="kpi"><div class="k-label">Unemployment</div><div class="k-value">{{ pct(d.unemployment) }}</div></div>
          <div class="kpi"><div class="k-label">Net trade · USD M</div><div class="k-value" [class.pos]="netTrade(d)>=0" [class.neg]="netTrade(d)<0">{{ compact(netTrade(d)) }}</div><div class="k-sub">exp {{ compact(d.exports) }} · imp {{ compact(d.imports) }}</div></div>
        </div>

        <div class="cols-2" style="margin-top:24px;">
          <section class="panel pad">
            <h3 class="sect-title">Employment structure</h3>
            <div class="bar-row" >
              <div class="bar-head"><span class="bar-name">Services</span><span class="bar-num">{{ pct(d.employment_services) }}</span></div>
              <div class="bar-track"><div class="bar-fill" [style.width.%]="toNum(d.employment_services)"></div></div>
            </div>
            <div class="bar-row">
              <div class="bar-head"><span class="bar-name">Industry</span><span class="bar-num">{{ pct(d.employment_industry) }}</span></div>
              <div class="bar-track"><div class="bar-fill amber" [style.width.%]="toNum(d.employment_industry)"></div></div>
            </div>
            <div class="bar-row">
              <div class="bar-head"><span class="bar-name">Agriculture</span><span class="bar-num">{{ pct(d.employment_agriculture) }}</span></div>
              <div class="bar-track"><div class="bar-fill" [style.width.%]="toNum(d.employment_agriculture)"></div></div>
            </div>

            <h3 class="sect-title" style="margin-top:22px;">Society</h3>
            <div class="data-row"><span class="dr-key">Internet users</span><span class="dr-val">{{ pct(d.internet_users) }}</span></div>
            <div class="data-row"><span class="dr-key">Urban population</span><span class="dr-val">{{ pct(d.urban_population) }}</span></div>
            <div class="data-row"><span class="dr-key">Homicide rate /100k</span><span class="dr-val">{{ num(d.homicide_rate,1) }}</span></div>
            <div class="data-row"><span class="dr-key">Tourists · 000s</span><span class="dr-val">{{ num(d.tourists) }}</span></div>
          </section>

          <section class="panel pad">
            <h3 class="sect-title">Environment &amp; risk</h3>
            <div class="data-row"><span class="dr-key">Surface area km²</span><span class="dr-val">{{ num(d.surface_area) }}</span></div>
            <div class="data-row"><span class="dr-key">Forested area</span><span class="dr-val">{{ pct(d.forested_area) }}</span></div>
            <div class="data-row"><span class="dr-key">CO₂ emissions · Mt</span><span class="dr-val">{{ num(d.co2_emissions,1) }}</span></div>
            <div class="data-row"><span class="dr-key">Threatened species</span><span class="dr-val">{{ num(d.threatened_species) }}</span></div>
            <div class="data-row"><span class="dr-key">Refugees · 000s</span><span class="dr-val">{{ num(d.refugees,1) }}</span></div>

            <h3 class="sect-title" style="margin-top:22px;">Education enrolment</h3>
            <div class="data-row"><span class="dr-key">Primary ♂ / ♀</span><span class="dr-val">{{ pct(d.primary_school_enrollment_male) }} / {{ pct(d.primary_school_enrollment_female) }}</span></div>
            <div class="data-row"><span class="dr-key">Secondary ♂ / ♀</span><span class="dr-val">{{ pct(d.secondary_school_enrollment_male) }} / {{ pct(d.secondary_school_enrollment_female) }}</span></div>
            <div class="data-row"><span class="dr-key">Post-secondary ♂ / ♀</span><span class="dr-val">{{ pct(d.post_secondary_enrollment_male) }} / {{ pct(d.post_secondary_enrollment_female) }}</span></div>
          </section>
        </div>
      } @else {
        <div class="loading mono">QUERYING INDICATORS…</div>
      }
    </div>
  `,
  styles: [`
    .page { height: 100%; overflow-y: auto; padding: 24px 30px 40px; }
    .page-head { display: flex; align-items: center; gap: 22px; margin-bottom: 22px; }
    .back { color: var(--t2); letter-spacing: 0.14em; font-size: 11px; }
    .back:hover { color: var(--cyan); }
    .page-head h1 { font-family: var(--cond); font-weight: 700; font-size: 32px; letter-spacing: 0.04em; margin: 4px 0 0; }
    .page-head .tag-class { margin-left: auto; }
    .panel.pad { padding: 18px 20px; }
    .loading { color: var(--cyan); letter-spacing: 0.18em; margin-top: 40px; }
  `],
})
export class SingleAnalysis {
  code = input.required<string>();
  private country = inject(CountryService);
  private sel = inject(SelectionService);

  c = signal<CountryIndicators | null>(null);

  num = num; pct = pct; compact = compact; toNum = toNumber;

  constructor() {
    // input is bound from the route via withComponentInputBinding()
    queueMicrotask(() => {
      const ref = this.sel.selected().find((x) => (x.iso2 ?? String(x.id)) === this.code());
      this.country.getIndicators(this.code(), ref?.name).subscribe((d) => this.c.set(d));
    });
  }

  avgLife(d: CountryIndicators): number {
    return (toNumber(d.life_expectancy_male) + toNumber(d.life_expectancy_female)) / 2;
  }
  netTrade(d: CountryIndicators): number {
    return toNumber(d.exports) - toNumber(d.imports);
  }
}
