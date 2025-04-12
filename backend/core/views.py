from rest_framework import viewsets
from .models import Transaction
from .serializers import TransactionSerializer


class TransactionViewset(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer.TransactionRetriveSerializer
    queryset = Transaction.objects.all()
