// src/app/flights/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// --- データ型の定義 ---
interface Flight {
  status: string | null;
  scheduledTime: string | null;
  changedTime: string | null;
  airport: string | null;
  airline?: string | null; // 国内線のみ
  flightNumber?: string | null; // 国内線のみ
  terminal: string | null;
  gate: string | null;
  gate_group?: string | null; // 国内線のみで追加される可能性
  gate_numeric?: number | null; // 国内線のみで追加される可能性
}

interface DomesticApiResponse {
  status: string;
  data: Flight[];
  last_update: string | null;
}

interface IntlApiResponse {
  data: Flight[];
  last_update: string | null;
  count: number;
}

interface PlotResponse {
    image_url: string;
    image_data: string; // Base64 encoded image data for a specific terminal
}


// --- API Fetch関数 ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'; // デフォルトはローカル

async function fetchDomesticFlights(): Promise<DomesticApiResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/flights`);
    if (!response.ok) {
      console.error('Failed to fetch domestic flights:', response.statusText);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching domestic flights:', error);
    return null;
  }
}

async function fetchIntlFlightsT2(): Promise<IntlApiResponse | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/intl/flights/t2`);
        if (!response.ok) {
            console.error('Failed to fetch intl T2 flights:', response.statusText);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching intl T2 flights:', error);
        return null;
    }
}

async function fetchIntlFlightsOther(): Promise<IntlApiResponse | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/intl/flights/other`);
        if (!response.ok) {
            console.error('Failed to fetch intl other flights:', response.statusText);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching intl other flights:', error);
        return null;
    }
}

async function fetchIntlPlotT2(): Promise<PlotResponse | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/intl/flights/plot/t2/json`);
        if (!response.ok) {
            console.error('Failed to fetch intl T2 plot:', response.statusText);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching intl T2 plot:', error);
        return null;
    }
}

