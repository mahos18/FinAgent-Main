def _sanitize_user_for_response(user) -> dict:
    """
    Ensure occupation is a string or default, monthlyIncome is int or default.
    """
    return {
        "id": int(user.id),
        "email": str(user.email),
        "name": str(user.name),
        # Provide defaults instead of None if you want consistent types in clients:
        "occupation": user.occupation if user.occupation is not None else "unspecified",
        "monthlyIncome": int(user.monthlyIncome) if user.monthlyIncome is not None else 0,
        "is_active": bool(user.is_active),
    }
