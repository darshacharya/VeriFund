import uuid
from typing import Protocol


class PaymentGateway(Protocol):
    async def create_payment(self, amount: float, metadata: dict) -> dict: ...
    async def verify_payment(self, payment_id: str) -> bool: ...


class MockPaymentGateway:
    """Simulates a payment gateway. Always succeeds."""

    async def create_payment(self, amount: float, metadata: dict) -> dict:
        payment_id = f"mock_pay_{uuid.uuid4().hex[:12]}"
        return {"payment_id": payment_id, "status": "completed", "amount": amount}

    async def verify_payment(self, payment_id: str) -> bool:
        return True


payment_gateway = MockPaymentGateway()