async function fetchIntlPlotOther(): Promise<PlotResponse | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/intl/flights/plot/other/json`);
        if (!response.ok) {
            console.error('Failed to fetch intl Other plot:', response.statusText);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching intl Other plot:', error);
        return null;
    }
}


async function refreshDomesticFlights() {
    try {
        await fetch(`${API_BASE_URL}/flights/refresh`, { method: 'POST' });
    } catch (error) {
        console.error('Error refreshing domestic flights:', error);
    }
}

async function refreshIntlFlights() {
    try {
        await fetch(`${API_BASE_URL}/intl/flights/refresh`, { method: 'POST' });
    } catch (error) {
        console.error('Error refreshing intl flights:', error);
    }
}


// --- ヘルパー関数 ---
// 時刻を30分単位に丸める関数
const roundToNearestHalfHour = (timeStr: string | null): string | null => {
    if (!timeStr) return null;
    try {
        const [hourStr, minuteStr] = timeStr.split(":");
        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);
        if (isNaN(hour) || isNaN(minute)) return null;

        if (minute < 30) {
            return `${String(hour).padStart(2, '0')}:00`;
        } else {
            return `${String(hour).padStart(2, '0')}:30`;
        }
    } catch (e) {
        console.error("Error rounding time:", e);
        return null;
    }
};

// フライトデータを時間帯別に集計する関数
const aggregateFlightsByTime = (flights: Flight[]): { time: string, count: number }[] => {
    const counts: { [key: string]: number } = {};
    flights.forEach(flight => {
        const roundedTime = roundToNearestHalfHour(flight.scheduledTime);
        if (roundedTime) {
            counts[roundedTime] = (counts[roundedTime] || 0) + 1;
        }
    });

    return Object.entries(counts)
        .map(([time, count]) => ({ time, count }))
        .sort((a, b) => a.time.localeCompare(b.time)); // 時間順にソート
};


// --- コンポーネント ---
// フライトテーブルコンポーネント (共通化)
const FlightTable: React.FC<{ flights: Flight[], title: string, isDomestic: boolean }> = ({ flights, title, isDomestic }) => {
    const [isExpanded, setIsExpanded] = useState(isDomestic); // 国内線はデフォルトで展開

    if (!flights || flights.length === 0) {
        return (
            <div className="mb-8 p-4 border rounded shadow">
                <h2 className="text-xl font-semibold mb-2 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                    {title} {isDomestic ? '' : `(${isExpanded ? '▲' : '▼'})`}
                </h2>
                {isExpanded && <p>現在表示できるフライト情報はありません。</p>}
            </div>
        );
    }

    // 国内線用のゲートグループを計算 (API側で追加されていなければ)
    const getGateGroup = (terminal: string | null, gate: string | null): string => {
        if (!terminal || !gate) return 'その他';
        const gateNumMatch = gate.match(/\d+/);
        if (!gateNumMatch) return 'その他';
        const gateNumeric = parseInt(gateNumMatch[0], 10);

        if (terminal === 'T1') {
            if (1 <= gateNumeric && gateNumeric <= 4) return 'NO1 (T1 1-4)';
            if (5 <= gateNumeric && gateNumeric <= 8) return 'NO2 (T1 5-8)'; // 要件は5-7だが、データに合わせて8まで含める
        } else if (terminal === 'T2') {
            if (1 <= gateNumeric && gateNumeric <= 3) return 'NO3 (T2 1-3)';
            if (4 <= gateNumeric && gateNumeric <= 6) return 'NO4 (T2 4-6)';
        }
        return 'その他';
    };

    const flightsWithGroup = isDomestic ? flights.map(f => ({ ...f, gate_group: getGateGroup(f.terminal, f.gate) })) : flights;

    // 国内線の場合、ゲートグループごとに表示
    const domesticSections: { [key: string]: Flight[] } = {};
    if (isDomestic) {
        flightsWithGroup.forEach(flight => {
            const group = flight.gate_group || 'その他';
            if (!domesticSections[group]) {
                domesticSections[group] = [];
            }
            domesticSections[group].push(flight);
        });
    }

    const renderTable = (data: Flight[]) => (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 border">ステータス</th>
                        <th className="py-2 px-4 border">予定時刻</th>
                        <th className="py-2 px-4 border">変更時刻</th>
                        <th className="py-2 px-4 border">出発空港</th>
                        {isDomestic && <th className="py-2 px-4 border">航空会社</th>}
                        {isDomestic && <th className="py-2 px-4 border">便名</th>}
                        <th className="py-2 px-4 border">ターミナル</th>
                        <th className="py-2 px-4 border">ゲート</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((flight, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border">{flight.status || '-'}</td>
                            <td className="py-2 px-4 border">{flight.scheduledTime || '-'}</td>
                            <td className="py-2 px-4 border">{flight.changedTime || '-'}</td>
                            <td className="py-2 px-4 border">{flight.airport || '-'}</td>
                            {isDomestic && <td className="py-2 px-4 border">{flight.airline || '-'}</td>}
                            {isDomestic && <td className="py-2 px-4 border">{flight.flightNumber || '-'}</td>}
                            <td className="py-2 px-4 border">{flight.terminal || '-'}</td>
                            <td className="py-2 px-4 border">{flight.gate || '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="mb-8 p-4 border rounded shadow">
            <h2 className="text-xl font-semibold mb-4 cursor-pointer" onClick={() => !isDomestic && setIsExpanded(!isExpanded)}>
                {title} {!isDomestic && `(${isExpanded ? '▲' : '▼'})`}
            </h2>
            {isExpanded && (
                isDomestic ? (
                    Object.entries(domesticSections)
                        .sort(([groupA], [groupB]) => { // NO1, NO2, NO3, NO4 の順にソート
                            const order = ['NO1', 'NO2', 'NO3', 'NO4', 'その他'];
                            const keyA = groupA.split(' ')[0];
                            const keyB = groupB.split(' ')[0];
                            return order.indexOf(keyA) - order.indexOf(keyB);
                        })
                        .map(([group, groupFlights]) => (
                            <div key={group} className="mb-6">
                                <h3 className="text-lg font-medium mb-2">{group}</h3>
                                {renderTable(groupFlights)}
                                {/* 国内線グラフ表示 */}
                                <div className="mt-4" style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <BarChart
                                            data={aggregateFlightsByTime(groupFlights)}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="time" />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="count" fill="#8884d8" name="到着便数" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ))
                ) : (
                    renderTable(flightsWithGroup)
                )
            )}
        </div>
    );
};


// メインページコンポーネント
const FlightsPage = () => {
  const [activeTab, setActiveTab] = useState<'domestic' | 'international'>('domestic');
  const [domesticData, setDomesticData] = useState<DomesticApiResponse | null>(null);
  const [intlT2Data, setIntlT2Data] = useState<IntlApiResponse | null>(null);
  const [intlOtherData, setIntlOtherData] = useState<IntlApiResponse | null>(null);
  const [intlPlotT2Data, setIntlPlotT2Data] = useState<PlotResponse | null>(null);
  const [intlPlotOtherData, setIntlPlotOtherData] = useState<PlotResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    // Fetch data in parallel
    const [domesticRes, intlT2Res, intlOtherRes, intlPlotT2Res, intlPlotOtherRes] = await Promise.all([
        fetchDomesticFlights(),
        fetchIntlFlightsT2(),
        fetchIntlFlightsOther(),
        fetchIntlPlotT2(),
        fetchIntlPlotOther()
    ]);

    setDomesticData(domesticRes);
    setIntlT2Data(intlT2Res);
    setIntlOtherData(intlOtherRes);
    setIntlPlotT2Data(intlPlotT2Res);
    setIntlPlotOtherData(intlPlotOtherRes);

    // 最終更新時間を設定 (いずれかのデータから取得、なければ現在時刻)
    const updateTime = domesticRes?.last_update || intlT2Res?.last_update || intlOtherRes?.last_update || new Date().toISOString();
    setLastUpdateTime(updateTime);

    setLoading(false);
  };

  const handleRefresh = async () => {
      setLoading(true);
      if (activeTab === 'domestic') {
          await refreshDomesticFlights();
      } else {
          await refreshIntlFlights();
      }
      // 少し待ってから再取得
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5秒待機
      await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      {/* ロゴとタイトル */}
      <div className="text-center mb-6">
        {/* ここに空港ロゴを追加 */}
        <h1 className="text-3xl font-bold">羽田空港 到着便ダッシュボード</h1>
        {lastUpdateTime && (
            <p className="text-sm text-gray-500 mt-1">
                最終更新: {new Date(lastUpdateTime).toLocaleString('ja-JP')}
            </p>
        )}
      </div>

      {/* ナビゲーションタブ */}
      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('domestic')}
            className={`${
              activeTab === 'domestic'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            国内線
          </button>
          <button
            onClick={() => setActiveTab('international')}
            className={`${
              activeTab === 'international'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            国際線
          </button>
           <button
                onClick={handleRefresh}
                disabled={loading}
                className="ml-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 disabled:opacity-50"
            >
                {loading ? '更新中...' : '更新'}
            </button>
        </nav>
      </div>

      {/* コンテンツエリア */}
      <div>
        {loading && <p className="text-center">データを読み込み中...</p>}

        {!loading && activeTab === 'domestic' && (
          <div>
            {domesticData?.data ? (
              <FlightTable flights={domesticData.data} title="国内線到着便" isDomestic={true} />
            ) : (
              <p>国内線のフライトデータを取得できませんでした。</p>
            )}
             {/* 国内線グラフはFlightTable内で表示されるため、ここは削除 */}
          </div>
        )}

        {!loading && activeTab === 'international' && (
          <div>
            {intlOtherData?.data && (
              <FlightTable flights={intlOtherData.data} title="国際線到着便 (T2以外)" isDomestic={false} />
            )}
             {intlT2Data?.data && (
              <FlightTable flights={intlT2Data.data} title="国際線到着便 (T2)" isDomestic={false} />
            )}
            {!intlOtherData?.data && !intlT2Data?.data && (
                 <p>国際線のフライトデータを取得できませんでした。</p>
            )}
            {/* 国際線グラフ表示エリア (T2) */}
            {intlPlotT2Data?.image_data && (
                 <div className="mt-8 p-4 border rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">国際線 到着便グラフ (T2)</h2>
                    <img src={`data:image/png;base64,${intlPlotT2Data.image_data}`} alt="国際線到着便グラフ (T2)" className="w-full h-auto" />
                 </div>
            )}
             {/* 国際線グラフ表示エリア (T3/Other) */}
            {intlPlotOtherData?.image_data && (
                 <div className="mt-8 p-4 border rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">国際線 到着便グラフ (T3/その他)</h2>
                    <img src={`data:image/png;base64,${intlPlotOtherData.image_data}`} alt="国際線到着便グラフ (T3/その他)" className="w-full h-auto" />
                 </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightsPage;