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

# 国際線APIをインポート
import intl_api_code as intl_api

# FastAPIアプリケーションの作成
app = FastAPI(
    title="羽田空港フライト情報API",
    description="羽田空港の到着便情報をスクレイピングして提供するAPI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    swagger_ui_parameters={"defaultModelsExpandDepth": -1}
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
        self.timeout = 30000  # 30秒のタイムアウト
        self.playwright = None
        self.browser = None
        self.page = None

    async def __aenter__(self):
        try:
            print("Playwrightを起動します...")
            self.playwright = await async_playwright().start()
            print("ブラウザを起動します...")
            self.browser = await self.playwright.chromium.launch(
                headless=True,
                args=[
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--disable-software-rasterizer',
                    '--disable-setuid-sandbox',
                    '--single-process'
                ],
                executable_path='/usr/bin/google-chrome'  # Docker内のGoogle Chromeのパス
            )
            print("新しいページを開きます...")
            self.page = await self.browser.new_page()
            # タイムアウトを設定
            self.page.set_default_timeout(self.timeout)
            # ビューポートを設定
            await self.page.set_viewport_size({"width": 1920, "height": 1080})
            return self
        except Exception as e:
            print(f"Playwrightの初期化中にエラーが発生: {str(e)}")
            if self.browser:
                await self.browser.close()
            if self.playwright:
                await self.playwright.stop()
            raise

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        try:
            if self.browser:
                print("ブラウザを閉じます...")
                await self.browser.close()
            if self.playwright:
                print("Playwrightを停止します...")
                await self.playwright.stop()
        except Exception as e:
            print(f"リソースの解放中にエラーが発生: {str(e)}")

    async def setup_page(self):
        """ページの初期設定を行う"""
        try:
            print(f"URLにアクセスします: {self.url}")
            await self.page.goto(self.url, timeout=self.timeout, wait_until='networkidle')
            print("テーブル要素を待機します...")
            await self.page.wait_for_selector('.flight-timeTable-timeZone', timeout=self.timeout)
            print("ページの初期設定が完了しました")
        except Exception as e:
            print(f"ページの初期設定中にエラーが発生: {str(e)}")
            raise

    async def select_all_flights(self):
        """全便表示を選択"""
        try:
            print("到着便を選択します...")
            await self.page.locator("input[value='dms-arrival']").check(timeout=self.timeout)
            await asyncio.sleep(2)
            print("全便表示を選択します...")
            await self.page.select_option('.flight-timeTable-timeZone.select', value='全便を見る', timeout=self.timeout)
            await asyncio.sleep(2)
            print("全便表示の選択が完了しました")
        except Exception as e:
            print(f"全便表示の選択中にエラーが発生: {str(e)}")
            raise

    async def get_flight_data(self):
        """フライト情報を取得"""
        try:
            print("フライトデータを取得します...")
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
            print(f"取得したフライト数: {len(flights)}")
            return flights
        except Exception as e:
            print(f"フライトデータの取得中にエラーが発生: {str(e)}")
            raise

async def fetch_flight_data():
    """フライトデータを取得しDataFrameに変換する関数"""
    global latest_flight_data, last_update_time
    
    try:
        print("スクレイピングを開始します...")
        async with HanedaFlightScraper() as scraper:
            print("ページの初期設定を行います...")
            await scraper.setup_page()
            print("全便表示を選択します...")
            await scraper.select_all_flights()
            print("フライトデータを取得します...")
            flights = await scraper.get_flight_data()
            print(f"取得したフライト数: {len(flights)}")

            if not flights:
                print("フライトデータが取得できませんでした")
                return None

            # データをPandasのDataFrameに変換
            df = pd.DataFrame(flights)
            
            # ゲートがないデータをスキップ（ゲートが空またはNaNの行を削除）
            df = df[df['gate'].notna() & (df['gate'] != '')]
            print(f"有効なフライト数: {len(df)}")
            
            if len(df) == 0:
                print("有効なフライトデータがありません")
                return None
            
            # 結果を保存
            latest_flight_data = df
            last_update_time = datetime.now()
            print("スクレイピングが完了しました")
            
            return df
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"スクレイピング中にエラーが発生: {str(e)}")
        print(f"エラーの詳細:\n{error_trace}")
        raise HTTPException(status_code=500, detail=f"データ取得中のエラー: {str(e)}\n{error_trace}")

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
        print("既に処理中です")
        return
    
    async with processing_lock:
        is_processing = True
        try:
            print("データ処理を開始します...")
            df = await fetch_flight_data()
            print("グラフを生成します...")
            generate_plots(df)
            print("データ処理が完了しました")
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
    try:
        global latest_flight_data, last_update_time, is_processing
        
        if is_processing:
            return JSONResponse(
                status_code=503,
                content={"status": "processing", "message": "データ取得中です"}
            )
        
        if latest_flight_data is None:
            is_processing = True
            try:
                latest_flight_data = await fetch_flight_data()
            finally:
                is_processing = False
        
        if latest_flight_data is None:
            return JSONResponse(
                status_code=404,
                content={"status": "error", "message": "フライトデータが見つかりません"}
            )
        
        return {
            "status": "success",
            "data": latest_flight_data.to_dict(orient='records'),
            "last_update": last_update_time.isoformat() if last_update_time else None
        }
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"エンドポイントでエラーが発生: {str(e)}")
        print(f"エラーの詳細:\n{error_trace}")
        raise HTTPException(status_code=500, detail=f"エラーが発生しました: {str(e)}\n{error_trace}")

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

@app.get("/api/healthz")
async def healthz():
    """ヘルスチェックエンドポイント"""
    return {"status": "ok"}

# 国際線APIのエンドポイントを統合
@app.get("/intl/flights")
async def get_international_flights():
    """国際線フライト情報を取得"""
    return await intl_api.get_flights()

@app.get("/intl/flights/other")
async def get_international_other_flights():
    """国際線の一般フライト情報を取得"""
    return await intl_api.get_other_flights()

@app.get("/intl/flights/t2")
async def get_international_t2_flights():
    """国際線のT2フライト情報を取得"""
    return await intl_api.get_t2_flights()

@app.get("/intl/flights/plot")
async def get_international_flight_plot():
    """国際線フライト数のグラフを取得"""
    return await intl_api.get_flight_plot()

@app.post("/intl/flights/refresh")
async def refresh_international_flights(background_tasks: BackgroundTasks):
    """国際線フライト情報を更新"""
    return await intl_api.refresh_flights(background_tasks)

@app.get("/intl/status")
async def get_international_status():
    """国際線APIの状態を取得"""
    return await intl_api.get_status()

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
