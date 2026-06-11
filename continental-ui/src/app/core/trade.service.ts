import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Bilateral, CountryRef, TradeResponse } from './models';

const USE_MOCK = true;
const API_BASE = '/api';

// Sample payload from the spec — used as the demo fallback for one direction.
const SAMPLE: TradeResponse = {
  totalExport: 690997847.522,
  totalImport: 454780509.254,
  exportWithCurrentPartner: 30576.488,
  importWithCurrentPartner: 106686.605,
  exports: {
    'Base Metals': { total: 22075.049, items: { 'Copper & articles thereof': 8006.193, 'Iron & steel': 7828.034, 'Aluminium & articles thereof': 6079.878, 'Miscellaneous base-metal articles': 71.656, 'Lead & articles thereof': 43.013, 'Zinc & articles thereof': 33.418, 'Articles of iron or steel': 12.833, 'Tools & cutlery of base metal': 0.024 } },
    'Pulp, Paper & Print': { total: 2750.729, items: { 'Wood pulp & recovered paper': 2732.164, 'Paper & paperboard': 18.539, 'Printed books, newspapers & pictures': 0.026 } },
    'Machinery': { total: 2675.741, items: { 'Machinery & mechanical appliances': 2675.741 } },
    'Arms & Ammunition': { total: 1133.185, items: { 'Arms & ammunition': 1133.185 } },
    'Electronics & Electrical': { total: 421.257, items: { 'Electrical machinery & electronics': 421.257 } },
    'Precision & Medical Instruments': { total: 348.895, items: { 'Optical, medical & precision instruments': 348.895 } },
    'Plastics & Rubber': { total: 518.821, items: { 'Plastics & articles thereof': 308.9, 'Rubber & articles thereof': 209.921 } },
    'Chemicals & Allied Industries': { total: 243.419, items: { 'Pharmaceuticals': 167.485, 'Organic chemicals': 75.761, 'Miscellaneous chemical products': 0.125, 'Albuminoidal substances, glues, enzymes': 0.048 } },
    'Textiles & Apparel': { total: 138.631, items: { 'Wool & animal hair': 127.459, 'Apparel, not knitted or crocheted': 6.598, 'Apparel, knitted or crocheted': 3.816, 'Other made-up textiles & worn clothing': 0.758 } },
    'Miscellaneous Manufactures': { total: 105.782, items: { 'Miscellaneous manufactured articles': 90.58, 'Toys, games & sports equipment': 15.202 } },
    'Agriculture & Live Animals': { total: 78.709, items: { 'Animal & vegetable fats & oils': 65.254, 'Dairy, eggs & honey': 10.715, 'Live animals': 2.74 } },
    'Foodstuffs & Beverages': { total: 60.535, items: { 'Food-industry residues & animal fodder': 60.535 } },
    'Precious Stones & Metals': { total: 15.352, items: { 'Pearls, precious stones & metals': 15.352 } },
    'Hides, Leather & Fur': { total: 3.461, items: { 'Leather articles & travel goods': 3.461 } },
    'Footwear & Headgear': { total: 4.11, items: { 'Footwear': 2.662, 'Headgear': 1.448 } },
    'Mineral Products': { total: 2.156, items: { 'Salt, stone, cement & plaster': 2.156 } },
    'Works of Art & Antiques': { total: 0.656, items: { 'Works of art & antiques': 0.656 } },
  },
  imports: {
    'Chemicals & Allied Industries': { total: 47539.486, items: { 'Organic chemicals': 34908.468, 'Pharmaceuticals': 6078.221, 'Miscellaneous chemical products': 6071.362, 'Essential oils & cosmetics': 178.444, 'Soap, waxes & polishes': 153.864, 'Inorganic chemicals': 96.041, 'Tanning & dyeing extracts, paints': 33.052, 'Explosives & pyrotechnics': 15.656, 'Photographic & cinematographic goods': 3.851, 'Albuminoidal substances, glues, enzymes': 0.315, 'Fertilisers': 0.212 } },
    'Electronics & Electrical': { total: 6676.315, items: { 'Electrical machinery & electronics': 6676.315 } },
    'Stone, Ceramic & Glass': { total: 6877.632, items: { 'Ceramic products': 6113.596, 'Articles of stone, plaster & cement': 478.403, 'Glass & glassware': 285.633 } },
    'Base Metals': { total: 10151.607, items: { 'Articles of iron or steel': 5396.43, 'Aluminium & articles thereof': 2664.492, 'Iron & steel': 1396.511, 'Miscellaneous base-metal articles': 237.975, 'Tools & cutlery of base metal': 230.414, 'Copper & articles thereof': 187.138, 'Nickel & articles thereof': 20.166, 'Zinc & articles thereof': 18.481 } },
    'Machinery': { total: 3955.202, items: { 'Machinery & mechanical appliances': 3955.202 } },
    'Agriculture & Live Animals': { total: 9839.975, items: { 'Fish & seafood': 3255.753, 'Cereals': 2870.292, 'Oil seeds & oleaginous fruits': 1649.851, 'Meat & edible offal': 897.371, 'Edible fruit & nuts': 662.574, 'Coffee, tea & spices': 246.197, 'Vegetables': 179.917, 'Dairy, eggs & honey': 62.575, 'Vegetable plaiting materials': 5.761, 'Animal & vegetable fats & oils': 4.533, 'Milling products (flour, malt, starch)': 4.433, 'Lac, gums & vegetable extracts': 0.487, 'Live trees & plants': 0.231 } },
    'Plastics & Rubber': { total: 5071.269, items: { 'Rubber & articles thereof': 3045.146, 'Plastics & articles thereof': 2026.123 } },
    'Precision & Medical Instruments': { total: 2705.543, items: { 'Optical, medical & precision instruments': 2697.345, 'Clocks & watches': 5.391, 'Musical instruments': 2.807 } },
    'Pulp, Paper & Print': { total: 2490.227, items: { 'Paper & paperboard': 2455.353, 'Printed books, newspapers & pictures': 34.874 } },
    'Textiles & Apparel': { total: 4906.433, items: { 'Apparel, knitted or crocheted': 1806.848, 'Other made-up textiles & worn clothing': 1208.574, 'Apparel, not knitted or crocheted': 829.94, 'Carpets & textile floor coverings': 276.137, 'Wadding, felt, twine & cordage': 221.502, 'Man-made staple fibres': 191.408, 'Other vegetable textile fibres': 109.734, 'Special woven fabrics & lace': 100.37, 'Coated & industrial textile fabrics': 93.437, 'Man-made filaments': 36.126, 'Silk': 23.911, 'Cotton': 7.315, 'Knitted or crocheted fabrics': 1.078, 'Wool & animal hair': 0.053 } },
    'Precious Stones & Metals': { total: 1355.205, items: { 'Pearls, precious stones & metals': 1355.205 } },
    'Foodstuffs & Beverages': { total: 2224.861, items: { 'Prepared vegetables & fruit': 1066.825, 'Miscellaneous edible preparations': 869.028, 'Cereal, flour & milk preparations': 156.099, 'Food-industry residues & animal fodder': 99.651, 'Prepared meat & fish': 14.262, 'Sugars & confectionery': 13.191, 'Beverages, spirits & vinegar': 5.042, 'Tobacco': 0.479, 'Cocoa & cocoa preparations': 0.284 } },
    'Hides, Leather & Fur': { total: 669.219, items: { 'Leather articles & travel goods': 657.297, 'Raw hides, skins & leather': 11.809, 'Furskins & artificial fur': 0.113 } },
    'Vehicles & Transport': { total: 634.832, items: { 'Vehicles (other than railway)': 634.832 } },
    'Mineral Products': { total: 489.134, items: { 'Ores, slag & ash': 460.082, 'Salt, stone, cement & plaster': 29.052 } },
    'Miscellaneous Manufactures': { total: 520.915, items: { 'Furniture, bedding & lighting': 447.146, 'Toys, games & sports equipment': 58.969, 'Miscellaneous manufactured articles': 14.8 } },
    'Footwear & Headgear': { total: 378.407, items: { 'Footwear': 356.321, 'Headgear': 21.0, 'Prepared feathers, artificial flowers': 1.071, 'Umbrellas & walking-sticks': 0.015 } },
    'Wood & Cork': { total: 149.199, items: { 'Wood & articles of wood': 148.296, 'Straw & basketware': 0.739, 'Cork & articles of cork': 0.164 } },
    'Works of Art & Antiques': { total: 26.386, items: { 'Works of art & antiques': 26.386 } },
    'Mineral Fuels & Oils': { total: 24.758, items: { 'Mineral fuels & oils': 24.758 } },
  },
};

@Injectable({ providedIn: 'root' })
export class TradeService {
  private http = inject(HttpClient);

  /** One direction: exporter -> importer. Mirrors `SELECT SUM(value) ... exporter=A AND importer=B`. */
  getDirectional(exporter: number, importer: number): Observable<TradeResponse> {
    if (USE_MOCK) return of(SAMPLE);
    return this.http.get<TradeResponse>(`${API_BASE}/trade`, {
      params: { exporter: String(exporter), importer: String(importer) },
    });
  }

  /** Calls the API both ways and bundles it for the bilateral dashboard. */
  getBilateral(a: CountryRef, b: CountryRef): Observable<Bilateral> {
    return forkJoin({
      aToB: this.getDirectional(a.id, b.id),
      bToA: this.getDirectional(b.id, a.id),
    }).pipe(map(({ aToB, bToA }) => ({ a, b, aToB, bToA })));
  }
}
