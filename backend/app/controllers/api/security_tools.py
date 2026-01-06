from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import ssl
import socket
from datetime import datetime
from typing import Dict, Any, Optional

router = APIRouter()

class SSLCheckRequest(BaseModel):
    domain: str
    port: int = 443

class SSLCheckResponse(BaseModel):
    valid: bool
    domain: str
    issuer: str
    subject: str
    valid_from: str
    valid_to: str
    days_remaining: int
    version: int
    serial_number: str
    error: Optional[str] = None

@router.post("/ssl-check", response_model=SSLCheckResponse)
def check_ssl(request: SSLCheckRequest):
    hostname = request.domain.strip()
    port = request.port
    
    # Remove protocol if present
    if hostname.startswith("https://"):
        hostname = hostname[8:]
    elif hostname.startswith("http://"):
        hostname = hostname[7:]
    
    # Remove trailing paths
    if "/" in hostname:
        hostname = hostname.split("/")[0]

    context = ssl.create_default_context()
    
    try:
        with socket.create_connection((hostname, port), timeout=5.0) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                
                # Extract Info
                subject = dict(x[0] for x in cert['subject'])
                issuer = dict(x[0] for x in cert['issuer'])
                
                not_before = datetime.strptime(cert['notBefore'], '%b %d %H:%M:%S %Y %Z')
                not_after = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                
                now = datetime.utcnow()
                days_remaining = (not_after - now).days
                
                return {
                    "valid": days_remaining > 0,
                    "domain": hostname,
                    "subject": subject.get('commonName', 'Unknown'),
                    "issuer": issuer.get('organizationName', issuer.get('commonName', 'Unknown')),
                    "valid_from": not_before.strftime('%Y-%m-%d'),
                    "valid_to": not_after.strftime('%Y-%m-%d'),
                    "days_remaining": days_remaining,
                    "version": cert.get('version', 0),
                    "serial_number": str(cert.get('serialNumber', '')),
                }

    except socket.timeout:
         return {
            "valid": False,
            "domain": hostname,
            "issuer": "-",
            "subject": "-",
            "valid_from": "-",
            "valid_to": "-",
            "days_remaining": 0,
            "version": 0,
            "serial_number": "",
            "error": "Connection Timed Out"
        }
    except ssl.SSLError as e:
         return {
            "valid": False,
            "domain": hostname,
            "issuer": "Invalid/Untrusted",
            "subject": "-",
            "valid_from": "-",
            "valid_to": "-",
            "days_remaining": 0,
            "version": 0,
            "serial_number": "",
            "error": f"SSL Error: {e.reason}"
        }
    except Exception as e:
        return {
            "valid": False,
            "domain": hostname,
            "issuer": "-",
            "subject": "-",
            "valid_from": "-",
            "valid_to": "-",
            "days_remaining": 0,
            "version": 0,
            "serial_number": "",
            "error": str(e)
        }

import requests
from fastapi import Header

class HeaderCheckRequest(BaseModel):
    url: str
    user_agent: Optional[str] = None

@router.post("/http-headers")
def check_headers(request: HeaderCheckRequest):
    url = request.url.strip()
    if not url.startswith("http"):
        url = "https://" + url
    
    headers = {}
    if request.user_agent:
        headers["User-Agent"] = request.user_agent
    else:
        headers["User-Agent"] = "Tools24Now/1.0"

    try:
        # verify=False is risky but often requested for debugging tools. 
        # We'll stick to verify=True for security unless specifically needed.
        response = requests.get(url, headers=headers, timeout=10, allow_redirects=True, stream=True)
        response.close() # Close connection immediately as we only need headers

        return {
            "status_code": response.status_code,
            "url": response.url,
            "headers": dict(response.headers),
            "redirects": [r.url for r in response.history]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
