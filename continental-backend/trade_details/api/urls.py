from django.urls import path
from trade_details.api.views import trade_summary

urlpatterns = [
    path('detail/', trade_summary),
]