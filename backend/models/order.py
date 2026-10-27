from pydantic import BaseModel, Field, field_validator
from typing import Optional
from enum import Enum

class OrderSide(str, Enum):
    BUY = "BUY"
    SELL = "SELL"

class OrderProduct(str, Enum):
    CNC = "CNC"  # Cash & Carry (Delivery)
    MIS = "MIS"  # Margin Intraday Square-off

class OrderType(str, Enum):
    MARKET = "MARKET"
    LIMIT = "LIMIT"
    SL = "SL"

class OrderStatus(str, Enum):
    PENDING = "PENDING"
    EXECUTED = "EXECUTED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"

class OrderCreateRequest(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=20, description="Stock ticker symbol, e.g. TCS")
    side: Optional[OrderSide] = Field(default=OrderSide.BUY, description="BUY or SELL")
    product: Optional[OrderProduct] = Field(default=OrderProduct.CNC, description="CNC or MIS")
    type: Optional[str] = Field(default="BUY", description="Order side / type: BUY, SELL, MARKET, LIMIT")
    quantity: int = Field(default=10, gt=0, description="Quantity of shares")
    price: Optional[float] = Field(default=None, description="Execution or limit price")
    trigger_price: Optional[float] = Field(default=None, description="Trigger price for SL orders")
    user_id: Optional[str] = Field(default="user_default", description="User ID for paper account")

    @field_validator("symbol")
    @classmethod
    def uppercase_symbol(cls, v: str) -> str:
        return v.upper().strip()

class OrderResponse(BaseModel):
    # Step 13 Primary Database Schema Fields
    userId: str = "user_default"
    user_id: Optional[str] = "user_default"
    symbol: str
    type: str = "BUY"
    quantity: int
    price: float
    total: float
    timestamp: str
    status: str = "COMPLETED"

    # Contextual fields for frontend compatibility
    id: Optional[str] = None
    side: Optional[OrderSide] = OrderSide.BUY
    product: Optional[OrderProduct] = OrderProduct.CNC
    total_value: Optional[float] = None
    time: Optional[str] = None
    date: Optional[str] = None
    message: Optional[str] = None
