from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Tuple
import uvicorn
import asyncio
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib import font_manager
import os
import re
from collections import defaultdict
from datetime import datetime
from playwright.async_api import async_playwright
import json
import base64
from io import BytesIO

app = FastAPI(
    title="羽田空港国際線フライト情報API",
    description="羽田空港の国際線到着便情報をスクレイピングして提供するAPI",
    version="1.0.0"
)

# CORSの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静的ファイル提供の設定
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# データ保存用のグローバル変数
latest_flight_data = {
    "other_flights": None,
    "t2_flights": None
}
last_update_time = None
processing_lock = asyncio.Lock()
is_processing = False

class HanedaFlightScraper:
    def __init__(self):
        self.url = "https://tokyo-haneda.com/flight/flightInfo_int.html"

    async def __aenter__(self):
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(headless=True)
        self.page = await self.browser.new_page()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.browser.close()
        await self.playwright.stop()

    async def setup_page(self):
        """ページの初期設定を行う"""
        await self.page.goto(self.url)
        await self.page.wait_for_load_state('networkidle')
        await self.page.wait_for_selector('.flight-timeTable-timeZone')

    async def select_all_flights(self):
        """全便表示を選択"""
        try:
            await self.page.locator("input[value='int-arrival']").check()
            await self.page.wait_for_load_state('networkidle')
            await asyncio.sleep(2)
            await self.page.select_option('.flight-timeTable-timeZone.select', value='全便を見る')
            await self.page.wait_for_load_state('networkidle')
            await asyncio.sleep(2)
        except Exception as e:
            print(f"全便表示の選択中にエラーが発生: {str(e)}")
            raise HTTPException(status_code=500, detail=f"データ取得中のエラー: {str(e)}")

    async def get_flight_data(self):
        """フライト情報を取得"""
        try:
            flights = await self.page.evaluate("""() => {
                const rows = document.querySelectorAll('.flight-timeTable-pc tr');
                return Array.from(rows).map(row => {
                    const cells = row.querySelectorAll('td');
                    return {
                    status: cells[0] ? cells[0].textContent.trim() : '',
                    scheduledTime: cells[1] ? cells[1].textContent.trim() : '',
                    changedTime: cells[2] ? cells[2].textContent.trim() : '',
                    airport: cells[3] ? cells[3].textContent.trim() : '',
                    terminal: cells[6] ? cells[6].textContent.trim() : '',
                    gate: cells[7] ? cells[7].textContent.trim() : ''
                    };
                });
            }""")
            # フライトデータから有効な時刻のみを返す
            # フライトデータをターミナルで分けて返す
            other_flights = [self.format_flight_time(flight) for flight in flights if flight['scheduledTime'] and flight['gate'] != 'T2']
            t2_flights = [self.format_flight_time(flight) for flight in flights if flight['scheduledTime'] and flight['gate'] == 'T2']
            return other_flights, t2_flights
        except Exception as e:
            print(f"フライトデータの取得中にエラーが発生: {str(e)}")
            raise HTTPException(status_code=500, detail=f"データ取得中のエラー: {str(e)}")

    def format_flight_time(self, flight):
        """フライトの到着時刻をフォーマット"""
        time_pattern = r"(\d{2}:\d{2})(?:\[(\d{2}:\d{2}| - )\])?"
        match = re.match(time_pattern, flight['scheduledTime'])

        if match:
            if match.group(2) and match.group(2) != ' - ':
                flight['scheduledTime'] = match.group(2)
            else:
                flight['scheduledTime'] = match.group(1)
        else:
            flight['scheduledTime'] = None

        return flight

    def count_arrivals_by_time(self, flight_data):
        """到着便数を30分ごとにカウント"""
        arrival_counts = defaultdict(int)
        for flight in flight_data:
            if flight['scheduledTime']:
                rounded_time = self.round_to_nearest_half_hour(flight['scheduledTime'])
                arrival_counts[rounded_time] += 1
        return dict(arrival_counts)

    def round_to_nearest_half_hour(self, time_str):
        """時刻を30分単位に丸める"""
        if not time_str:
            return None
        try:
            hour, minute = map(int, time_str.split(":"))
            if minute < 30:
                rounded_time = f"{hour:02}:00"
            else:
                rounded_time = f"{hour:02}:30"
            return rounded_time
        except Exception:
            return None

