import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CountryIndicators } from './models';

/**
 * Set USE_MOCK = false and fill in API_BASE to hit your real endpoint.
 * The API returns an ARRAY; we take the first element.
 */
const USE_MOCK = true;
const API_BASE = '/api'; // e.g. https://your-host/api

// Sample payload from the spec (United States) — used as the demo fallback.
const SAMPLE_US: CountryIndicators = {
  gdp: '20580223', sex_ratio: '97.9', surface_area: '9833517',
  life_expectancy_male: '76.3', unemployment: '3.9', imports: '2567490',
  homicide_rate: '5', currency: { code: 'USD', name: 'Us Dollar' }, iso2: 'US',
  gdp_growth: '2.9', employment_services: '79', urban_population_growth: '0.9',
  secondary_school_enrollment_female: '98.7', employment_agriculture: '1.3',
  capital: 'Washington, D.C.', co2_emissions: '4761.3', forested_area: '33.9',
  tourists: '79746', exports: '1644280', life_expectancy_female: '81.3',
  post_secondary_enrollment_female: '102.0', post_secondary_enrollment_male: '75.0',
  primary_school_enrollment_female: '101.4', infant_mortality: '5.8',
  secondary_school_enrollment_male: '99.2', threatened_species: '1655',
  population: '331003', urban_population: '82.5', employment_industry: '19.7',
  name: 'United States', pop_growth: '0.6', region: 'Northern America',
  pop_density: '36.2', internet_users: '87.3', gdp_per_capita: '62917.9',
  fertility: '1.8', refugees: '1043.2', primary_school_enrollment_male: '102.2',
};

@Injectable({ providedIn: 'root' })
export class CountryService {
  private http = inject(HttpClient);

  /** @param code alpha-2 (preferred) or numeric id; @param name display fallback */
  getIndicators(code: string | number | undefined, name?: string): Observable<CountryIndicators> {
    if (USE_MOCK || !code) {
      return of({ ...SAMPLE_US, name: name ?? SAMPLE_US.name });
    }
    // REAL CALL — adjust path/params to match your backend:
    return this.http
      .get<CountryIndicators[]>(`${API_BASE}/country`, { params: { code: String(code) } })
      .pipe(map((rows) => rows?.[0] ?? {}));
  }
}
