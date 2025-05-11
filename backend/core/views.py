from django.db import transaction
from django.db.models import Sum
from rest_framework import viewsets, status, permissions
from django.db.models.functions import TruncMonth, TruncYear
from datetime import datetime, timedelta
from collections import defaultdict
from django.utils.timezone import now
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model

from .models import Transaction
from .serializers import TransactionSerializer


User = get_user_model()

class UserViewset(viewsets.ModelViewSet):
    serializer_class = None
    queryset = User.objects.all()
    permission_classes = []

    @action(methods=['GET'], detail=False)
    def user_metrics(self, request, *args, **kwargs):
        # total_sell_transaction_amount, total_buy_transaction_amount, total_amount_of_transaction_made
        pass


class TransactionViewset(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer.TransactionRetriveSerializer
    queryset = Transaction.objects.all()

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = TransactionSerializer.TransactionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        transaction_type = validated_data["type"]
        date = validated_data['date']
        amount = float(validated_data["amount"])
        naira_rate = float(validated_data["naira_rate_used_in_transation"])

        if transaction_type == "SELL":
            amount_to_be_sold = amount
            total_cost = 0
            buy_used = []

            user_buy_transactions = Transaction.objects.filter(type='BUY').order_by('date').filter(is_used=False)

            for buy in user_buy_transactions:
                matched_buy_data = Transaction.objects.exclude(type='BUY').values_list("used_buy_info", flat=True)

                already_used_amount = 0
                for matched_list in matched_buy_data:
                    if matched_list and isinstance(matched_list, list):
                        for item in matched_list:
                            if item['buy_id'] == str(buy.id):
                                already_used_amount += item['amount_used']

                if already_used_amount == buy.amount:
                    buy.is_used = True
                    buy.save()

                available = float(buy.amount) - float(already_used_amount)
                if available <= 0:
                    continue

                amount_used = min(available, amount_to_be_sold)
                buy_used.append({
                    "buy_id": str(buy.id),
                    "date": str(buy.date),
                    "amount_used": float(amount_used),
                    "naira_rate_used_in_transation": float(buy.naira_rate_used_in_transation),
                })

                total_cost += amount_used * float(buy.naira_rate_used_in_transation)
                amount_to_be_sold -= amount_used

                if amount_to_be_sold <= 0:
                    break

            if amount_to_be_sold > 0:
                return Response(
                    {"detail": "You don't have enough BUY transactions to complete this SELL."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            current_transaction_total = amount * naira_rate
            profit_amount_transaction = current_transaction_total - total_cost
            gain_percent = (profit_amount_transaction / total_cost) * 100 if total_cost else 0

            transaction = Transaction.objects.create(
                type='SELL',
                date=date,
                amount=amount,
                naira_rate_used_in_transation=naira_rate,
                total=profit_amount_transaction,
                gain_percent=round(gain_percent, 2),
                used_buy_info=buy_used,
            )

        else:
            transaction = Transaction.objects.create(
                type='BUY',
                date=date, 
                amount=amount,
                naira_rate_used_in_transation=naira_rate,
                total=amount * naira_rate,
            )

        response_serializer = self.get_serializer(transaction)
        return Response(data=response_serializer.data, status=status.HTTP_201_CREATED)

    @action(methods=['GET'], detail=False)
    def user_metrics(self, request, *args, **kwargs):

        total_sell = Transaction.objects.filter(type="SELL")
        total_buy = Transaction.objects.filter(type="BUY")
        total_sell_transaction_amount = total_sell.aggregate(Sum("total"))
        total_buy_transaction_amount = total_buy.aggregate(Sum("total"))
        remaining_balance = total_buy.filter(is_used=False).aggregate(Sum("total"))

        total_transaction_amount = float(total_buy_transaction_amount['total__sum']) + float(total_sell_transaction_amount['total__sum'])
        data = {
            "total_transaction_amount": total_transaction_amount,
            "remaining_balance": remaining_balance['total__sum'],
            "total_buy_transaction_amount": total_buy_transaction_amount["total__sum"],
            "total_sell_transaction_amount": total_sell_transaction_amount["total__sum"],
            "total_buy_count": total_buy.count(),
            "total_sell_count": total_sell.count()
        }

        return Response(data, status=status.HTTP_200_OK)

    @action(methods=['GET'], detail=False )
    def get_profit_summary(self, request, *args, **kwargs):
        current_year = now().year

        # Step 1: Get real monthly profit data
        monthly_data_raw = (
            Transaction.objects.filter(type="SELL")
            .annotate(month=TruncMonth("date"))
            .values("month")
            .annotate(total_profit=Sum("total"))
            .order_by("month")
        )

        # Step 2: Build a full list of months for the current year
        full_months = [
            datetime(current_year, month, 1) for month in range(1, 13)
        ]
        monthly_data_dict = {item["month"].strftime("%Y-%m"): item["total_profit"] for item in monthly_data_raw}

        monthly_data = [
            {
                "month": m.strftime("%Y-%m"),
                "total_profit": monthly_data_dict.get(m.strftime("%Y-%m"), 0)
            }
            for m in full_months
        ]

        # Step 3: Yearly profit (no need to pad with zeroes here)
        yearly_data = (
            Transaction.objects.filter(type="SELL")
            .annotate(year=TruncYear("date"))
            .values("year")
            .annotate(total_profit=Sum("total"))
            .order_by("year")
        )

        data = {
            "monthly": monthly_data,
            "yearly": [
                {"year": item["year"].strftime("%Y"), "total_profit": item["total_profit"]}
                for item in yearly_data
            ],
        }

        return Response(data)