async def fetch_flight_data():
    """フライトデータを取得する非同期関数"""
    global latest_flight_data, last_update_time
    
    async with HanedaFlightScraper() as scraper:
        await scraper.setup_page()
        await scraper.select_all_flights()
        other_flights, t2_flights = await scraper.get_flight_data()
        
        # データを保存
        latest_flight_data = {
            "other_flights": other_flights,
            "t2_flights": t2_flights
        }
        last_update_time = datetime.now()
        
        return other_flights, t2_flights

def generate_plot(flight_data, title="Number of Arrivals by Time of Day (30-min Intervals)"):
    """フライトデータからグラフを生成する関数"""
    if not flight_data:
        return None
    
    # スクレイパーインスタンスを作成
    scraper = HanedaFlightScraper()
    
    # 到着便数を30分ごとにカウント
    arrival_counts = scraper.count_arrivals_by_time(flight_data)
    
    # 時間順にソート
    sorted_arrival_counts = dict(sorted(arrival_counts.items(),
                              key=lambda item: datetime.strptime(item[0], '%H:%M')))
    
    # グラフを生成
    plt.figure(figsize=(12, 6))
    plt.bar(sorted_arrival_counts.keys(), sorted_arrival_counts.values(), color='skyblue')
    plt.xlabel('到着時間')
    plt.ylabel('到着便数')
    plt.title(title)
    plt.xticks(rotation=90)
    plt.tight_layout()
    
    # 画像をバイト列として保存
    buffer = BytesIO()
    plt.savefig(buffer, format='png')
    plt.close()
    buffer.seek(0)
    
    # 静的ファイルとして保存
    os.makedirs("static", exist_ok=True)
    filename = f"flight_graph_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
    filepath = os.path.join("static", filename)
    with open(filepath, 'wb') as f:
        f.write(buffer.getvalue())
    
    return {
        "image_path": f"/static/{filename}",
        "image_data": base64.b64encode(buffer.getvalue()).decode('utf-8')
    }

