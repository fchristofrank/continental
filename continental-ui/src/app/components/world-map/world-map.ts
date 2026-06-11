import {
  Component, ElementRef, ViewEncapsulation, afterNextRender, effect, inject, signal, viewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { SelectionService } from '../../core/selection.service';
import { iso2For } from '../../core/country-codes';
import { CountryRef } from '../../core/models';

const ATLAS = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const W = 960;
const H = 500;

@Component({
  selector: 'app-world-map',
  template: `
    <div class="map-wrap">
      <div #host class="map-host"></div>

      <div class="map-tip mono"
           [style.opacity]="tip() ? 1 : 0"
           [style.left.px]="tipX()" [style.top.px]="tipY()">{{ tip() }}</div>

      <div class="hud-bl mono">
        <div class="hud-line"><span>PROJ</span> NATURAL_EARTH_I</div>
        <div class="hud-line"><span>SRC</span> world-atlas 110m</div>
        <div class="hud-line"><span>SCROLL</span> zoom · DRAG pan · CLICK select</div>
      </div>

      @if (loading()) {
        <div class="map-overlay mono">ESTABLISHING UPLINK · LOADING GEOMETRY…</div>
      }
      @if (error()) {
        <div class="map-overlay err mono">{{ error() }}</div>
      }
      @if (sel.limitHit()) {
        <div class="limit mono">SELECTION CAP REACHED · MAX {{ sel.MAX }} NODES</div>
      }
    </div>
  `,
  styles: [`
    .map-wrap { position: absolute; inset: 0; overflow: hidden; }
    .map-host { position: absolute; inset: 0; }
    .map-host svg { width: 100%; height: 100%; display: block; cursor: grab; }
    .map-host svg:active { cursor: grabbing; }

    .map-host .sphere { fill: #07101c; stroke: var(--line); stroke-width: 0.6; }
    .map-host .graticule { fill: none; stroke: rgba(120,170,210,0.06); stroke-width: 0.5; }
    .map-host .country {
      fill: #16273a; stroke: #0a1420; stroke-width: 0.45;
      transition: fill 0.15s ease;
      cursor: pointer;
    }
    .map-host .country:hover { fill: #244563; }
    .map-host .country.selected {
      fill: var(--amber);
      stroke: #ffd479; stroke-width: 0.8;
      filter: drop-shadow(0 0 6px rgba(245,166,35,0.6));
    }

    app-world-map .map-tip {
      position: absolute; z-index: 5; pointer-events: none;
      transform: translate(0, -120%);
      background: rgba(10,16,24,0.95); border: 1px solid var(--cyan);
      color: var(--t0); font-size: 11px; letter-spacing: 0.08em;
      padding: 4px 9px; border-radius: 2px; white-space: nowrap;
      box-shadow: 0 0 14px var(--cyan-dim); transition: opacity 0.12s;
    }

    app-world-map .hud-bl {
      position: absolute; left: 14px; bottom: 14px; z-index: 4;
      font-size: 9.5px; letter-spacing: 0.14em; color: var(--t2); line-height: 1.7;
    }
    app-world-map .hud-bl span { color: var(--cyan); display: inline-block; width: 56px; }

    app-world-map .map-overlay {
      position: absolute; inset: 0; z-index: 6;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; letter-spacing: 0.2em; color: var(--cyan);
      background: rgba(6,10,17,0.6); backdrop-filter: blur(2px);
    }
    app-world-map .map-overlay.err { color: var(--red); }

    app-world-map .limit {
      position: absolute; top: 14px; left: 50%; transform: translateX(-50%); z-index: 7;
      background: rgba(245,166,35,0.12); border: 1px solid var(--amber);
      color: var(--amber); font-size: 10.5px; letter-spacing: 0.16em;
      padding: 7px 14px; border-radius: 2px;
    }
  `],
  encapsulation: ViewEncapsulation.None,
})
export class WorldMap {
  private http = inject(HttpClient);
  sel = inject(SelectionService);

  private host = viewChild.required<ElementRef<HTMLDivElement>>('host');
  loading = signal(true);
  error = signal('');
  tip = signal('');
  tipX = signal(0);
  tipY = signal(0);

  private paths?: d3.Selection<SVGPathElement, GeoFeature, SVGGElement, unknown>;

  constructor() {
    afterNextRender(() => this.init());
    // Re-style whenever the shared selection changes.
    effect(() => {
      const ids = this.sel.ids();
      this.paths?.classed('selected', (d) => ids.has(+(d.id ?? -1)));
    });
  }

  private init(): void {
    this.http.get<TopoLike>(ATLAS).subscribe({
      next: (topo) => this.draw(topo),
      error: () => {
        this.loading.set(false);
        this.error.set('FAILED TO LOAD MAP GEOMETRY · CHECK NETWORK');
      },
    });
  }

  private draw(topo: TopoLike): void {
    const el = this.host().nativeElement;
    const features = (feature(topo as never, topo.objects.countries as never) as never as {
      features: GeoFeature[];
    }).features;

    const svg = d3
      .select(el)
      .append('svg')
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g');

    const projection = d3
      .geoNaturalEarth1()
      .fitSize([W, H], { type: 'FeatureCollection', features } as never);
    const path = d3.geoPath(projection);

    g.append('path').datum({ type: 'Sphere' } as never).attr('class', 'sphere').attr('d', path as never);
    g.append('path').datum(d3.geoGraticule10()).attr('class', 'graticule').attr('d', path as never);

    this.paths = g
      .selectAll<SVGPathElement, GeoFeature>('path.country')
      .data(features)
      .join('path')
      .attr('class', 'country')
      .attr('d', path as never)
      .on('click', (_e, d) => this.toggle(d))
      .on('mousemove', (e: MouseEvent, d) => this.showTip(e, d.properties?.name ?? 'UNKNOWN'))
      .on('mouseleave', () => this.tip.set(''));

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 9])
      .on('zoom', (e) => g.attr('transform', e.transform.toString()));
    svg.call(zoom as never);

    this.loading.set(false);
    const ids = this.sel.ids();
    this.paths.classed('selected', (d) => ids.has(+(d.id ?? -1)));
  }

  private toggle(d: GeoFeature): void {
    const id = +(d.id ?? -1);
    if (id < 0) return;
    const ref: CountryRef = {
      id,
      name: d.properties?.name ?? `#${id}`,
      iso2: iso2For(id),
    };
    this.sel.toggle(ref);
  }

  private showTip(e: MouseEvent, name: string): void {
    const rect = this.host().nativeElement.getBoundingClientRect();
    this.tipX.set(e.clientX - rect.left + 12);
    this.tipY.set(e.clientY - rect.top);
    this.tip.set(name.toUpperCase());
  }
}

/* ---- light local types so we don't need @types/topojson ---- */
interface GeoFeature {
  id?: string | number;
  properties?: { name?: string };
}
interface TopoLike {
  objects: { countries: unknown };
}
