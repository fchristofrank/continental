from django.apps import AppConfig
from .repository.lookup import load_lookups


class TradeDetailsConfig(AppConfig):
    name = 'trade_details'
    load_lookups()
