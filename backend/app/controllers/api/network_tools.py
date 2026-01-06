from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import dns.resolver
from typing import List, Dict, Any

router = APIRouter()

class DNSQueryRequest(BaseModel):
    domain: str
    record_type: str = "A"

class DNSRecord(BaseModel):
    type: str
    value: str
    ttl: int
    preference: int = 0 # For MX records

@router.post("/dns-lookup", response_model=List[DNSRecord])
def lookup_dns(request: DNSQueryRequest):
    try:
        results = []
        # Support common record types
        valid_types = ["A", "AAAA", "MX", "NS", "TXT", "SOA", "CNAME"]
        
        # Determine which types to query
        types_to_query = valid_types if request.record_type.upper() == "ALL" else [request.record_type.upper()]

        if request.record_type.upper() != "ALL" and request.record_type.upper() not in valid_types:
             raise HTTPException(status_code=400, detail=f"Invalid record type. Supported: {', '.join(valid_types)} or ALL")

        for r_type in types_to_query:
            try:
                answers = dns.resolver.resolve(request.domain, r_type)
                for rdata in answers:
                    record = {
                        "type": r_type,
                        "value": rdata.to_text(),
                        "ttl": answers.ttl
                    }
                    
                    # handle specific fields like preference for MX
                    if r_type == "MX":
                         record["preference"] = rdata.preference
                         record["value"] = rdata.exchange.to_text()

                    results.append(record)
            except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN):
                continue # Skip if no records found for this type
            except Exception:
                continue # Skip on other errors for specific types when querying ALL

        if not results and request.record_type.upper() != "ALL":
             # If specific query and no results, try to raise informative error
             # But for simplicity, returning empty list is often better for UI
             pass

        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
