import random
import string


SUPPLIERS = ["ARJAVASAI INT. LTD", "MYSORE PRECISION PARTS", "SVR ELECTRONICS", "KAVERI COMPONENTS"]


def _random_part_number(prefix_len=2):
    letters = "".join(random.choices(string.ascii_uppercase, k=prefix_len))
    digits = "".join(random.choices(string.digits, k=random.choice([6, 7, 8])))
    return f"{letters}{digits}"


def extract_invoice_data(filename: str, po_number: str) -> dict:
    """Return mocked structured data extracted from an invoice document."""
    random.seed(filename)  # deterministic-ish per file for a stable demo

    num_parts = random.randint(4, 7)
    num_mismatched = random.randint(1, 3)

    parts = []
    for i in range(num_parts):
        mismatch = i >= (num_parts - num_mismatched)
        parts.append({
            "part_number": _random_part_number(),
            "quantity": random.choice([80, 4000, 5000, 4500, 10000, 25000]),
            "internal_part_number": None if mismatch else f"IPN-{random.randint(1, 99):04d}",
            "mismatch": mismatch,
        })

    return {
        "po_number": po_number,
        "invoice_number": None,  # left for manual entry, matching source app
        "invoice_date": None,
        "supplier_name": random.choice(SUPPLIERS),
        "verification_status": "MISMATCH" if num_mismatched else "OK",
        "parts": parts,
    }
