import uuid
from django.db import models
from django.core.exceptions import ValidationError

def generate_uid():
    return uuid.uuid4()


class BaseModelMixin(models.Model):
    id = models.UUIDField(default=generate_uid, editable=False, primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Transaction(BaseModelMixin):
    TRANSACTION_TYPES = [
        ('BUY', 'Buy'),
        ("SELL", 'Sell')
    ]

    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    date = models.DateField()
    amount = models.DecimalField(max_digits=16, decimal_places=2)
    naira_rate_used_in_transation = models.DecimalField(max_digits=8, decimal_places=2)
    is_used = models.BooleanField(default=False)
    total = models.DecimalField(max_digits=16, decimal_places=2, null=True)
    gain_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    used_buy_info = models.JSONField(default=list, null=True, blank=True)
    # [
    #     {
    #         "buy_id": 1,
    #         "amount_usd": 100,
    #         "rate_naira": 1100
    #     },
    # ]

    def __str__(self):
        return f"{self.type} - ${self.amount} @ {self.naira_rate_used_in_transation}"