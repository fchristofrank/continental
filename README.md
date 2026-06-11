# Continental — Financial Intelligence Tool

An interactive geospatial tool for exploring international trade flows. Continental renders global bilateral trade on a world map and lets you drill into the trade relationship between any two countries, broken down by product category.

The data layer is built on [BACI](https://www.cepii.fr/CEPII/en/bdd_modele/bdd_modele_item.asp?id=37) (CEPII), a cleaned and reconciled version of UN Comtrade covering ~200 countries and ~5,000 products (HS6) from 1995 onward.

## Features

- World map of trade flows with selectable origin/destination countries.
- Bilateral analysis: total exports, total imports, and partner-specific trade.
- Product breakdown grouped by HS section and chapter rather than raw HS6 codes, so the ~5,000 product lines collapse into a readable hierarchy.
- All aggregation pushed down to SQL; the API returns compact, pre-summarized payloads.

## Architecture

```
Angular 22 + D3  ->  Django REST API  ->  PostgreSQL
   (world map,        (service +           (trade_data
    dashboards)        repository layers)    fact table)
```

- Frontend: Angular 22, D3 for the map and charts.
- Backend: Django, layered into a thin repository (raw parameterized SQL) and a service layer (aggregation, HS classification, response shaping).
- Database: PostgreSQL holding the BACI fact table plus country/product lookups.

## Data Model

The core table is a trade fact table:

| Column      | Type              | Notes                                  |
|-------------|-------------------|----------------------------------------|
| `year`      | smallint          | Reporting year                         |
| `exporter`  | varchar / int     | Exporter country (BACI code)           |
| `importer`  | varchar / int     | Importer country (BACI code)           |
| `productid` | varchar(6)        | HS6 code, zero-padded to 6 chars       |
| `value`     | numeric / bigint  | Trade value in thousands of USD        |
| `quantity`  | numeric           | Quantity in metric tons                |

Notes for anyone touching the data:

- `value` is in **thousands of USD** in raw BACI. Multiply by 1000 for absolute USD.
- `productid` is a 6-character HS code. The first 2 digits are the HS **chapter**, the first 4 are the **heading**. Grouping is done on these prefixes — see `lookup.py`.
- BACI is reconciled, so exporter-reported and importer-reported values for a country pair already agree. Do not mix in raw Comtrade without handling the reporter/partner discrepancy.

## Classification

Product grouping uses the Harmonized System hierarchy, not text matching:

- `LEFT(productid, 2)` yields the HS chapter (01–99).
- `lookup.py` maps each chapter to a readable name (`HS_CHAPTERS`), a broad section key (`CHAPTER_TO_SECTION`), and a section display name (`SECTION_NAMES`).
- Sections are a pragmatic grouping of the official 21 HS sections, with mineral fuels (ch. 27) and electronics (ch. 85) split out from minerals and machinery respectively.

## API

Base path: `/api`

| Endpoint                                   | Description                                              |
|--------------------------------------------|----------------------------------------------------------|
| `GET /trade/summary?country=&partner=`     | Totals + partner-specific trade + product breakdown      |

`GET /trade/summary` response shape:

```json
{
  "totalExport": 1827577.686,
  "totalImport": 396433.348,
  "exportWithCurrentPartner": 0.0,
  "importWithCurrentPartner": 0.0,
  "exports": {
    "Agriculture & Live Animals": {
      "total": 48201.3,
      "items": { "Fish & seafood": 40231.5, "Dairy, eggs & honey": 7969.8 }
    }
  },
  "imports": { "...": { "total": 0, "items": {} } }
}
```

`exports` and `imports` are nested by HS section; each section carries its own `total` and an `items` map of chapter-level sums. When `partner` is supplied, the breakdown is bilateral; otherwise it reflects the country's world trade.

## Getting Started

### Prerequisites

- Python 3.11+
- Node 20+ and Angular CLI 22
- PostgreSQL 14+

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# configure DATABASE_URL / DB settings in settings.py or .env
python manage.py migrate
python manage.py runserver
```

### Load trade data

Download a BACI release (HS22) from CEPII, then load it into `trade_data` along with the country and product code lookups that ship in the same archive. Confirm `productid` is stored as a consistent 6-character string before serving:

```sql
SELECT length(productid) AS len, count(*) FROM trade_data GROUP BY len;
```

All rows should report `len = 6`.

### Frontend

```bash
cd frontend
npm install
ng serve
```

The app runs at `http://localhost:4200` and expects the API at `http://localhost:8000/api`.

## Project Layout

```
backend/
  repository/
    repository.py     # parameterized SQL, no ORM hydration on aggregates
    lookup.py         # country / product codes, HS chapter & section maps
  service/
    service.py        # aggregation, HS nesting, response assembly
frontend/
  src/app/            # Angular components: map, dashboards, country detail
```

## Notes and Limitations

- BACI is annual country-and-product data. It does not contain company- or shipment-level detail; the tool is built for macro trade analysis, not entity-level intelligence.
- Values are nominal USD and are not inflation-adjusted across years.
- Quantity is reported in metric tons and is not summable across products; use `value` for all aggregates.
