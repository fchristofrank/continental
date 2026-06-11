/** A country the user has clicked on the map. id = ISO 3166-1 numeric (matches trade API exporter/importer). */
export interface CountryRef {
  id: number;
  name: string;
  iso2?: string;
}

/** Mirror of the fundamental-indicators API response (all optional, comes back as strings). */
export interface CountryIndicators {
  name?: string;
  iso2?: string;
  region?: string;
  capital?: string;
  currency?: { code?: string; name?: string };

  gdp?: string;
  gdp_growth?: string;
  gdp_per_capita?: string;
  imports?: string;
  exports?: string;
  unemployment?: string;

  population?: string;
  pop_growth?: string;
  pop_density?: string;
  surface_area?: string;
  urban_population?: string;
  urban_population_growth?: string;

  life_expectancy_male?: string;
  life_expectancy_female?: string;
  fertility?: string;
  infant_mortality?: string;
  sex_ratio?: string;
  homicide_rate?: string;

  employment_agriculture?: string;
  employment_industry?: string;
  employment_services?: string;

  secondary_school_enrollment_male?: string;
  secondary_school_enrollment_female?: string;
  post_secondary_enrollment_male?: string;
  post_secondary_enrollment_female?: string;
  primary_school_enrollment_male?: string;
  primary_school_enrollment_female?: string;

  internet_users?: string;
  co2_emissions?: string;
  forested_area?: string;
  threatened_species?: string;
  tourists?: string;
  refugees?: string;
  [key: string]: unknown;
}

/** One HS-section category in the trade response. */
export interface TradeCategory {
  total: number;
  items: Record<string, number>;
}

/** Mirror of the bilateral trade API response (one direction). */
export interface TradeResponse {
  totalExport: number;
  totalImport: number;
  exportWithCurrentPartner: number;
  importWithCurrentPartner: number;
  exports: Record<string, TradeCategory>;
  imports: Record<string, TradeCategory>;
}

export interface Bilateral {
  a: CountryRef;
  b: CountryRef;
  aToB: TradeResponse; // exporter = A, importer = B
  bToA: TradeResponse; // exporter = B, importer = A
}
