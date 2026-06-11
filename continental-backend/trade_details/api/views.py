import json
import logging

from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt

from ..service.service import TradeDataService
from ..repository.lookup import COUNTRY_NAME_TO_CODE

logger = logging.getLogger(__name__)


def resolve_code(value):
    if value is None:
        return None
    # already a numeric code (JSON sent a number, or a numeric string)
    if isinstance(value, int):
        return value
    value = value.strip()
    if value.isdigit():
        return int(value)
    # otherwise treat it as a name and look up the code
    code = COUNTRY_NAME_TO_CODE.get(value.lower())
    return int(code) if code is not None else None


@csrf_exempt
@require_POST
def trade_summary(request):
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "invalid JSON body"}, status=400)

    exporter_name = body.get("exporter")
    importer_name = body.get("importer")

    exporter = resolve_code(exporter_name)
    importer = resolve_code(importer_name)

    logger.info(f"Exporter: {exporter_name} -> {exporter} | Importer: {importer_name} -> {importer}")

    if exporter is None:
        return JsonResponse({"error": f"unknown exporter: {exporter_name}"}, status=400)
    if importer is None:
        return JsonResponse({"error": f"unknown importer: {importer_name}"}, status=400)

    return JsonResponse(TradeDataService.get_trade_summary(exporter, importer))