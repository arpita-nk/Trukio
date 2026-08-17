"""
DigiTrail Gate Entry - FastAPI backend.

Run with:
    uvicorn main:app --reload --port 8000
"""
import os
import shutil
from datetime import datetime, date
from typing import Optional, List

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import or_

import models
import schemas
from database import Base, engine, get_db
from ai_extraction import extract_invoice_data
from codegen import gate_pass_barcode_png, part_qr_png

Base.metadata.create_all(bind=engine)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(title="DigiTrail Gate Entry API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _find_gate_pass(db: Session, code: str) -> models.GatePass:
    """Look up a gate pass by its gate-pass id OR truck number (as the UI allows both)."""
    gp = (
        db.query(models.GatePass)
        .filter(
            or_(
                models.GatePass.gate_pass_id == code,
                models.GatePass.truck_number == code,
            )
        )
        .order_by(models.GatePass.id.desc())
        .first()
    )
    if not gp:
        raise HTTPException(status_code=404, detail="Gate pass not found")
    return gp


def _log_status_event(db: Session, gp: models.GatePass, status: str):
    db.add(models.StatusEvent(gate_pass_pk=gp.id, status=status))


# ---------------------------------------------------------------------------
# Gate Check-In
# ---------------------------------------------------------------------------

@app.post("/api/gate-passes", response_model=schemas.GatePassDetailOut)
async def create_gate_pass(
    truck_number: str = Form(...),
    po_number: str = Form(...),
    files: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
):
    print("\n========== GATE PASS REQUEST ==========")

    print("Truck Number:", truck_number)
    print("PO Number:", po_number)
    print("Number of files:", len(files))
    gp = models.GatePass(truck_number=truck_number.upper(), po_number=po_number, status="CHECKIN")
    db.add(gp)
    db.flush()
    _log_status_event(db, gp, "CHECKIN")

    for f in files:
        dest_path = os.path.join(UPLOAD_DIR, f"{gp.gate_pass_id}_{f.filename}")
        with open(dest_path, "wb") as out:
            shutil.copyfileobj(f.file, out)

        doc = models.InvoiceDocument(
            gate_pass_pk=gp.id,
            filename=f.filename,
            stored_path=dest_path,
            po_number=po_number,
            processing_status="QUEUED_FOR_AI",
        )
        db.add(doc)
        db.flush()

        # Mock AI/OCR extraction - see ai_extraction.py to swap in a real model.
        extracted = extract_invoice_data(f.filename, po_number)
        doc.invoice_number = extracted["invoice_number"]
        doc.invoice_date = extracted["invoice_date"]
        doc.supplier_name = extracted["supplier_name"]
        doc.verification_status = extracted["verification_status"]
        doc.processing_status = "PROCESSED"

        for p in extracted["parts"]:
            db.add(models.Part(
                document_id=doc.id,
                gate_pass_pk=gp.id,
                part_number=p["part_number"],
                quantity=p["quantity"],
                internal_part_number=p["internal_part_number"],
                mismatch=p["mismatch"],
                routing_status="PENDING_QC",
            ))
    print(gp.gate_pass_id)
    db.commit()
    db.refresh(gp)
    return gp


@app.get("/api/gate-passes", response_model=List[schemas.GatePassOut])
def list_gate_passes(
    search: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
):
    print("\n========== GATE PASS REQUEST ==========")

    print("Truck Number:")
    q = db.query(models.GatePass)
    if search:
        like = f"%{search}%"
        q = q.filter(or_(models.GatePass.gate_pass_id.ilike(like), models.GatePass.truck_number.ilike(like)))
    if date_from:
        q = q.filter(models.GatePass.entry_time >= datetime.combine(date_from, datetime.min.time()))
    if date_to:
        q = q.filter(models.GatePass.entry_time <= datetime.combine(date_to, datetime.max.time()))
    return q.order_by(models.GatePass.id.desc()).all()


@app.get("/api/gate-passes/{code}", response_model=schemas.GatePassDetailOut)
def get_gate_pass(code: str, db: Session = Depends(get_db)):
    return _find_gate_pass(db, code)


@app.post("/api/gate-passes/{code}/progress", response_model=schemas.GatePassOut)
def progress_gate_pass(code: str, db: Session = Depends(get_db)):
    gp = _find_gate_pass(db, code)
    states = models.GATE_PASS_STATES
    idx = states.index(gp.status)
    if idx >= len(states) - 1:
        raise HTTPException(status_code=400, detail="Gate pass has reached its final status")
    gp.status = states[idx + 1]
    if gp.status == "CHECKOUT":
        gp.checkout_time = datetime.utcnow()
    _log_status_event(db, gp, gp.status)
    db.commit()
    db.refresh(gp)
    return gp


@app.get("/api/gate-passes/{code}/barcode.png")
def get_barcode(code: str, db: Session = Depends(get_db)):
    gp = _find_gate_pass(db, code)
    png = gate_pass_barcode_png(gp.gate_pass_id)
    return Response(content=png, media_type="image/png")


@app.get("/api/dashboard")
def dashboard(
    search: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
):
    q = db.query(models.GatePass)
    if search:
        like = f"%{search}%"
        q = q.filter(or_(models.GatePass.gate_pass_id.ilike(like), models.GatePass.truck_number.ilike(like)))
    if date_from:
        q = q.filter(models.GatePass.entry_time >= datetime.combine(date_from, datetime.min.time()))
    if date_to:
        q = q.filter(models.GatePass.entry_time <= datetime.combine(date_to, datetime.max.time()))
    rows = q.order_by(models.GatePass.id.desc()).all()

    card = {
        "total": len(rows),
        "checkin": sum(1 for r in rows if r.status == "CHECKIN"),
        "unloading_start": sum(1 for r in rows if r.status == "UNLOADING-START"),
        "unloading_over": sum(1 for r in rows if r.status == "UNLOADING-OVER"),
        "checkout": sum(1 for r in rows if r.status == "CHECKOUT"),
    }
    now = datetime.utcnow()
    row_out = [
        {
            "gate_pass_id": r.gate_pass_id,
            "truck_number": r.truck_number,
            "status": r.status,
            "entry_time": r.entry_time,
            "elapsed_seconds": int(((r.checkout_time or now) - r.entry_time).total_seconds()),
        }
        for r in rows
    ]
    return {"card": card, "rows": row_out}


# ---------------------------------------------------------------------------
# Sort Invoices
# ---------------------------------------------------------------------------

@app.get("/api/gate-passes/{code}/invoices", response_model=List[schemas.InvoiceDocumentOut])
def get_invoices(code: str, db: Session = Depends(get_db)):
    gp = _find_gate_pass(db, code)
    return gp.documents


@app.patch("/api/invoices/{invoice_id}", response_model=schemas.InvoiceDocumentOut)
def update_invoice(invoice_id: int, payload: schemas.InvoiceDocumentUpdate, db: Session = Depends(get_db)):
    doc = db.query(models.InvoiceDocument).get(invoice_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Invoice not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(doc, field, value)
    db.commit()
    db.refresh(doc)
    return doc


@app.patch("/api/parts/{part_id}", response_model=schemas.PartOut)
def update_part(part_id: int, payload: schemas.PartUpdate, db: Session = Depends(get_db)):
    part = db.query(models.Part).get(part_id)
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(part, field, value)
    # Resolving the internal part number clears the mismatch flag, matching the source app.
    if payload.internal_part_number:
        part.mismatch = False
    db.commit()
    db.refresh(part)
    return part


@app.post("/api/parts/print")
def print_parts(part_ids: List[int], db: Session = Depends(get_db)):
    parts = db.query(models.Part).filter(models.Part.id.in_(part_ids)).all()
    for p in parts:
        p.printed = True
        p.invoice_status = "QC"
    db.commit()
    return {"printed": len(parts)}


@app.get("/api/parts/{part_id}/qr.png")
def part_qr(part_id: int, db: Session = Depends(get_db)):
    part = db.query(models.Part).get(part_id)
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    gp = db.query(models.GatePass).get(part.gate_pass_pk)
    png = part_qr_png(gp.gate_pass_id, part.part_number, part.gate_stage)
    return Response(content=png, media_type="image/png")


@app.get(
    "/api/invoices",
    response_model=List[schemas.InvoiceDocumentOut]
)
def get_all_invoices(db: Session = Depends(get_db)):
    invoices = (
        db.query(models.InvoiceDocument)
        .order_by(models.InvoiceDocument.id.desc())
        .all()
    )

    return invoices


# ---------------------------------------------------------------------------
# QC / Part Routing
# ---------------------------------------------------------------------------

@app.get("/api/parts/lookup", response_model=schemas.PartRoutingDetail)
def lookup_part(
    part_number: str,
    db: Session = Depends(get_db)
):
    part_number = part_number.strip()

    if not part_number:
        raise HTTPException(
            status_code=400,
            detail="Part number is required"
        )

    # Find part directly using part number
    part = (
        db.query(models.Part)
        .filter(models.Part.part_number == part_number)
        .order_by(models.Part.id.desc())
        .first()
    )

    if not part:
        raise HTTPException(
            status_code=404,
            detail="Part not found"
        )

    # Find gate pass only internally, if the part has one.
    # User does NOT provide gate_pass_id.
    gp = None

    if part.gate_pass_pk:
        gp = (
            db.query(models.GatePass)
            .filter(models.GatePass.id == part.gate_pass_pk)
            .first()
        )

    # Build routing history
    events = []

    if gp:
        events.append({
            "stage": "Gate Pass Check-in",
            "description": None,
            "timestamp": gp.entry_time
        })

        events.append({
            "stage": "QC Inspection",
            "description": None,
            "timestamp": gp.entry_time
        })

    for ev in part.routing_events:
        events.append({
            "stage": ev.stage,
            "description": ev.description,
            "timestamp": ev.timestamp
        })

    return {
        "part": part,
        "gate_pass_id": gp.gate_pass_id if gp else None,
        "invoice_number": (
            part.document.invoice_number
            if part.document
            else None
        ),
        "events": events,
    }


@app.post("/api/parts/{part_id}/route", response_model=schemas.PartOut)
def route_part(part_id: int, decision: schemas.RouteDecision, db: Session = Depends(get_db)):
    part = db.query(models.Part).get(part_id)
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")

    if decision.action == "QUARANTINE":
        if not decision.description or not decision.description.strip():
            raise HTTPException(status_code=400, detail="A description is mandatory for quarantine")
        part.routing_status = "QUARANTINED"
        stage = "Quarantined"
    elif decision.action == "GRN":
        part.routing_status = "GRN_APPROVED"
        stage = "GRN Approved"
    else:
        raise HTTPException(status_code=400, detail="Unknown action")

    part.routing_description = decision.description
    part.routed_at = datetime.utcnow()
    db.add(models.PartRoutingEvent(part_id=part.id, stage=stage, description=decision.description))
    db.commit()
    db.refresh(part)
    return part


@app.get("/api/parts/pending", response_model=List[schemas.PartOut])
def pending_parts(gate_pass_id: str, db: Session = Depends(get_db)):
    gp = _find_gate_pass(db, gate_pass_id)
    return (
        db.query(models.Part)
        .filter(models.Part.gate_pass_pk == gp.id, models.Part.routing_status.in_(["PENDING_QC", "QUARANTINED"]))
        .all()
    )

@app.get("/api/parts/all", response_model=List[schemas.PartListOut])
def get_all_parts(db: Session = Depends(get_db)):
    rows = (
        db.query(models.Part, models.GatePass)
        .outerjoin(
            models.GatePass,
            models.GatePass.id == models.Part.gate_pass_pk
        )
        .all()
    )

    result = []

    for part, gate_pass in rows:
        result.append({
            "id": part.id,
            "part_number": part.part_number,
            "quantity": part.quantity,
            "internal_part_number": part.internal_part_number,
            "mismatch": part.mismatch,
            "invoice_status": part.invoice_status,
            "gate_stage": part.gate_stage,
            "routing_status": part.routing_status,
            "routing_description": part.routing_description,
            "printed": part.printed,
            "gate_pass_id": gate_pass.gate_pass_id if gate_pass else None,
            "invoice_number": None
        })

    return result
# ---------------------------------------------------------------------------
# Routed Parts List (overview)
# ---------------------------------------------------------------------------

STATUS_MAP = {
    "grn": "GRN_APPROVED",
    "pending": "PENDING_QC",
    "quarantined": "QUARANTINED",
    "completed": "COMPLETED",
}


@app.get("/api/parts/overview")
def parts_overview(search: Optional[str] = None, db: Session = Depends(get_db)):
    counts = {}
    rows_by_status = {}
    for key, routing_status in STATUS_MAP.items():
        q = db.query(models.Part).filter(models.Part.routing_status == routing_status)
        if search:
            like = f"%{search}%"
            q = q.join(models.GatePass, models.Part.gate_pass_pk == models.GatePass.id).filter(
                or_(
                    models.Part.part_number.ilike(like),
                    models.GatePass.gate_pass_id.ilike(like),
                )
            )
        parts = q.order_by(models.Part.id.desc()).all()
        counts[key] = len(parts)
        rows = []
        for p in parts:
            gp = db.query(models.GatePass).get(p.gate_pass_pk)
            rows.append({
                "date": (p.routed_at or gp.entry_time).strftime("%-m/%-d/%Y") if os.name != "nt" else (p.routed_at or gp.entry_time).strftime("%m/%d/%Y"),
                "time": (p.routed_at or gp.entry_time).strftime("%I:%M %p"),
                "gate_pass_id": gp.gate_pass_id,
                "invoice_no": p.document.invoice_number if p.document and p.document.invoice_number else "N/A",
                "part_number": p.part_number,
                "quantity": p.quantity,
                "description": p.routing_description or ("still working" if routing_status == "PENDING_QC" else ""),
                "mismatch": p.mismatch,
                "part_id": p.id,
            })
        rows_by_status[key] = rows

    return {"counts": counts, "rows": rows_by_status}


@app.post("/api/parts/{part_id}/complete", response_model=schemas.PartOut)
def complete_part(part_id: int, db: Session = Depends(get_db)):
    part = db.query(models.Part).get(part_id)
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    if part.routing_status != "GRN_APPROVED":
        raise HTTPException(status_code=400, detail="Only GRN approved parts can be marked completed")
    part.routing_status = "COMPLETED"
    db.add(models.PartRoutingEvent(part_id=part.id, stage="Completed", description="Put away complete"))
    db.commit()
    db.refresh(part)
    return part


@app.get("/")
def root():
    return {"service": "DigiTrail Gate Entry API", "status": "running"}
