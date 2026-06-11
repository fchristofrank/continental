from ..repository.repository import TradeDataRepository
from ..repository.lookup import CHAPTER_TO_SECTION, SECTION_NAMES, HS_CHAPTERS

class TradeDataService:
    @staticmethod
    def _nest_by_section(rows):
        sections = {}
        for chapter, total in rows:
            total = float(total or 0)
            section_key = CHAPTER_TO_SECTION.get(chapter, "other")
            section_name = SECTION_NAMES.get(section_key, "Other")
            chapter_name = HS_CHAPTERS.get(chapter, f"Chapter {chapter}")

            bucket = sections.setdefault(section_name, {"total": 0.0, "items": {}})
            bucket["total"] += total
            bucket["items"][chapter_name] = bucket["items"].get(chapter_name, 0.0) + total
        return sections

    @staticmethod
    def get_trade_summary(country, partner):
        repo = TradeDataRepository
        return {
            "totalExport": repo.total_export(country),
            "totalImport": repo.total_import(country),
            "exportWithCurrentPartner": repo.export_with_partner(country, partner),
            "importWithCurrentPartner": repo.import_with_partner(country, partner),
            "exports": TradeDataService._nest_by_section(repo.exports_by_chapter(country,partner)),
            "imports": TradeDataService._nest_by_section(repo.imports_by_chapter(country,partner)),
        }