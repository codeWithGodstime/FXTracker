from rest_framework import serializers
from .models import Transaction

class TransactionSerializer:

    class TransactionRetriveSerializer:
        class Meta:
            model = Transaction
            fields = (
                "id",
                "date",
                "amount_usd",
                "rate_naira",
                "total_naira",
                "gain_naira",
                "gain_percent"
            )

    class TransactionCreateSerializer:
        class Meta:
            model = Transaction
            fields = (
                "date",
                "amount_usd",
                "rate_naira",
                "type"
            )