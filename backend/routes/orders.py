from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from ..models.order import OrderCreateRequest, OrderResponse, OrderSide
from ..services.portfolio_service import execute_order, get_orders

router = APIRouter(prefix="/api/orders", tags=["Orders & Trading"])

@router.get("", response_model=List[OrderResponse], summary="List all orders")
def list_orders(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter: ALL, EXECUTED, PENDING, CANCELLED")
):
    """
    Returns order book history and statuses.
    """
    return get_orders(status=status_filter)

@router.post("/buy", response_model=OrderResponse, status_code=status.HTTP_201_CREATED, summary="Place a paper BUY order")
def place_buy_order(order_req: OrderCreateRequest):
    """
    Simulates a paper BUY order. Validates available virtual cash/margin and adds to delivery or intraday holdings.
    """
    order_req.side = OrderSide.BUY
    try:
        return execute_order(order_req)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/sell", response_model=OrderResponse, status_code=status.HTTP_201_CREATED, summary="Place a paper SELL order")
def place_sell_order(order_req: OrderCreateRequest):
    """
    Simulates a paper SELL order. Validates existing delivery holdings for CNC or creates a short position for MIS.
    """
    order_req.side = OrderSide.SELL
    try:
        return execute_order(order_req)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
