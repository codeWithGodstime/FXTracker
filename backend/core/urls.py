from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import TransactionViewset


router = DefaultRouter()

router.register("", TransactionViewset, basename="transactions")

urlpatterns = router.urls