from pydantic import BaseModel, validator, ValidationError
from typing import Optional
from datetime import date, datetime
from decimal import Decimal
import re

class ReceiptData(BaseModel):
    vendor: str
    transaction_date: date
    amount: Decimal
    category: Optional[str] = 'other'
    raw_text: Optional[str] = ''
    confidence_score: Optional[float] = 0.0
    
    @validator('vendor')
    def validate_vendor(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Vendor name cannot be empty')
        return v.strip()
    
    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be positive')
        return v
    
    @validator('confidence_score')
    def validate_confidence(cls, v):
        if not 0 <= v <= 1:
            raise ValueError('Confidence score must be between 0 and 1')
        return v

def validate_file_type(file):
    """Validate uploaded file type"""
    allowed_extensions = ['.jpg', '.jpeg', '.png', '.pdf', '.txt']
    file_extension = file.name.lower().split('.')[-1]
    if f'.{file_extension}' not in allowed_extensions:
        raise ValidationError(f"File type not supported. Allowed: {', '.join(allowed_extensions)}")
    
    # Check file size (max 10MB)
    if file.size > 10 * 1024 * 1024:
        raise ValidationError("File size too large. Maximum 10MB allowed.")
    
    return True

