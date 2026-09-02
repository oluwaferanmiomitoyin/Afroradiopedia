import ipaddress
import os
import socket
from urllib.parse import urlparse

import httpx
from fastapi import HTTPException

_ALLOWED_HOSTS_ENV = os.getenv("ALLOWED_IMAGE_HOSTS", "")
ALLOWED_HOSTS: set[str] = {
    h.strip().lower() for h in _ALLOWED_HOSTS_ENV.split(",") if h.strip()
}


def validate_image_url(url: str) -> str:
    """Validate an image URL to prevent SSRF attacks (same approach as Blossom's
    mammogram-inference-service)."""
    parsed = urlparse(url)
    if parsed.scheme != "https":
        raise HTTPException(status_code=400, detail="Only HTTPS URLs are allowed")
    hostname = (parsed.hostname or "").lower()
    if not hostname:
        raise HTTPException(status_code=400, detail="Invalid URL")
    if ALLOWED_HOSTS and hostname not in ALLOWED_HOSTS:
        raise HTTPException(status_code=400, detail="Image host not in allowlist")
    try:
        for info in socket.getaddrinfo(hostname, None):
            addr = info[4][0]
            try:
                ip = ipaddress.ip_address(addr)
                if ip.is_private or ip.is_loopback or ip.is_link_local:
                    raise HTTPException(status_code=400, detail="URL resolves to a private address")
            except ValueError:
                pass  # skip unparseable addresses (e.g. scoped IPv6)
    except HTTPException:
        raise
    except OSError as exc:
        raise HTTPException(status_code=400, detail="Cannot resolve hostname") from exc
    return url


async def fetch_image_bytes(url: str) -> bytes:
    validate_image_url(url)
    headers = {"User-Agent": "AfroRadiopedia-AI-Service/1.0"}
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(url, headers=headers)
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Could not fetch image")
    return response.content
