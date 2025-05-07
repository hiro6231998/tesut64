from datetime import datetime, timedelta
from sqlalchemy.orm import sessionmaker
from models import engine, Concert

# データベースセッション
Session = sessionmaker(bind=engine)
session = Session()

# テストデータ
concerts = [
    {
        "title": "ロック・フェスティバル2024",
        "artist": "Various Artists",
        "date": datetime.now() + timedelta(days=5),
        "venue": "東京ドーム",
        "description": "年間最大のロックフェスティバル！多数のアーティストが出演予定。",
        "price": 15000,
        "available_seats": 100
    },
    {
        "title": "クラシックの夕べ",
        "artist": "東京フィルハーモニー管弦楽団",
        "date": datetime.now() + timedelta(days=10),
        "venue": "サントリーホール",
        "description": "ベートーベン交響曲第9番「合唱」を演奏します。",
        "price": 8000,
        "available_seats": 50
    },
    {
        "title": "Jポップライブ",
        "artist": "山田花子",
        "date": datetime.now() + timedelta(days=15),
        "venue": "横浜アリーナ",
        "description": "最新アルバムの発売を記念したスペシャルライブ！",
        "price": 12000,
        "available_seats": 80
    }
]

# データベースにコンサート情報を追加
for concert_data in concerts:
    concert = Concert(**concert_data)
    session.add(concert)

session.commit()
session.close()

print("テストデータを追加しました。") 