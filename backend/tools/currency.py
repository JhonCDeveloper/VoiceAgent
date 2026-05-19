"""
Name: currency_convert
Description: Convert currency amounts based on real-time exchange rates.
Params:
    amount (float): The amount to convert.
    from_currency (str): The three-letter currency code to convert from (e.g. USD).
    to_currency (str): The three-letter currency code to convert to (e.g. EUR).
Returns:
    dict: A dictionary containing converted_amount, rate, from_currency, and to_currency.
"""

import requests

def currency_convert(amount: float, from_currency: str, to_currency: str) -> dict:
    """
    Convert currency amounts using the open, unauthenticated ExchangeRate-API.
    
    Args:
        amount (float): The amount to convert.
        from_currency (str): The base currency code.
        to_currency (str): The target currency code.
        
    Returns:
        dict: A dictionary with 'converted_amount', 'rate', 'from_currency', and 'to_currency'.
    """
    from_currency = from_currency.upper()
    to_currency = to_currency.upper()
    
    url = f"https://open.er-api.com/v6/latest/{from_currency}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        if data.get("result") == "success":
            rates = data.get("rates", {})
            
            if to_currency not in rates:
                return {
                    "error": f"Target currency '{to_currency}' not supported.",
                    "converted_amount": 0.0,
                    "rate": 0.0,
                    "from_currency": from_currency,
                    "to_currency": to_currency
                }
                
            rate = rates[to_currency]
            converted_amount = amount * rate
            
            return {
                "converted_amount": round(converted_amount, 2),
                "rate": rate,
                "from_currency": from_currency,
                "to_currency": to_currency
            }
        else:
            return {
                "error": data.get("error-type", "Unknown API error"),
                "converted_amount": 0.0,
                "rate": 0.0,
                "from_currency": from_currency,
                "to_currency": to_currency
            }
    except Exception as e:
        return {
            "error": f"Currency conversion request failed: {str(e)}",
            "converted_amount": 0.0,
            "rate": 0.0,
            "from_currency": from_currency,
            "to_currency": to_currency
        }
