from django.db import connection


class TradeDataRepository:
    @staticmethod
    def _scalar(query, params):
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            row = cursor.fetchone()
        return float(row[0]) if row and row[0] is not None else 0.0

    @staticmethod
    def total_export(country):
        return TradeDataRepository._scalar(
            "SELECT SUM(value) FROM trade_data WHERE exporter = %s", [country]
        )

    @staticmethod
    def total_import(country):
        return TradeDataRepository._scalar(
            "SELECT SUM(value) FROM trade_data WHERE importer = %s", [country]
        )

    @staticmethod
    def export_with_partner(country, partner):
        print("yoyo",country,partner)
        return TradeDataRepository._scalar(
            "SELECT SUM(value) FROM trade_data WHERE exporter = %s AND importer = %s",
            [country, partner],
        )

    @staticmethod
    def import_with_partner(country, partner):
        return TradeDataRepository._scalar(
            "SELECT SUM(value) FROM trade_data WHERE importer = %s AND exporter = %s",
            [country, partner],
        )

    @staticmethod
    def exports_by_product(country):
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT productid, value FROM trade_data WHERE exporter = %s", [country]
            )
            return cursor.fetchall()

    @staticmethod
    def imports_by_product(country):
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT productid, value FROM trade_data WHERE importer = %s", [country]
            )
            return cursor.fetchall()

    @staticmethod
    def _grouped(query, params):
        with connection.cursor() as cursor:
            cursor.execute(query, params)
            return cursor.fetchall()

    @staticmethod
    def exports_by_chapter(country, partner):
        return TradeDataRepository._grouped(
            """
            SELECT LEFT(productid, 2) AS chapter,
                   SUM(value) AS total
            FROM trade_data
            WHERE exporter = %s AND importer = %s
            GROUP BY chapter
            ORDER BY total DESC
            """,
            [country, partner],
        )

    @staticmethod
    def imports_by_chapter(country, partner):
        return TradeDataRepository._grouped(
            """
            SELECT LEFT(productid, 2) AS chapter,
                   SUM(value) AS total
            FROM trade_data
            WHERE importer = %s AND exporter = %s
            GROUP BY chapter
            ORDER BY total DESC
            """,
            [country, partner],
        )