from django.db import transaction
from rest_framework import viewsets, status
from rest_framework.response import Response

from .models import Transaction
from .serializers import TransactionSerializer


class TransactionViewset(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer.TransactionRetriveSerializer
    queryset = Transaction.objects.all()

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = TransactionSerializer.TransactionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.save()

        if data.type == "SELL":
            usd_to_sell = float(data.amount_usd)
            total_cost = 0
            buy_transactions = Transaction.objects.filter(type='BUY').order_by('date')
            buy_used = []

            for buy in buy_transactions:
                matched_buy_data = Transaction.objects.filter(type="SELL").exclude(id=data.id).values_list("matched_buy_ids", flat=True)

                already_used = 0
                for matched_list in matched_buy_data:
                    if matched_list and isinstance(matched_list, list):
                        for item in matched_list:
                            if item['buy_id'] == str(buy.id):
                                already_used += item['amount_usd']

                available = float(buy.amount_usd) - float(already_used)
                if available <= 0:
                    continue

                amount_used = min(available, usd_to_sell)
                buy_used.append({
                    "buy_id": str(buy.id),
                    "amount_usd": float(amount_used),
                    "rate_naira": float(buy.rate_naira),
                })

                total_cost += float(amount_used) * float(buy.rate_naira)
                usd_to_sell -= float(amount_used)

                if usd_to_sell <= 0:
                    break

            if usd_to_sell > 0:
                return Response(
                    {"detail": "Not enough USD from previous BUYs to match this SELL."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            data.matched_buy_ids = buy_used
            sell_total = float(data.amount_usd) * float(data.rate_naira)
            gain_naira = float(sell_total) - float(total_cost)
            gain_percent = (gain_naira / total_cost) * 100 if total_cost else 0

            data.gain_naira = round(gain_naira, 2)
            data.gain_percent = round(gain_percent, 2)
            data.save()

        response_serializer = self.get_serializer(data)
        print("reached here", response_serializer)
        return Response(data=response_serializer.data, status=status.HTTP_201_CREATED)

