"""Pydantic request/response schemas."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class PartOut(BaseModel):
    id: int
    part_number: str
    quantity: int
    internal_part_number: Optional[str] = None
    mismatch: bool
    invoice_status: str
    gate_stage: str
    routing_status: str
    routing_description: Optional[str] = None
    printed: bool

    class Config:
        from_attributes = True

class PartListOut(BaseModel):
    id: int
    part_number: str
    quantity: int
    internal_part_number: Optional[str] = None
    mismatch: bool
    invoice_status: str
    gate_stage: str
    routing_status: str
    routing_description: Optional[str] = None
    printed: bool

    gate_pass_id: Optional[str] = None
    invoice_number: Optional[str] = None

    class Config:
        from_attributes = True


class PartUpdate(BaseModel):
    part_number: Optional[str] = None
    quantity: Optional[int] = None
    internal_part_number: Optional[str] = None


class RoutingEventOut(BaseModel):
    stage: str
    description: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True


class PartRoutingDetail(BaseModel):
    part: PartOut
    gate_pass_id: Optional[str] = None
    invoice_number: Optional[str] = None
    events: List[RoutingEventOut]

    class Config:
        from_attributes = True


class RouteDecision(BaseModel):
    action: str  # "GRN" | "QUARANTINE"
    description: Optional[str] = None


class InvoiceDocumentOut(BaseModel):
    id: int
    filename: str
    po_number: Optional[str] = None
    invoice_number: Optional[str] = None
    invoice_date: Optional[str] = None
    supplier_name: Optional[str] = None
    verification_status: str
    processing_status: str
    parts: List[PartOut] = []

    class Config:
        from_attributes = True


class InvoiceDocumentUpdate(BaseModel):
    po_number: Optional[str] = None
    invoice_number: Optional[str] = None
    invoice_date: Optional[str] = None
    supplier_name: Optional[str] = None


class GatePassOut(BaseModel):
    id: int
    gate_pass_id: str
    truck_number: str
    po_number: str
    status: str
    entry_time: datetime
    checkout_time: Optional[datetime] = None

    class Config:
        from_attributes = True


class GatePassDetailOut(GatePassOut):
    documents: List[InvoiceDocumentOut] = []

    class Config:
        from_attributes = True


class DashboardCard(BaseModel):
    total: int
    checkin: int
    unloading_start: int
    unloading_over: int
    checkout: int


class DashboardRow(BaseModel):
    gate_pass_id: str
    truck_number: str
    status: str
    entry_time: datetime
    elapsed_seconds: int
