"""Barcode (gate pass) and QR code (part label) image generation."""
import io
import barcode  # type: ignore
from barcode.writer import ImageWriter  # type: ignore
import qrcode


def gate_pass_barcode_png(code: str) -> bytes:
    """Code128 barcode PNG for a gate pass id."""
    buf = io.BytesIO()
    code128 = barcode.get("code128", code, writer=ImageWriter())
    code128.write(buf, options={"write_text": True, "module_height": 10, "font_size": 10})
    return buf.getvalue()


def part_qr_png(gate_pass_id: str, part_number: str, stage: str = "QC") -> bytes:
    """QR code PNG for a printable part label, encoding gate pass + part."""
    payload = f"{gate_pass_id}|{part_number}|{stage}"
    img = qrcode.make(payload, box_size=8, border=2)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()
