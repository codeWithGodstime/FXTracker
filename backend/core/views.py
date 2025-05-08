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
            amount_to_be_sold = float(data.amount)
            total_cost = 0
            user_buy_transactions = Transaction.objects.filter(type='BUY').order_by('date').filter(is_used=False)
            buy_used = []

            for buy in user_buy_transactions:
                matched_buy_data = Transaction.objects.filter(type="SELL").exclude(id=data.id).values_list("used_buy_info", flat=True)

                already_used_amount = 0
                for matched_list in matched_buy_data:
                    if matched_list and isinstance(matched_list, list):
                        for item in matched_list:
                            if item['buy_id'] == str(buy.id):
                                already_used_amount += item['amount_used']
                
                # this to track the used up buy transactions
                if already_used_amount == buy.amount:
                    buy.is_used = True
                    buy.save()

                available = float(buy.amount) - float(already_used_amount)

                if available <= 0:
                    continue

                amount_used = min(available, amount_to_be_sold)
                buy_used.append({
                    "buy_id": str(buy.id),
                    "amount_used": float(amount_used),
                    "naira_rate_used_in_transation": float(buy.naira_rate_used_in_transation),
                })

                total_cost += float(amount_used) * float(buy.naira_rate_used_in_transation)
                amount_to_be_sold -= float(amount_used)

                if amount_to_be_sold <= 0:
                    break

            if amount_to_be_sold > 0:
                return Response(
                    {"detail": "You dont have enough BUY transactions to complete this sell"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            data.used_buy_info = buy_used
            current_transaction_total = float(data.amount) * float(data.naira_rate_used_in_transation)
            profit_amount_transaction = float(current_transaction_total) - float(total_cost)
            gain_percent = (profit_amount_transaction / total_cost) * 100 if total_cost else 0

            data.gain_percent = round(gain_percent, 2)
            data.save()

        response_serializer = self.get_serializer(data)
        
        return Response(data=response_serializer.data, status=status.HTTP_201_CREATED)

