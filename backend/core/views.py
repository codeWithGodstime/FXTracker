from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Transaction
from .serializers import TransactionSerializer


class TransactionViewset(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer.TransactionRetriveSerializer
    queryset = Transaction.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = TransactionSerializer.TransactionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.save()

        response_serializer = self.get_serializer(data)
        return Response(data=response_serializer.data, status=status.HTTP_201_CREATED)

