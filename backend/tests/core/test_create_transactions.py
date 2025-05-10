from decimal import Decimal
import pytest
from faker import Faker
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from core.models import Transaction

fake = Faker()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def create_buy_transaction():
    def _create_buy(amount, naira_rate_used_in_transation, date=fake.date_this_month()):
        return Transaction.objects.create(
            type='BUY',
            date=date,
            amount=Decimal(amount),
            naira_rate_used_in_transation=Decimal(naira_rate_used_in_transation),
        )
    return _create_buy

@pytest.mark.django_db
def test_create_valid_buy(api_client):
    data = {
        "type": "BUY",
        "date": "2025-05-10",
        "amount": "1000.00",
        "naira_rate_used_in_transation": "1400.50"
    }
    response = api_client.post(reverse('transactions-list'), data)
    assert response.status_code == status.HTTP_201_CREATED

@pytest.mark.django_db
@pytest.mark.parametrize("amount", ["0", "-500"])
def test_reject_invalid_buy_amount(api_client, amount):
    data = {
        "type": "BUY",
        "date": "2025-05-10",
        "amount": amount,
        "naira_rate_used_in_transation": "1400"
    }
    response = api_client.post(reverse('transactions-list'), data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_reject_buy_missing_fields(api_client):
    data = {
        "type": "BUY",
        "naira_rate_used_in_transation": "1400"
    }
    response = api_client.post(reverse('transactions-list'), data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_create_sell_fully_matched(api_client, create_buy_transaction):
    create_buy_transaction(500, 1300, "2025-05-10")
    create_buy_transaction(300, 1350, "2025-05-10")
    
    data = {
        "type": "SELL",
        "date": "2025-05-12",
        "amount": "600",
        "naira_rate_used_in_transation": "1500"
    }
    response = api_client.post(reverse('transactions-list'), data)
    assert response.status_code == status.HTTP_201_CREATED
    assert "used_buy_info" in response.data
    assert Decimal(response.data["gain_percent"]) > 0

@pytest.mark.django_db
def test_reject_sell_without_buys(api_client):
    data = {
        "type": "SELL",
        "amount": "100",
        "naira_rate_used_in_transation": "1500"
    }
    response = api_client.post(reverse('transactions-list'), data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_reject_sell_exceeding_available_usd(api_client, create_buy_transaction):
    create_buy_transaction(200, 1300, "2025-05-10")
    
    data = {
        "type": "SELL",
        "date": "2025-05-15",
        "amount": "300",
        "naira_rate_used_in_transation": "1500"
    }
    response = api_client.post(reverse('transactions-list'), data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST

@pytest.mark.django_db
def test_sell_exactly_matches_multiple_buys(api_client, create_buy_transaction):
    create_buy_transaction(300, 1300)
    create_buy_transaction(200, 1320)

    data = {
        "type": "SELL",
        "date": "2025-05-15",
        "amount": "500",
        "naira_rate_used_in_transation": "1550"
    }
    response = api_client.post(reverse('transactions-list'), data)
    print(response.data)
    assert response.status_code == status.HTTP_201_CREATED
    assert len(response.data["used_buy_info"]) == 2

@pytest.mark.django_db
def test_sell_fully_consumes_single_buy(api_client, create_buy_transaction):
    create_buy_transaction(500, 1290)

    data = {
        "type": "SELL",
        "date": "2025-05-15",
        "amount": "500",
        "naira_rate_used_in_transation": "1550"
    }
    response = api_client.post(reverse('transactions-list'), data)
    assert response.status_code == status.HTTP_201_CREATED
    assert len(response.data["used_buy_info"]) == 1

@pytest.mark.django_db
def test_multiple_sells_consume_same_buy(api_client, create_buy_transaction):
    buy = create_buy_transaction(500, 1280)

    data1 = {
        "type": "SELL",
        "date": "2025-05-15",
        "amount": "300",
        "naira_rate_used_in_transation": "1500"
    }
    response1 = api_client.post(reverse('transactions-list'), data1)
    assert response1.status_code == status.HTTP_201_CREATED

    # Second sell
    data2 = {
        "type": "SELL",
        "date": "2025-05-15",
        "amount": "200",
        "naira_rate_used_in_transation": "1500"
    }
    response2 = api_client.post(reverse('transactions-list'), data2)
    assert response2.status_code == status.HTTP_201_CREATED

@pytest.mark.django_db
def test_sell_after_buys_used_up_fails(api_client, create_buy_transaction):
    create_buy_transaction(400, 1290)

    # First sell consumes all
    api_client.post(reverse('transactions-list'), {
        "type": "SELL",
        "date": "2025-05-15",
        "amount": "400",
        "naira_rate_used_in_transation": "1500"
    })

    # Second sell should fail
    response = api_client.post(reverse('transactions-list'), {
        "type": "SELL",
        "amount": "100",
        "naira_rate_used_in_transation": "1500"
    })
    assert response.status_code == status.HTTP_400_BAD_REQUEST