def generate_html_report(other_flights, t2_flights):
    """HTMLレポートを生成する関数"""
    if not other_flights and not t2_flights:
        return None
    
    current_time = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"haneda_flights_{current_time}.html"
    filepath = os.path.join("static", filename)
    
    # DataFrameに変換
    df_other = pd.DataFrame(other_flights)
    df_t2 = pd.DataFrame(t2_flights)
    
    # 空のデータを処理
    df_other = df_other.replace('', pd.NA)
    df_t2 = df_t2.replace('', pd.NA)
    
    df_other = df_other.dropna(how='all').reset_index(drop=True)
    df_t2 = df_t2.dropna(how='all').reset_index(drop=True)
    
    df_other = df_other[df_other['scheduledTime'].notna()]
    df_t2 = df_t2[df_t2['scheduledTime'].notna()]
    
    df_other = df_other.sort_values('scheduledTime').reset_index(drop=True)
    df_t2 = df_t2.sort_values('scheduledTime').reset_index(drop=True)
    
    # グラフの生成
    scraper = HanedaFlightScraper()
    plot_result = generate_plot(other_flights + t2_flights, "国際線到着便数（30分間隔）")
    
    # HTMLの生成
    html_content = f"""
    <html>
    <head>
        <meta charset="utf-8">
        <title>羽田空港国際線フライト情報</title>
        <style>
            table {{ border-collapse: collapse; width: 100%; margin: 20px 0; }}
            th, td {{ border: 1px solid black; padding: 8px; text-align: center; }}
            th {{ background-color: #f2f2f2; }}
            h2 {{ color: #333; }}
            .container {{ max-width: 1200px; margin: 0 auto; padding: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>羽田空港国際線フライト情報</h1>
            <p>更新時間: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            
            <h2>その他ターミナル便</h2>
            {df_other.to_html(index=False) if not df_other.empty else "<p>データがありません</p>"}
            
            <h2>ターミナル2便</h2>
            {df_t2.to_html(index=False) if not df_t2.empty else "<p>データがありません</p>"}
            
            <h2>到着便分布</h2>
            <img src="{plot_result['image_path']}" alt="フライト到着分布">
        </div>
    </body>
    </html>
    """
    
    # HTMLファイルを保存
    os.makedirs("static", exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    return {
        "file_path": filepath,
        "file_url": f"/static/{os.path.basename(filepath)}"
    }

async def process_data():
    """データを取得して処理する非同期関数"""
    global is_processing
    
    if is_processing:
        return
    
    async with processing_lock:
        is_processing = True
        try:
            other_flights, t2_flights = await fetch_flight_data()
            generate_html_report(other_flights, t2_flights)
        finally:
            is_processing = False

# API エンドポイント
@app.get("/")
async def root():
    """APIのルートエンドポイント"""
    return {
        "message": "羽田空港国際線フライト情報API",
        "endpoints": {
            "/flights": "フライト情報を取得",
            "/flights/other": "その他ターミナルのフライト情報を取得",
            "/flights/t2": "ターミナル2のフライト情報を取得",
            "/flights/plot": "フライト情報のグラフを取得",
            "/flights/html": "フライト情報のHTMLレポートを取得",
            "/flights/refresh": "フライト情報を更新"
        }
    }

@app.get("/flights")
async def get_flights():
    """すべてのフライト情報を取得するエンドポイント"""
    global latest_flight_data, last_update_time
    
    # データがない場合は取得
    if latest_flight_data["other_flights"] is None and latest_flight_data["t2_flights"] is None:
        await process_data()
    
    if latest_flight_data["other_flights"] is None and latest_flight_data["t2_flights"] is None:
        raise HTTPException(status_code=404, detail="フライトデータがありません")
    
    return {
        "other_flights": latest_flight_data["other_flights"],
        "t2_flights": latest_flight_data["t2_flights"],
        "last_update": last_update_time.isoformat() if last_update_time else None,
        "count": len(latest_flight_data["other_flights"] or []) + len(latest_flight_data["t2_flights"] or [])
    }

@app.get("/flights/other")
async def get_other_flights():
    """その他ターミナルのフライト情報を取得するエンドポイント"""
    global latest_flight_data, last_update_time
    
    # データがない場合は取得
    if latest_flight_data["other_flights"] is None:
        await process_data()
    
    if latest_flight_data["other_flights"] is None:
        raise HTTPException(status_code=404, detail="フライトデータがありません")
    
    return {
        "data": latest_flight_data["other_flights"],
        "last_update": last_update_time.isoformat() if last_update_time else None,
        "count": len(latest_flight_data["other_flights"])
    }

@app.get("/flights/t2")
async def get_t2_flights():
    """ターミナル2のフライト情報を取得するエンドポイント"""
    global latest_flight_data, last_update_time
    
    # データがない場合は取得
    if latest_flight_data["t2_flights"] is None:
        await process_data()
    
    if latest_flight_data["t2_flights"] is None:
        raise HTTPException(status_code=404, detail="フライトデータがありません")
    
    return {
        "data": latest_flight_data["t2_flights"],
        "last_update": last_update_time.isoformat() if last_update_time else None,
        "count": len(latest_flight_data["t2_flights"])
    }

@app.get("/flights/plot")
async def get_flight_plot():
    """フライト情報のグラフを取得するエンドポイント"""
    global latest_flight_data
    
    # データがない場合は取得
    if latest_flight_data["other_flights"] is None and latest_flight_data["t2_flights"] is None:
        await process_data()
    
    if latest_flight_data["other_flights"] is None and latest_flight_data["t2_flights"] is None:
        raise HTTPException(status_code=404, detail="フライトデータがありません")
    
    # 全フライトのデータを結合
    all_flights = (latest_flight_data["other_flights"] or []) + (latest_flight_data["t2_flights"] or [])
    
    # グラフ生成
    plot_result = generate_plot(all_flights, "国際線到着便数（30分間隔）")
    
    if not plot_result:
        raise HTTPException(status_code=404, detail="グラフの生成に失敗しました")
    
    return FileResponse(f"static/{os.path.basename(plot_result['image_path'])}")

@app.get("/flights/plot/json")
async def get_flight_plot_json():
    """フライト情報のグラフを取得するエンドポイント（JSON）"""
    global latest_flight_data
    
    # データがない場合は取得
    if latest_flight_data["other_flights"] is None and latest_flight_data["t2_flights"] is None:
        await process_data()
    
    if latest_flight_data["other_flights"] is None and latest_flight_data["t2_flights"] is None:
        raise HTTPException(status_code=404, detail="フライトデータがありません")
    
    # 全フライトのデータを結合
    all_flights = (latest_flight_data["other_flights"] or []) + (latest_flight_data["t2_flights"] or [])
    
    # グラフ生成
    plot_result = generate_plot(all_flights, "国際線到着便数（30分間隔）")
    
    if not plot_result:
        raise HTTPException(status_code=404, detail="グラフの生成に失敗しました")
    
    return {
        "image_url": plot_result["image_path"],
        "image_data": f"data:image/png;base64,{plot_result['image_data']}"
    }

@app.get("/flights/html", response_class=HTMLResponse)
async def get_flights_html():
    """フライト情報のHTMLレポートを取得するエンドポイント"""
    global latest_flight_data
    
    # データがない場合は取得
    if latest_flight_data["other_flights"] is None and latest_flight_data["t2_flights"] is None:
        await process_data()
    
    if latest_flight_data["other_flights"] is None and latest_flight_data["t2_flights"] is None:
        raise HTTPException(status_code=404, detail="フライトデータがありません")
    
    # HTMLレポート生成
    html_result = generate_html_report(
        latest_flight_data["other_flights"] or [],
        latest_flight_data["t2_flights"] or []
    )
    
    if not html_result:
        raise HTTPException(status_code=404, detail="HTMLレポートの生成に失敗しました")
    
    with open(html_result["file_path"], 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    return HTMLResponse(content=html_content)

@app.post("/flights/refresh")
async def refresh_flights(background_tasks: BackgroundTasks):
    """フライト情報を更新するエンドポイント"""
    background_tasks.add_task(process_data)
    return {"message": "フライト情報の更新を開始しました"}

class TimeFilterParams(BaseModel):
    """時間フィルタリングパラメータ"""
    time_from: Optional[str] = None
    time_to: Optional[str] = None

@app.post("/flights/filter")
async def filter_flights(params: TimeFilterParams):
    """フライト情報を時間でフィルタするエンドポイント"""
    global latest_flight_data
    
    if latest_flight_data["other_flights"] is None and latest_flight_data["t2_flights"] is None:
        await process_data()
    
    if latest_flight_data["other_flights"] is None and latest_flight_data["t2_flights"] is None:
        raise HTTPException(status_code=404, detail="フライトデータがありません")
    
    # フィルタリングのためにフライトデータをコピー
    other_flights = latest_flight_data["other_flights"].copy() if latest_flight_data["other_flights"] else []
    t2_flights = latest_flight_data["t2_flights"].copy() if latest_flight_data["t2_flights"] else []
    
    # 時間でフィルタリング
    if params.time_from:
        time_from = params.time_from
        other_flights = [f for f in other_flights if f['scheduledTime'] and f['scheduledTime'] >= time_from]
        t2_flights = [f for f in t2_flights if f['scheduledTime'] and f['scheduledTime'] >= time_from]
    
    if params.time_to:
        time_to = params.time_to
        other_flights = [f for f in other_flights if f['scheduledTime'] and f['scheduledTime'] <= time_to]
        t2_flights = [f for f in t2_flights if f['scheduledTime'] and f['scheduledTime'] <= time_to]
    
    return {
        "other_flights": other_flights,
        "t2_flights": t2_flights,
        "count": len(other_flights) + len(t2_flights)
    }

@app.get("/status")
async def get_status():
    """APIの状態情報を取得するエンドポイント"""
    global latest_flight_data, last_update_time, is_processing
    
    other_count = len(latest_flight_data["other_flights"] or [])
    t2_count = len(latest_flight_data["t2_flights"] or [])
    
    return {
        "status": "processing" if is_processing else "idle",
        "has_data": latest_flight_data["other_flights"] is not None or latest_flight_data["t2_flights"] is not None,
        "last_update": last_update_time.isoformat() if last_update_time else None,
        "other_flights_count": other_count,
        "t2_flights_count": t2_count,
        "total_flights_count": other_count + t2_count
    }

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
