import csv
from pathlib import Path

from django.conf import settings

"""
Lookup tables for trade-data classification.

- COUNTRY_CODES / PRODUCT_CODES : your existing BACI lookups (keep as-is).
- HS_CHAPTERS                   : 2-digit HS chapter -> readable name (all 99).
- CHAPTER_TO_SECTION            : 2-digit HS chapter -> broad section key.
- SECTION_NAMES                 : section key -> display name (top-level JSON bucket).

The section scheme is a pragmatic grouping of the official 21 HS sections,
with Mineral Fuels & Oils (ch. 27) split out from other minerals and
Electronics (ch. 85) split out from general machinery (ch. 84), as requested.
"""


# module-level dicts — populated once at startup, read-only thereafter
COUNTRY_CODES = {}   # {country_code: country_name}
PRODUCT_CODES = {}   # {product_id: product_description}
COUNTRY_NAME_TO_CODE = {}  # {name_lower: code}  -> used to translate user input

_DATA_DIR = Path(settings.BASE_DIR) / "trade_details" / "data"


def _load_csv(filename, key_col, value_col):
    result = {}
    path = _DATA_DIR / filename
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            result[row[key_col].strip()] = row[value_col].strip()
    return result


def load_lookups():
    COUNTRY_CODES.update(_load_csv("country_codes.csv", "country_code", "country_name"))
    PRODUCT_CODES.update(_load_csv("product_codes.csv", "code", "description"))
    for code, name in COUNTRY_CODES.items():
        COUNTRY_NAME_TO_CODE[name.lower()] = code


# ---------------------------------------------------------------------------
# HS chapter -> readable name. Covers all chapters 01-99.
# (Chapter 77 is reserved by the WCO and never appears in trade data.)
# ---------------------------------------------------------------------------
HS_CHAPTERS = {
    "01": "Live animals",
    "02": "Meat & edible offal",
    "03": "Fish & seafood",
    "04": "Dairy, eggs & honey",
    "05": "Other animal products",
    "06": "Live trees & plants",
    "07": "Vegetables",
    "08": "Edible fruit & nuts",
    "09": "Coffee, tea & spices",
    "10": "Cereals",
    "11": "Milling products (flour, malt, starch)",
    "12": "Oil seeds & oleaginous fruits",
    "13": "Lac, gums & vegetable extracts",
    "14": "Vegetable plaiting materials",
    "15": "Animal & vegetable fats & oils",
    "16": "Prepared meat & fish",
    "17": "Sugars & confectionery",
    "18": "Cocoa & cocoa preparations",
    "19": "Cereal, flour & milk preparations",
    "20": "Prepared vegetables & fruit",
    "21": "Miscellaneous edible preparations",
    "22": "Beverages, spirits & vinegar",
    "23": "Food-industry residues & animal fodder",
    "24": "Tobacco",
    "25": "Salt, stone, cement & plaster",
    "26": "Ores, slag & ash",
    "27": "Mineral fuels & oils",
    "28": "Inorganic chemicals",
    "29": "Organic chemicals",
    "30": "Pharmaceuticals",
    "31": "Fertilisers",
    "32": "Tanning & dyeing extracts, paints",
    "33": "Essential oils & cosmetics",
    "34": "Soap, waxes & polishes",
    "35": "Albuminoidal substances, glues, enzymes",
    "36": "Explosives & pyrotechnics",
    "37": "Photographic & cinematographic goods",
    "38": "Miscellaneous chemical products",
    "39": "Plastics & articles thereof",
    "40": "Rubber & articles thereof",
    "41": "Raw hides, skins & leather",
    "42": "Leather articles & travel goods",
    "43": "Furskins & artificial fur",
    "44": "Wood & articles of wood",
    "45": "Cork & articles of cork",
    "46": "Straw & basketware",
    "47": "Wood pulp & recovered paper",
    "48": "Paper & paperboard",
    "49": "Printed books, newspapers & pictures",
    "50": "Silk",
    "51": "Wool & animal hair",
    "52": "Cotton",
    "53": "Other vegetable textile fibres",
    "54": "Man-made filaments",
    "55": "Man-made staple fibres",
    "56": "Wadding, felt, twine & cordage",
    "57": "Carpets & textile floor coverings",
    "58": "Special woven fabrics & lace",
    "59": "Coated & industrial textile fabrics",
    "60": "Knitted or crocheted fabrics",
    "61": "Apparel, knitted or crocheted",
    "62": "Apparel, not knitted or crocheted",
    "63": "Other made-up textiles & worn clothing",
    "64": "Footwear",
    "65": "Headgear",
    "66": "Umbrellas & walking-sticks",
    "67": "Prepared feathers, artificial flowers",
    "68": "Articles of stone, plaster & cement",
    "69": "Ceramic products",
    "70": "Glass & glassware",
    "71": "Pearls, precious stones & metals",
    "72": "Iron & steel",
    "73": "Articles of iron or steel",
    "74": "Copper & articles thereof",
    "75": "Nickel & articles thereof",
    "76": "Aluminium & articles thereof",
    "78": "Lead & articles thereof",
    "79": "Zinc & articles thereof",
    "80": "Tin & articles thereof",
    "81": "Other base metals & cermets",
    "82": "Tools & cutlery of base metal",
    "83": "Miscellaneous base-metal articles",
    "84": "Machinery & mechanical appliances",
    "85": "Electrical machinery & electronics",
    "86": "Railway locomotives & rolling-stock",
    "87": "Vehicles (other than railway)",
    "88": "Aircraft & spacecraft",
    "89": "Ships & boats",
    "90": "Optical, medical & precision instruments",
    "91": "Clocks & watches",
    "92": "Musical instruments",
    "93": "Arms & ammunition",
    "94": "Furniture, bedding & lighting",
    "95": "Toys, games & sports equipment",
    "96": "Miscellaneous manufactured articles",
    "97": "Works of art & antiques",
    "98": "Special / national-use transactions",
    "99": "Special / national-use transactions",
}


