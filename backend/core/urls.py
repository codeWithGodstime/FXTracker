from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import TransactionViewset


router = DefaultRouter()

router.register("transactions", TransactionViewset, basename="transactions")

urlpatterns = router.urls