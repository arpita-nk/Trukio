"""ORM models"""
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship

from database import Base

# Gate pass lifecycle - strictly ordered, one-directional progression.
GATE_PASS_STATES = ["CHECKIN", "UNLOADING-START", "UNLOADING-OVER", "CHECKOUT"]

# Part routing lifecycle.
PART_ROUTING_STATES = ["PENDING_QC", "QUARANTINED", "GRN_APPROVED", "COMPLETED"]


def new_gate_pass_id() -> str:
    return f"GP-{uuid.uuid4().int % 10_000_000_000_000:013d}"


class GatePass(Base):
    __tablename__ = "gate_passes"

    id = Column(Integer, primary_key=True, index=True)
    gate_pass_id = Column(String, unique=True, index=True, default=new_gate_pass_id)
    truck_number = Column(String, index=True, nullable=False)
    po_number = Column(String, index=True, nullable=False)
    status = Column(String, default="CHECKIN")
    entry_time = Column(DateTime, default=datetime.utcnow)
    checkout_time = Column(DateTime, nullable=True)

    documents = relationship("InvoiceDocument", back_populates="gate_pass", cascade="all, delete-orphan")
    status_events = relationship("StatusEvent", back_populates="gate_pass", cascade="all, delete-orphan")


class StatusEvent(Base):
    """History of gate-pass state transitions, used to compute elapsed time."""
    __tablename__ = "status_events"

    id = Column(Integer, primary_key=True, index=True)
    gate_pass_pk = Column(Integer, ForeignKey("gate_passes.id"))
    status = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    gate_pass = relationship("GatePass", back_populates="status_events")


class InvoiceDocument(Base):
    __tablename__ = "invoice_documents"

    id = Column(Integer, primary_key=True, index=True)
    gate_pass_pk = Column(Integer, ForeignKey("gate_passes.id"))
    filename = Column(String)
    stored_path = Column(String, nullable=True)

    po_number = Column(String, nullable=True)
    invoice_number = Column(String, nullable=True)
    invoice_date = Column(String, nullable=True)
    supplier_name = Column(String, nullable=True)
    verification_status = Column(String, default="PENDING")  # OK | MISMATCH | PENDING
    processing_status = Column(String, default="QUEUED_FOR_AI")  # QUEUED_FOR_AI | PROCESSED

    gate_pass = relationship("GatePass", back_populates="documents")
    parts = relationship("Part", back_populates="document", cascade="all, delete-orphan")


class Part(Base):
    __tablename__ = "parts"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("invoice_documents.id"))
    gate_pass_pk = Column(Integer, ForeignKey("gate_passes.id"))

    part_number = Column(String, index=True)
    quantity = Column(Integer, default=0)
    internal_part_number = Column(String, nullable=True)
    mismatch = Column(Boolean, default=False)

    invoice_status = Column(String, default="OPEN")  # OPEN | QC
    gate_stage = Column(String, default="QC")  # QC | GRN
    routing_status = Column(String, default="PENDING_QC")  # see PART_ROUTING_STATES
    routing_description = Column(Text, nullable=True)
    routed_at = Column(DateTime, nullable=True)
    printed = Column(Boolean, default=False)

    document = relationship("InvoiceDocument", back_populates="parts")
    routing_events = relationship("PartRoutingEvent", back_populates="part", cascade="all, delete-orphan")


class PartRoutingEvent(Base):
    """Timeline entries shown in the QC 'Routing Path' modal."""
    __tablename__ = "part_routing_events"

    id = Column(Integer, primary_key=True, index=True)
    part_id = Column(Integer, ForeignKey("parts.id"))
    stage = Column(String)  # Gate Pass Check-in | QC Inspection | Quarantined | GRN Approved | Completed
    description = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    part = relationship("Part", back_populates="routing_events")
