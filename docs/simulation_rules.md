# Paper Trading & Simulation Rules

## 1. Simulated Capital & Margins
- **Starting Virtual Balance**: Default allocation of ₹10,00,000 (10 Lakh INR) in virtual simulation capital per account.
- **Delivery (CNC - Cash 'N Carry)**: Requires 100% virtual cash margin. Stocks are credited to the user's paper demat holdings upon execution.
- **Intraday (MIS - Margin Intraday Square-off)**: Offers up to 5x virtual leverage. All open MIS positions are automatically squared off at 03:20 PM IST in the simulation.

## 2. Order Execution Logic
- **Market Orders**: Filled instantly against current simulated LTP (Last Traded Price) with a simulated slippage model (±0.05% typical).
- **Limit Orders**: Placed in an `OPEN` state. Triggered and filled when market tick satisfies the limit price condition (price <= limit for BUY, price >= limit for SELL).
- **Stop-Loss Orders**: Triggered when the market crosses the specified trigger price, then executed as Market (SL-M) or Limit (SL).
- **Circuit Limits**: Simulated upper and lower circuit limits (typically 5%, 10%, or 20%) prevent fills beyond defined bounds.

## 3. Simulated Transaction Charges
To provide a realistic trading experience, the simulation models realistic Indian regulatory and statutory charges:
- **Brokerage**: ₹0 for delivery, flat ₹20 or 0.03% (whichever is lower) for intraday.
- **STT (Securities Transaction Tax)**: 0.1% on delivery buy/sell, 0.025% on intraday sell.
- **Exchange Turnover Charges & GST**: Standard simulated rates for realistic net P&L calculation.