# ---------------------------------------------------------------------------
# HS chapter -> broad section key (top-level grouping in the JSON).
# ---------------------------------------------------------------------------
CHAPTER_TO_SECTION = {
    # Agriculture & animal/vegetable products (HS 01-15)
    "01": "agriculture", "02": "agriculture", "03": "agriculture",
    "04": "agriculture", "05": "agriculture", "06": "agriculture",
    "07": "agriculture", "08": "agriculture", "09": "agriculture",
    "10": "agriculture", "11": "agriculture", "12": "agriculture",
    "13": "agriculture", "14": "agriculture", "15": "agriculture",

    # Prepared foodstuffs, beverages, tobacco (HS 16-24)
    "16": "food", "17": "food", "18": "food", "19": "food", "20": "food",
    "21": "food", "22": "food", "23": "food", "24": "food",

    # Mineral products excl. fuels (HS 25-26)
    "25": "minerals", "26": "minerals",

    # Mineral fuels & oils — split out (HS 27)
    "27": "oil",

    # Chemicals & allied industries (HS 28-38)
    "28": "chemicals", "29": "chemicals", "30": "chemicals", "31": "chemicals",
    "32": "chemicals", "33": "chemicals", "34": "chemicals", "35": "chemicals",
    "36": "chemicals", "37": "chemicals", "38": "chemicals",

    # Plastics & rubber (HS 39-40)
    "39": "plastics", "40": "plastics",

    # Hides, leather, fur (HS 41-43)
    "41": "leather", "42": "leather", "43": "leather",

    # Wood & cork (HS 44-46)
    "44": "wood", "45": "wood", "46": "wood",

    # Pulp, paper, printed matter (HS 47-49)
    "47": "paper", "48": "paper", "49": "paper",

    # Textiles & apparel (HS 50-63)
    "50": "textiles", "51": "textiles", "52": "textiles", "53": "textiles",
    "54": "textiles", "55": "textiles", "56": "textiles", "57": "textiles",
    "58": "textiles", "59": "textiles", "60": "textiles", "61": "textiles",
    "62": "textiles", "63": "textiles",

    # Footwear, headgear, accessories (HS 64-67)
    "64": "footwear", "65": "footwear", "66": "footwear", "67": "footwear",

    # Stone, ceramic, glass (HS 68-70)
    "68": "stone_glass", "69": "stone_glass", "70": "stone_glass",

    # Precious stones & metals (HS 71)
    "71": "gems",

    # Base metals (HS 72-83)
    "72": "metals", "73": "metals", "74": "metals", "75": "metals",
    "76": "metals", "78": "metals", "79": "metals", "80": "metals",
    "81": "metals", "82": "metals", "83": "metals",

    # General machinery — split out (HS 84)
    "84": "machinery",

    # Electronics / electrical — split out (HS 85)
    "85": "technology",

    # Vehicles, aircraft, vessels (HS 86-89)
    "86": "transport", "87": "transport", "88": "transport", "89": "transport",

    # Optical, medical, clocks, musical instruments (HS 90-92)
    "90": "instruments", "91": "instruments", "92": "instruments",

    # Arms & ammunition (HS 93)
    "93": "arms",

    # Miscellaneous manufactured articles (HS 94-96)
    "94": "misc", "95": "misc", "96": "misc",

    # Works of art & antiques (HS 97)
    "97": "art",

    # Special / national-use (HS 98-99)
    "98": "other", "99": "other",
}


# ---------------------------------------------------------------------------
# Section key -> display name (the top-level keys in your JSON response).
# ---------------------------------------------------------------------------
SECTION_NAMES = {
    "agriculture": "Agriculture & Live Animals",
    "food":        "Foodstuffs & Beverages",
    "minerals":    "Mineral Products",
    "oil":         "Mineral Fuels & Oils",
    "chemicals":   "Chemicals & Allied Industries",
    "plastics":    "Plastics & Rubber",
    "leather":     "Hides, Leather & Fur",
    "wood":        "Wood & Cork",
    "paper":       "Pulp, Paper & Print",
    "textiles":    "Textiles & Apparel",
    "footwear":    "Footwear & Headgear",
    "stone_glass": "Stone, Ceramic & Glass",
    "gems":        "Precious Stones & Metals",
    "metals":      "Base Metals",
    "machinery":   "Machinery",
    "technology":  "Electronics & Electrical",
    "transport":   "Vehicles & Transport",
    "instruments": "Precision & Medical Instruments",
    "arms":        "Arms & Ammunition",
    "misc":        "Miscellaneous Manufactures",
    "art":         "Works of Art & Antiques",
    "other":       "Other / Unclassified",
}