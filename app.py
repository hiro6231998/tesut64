from datetime import datetime, timedelta
from fastapi import FastAPI, Request, Form, HTTPException, Depends
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import sessionmaker, Session
from models import engine, Concert, Ticket
import calendar

app = FastAPI()

# テンプレートの設定
templates = Jinja2Templates(directory="templates")

# 静的ファイルの設定
app.mount("/static", StaticFiles(directory="static"), name="static")

# データベースセッション
SessionLocal = sessionmaker(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/", response_class=HTMLResponse)
async def calendar_view(request: Request, year: int = None, month: int = None, search: str = None):
    db = SessionLocal()
    now = datetime.now()
    year = year or now.year
    month = month or now.month
    
    # カレンダーを生成
    cal = calendar.monthcalendar(year, month)
    
    # コンサート情報を取得（検索機能付き）
    query = db.query(Concert)
    if search:
        search = f"%{search}%"
        query = query.filter(
            (Concert.title.ilike(search)) |
            (Concert.artist.ilike(search)) |
            (Concert.venue.ilike(search))
        )
    
    concerts = query.filter(
        Concert.date.between(
            datetime(year, month, 1),
            datetime(year, month + 1 if month < 12 else 1, 1) - timedelta(days=1)
        )
    ).all()
    
    # コンサート情報をカレンダーに追加
    concert_dates = {}
    for concert in concerts:
        date = concert.date.day
        if date not in concert_dates:
            concert_dates[date] = []
        concert_dates[date].append(concert)
    
    # 月の名前を日本語で取得
    month_names = ["1月", "2月", "3月", "4月", "5月", "6月", 
                  "7月", "8月", "9月", "10月", "11月", "12月"]
    month_name = month_names[month - 1]
    
    # 前月と次月の年月を計算
    prev_month = month - 1 if month > 1 else 12
    prev_year = year if month > 1 else year - 1
    next_month = month + 1 if month < 12 else 1
    next_year = year if month < 12 else year + 1
    
    return templates.TemplateResponse(
        "calendar.html",
        {
            "request": request,
            "calendar": cal,
            "year": year,
            "month": month,
            "month_name": month_name,
            "prev_year": prev_year,
            "prev_month": prev_month,
            "next_year": next_year,
            "next_month": next_month,
            "concert_dates": concert_dates,
            "search": search
        }
    )

@app.get("/concert/{concert_id}")
async def concert_detail(request: Request, concert_id: int):
    db = SessionLocal()
    concert = db.query(Concert).filter(Concert.id == concert_id).first()
    if not concert:
        raise HTTPException(status_code=404, detail="コンサートが見つかりません")
    
    # 予約履歴を取得
    tickets = db.query(Ticket).filter(Ticket.concert_id == concert_id).all()
    
    return templates.TemplateResponse(
        "concert_detail.html",
        {
            "request": request,
            "concert": concert,
            "tickets": tickets
        }
    )

@app.post("/book_ticket/{concert_id}")
async def book_ticket(
    request: Request,
    concert_id: int,
    user_name: str = Form(...),
    email: str = Form(...),
    quantity: int = Form(...)
):
    db = SessionLocal()
    concert = db.query(Concert).filter(Concert.id == concert_id).first()
    if not concert:
        raise HTTPException(status_code=404, detail="コンサートが見つかりません")
    
    if concert.available_seats < quantity:
        raise HTTPException(status_code=400, detail="十分な座席がありません")
    
    total_price = concert.price * quantity
    ticket = Ticket(
        concert_id=concert_id,
        user_name=user_name,
        email=email,
        quantity=quantity,
        total_price=total_price,
        purchase_date=datetime.now()
    )
    
    concert.available_seats -= quantity
    db.add(ticket)
    db.commit()
    
    return RedirectResponse(url=f"/concert/{concert_id}", status_code=303)

@app.get("/add_concert", response_class=HTMLResponse)
async def add_concert_form(request: Request):
    return templates.TemplateResponse(
        "add_concert.html",
        {"request": request}
    )

@app.post("/add_concert")
async def add_concert(
    request: Request,
    title: str = Form(...),
    artist: str = Form(...),
    date: str = Form(...),
    time: str = Form(...),
    venue: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    available_seats: int = Form(...)
):
    db = SessionLocal()
    concert_date = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
    
    concert = Concert(
        title=title,
        artist=artist,
        date=concert_date,
        venue=venue,
        description=description,
        price=price,
        available_seats=available_seats
    )
    
    db.add(concert)
    db.commit()
    
    return RedirectResponse(url="/", status_code=303)

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8083)
            