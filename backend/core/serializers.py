from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import Transaction

class TransactionSerializer:

    class TransactionRetriveSerializer(serializers.ModelSerializer):
        class Meta:
            model = Transaction
            fields = (
                "id",
                "date",
                "amount",
                "naira_rate_used_in_transation",
                "type",
                "gain_percent",
                "total",
                "used_buy_info",
            )

    class TransactionCreateSerializer(serializers.ModelSerializer):
        id = serializers.ReadOnlyField()
        class Meta:
            model = Transaction
            fields = (
                "id",
                "date",
                "amount",
                "naira_rate_used_in_transation",
                "type"
            )

        def validate_amount(self, amount):
            if amount <= 0:
                raise ValidationError("Invalid amount, cannot be less that 1")
            return amount