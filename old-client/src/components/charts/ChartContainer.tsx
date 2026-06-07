import { useEffect, useRef, useCallback } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, LineData, HistogramData } from 'lightweight-charts';
import { useMarketStore } from '../../stores/marketStore';

interface ChartContainerProps {
  width?: number;
  height?: number;
  chartType?: 'candlestick' | 'line' | 'area';
}

export default function ChartContainer({ width, height, chartType = 'candlestick' }: ChartContainerProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const { candles, activeSymbol, quotes } = useMarketStore();

  const initChart = useCallback(() => {
    if (!chartContainerRef.current) return;

    // Cleanup existing
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = chartContainerRef.current;

    const chart = createChart(container, {
      width: width || container.clientWidth,
      height: height || container.clientHeight || 500,
      layout: {
        background: { type: ColorType.Solid, color: '#111627' },
        textColor: '#a1a7bd',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: '#1a2038' },
        horzLines: { color: '#1a2038' },
      },
      crosshair: {
        mode: 0,
        vertLine: {
          color: '#00d4ff40',
          width: 1,
          style: 2,
          labelBackgroundColor: '#00d4ff',
        },
        horzLine: {
          color: '#00d4ff40',
          width: 1,
          style: 2,
          labelBackgroundColor: '#00d4ff',
        },
      },
      rightPriceScale: {
        borderColor: '#1a2038',
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderColor: '#1a2038',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { vertTouchDrag: false },
    });

    // Create main series
    let mainSeries: ISeriesApi<any>;

    if (chartType === 'candlestick') {
      mainSeries = chart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
        borderUpColor: '#10b981',
        borderDownColor: '#ef4444',
        wickUpColor: '#10b98180',
        wickDownColor: '#ef444480',
      });
    } else if (chartType === 'line') {
      mainSeries = chart.addLineSeries({
        color: '#00d4ff',
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBackgroundColor: '#00d4ff',
      });
    } else {
      mainSeries = chart.addAreaSeries({
        topColor: '#00d4ff30',
        bottomColor: '#00d4ff05',
        lineColor: '#00d4ff',
        lineWidth: 2,
      });
    }

    // Volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#00d4ff40',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;
    mainSeriesRef.current = mainSeries;
    volumeSeriesRef.current = volumeSeries;

    return chart;
  }, [chartType, width, height]);

  // Init chart on mount
  useEffect(() => {
    const chart = initChart();
    if (!chart || !chartContainerRef.current) return;

    // ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        chart.applyOptions({ width: w, height: h });
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [initChart]);

  // Update data when candles or activeSymbol change
  useEffect(() => {
    if (!mainSeriesRef.current || !volumeSeriesRef.current) return;

    const symbolCandles = candles?.[activeSymbol];
    if (!symbolCandles || symbolCandles.length === 0) return;

    try {
      if (chartType === 'candlestick') {
        const candleData: CandlestickData[] = symbolCandles.map((c: any) => ({
          time: (typeof c.time === 'number' ? c.time : new Date(c.time).getTime() / 1000) as any,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));
        mainSeriesRef.current.setData(candleData);
      } else {
        const lineData: LineData[] = symbolCandles.map((c: any) => ({
          time: (typeof c.time === 'number' ? c.time : new Date(c.time).getTime() / 1000) as any,
          value: c.close,
        }));
        mainSeriesRef.current.setData(lineData);
      }

      const volumeData: HistogramData[] = symbolCandles.map((c: any) => ({
        time: (typeof c.time === 'number' ? c.time : new Date(c.time).getTime() / 1000) as any,
        value: c.volume || 0,
        color: c.close >= c.open ? '#10b98140' : '#ef444440',
      }));
      volumeSeriesRef.current.setData(volumeData);

      chartRef.current?.timeScale().fitContent();
    } catch (e) {
      console.error('Chart data error:', e);
    }
  }, [candles, activeSymbol, chartType]);

  // Real-time quote updates
  useEffect(() => {
    if (!mainSeriesRef.current || !quotes) return;

    const quote = quotes[activeSymbol];
    if (!quote) return;

    try {
      const time = (Math.floor(Date.now() / 1000)) as any;

      if (chartType === 'candlestick') {
        mainSeriesRef.current.update({
          time,
          open: quote.open || quote.price,
          high: quote.high || quote.price,
          low: quote.low || quote.price,
          close: quote.price,
        });
      } else {
        mainSeriesRef.current.update({
          time,
          value: quote.price,
        });
      }
    } catch (e) {
      // Silently handle update errors
    }
  }, [quotes, activeSymbol, chartType]);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-dark-800 rounded-2xl overflow-hidden border border-white/5">
      <div ref={chartContainerRef} className="w-full h-full" />
      {(!candles?.[activeSymbol] || candles[activeSymbol].length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-dark-700 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
            </div>
            <p className="text-dark-300 text-sm">Loading chart data for {activeSymbol}...</p>
          </div>
        </div>
      )}
    </div>
  );
}
