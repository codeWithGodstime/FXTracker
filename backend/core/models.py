import uuid
from django.db import models

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
    amount_usd = models.DecimalField(max_digits=16, decimal_places=2)
    rate_naira = models.DecimalField(max_digits=16, decimal_places=2)

    matched_buy_ids = models.JSONField(null=True, blank=True)
    gain_naira = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    gain_percent = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.type} - ${self.amount_usd} @ {self.rate_naira}"