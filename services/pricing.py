def calculate_new_price(current_price: float, quantity: int, trade_type: str) -> float:
    impact_percent = min(quantity * 0.1, 5.0)  # cap swing at 5% per trade
    if trade_type == "buy":
        return round(float(current_price) * (1 + impact_percent / 100), 2)
    else:
        return round(float(current_price) * (1 - impact_percent / 100), 2)