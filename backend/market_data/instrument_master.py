"""
StockSense-AI: Comprehensive Instrument Master
Defines and indexes Indian equities, indices, derivatives (F&O), commodities, ETFs, and global indices.
"""
from typing import Dict, List, Optional, Any
from .base import InstrumentMetadata


class InstrumentMaster:
    """
    Central directory and query engine for all tradable and trackable financial instruments.
    """

    def __init__(self):
        self._instruments: Dict[str, InstrumentMetadata] = {}
        self._symbol_index: Dict[str, str] = {}  # symbol.upper() -> instrument_id
        self._init_instruments()

    def _register(self, item: InstrumentMetadata):
        self._instruments[item.instrument_id] = item
        self._symbol_index[item.symbol.upper()] = item.instrument_id

    def _init_instruments(self):
        # -------------------------------------------------------------
        # 1. INDIAN BENCHMARK & SECTOR INDICES (Screenshot 4)
        # -------------------------------------------------------------
        indices = [
            ("IDX_NIFTY50", "NIFTY 50", "NIFTY 50 Benchmark Index", "NSE", "INDEX", "index", "Benchmark"),
            ("IDX_SENSEX", "SENSEX", "BSE SENSEX 30 Benchmark Index", "BSE", "INDEX", "index", "Benchmark"),
            ("IDX_BANKNIFTY", "BANK NIFTY", "Nifty Bank Sectoral Index", "NSE", "INDEX", "index", "Banking"),
            ("IDX_FINNIFTY", "FIN NIFTY", "Nifty Financial Services Index", "NSE", "INDEX", "index", "Financial Services"),
            ("IDX_BANKEX", "BANKEX", "BSE Bankex Index", "BSE", "INDEX", "index", "Banking"),
            ("IDX_MIDCPNIFTY", "MIDCPNIFTY", "Nifty Midcap Select Index", "NSE", "INDEX", "index", "Midcap"),
            ("IDX_INDIAVIX", "INDIA VIX", "India Volatility Benchmark Index", "NSE", "INDEX", "index", "Volatility"),
            ("IDX_NIFTYNXT50", "NIFTYNXT50", "Nifty Next 50 Index", "NSE", "INDEX", "index", "Large Cap"),
        ]
        for i_id, sym, name, exch, itype, cat, sec in indices:
            self._register(
                InstrumentMetadata(
                    instrument_id=i_id,
                    symbol=sym,
                    name=name,
                    exchange=exch,
                    instrument_type=itype,
                    category=cat,
                    sector=sec,
                    lot_size=1,
                    tick_size=0.05,
                )
            )

        # -------------------------------------------------------------
        # 2. GLOBAL BENCHMARK INDICES (Screenshot 4)
        # -------------------------------------------------------------
        global_indices = [
            ("GLB_DXY", "DOLLAR INDEX", "US Dollar Index Spot", "GLOBAL", "GLOBAL_INDEX", "global_index", "Currency"),
            ("GLB_US10Y", "US 10 YR TREASURY", "United States 10 Year Benchmark Yield", "GLOBAL", "GLOBAL_INDEX", "global_index", "Bonds"),
            ("GLB_DJI", "DOW JONES", "Dow Jones Industrial Average", "GLOBAL", "GLOBAL_INDEX", "global_index", "USA"),
            ("GLB_RUT", "RUSSELL 2000", "Russell 2000 Small Cap Index", "GLOBAL", "GLOBAL_INDEX", "global_index", "USA"),
            ("GLB_SPX", "S&P 500", "Standard & Poor's 500 Index", "GLOBAL", "GLOBAL_INDEX", "global_index", "USA"),
            ("GLB_NDX", "NASDAQ", "Nasdaq Composite Technology Index", "GLOBAL", "GLOBAL_INDEX", "global_index", "USA"),
            ("GLB_TSX", "TSX", "Toronto Stock Exchange Composite", "GLOBAL", "GLOBAL_INDEX", "global_index", "Americas"),
            ("GLB_N225", "NIKKEI 225", "Tokyo Nikkei 225 Index", "GLOBAL", "GLOBAL_INDEX", "global_index", "Asia"),
            ("GLB_HSI", "HANG SENG", "Hong Kong Hang Seng Index", "GLOBAL", "GLOBAL_INDEX", "global_index", "Asia"),
            ("GLB_FTSE", "FTSE 100", "London Stock Exchange FTSE 100", "GLOBAL", "GLOBAL_INDEX", "global_index", "Europe"),
            ("GLB_DAX", "DAX 40", "Frankfurt DAX Performance Index", "GLOBAL", "GLOBAL_INDEX", "global_index", "Europe"),
            ("GLB_CAC", "CAC 40", "Paris Euronext CAC 40", "GLOBAL", "GLOBAL_INDEX", "global_index", "Europe"),
        ]
        for i_id, sym, name, exch, itype, cat, sec in global_indices:
            self._register(
                InstrumentMetadata(
                    instrument_id=i_id,
                    symbol=sym,
                    name=name,
                    exchange=exch,
                    instrument_type=itype,
                    category=cat,
                    sector=sec,
                    lot_size=1,
                    tick_size=0.01,
                )
            )

        # -------------------------------------------------------------
        # 3. NSE & BSE EQUITIES (Comprehensive Bluechips & Movers)
        # -------------------------------------------------------------
        equities = [
            ("EQ_RELIANCE", "RELIANCE", "Reliance Industries Ltd.", "NSE", "Oil & Gas / Conglomerate", "INE002A01018"),
            ("EQ_TCS", "TCS", "Tata Consultancy Services Ltd.", "NSE", "Information Technology", "INE467B01029"),
            ("EQ_HDFCBANK", "HDFCBANK", "HDFC Bank Ltd.", "NSE", "Banking & Financials", "INE040A01034"),
            ("EQ_INFY", "INFY", "Infosys Ltd.", "NSE", "Information Technology", "INE009A01021"),
            ("EQ_ICICIBANK", "ICICIBANK", "ICICI Bank Ltd.", "NSE", "Banking & Financials", "INE090A01021"),
            ("EQ_SBIN", "SBIN", "State Bank of India", "NSE", "PSU Banking", "INE062A01020"),
            ("EQ_BHARTIARTL", "BHARTIARTL", "Bharti Airtel Ltd.", "NSE", "Telecommunications", "INE397D01024"),
            ("EQ_TATAMOTORS", "TATAMOTORS", "Tata Motors Passenger Vehicles & EV", "NSE", "Automobile", "INE155A01022"),
            ("EQ_LT", "LT", "Larsen & Toubro Ltd.", "NSE", "Infrastructure & Capital Goods", "INE018A01030"),
            ("EQ_ITC", "ITC", "ITC Ltd.", "NSE", "FMCG / Consumer Goods", "INE154A01025"),
            ("EQ_BAJFINANCE", "BAJFINANCE", "Bajaj Finance Ltd.", "NSE", "NBFC & Lending", "INE296A01024"),
            ("EQ_ZOMATO", "ZOMATO", "Zomato Ltd.", "NSE", "Consumer Internet / Quick Commerce", "INE758T01015"),
            ("EQ_SUZLON", "SUZLON", "Suzlon Energy Ltd.", "NSE", "Renewable Energy", "INE040H01021"),
            ("EQ_TATASTEEL", "TATASTEEL", "Tata Steel Ltd.", "NSE", "Metals & Mining", "INE081A01020"),
            ("EQ_NTPC", "NTPC", "NTPC Ltd.", "NSE", "Power Generation", "INE733E01010"),
            ("EQ_IRFC", "IRFC", "Indian Railway Finance Corporation", "NSE", "Railway Infrastructure", "INE053F01010"),
            ("EQ_YESBANK", "YESBANK", "Yes Bank Ltd.", "NSE", "Banking", "INE528G01035"),
            ("EQ_TATAPOWER", "TATAPOWER", "Tata Power Company Ltd.", "NSE", "Power & Utilities", "INE245A01021"),
            ("EQ_ONGC", "ONGC", "Oil and Natural Gas Corporation Ltd.", "NSE", "Oil & Gas Exploration", "INE213A01029"),
            ("EQ_RVNL", "RVNL", "Rail Vikas Nigam Ltd.", "NSE", "Rail Infrastructure", "INE415G01027"),
            ("EQ_IDEA", "IDEA", "Vodafone Idea Ltd.", "NSE", "Telecommunications", "INE669E01016"),
            ("EQ_JIOFIN", "JIOFIN", "Jio Financial Services Ltd.", "NSE", "Financial Services", "INE758E01017"),
            ("EQ_NHPC", "NHPC", "NHPC Ltd.", "NSE", "Hydroelectric Power", "INE848E01016"),
            ("EQ_IREDA", "IREDA", "Indian Renewable Energy Development Agency", "NSE", "Clean Energy NBFC", "INE202E01016"),
            ("EQ_IOC", "IOC", "Indian Oil Corporation Ltd.", "NSE", "Oil Refining & Marketing", "INE242A01010"),
            ("EQ_IDFCFIRSTB", "IDFCFIRSTB", "IDFC First Bank Ltd.", "NSE", "Banking", "INE092T01019"),
            ("EQ_COFORGE", "COFORGE", "Coforge Ltd.", "NSE", "Technology", "INE591G01017"),
            ("EQ_DIXON", "DIXON", "Dixon Technologies (India) Ltd.", "NSE", "Electronics Manufacturing", "INE935N01020"),
            ("EQ_GRASIM", "GRASIM", "Grasim Industries Ltd.", "NSE", "Diversified", "INE047A01021"),
            ("EQ_DMART", "DMART", "Avenue Supermarts Ltd. (DMart)", "NSE", "Retail", "INE192R01011"),
            ("EQ_BANKBARODA", "BANKBARODA", "Bank of Baroda", "NSE", "PSU Banking", "INE077A01010"),
            ("EQ_PNB", "PNB", "Punjab National Bank", "NSE", "PSU Banking", "INE160A01022"),
            ("EQ_CANBK", "CANBK", "Canara Bank", "NSE", "PSU Banking", "INE476A01022"),
            ("EQ_UNIONBANK", "UNIONBANK", "Union Bank of India", "NSE", "PSU Banking", "INE692A01016"),
            ("EQ_ABB", "ABB", "ABB India Ltd.", "NSE", "Industrial Engineering", "INE117A01022"),
            ("EQ_WIPRO", "WIPRO", "Wipro Ltd.", "NSE", "Information Technology", "INE075A01022"),
            ("EQ_MARUTI", "MARUTI", "Maruti Suzuki India Ltd.", "NSE", "Automobile", "INE585B01010"),
            ("EQ_SUNPHARMA", "SUNPHARMA", "Sun Pharmaceutical Industries Ltd.", "NSE", "Pharmaceuticals", "INE044A01036"),
            ("EQ_AXISBANK", "AXISBANK", "Axis Bank Ltd.", "NSE", "Banking & Financials", "INE238A01034"),
            ("EQ_KOTAKBANK", "KOTAKBANK", "Kotak Mahindra Bank Ltd.", "NSE", "Banking & Financials", "INE237A01028"),
        ]
        for i_id, sym, name, exch, sec, isin in equities:
            self._register(
                InstrumentMetadata(
                    instrument_id=i_id,
                    symbol=sym,
                    name=name,
                    exchange=exch,
                    instrument_type="EQUITY",
                    category="equity",
                    sector=sec,
                    lot_size=1,
                    tick_size=0.05,
                    isin=isin,
                )
            )

        # -------------------------------------------------------------
        # 4. ETF DISCOVERY DIRECTORY (Screenshot 5)
        # -------------------------------------------------------------
        etfs = [
            ("ETF_JUNIORBEES", "JUNIORBEES", "Nippon India ETF Nifty Next 50 Junior BeES", "NSE", "Index", 744.73),
            ("ETF_AUTOIETF", "AUTOIETF", "ICICI Prudential Nifty Auto ETF", "NSE", "Sector", 26.48),
            ("ETF_AUTOBEES", "AUTOBEES", "Nippon India Nifty Auto ETF", "NSE", "Sector", 264.79),
            ("ETF_AONEGOLD", "AONEGOLD", "Angel One Gold ETF", "NSE", "Gold", 13.52),
            ("ETF_AONELIQUID", "AONELIQUID", "Angel One Nifty 1D Rate Liquid ETF", "NSE", "Debt", 1081.94),
            ("ETF_AONETMMQ50", "AONETMMQ50", "Angel One Nifty Total Market Q50 ETF", "NSE", "Index", 24.15),
            ("ETF_TATAGOLD", "TATAGOLD", "Tata Gold Exchange Traded Fund", "NSE", "Gold", 14.09),
            ("ETF_LIQUIDCASE", "LIQUIDCASE", "Zerodha Nifty 1D Rate Liquid ETF", "NSE", "Debt", 116.47),
            ("ETF_TATSILV", "TATSILV", "Tata Silver Exchange Traded Fund", "NSE", "Silver", 94.20),
            ("ETF_MONQ50", "MONQ50", "Motilal Oswal Nasdaq Q 50 ETF", "NSE", "Global", 236.71),
            ("ETF_MAFANG", "MAFANG", "Mirae Asset NYSE FANG+ ETF", "NSE", "Global", 267.62),
            ("ETF_MASPTOP50", "MASPTOP50", "Mirae Asset S&P 500 Top 50 ETF", "NSE", "Global", 104.26),
            ("ETF_MODEFENCE", "MODEFENCE", "Motilal Oswal Nifty India Defence ETF", "NSE", "Sector", 99.84),
            ("ETF_MOPSE", "MOPSE", "Motilal Oswal Nifty PSE ETF", "NSE", "Index", 94.07),
            ("ETF_GROWWPSE", "GROWWPSE", "Groww Nifty PSE ETF", "NSE", "Sector", 92.95),
            ("ETF_GOLDBEES", "GOLDBEES", "Nippon India ETF Gold BeES", "NSE", "Gold", 68.45),
            ("ETF_SILVERBEES", "SILVERBEES", "Nippon India ETF Silver BeES", "NSE", "Silver", 89.10),
            ("ETF_NIFTYBEES", "NIFTYBEES", "Nippon India ETF Nifty 50 BeES", "NSE", "Index", 258.90),
            ("ETF_BANKBEES", "BANKBEES", "Nippon India ETF Bank BeES", "NSE", "Sector", 558.20),
            ("ETF_ITBEES", "ITBEES", "Nippon India ETF Nifty IT BeES", "NSE", "Sector", 42.15),
        ]
        for i_id, sym, name, exch, sec, _ in etfs:
            self._register(
                InstrumentMetadata(
                    instrument_id=i_id,
                    symbol=sym,
                    name=name,
                    exchange=exch,
                    instrument_type="ETF",
                    category="etf",
                    sector=sec,
                    lot_size=1,
                    tick_size=0.01,
                )
            )

        # -------------------------------------------------------------
        # 5. COMMODITIES CONTRACTS (Screenshot 3)
        # -------------------------------------------------------------
        commodities = [
            ("COMM_CRUDEOIL", "CRUDE OIL", "Crude Oil Futures 100 Barrels", "MCX", "Energy", "19 Nov 2026", 100),
            ("COMM_NATGAS", "NATURAL GAS", "Natural Gas Futures 1250 mmBtu", "MCX", "Energy", "27 Oct 2026", 1250),
            ("COMM_GOLD", "GOLD", "Gold 1 Kg Standard Contract", "MCX", "Precious Metals", "04 Dec 2026", 1),
            ("COMM_SILVER", "SILVER", "Silver 30 Kg Standard Contract", "MCX", "Precious Metals", "04 Dec 2026", 30),
            ("COMM_CRUDEOILM", "CRUDE OIL MINI", "Crude Oil Mini Futures 10 Barrels", "MCX", "Energy", "19 Nov 2026", 10),
            ("COMM_NATGASM", "NATURAL GAS MINI", "Natural Gas Mini Futures 250 mmBtu", "MCX", "Energy", "27 Oct 2026", 250),
            ("COMM_GOLDM", "GOLD MINI", "Gold Mini 100 Grams Contract", "MCX", "Precious Metals", "05 Nov 2026", 10),
            ("COMM_SILVERM", "SILVER MINI", "Silver Mini 5 Kg Contract", "MCX", "Precious Metals", "04 Dec 2026", 5),
            ("COMM_COPPER", "COPPER", "Copper Futures 2500 Kg", "MCX", "Base Metals", "30 Nov 2026", 2500),
        ]
        for i_id, sym, name, exch, sec, exp, lot in commodities:
            self._register(
                InstrumentMetadata(
                    instrument_id=i_id,
                    symbol=sym,
                    name=name,
                    exchange=exch,
                    instrument_type="COMMODITY",
                    category="commodity",
                    sector=sec,
                    lot_size=lot,
                    tick_size=1.0 if "GOLD" in sym or "CRUDE" in sym else 0.1,
                    expiry=exp,
                )
            )

        # -------------------------------------------------------------
        # 6. INDEX DERIVATIVES (F&O) - Screenshot 1
        # -------------------------------------------------------------
        # Nearest NIFTY Future
        self._register(
            InstrumentMetadata(
                instrument_id="FUT_NIFTY_27OCT",
                symbol="NIFTY 27 Oct 2026",
                name="NIFTY Index Futures Near Month",
                exchange="NSE",
                instrument_type="FUT_INDEX",
                category="fno_index",
                sector="Benchmark",
                lot_size=25,
                tick_size=0.05,
                expiry="27 Oct 2026",
            )
        )
        self._register(
            InstrumentMetadata(
                instrument_id="FUT_BANKNIFTY_27OCT",
                symbol="BANKNIFTY 27 Oct 2026",
                name="BANKNIFTY Index Futures Near Month",
                exchange="NSE",
                instrument_type="FUT_INDEX",
                category="fno_index",
                sector="Banking",
                lot_size=15,
                tick_size=0.05,
                expiry="27 Oct 2026",
            )
        )

        # NIFTY Weekly Options (Strikes: 22800, 22850, 22900, 22950, 23000)
        strikes = [22800, 22850, 22900, 22950, 23000]
        for strike in strikes:
            # CE
            self._register(
                InstrumentMetadata(
                    instrument_id=f"OPT_NIFTY_19OCT_{strike}_CE",
                    symbol=f"NIFTY {strike} 19 Oct 2026 CE",
                    name=f"NIFTY {strike} Call Option",
                    exchange="NSE",
                    instrument_type="OPT_INDEX",
                    category="fno_index",
                    sector="Options",
                    lot_size=25,
                    tick_size=0.05,
                    expiry="19 Oct 2026",
                    strike_price=float(strike),
                    option_type="CE",
                )
            )
            # PE
            self._register(
                InstrumentMetadata(
                    instrument_id=f"OPT_NIFTY_19OCT_{strike}_PE",
                    symbol=f"NIFTY {strike} 19 Oct 2026 PE",
                    name=f"NIFTY {strike} Put Option",
                    exchange="NSE",
                    instrument_type="OPT_INDEX",
                    category="fno_index",
                    sector="Options",
                    lot_size=25,
                    tick_size=0.05,
                    expiry="19 Oct 2026",
                    strike_price=float(strike),
                    option_type="PE",
                )
            )

        # -------------------------------------------------------------
        # 7. STOCKS DERIVATIVES (F&O) - Screenshot 2
        # -------------------------------------------------------------
        fno_stocks = [
            ("FUT_BANKBARODA_27OCT", "BANKBARODA 27 Oct 2026", "Bank of Baroda Oct Futures", "PSU Bank", 5850),
            ("FUT_BANKINDIA_27OCT", "BANKINDIA 27 Oct 2026", "Bank of India Oct Futures", "PSU Bank", 4500),
            ("FUT_CANBK_27OCT", "CANBK 27 Oct 2026", "Canara Bank Oct Futures", "PSU Bank", 6750),
            ("FUT_PNB_27OCT", "PNB 27 Oct 2026", "Punjab National Bank Oct Futures", "PSU Bank", 8000),
            ("FUT_SBIN_27OCT", "SBIN 27 Oct 2026", "State Bank of India Oct Futures", "PSU Bank", 750),
            ("FUT_UNIONBANK_27OCT", "UNIONBANK 27 Oct 2026", "Union Bank of India Oct Futures", "PSU Bank", 8250),
            ("FUT_FEDERALBNK_27OCT", "FEDERALBNK 27 Oct 2026", "Federal Bank Oct Futures", "Banking", 5000),
            ("FUT_ABB_27OCT", "ABB 27 Oct 2026", "ABB India Oct Futures", "Infra", 125),
            ("FUT_COFORGE_27OCT", "COFORGE 27 Oct 2026", "Coforge Oct Futures", "Technology", 150),
            ("FUT_DIXON_27OCT", "DIXON 27 Oct 2026", "Dixon Tech Oct Futures", "Consumer", 100),
            ("FUT_GRASIM_27OCT", "GRASIM 27 Oct 2026", "Grasim Industries Oct Futures", "Cement", 250),
            ("FUT_DMART_27OCT", "DMART 27 Oct 2026", "Avenue Supermarts Oct Futures", "Retail", 150),
        ]
        for i_id, sym, name, sec, lot in fno_stocks:
            self._register(
                InstrumentMetadata(
                    instrument_id=i_id,
                    symbol=sym,
                    name=name,
                    exchange="NSE",
                    instrument_type="FUT_STOCK",
                    category="fno_stock",
                    sector=sec,
                    lot_size=lot,
                    tick_size=0.05,
                    expiry="27 Oct 2026",
                )
            )

    def get_instrument(self, instrument_id: str) -> Optional[InstrumentMetadata]:
        return self._instruments.get(instrument_id)

    def get_by_symbol(self, symbol: str) -> Optional[InstrumentMetadata]:
        i_id = self._symbol_index.get(symbol.upper().strip())
        return self._instruments.get(i_id) if i_id else None

    def get_all(self) -> List[InstrumentMetadata]:
        return list(self._instruments.values())

    def get_by_category(self, category: str) -> List[InstrumentMetadata]:
        cat_lower = category.lower().strip()
        return [inst for inst in self._instruments.values() if inst.category == cat_lower]

    def search_instruments(
        self,
        q: Optional[str] = None,
        category: Optional[str] = None,
        exchange: Optional[str] = None,
        sector: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
    ) -> Dict[str, Any]:
        """
        Multi-field indexed search with filtering, pagination, and total count.
        """
        results = list(self._instruments.values())

        if category and category.lower() != "all":
            c = category.lower().strip()
            results = [r for r in results if r.category == c or r.instrument_type.lower() == c]

        if exchange and exchange.upper() != "ALL":
            e = exchange.upper().strip()
            results = [r for r in results if r.exchange == e]

        if sector and sector.upper() != "ALL":
            s = sector.lower().strip()
            results = [r for r in results if r.sector and s in r.sector.lower()]

        if q and q.strip():
            query = q.lower().strip()
            results = [
                r
                for r in results
                if query in r.symbol.lower()
                or query in r.name.lower()
                or (r.isin and query in r.isin.lower())
                or query in r.exchange.lower()
                or query in r.instrument_type.lower()
            ]

        total = len(results)
        start_idx = (max(1, page) - 1) * limit
        end_idx = start_idx + limit
        paginated = results[start_idx:end_idx]

        return {
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit if limit > 0 else 1,
            "instruments": [item.dict() for item in paginated],
        }


# Global singleton instance
instrument_master = InstrumentMaster()
