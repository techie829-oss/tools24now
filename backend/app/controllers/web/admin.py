from fastapi import APIRouter, Request, Depends
from fastapi.responses import HTMLResponse
from app.core.templates import templates

router = APIRouter()

@router.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    return templates.TemplateResponse("admin/login.html", {"request": request})

@router.get("/", response_class=HTMLResponse)
def dashboard_root(request: Request):
    return templates.TemplateResponse("admin/dashboard.html", {"request": request})

@router.get("/dashboard", response_class=HTMLResponse)
def dashboard_page(request: Request):
    return templates.TemplateResponse("admin/dashboard.html", {"request": request})
