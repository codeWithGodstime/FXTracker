from rest_framework import serializers
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
                "used_buy_info",
            )

    class TransactionCreateSerializer(serializers.ModelSerializer):
        class Meta:
            model = Transaction
            fields = (
                "date",
                "amount",
                "naira_rate_used_in_transation",
                "type"
            )