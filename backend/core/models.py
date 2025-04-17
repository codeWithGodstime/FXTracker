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
    amount_usd = models.DecimalField(max_digits=16, decimal_places=2)
    rate_naira = models.DecimalField(max_digits=16, decimal_places=2)

    matched_buy_ids = models.JSONField(default=list, null=True, blank=True)
    # [
    #     {
    #         "buy_id": 1,
    #         "amount_usd": 100,
    #         "rate_naira": 1100
    #     },
    # ]
    gain_naira = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    gain_percent = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.type} - ${self.amount_usd} @ {self.rate_naira}"

    def clean(self):
        super().clean()

        if self.matched_buy_ids:
            if not isinstance(self.matched_buy_ids, list):
                raise ValidationError({"matched_buy_ids": "Must be a list."})

            for i, item in enumerate(self.matched_buy_ids):
                if not isinstance(item, dict):
                    raise ValidationError({"matched_buy_ids": f"Item {i} must be a dictionary."})

                required_keys = {"buy_id", "amount_usd", "rate_naira"}
                if not required_keys.issubset(item):
                    missing = required_keys - item.keys()
                    raise ValidationError({
                        "matched_buy_ids": f"Item {i} is missing keys: {', '.join(missing)}"
                    })

                if not isinstance(item["buy_id"], str):
                    raise ValidationError({
                        "matched_buy_ids": f"Item {i} → 'buy_id' must be an str or uuid."
                    })

                for key in ["amount_usd", "rate_naira"]:
                    if not isinstance(item[key], (int, float)):
                        raise ValidationError({
                            "matched_buy_ids": f"Item {i} → '{key}' must be a number."
                        })
                    
    def save(self, *args, **kwargs):
        return super().save(*args, **kwargs)