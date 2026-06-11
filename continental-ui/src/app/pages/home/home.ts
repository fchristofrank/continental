import { Component } from '@angular/core';
import { WorldMap } from '../../components/world-map/world-map';
import { CountryPanel } from '../../components/country-panel/country-panel';

@Component({
  selector: 'app-home',
  imports: [WorldMap, CountryPanel],
  template: `
    <div class="home">
      <app-world-map />
      <app-country-panel />
    </div>
  `,
  styles: [`
    .home { position: absolute; inset: 0; }
  `],
})
export class Home {}
