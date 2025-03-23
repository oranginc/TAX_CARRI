from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import asyncio
import pandas as pd
from datetime import datetime
import matplotlib.pyplot as plt
from matplotlib import font_manager
import os
from PIL import Image
from playwright.async_api import async_playwright
import json

app = FastAPI(
    title="羽田空港フライト情報API",
    description="羽田空港の到着便情報をスクレイピングして提供するAPI",
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

# データ保存用のグローバル変数
latest_flight_data = None
last_update_time = None
processing_lock = asyncio.Lock()
is_processing = False

class HanedaFlightScraper:
    def __init__(self):
        self.url = "https://tokyo-haneda.com/flight/flightInfo_dms.html"

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
            await self.page.locator("input[value='dms-arrival']").check()
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
                        status: cells[0]?.textContent.trim(),
                        scheduledTime: cells[1]?.textContent.trim(),
                        changedTime: cells[2]?.textContent.trim(),
                        airport: cells[3]?.textContent.trim(),
                        airline: cells[4]?.textContent.trim(),
                        flightNumber: cells[5]?.textContent.trim(),
                        terminal: cells[6]?.textContent.trim(),
                        gate: cells[7]?.textContent.trim()
                    };
                });
            }""")
            return flights
        except Exception as e:
            print(f"フライトデータの取得中にエラーが発生: {str(e)}")
            raise HTTPException(status_code=500, detail=f"データ取得中のエラー: {str(e)}")

async def fetch_flight_data():
    """フライトデータを取得しDataFrameに変換する関数"""
    global latest_flight_data, last_update_time
    
    async with HanedaFlightScraper() as scraper:
        await scraper.setup_page()
        await scraper.select_all_flights()
        flights = await scraper.get_flight_data()

        # データをPandasのDataFrameに変換
        df = pd.DataFrame(flights)
        
        # ゲートがないデータをスキップ（ゲートが空またはNaNの行を削除）
        df = df[df['gate'].notna() & (df['gate'] != '')]
        
        # 結果を保存
        latest_flight_data = df
        last_update_time = datetime.now()
        
        return df

def gate_group(row):
    """ゲート番号からグループを決定する関数"""
    if row['terminal'] == 'T1':
        if 1 <= row['gate_numeric'] <= 4:
            return 'NO1'
        elif 5 <= row['gate_numeric'] <= 8:
            return 'NO2'
    elif row['terminal'] == 'T2':
        if 1 <= row['gate_numeric'] <= 3:
            return 'NO3'
        elif 4 <= row['gate_numeric'] <= 6:
            return 'NO4'
    return 'その他'

def generate_plots(df):
    """フライトデータからグラフを生成する関数"""
    # プロットフォルダを作成
    if not os.path.exists('plots'):
        os.makedirs('plots')
    
    # データの整形
    df['scheduledTime'] = pd.to_datetime(df['scheduledTime'], format='%H:%M:%S', errors='coerce')
    
    # 15分ごとに時刻を丸める
    df['time_15min'] = df['scheduledTime'].dt.floor('15T')
    
    # ゲート番号を数値に変換
    df['gate_numeric'] = df['gate'].str.extract('(\d+)').astype(float)
    
    # ゲートグループ列を追加
    df['gate_group'] = df.apply(gate_group, axis=1)
    
    # プロットのファイルパスリスト
    plot_paths = []
    
    # ターミナルとゲートグループごとの15分毎の到着便数を集計してグラフを作成
    terminals = df['terminal'].unique()
    for terminal in terminals:
        terminal_data = df[df['terminal'] == terminal]
        gate_groups = terminal_data['gate_group'].unique()
        
        for group in gate_groups:
            if group == 'その他':
                continue
                
            group_data = terminal_data[terminal_data['gate_group'] == group]
            
            # 15分ごとの到着便数を集計
            plt.figure(figsize=(10, 6))
            counts_15min = group_data.groupby('time_15min')['gate'].value_counts().unstack(fill_value=0)
            counts_15min.plot(kind='bar', stacked=True)
            
            plt.xlabel('時間（15分間隔）')
            plt.ylabel('到着便数')
            plt.title(f'{terminal}ターミナル - ゲート{group} - 15分間隔')
            plt.xticks(rotation=45)
            plt.tight_layout()
            
            plot_path = f'plots/{terminal}_gate_{group}_15min.png'
            plt.savefig(plot_path)
            plt.close()
            
            plot_paths.append(plot_path)
    
    # 画像ファイルを結合
    if plot_paths:
        gate_group_order = ['NO1', 'NO2', 'NO3', 'NO4']
        output_path = 'plots/combined_plots_vertical.png'
        combine_images_vertical(plot_paths, output_path, gate_group_order)
        return output_path
    
    return None

def combine_images_vertical(image_paths, output_path, order):
    """画像を縦に結合する関数"""
    images = {os.path.basename(path).split('_')[1]: Image.open(path) for path in image_paths}
    ordered_images = [images[group] for group in order if group in images]
    
    if not ordered_images:
        return None
    
    widths, heights = zip(*(i.size for i in ordered_images))
    max_width = max(widths)
    total_height = sum(heights)
    
    new_im = Image.new('RGB', (max_width, total_height))
    
    y_offset = 0
    for im in ordered_images:
        new_im.paste(im, (0, y_offset))
        y_offset += im.size[1]
    
    new_im.save(output_path)
    return output_path

async def process_data():
    """データを取得して処理する非同期関数"""
    global is_processing
    
    if is_processing:
        return
    
    async with processing_lock:
        is_processing = True
        try:
            df = await fetch_flight_data()
            generate_plots(df)
        finally:
            is_processing = False

# API エンドポイント
@app.get("/")
async def root():
    """APIのルートエンドポイント"""
    return {
        "message": "羽田空港フライト情報API",
        "endpoints": {
            "/flights": "フライト情報を取得",
            "/flights/plot": "フライト情報のグラフを取得",
            "/flights/refresh": "フライト情報を更新"
        }
    }

@app.get("/flights")
async def get_flights():
    """フライト情報を取得するエンドポイント"""
    global latest_flight_data, last_update_time
    
    # データがない場合は取得
    if latest_flight_data is None:
        await process_data()
    
    if latest_flight_data is None:
        raise HTTPException(status_code=404, detail="フライトデータがありません")
    
    # DataFrameをJSON形式に変換
    flights = latest_flight_data.to_dict(orient="records")
    
    return {
        "data": flights,
        "last_update": last_update_time.isoformat() if last_update_time else None,
        "count": len(flights)
    }

@app.get("/flights/plot")
async def get_flight_plot():
    """フライト情報のグラフを取得するエンドポイント"""
    global latest_flight_data
    
    # データがない場合は取得
    if latest_flight_data is None:
        await process_data()
    
    if latest_flight_data is None:
        raise HTTPException(status_code=404, detail="フライトデータがありません")
    
    # グラフ生成
    combined_plot_path = generate_plots(latest_flight_data)
    
    if not combined_plot_path or not os.path.exists(combined_plot_path):
        raise HTTPException(status_code=404, detail="グラフの生成に失敗しました")
    
    return FileResponse(combined_plot_path)

@app.post("/flights/refresh")
async def refresh_flights(background_tasks: BackgroundTasks):
    """フライト情報を更新するエンドポイント"""
    background_tasks.add_task(process_data)
    return {"message": "フライト情報の更新を開始しました"}

class FilterParams(BaseModel):
    """フライト情報のフィルタパラメータ"""
    terminal: Optional[str] = None
    gate_group: Optional[str] = None
    time_from: Optional[str] = None
    time_to: Optional[str] = None

@app.post("/flights/filter")
async def filter_flights(params: FilterParams):
    """フライト情報をフィルタするエンドポイント"""
    global latest_flight_data
    
    if latest_flight_data is None:
        await process_data()
    
    if latest_flight_data is None:
        raise HTTPException(status_code=404, detail="フライトデータがありません")
    
    df = latest_flight_data.copy()
    
    # 時刻データの変換
    df['scheduledTime'] = pd.to_datetime(df['scheduledTime'], format='%H:%M:%S', errors='coerce')
    
    # ゲート番号を数値に変換
    df['gate_numeric'] = df['gate'].str.extract('(\d+)').astype(float)
    
    # ゲートグループ列を追加
    df['gate_group'] = df.apply(gate_group, axis=1)
    
    # フィルタリング
    if params.terminal:
        df = df[df['terminal'] == params.terminal]
    
    if params.gate_group:
        df = df[df['gate_group'] == params.gate_group]
    
    if params.time_from:
        time_from = pd.to_datetime(params.time_from).time()
        df = df[df['scheduledTime'].dt.time >= time_from]
    
    if params.time_to:
        time_to = pd.to_datetime(params.time_to).time()
        df = df[df['scheduledTime'].dt.time <= time_to]
    
    # DataFrameをJSON形式に変換
    filtered_flights = df.to_dict(orient="records")
    
    return {
        "data": filtered_flights,
        "count": len(filtered_flights)
    }

@app.get("/status")
async def get_status():
    """APIの状態情報を取得するエンドポイント"""
    global latest_flight_data, last_update_time, is_processing
    
    return {
        "status": "processing" if is_processing else "idle",
        "has_data": latest_flight_data is not None,
        "last_update": last_update_time.isoformat() if last_update_time else None,
        "flight_count": len(latest_flight_data) if latest_flight_data is not None else 0
    }

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
