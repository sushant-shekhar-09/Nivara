"""
PII-Safe Logging Filter & Redaction Module for Nivara AI.
Prevents sensitive identifiers (emails, passwords, phone numbers, student IDs)
from leaking into application log sinks.
"""

import re
import logging
from typing import Any

EMAIL_REGEX = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
PHONE_REGEX = re.compile(r"(\+?\d{1,4}[-.\s]?)?(?:\(?\d{2,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,6}")
PASSWORD_REGEX = re.compile(r"(password|pwd|secret)['\"]?\s*[:=]\s*['\"]?([^'\",\s]+)", re.IGNORECASE)

def redact_pii(text: str) -> str:
    """Redacts Personally Identifiable Information (PII) from strings."""
    if not isinstance(text, str):
        text = str(text)
        
    text = EMAIL_REGEX.sub("[REDACTED_EMAIL]", text)
    text = PASSWORD_REGEX.sub(r"\1: [REDACTED_SECRET]", text)
    text = PHONE_REGEX.sub("[REDACTED_PHONE]", text)
    return text

class PIISafeLoggingFilter(logging.Filter):
    """Logging filter that sanitizes log records before emission."""
    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            record.msg = redact_pii(record.msg)
        if record.args:
            if isinstance(record.args, dict):
                record.args = {k: redact_pii(v) if isinstance(v, str) else v for k, v in record.args.items()}
            elif isinstance(record.args, (list, tuple)):
                record.args = tuple(redact_pii(v) if isinstance(v, str) else v for v in record.args)
        return True
