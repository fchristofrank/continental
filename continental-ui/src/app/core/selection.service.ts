import { Injectable, computed, signal } from '@angular/core';
import { CountryRef } from './models';

@Injectable({ providedIn: 'root' })
export class SelectionService {
  readonly MAX = 10;

  private _selected = signal<CountryRef[]>([]);
  readonly selected = this._selected.asReadonly();

  /** Set of selected numeric ids — used by the map to re-style paths reactively. */
  readonly ids = computed(() => new Set(this._selected().map((c) => c.id)));
  readonly count = computed(() => this._selected().length);

  /** Flips on briefly when the user tries to exceed MAX. */
  readonly limitHit = signal(false);

  toggle(c: CountryRef): void {
    const cur = this._selected();
    if (cur.some((x) => x.id === c.id)) {
      this._selected.set(cur.filter((x) => x.id !== c.id));
      return;
    }
    if (cur.length >= this.MAX) {
      this.limitHit.set(true);
      setTimeout(() => this.limitHit.set(false), 2200);
      return;
    }
    this._selected.set([...cur, c]);
  }

  remove(id: number): void {
    this._selected.set(this._selected().filter((x) => x.id !== id));
  }

  clear(): void {
    this._selected.set([]);
  }

  byId(id: number): CountryRef | undefined {
    return this._selected().find((x) => x.id === id);
  }
}
