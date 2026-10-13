import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Upload, Database, Table, BarChart2, Plus, Trash2, Filter, RefreshCw, 
  Download, Play, Layers, Sun, Moon, CheckCircle2, ChevronRight, FileText, 
  Settings, Grid, LayoutDashboard, Sliders, ArrowUpRight, Shield, AlertCircle
} from 'lucide-react';
const handleFileUpload = async (file) => {
  const formData = new FormData();
  // Ensure "file" matches the parameter name in your FastAPI endpoint: upload_file(file: UploadFile = File(...))
  formData.append("file", file);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8005";

  try {
    const res = await fetch(`${API_BASE_URL}/api/upload`, {
      method: "POST",
      // Leave headers empty (or omit Content-Type) so the browser sets the boundary automatically
      body: formData, 
    });

    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`);
    }

    const data = await res.json();
    console.log("File response:", data);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};
const INITIAL_SAMPLE_DATA = [
  { id: 1, Date: "2024-01-15", Region: "North America", Product: "Quantum Laptop", Category: "Electronics", Sales: 12500, Revenue: 15000, Units: 10, Profit: 2500, CustomerType: "Enterprise" },
  { id: 2, Date: "2024-01-18", Region: "Europe", Product: "Ergo Chair", Category: "Furniture", Sales: 3200, Revenue: 4100, Units: 16, Profit: 900, CustomerType: "Consumer" },
  { id: 3, Date: "2024-01-22", Region: "Asia Pacific", Product: "Smart Monitor 4K", Category: "Electronics", Sales: 8900, Revenue: 11200, Units: 20, Profit: 2300, CustomerType: "Enterprise" },
  { id: 4, Date: "2024-02-01", Region: "North America", Product: "Noise Cancelling Headphones", Category: "Electronics", Sales: 4500, Revenue: 5800, Units: 30, Profit: 1300, CustomerType: "Consumer" },
  { id: 5, Date: "2024-02-05", Region: "Europe", Product: "Standing Desk Pro", Category: "Furniture", Sales: 7800, Revenue: 9500, Units: 12, Profit: 1700, CustomerType: "SMB" },
  { id: 6, Date: "2024-02-12", Region: "Latin America", Product: "Quantum Laptop", Category: "Electronics", Sales: 15600, Revenue: 18200, Units: 13, Profit: 2600, CustomerType: "Enterprise" },
  { id: 7, Date: "2024-02-18", Region: "Asia Pacific", Product: "Ergo Chair", Category: "Furniture", Sales: 4100, Revenue: 5200, Units: 21, Profit: 1100, CustomerType: "SMB" },
  { id: 8, Date: "2024-03-02", Region: "North America", Product: "Mechanical Keyboard", Category: "Electronics", Sales: 2800, Revenue: 3600, Units: 28, Profit: 800, CustomerType: "Consumer" },
  { id: 9, Date: "2024-03-10", Region: "Europe", Product: "Smart Monitor 4K", Category: "Electronics", Sales: 11200, Revenue: 13800, Units: 25, Profit: 2600, CustomerType: "Enterprise" },
  { id: 10, Date: "2024-03-15", Region: "Latin America", Product: "Standing Desk Pro", Category: "Furniture", Sales: 6200, Revenue: 7900, Units: 10, Profit: 1700, CustomerType: "SMB" },
  { id: 11, Date: "2024-03-22", Region: "Asia Pacific", Product: "Wireless Mouse", Category: "Electronics", Sales: 1400, Revenue: 2100, Units: 45, Profit: 700, CustomerType: "Consumer" },
  { id: 12, Date: "2024-04-01", Region: "North America", Product: "Standing Desk Pro", Category: "Furniture", Sales: 9400, Revenue: 11500, Units: 15, Profit: 2100, CustomerType: "Enterprise" },
  { id: 13, Date: "2024-04-08", Region: "Europe", Product: "Quantum Laptop", Category: "Electronics", Sales: 18200, Revenue: 21500, Units: 15, Profit: 3300, CustomerType: "Enterprise" },
  { id: 14, Date: "2024-04-14", Region: "Asia Pacific", Product: "Noise Cancelling Headphones", Category: "Electronics", Sales: 5100, Revenue: 6400, Units: 34, Profit: 1300, CustomerType: "Consumer" },
  { id: 15, Date: "2024-04-20", Region: "Latin America", Product: "Ergo Chair", Category: "Furniture", Sales: 3900, Revenue: 4800, Units: 19, Profit: 900, CustomerType: "SMB" }
];

const COLOR_PALETTE = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export default function App() {
  const [dataset, setDataset] = useState(INITIAL_SAMPLE_DATA);
  const [datasetName, setDatasetName] = useState("Global_Sales_Dataset.csv");
  const [activeView, setActiveView] = useState("report"); // 'report' | 'data'
  const [darkMode, setDarkMode] = useState(true);
  
  // Modals
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Global Filters / Slicers State
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCustomerType, setSelectedCustomerType] = useState("All");
  
  // Dashboard Widgets Engine
  const [widgets, setWidgets] = useState([
    {
      id: 'w1',
      title: 'Total Revenue by Region',
      chartType: 'bar',
      xAxisKey: 'Region',
      yAxisKey: 'Revenue',
      aggregation: 'sum'
    },
    {
      id: 'w2',
      title: 'Sales Trend by Product Category',
      chartType: 'line',
      xAxisKey: 'Date',
      yAxisKey: 'Sales',
      aggregation: 'sum'
    },
    {
      id: 'w3',
      title: 'Profit Share by Category',
      chartType: 'pie',
      xAxisKey: 'Category',
      yAxisKey: 'Profit',
      aggregation: 'sum'
    },
    {
      id: 'w4',
      title: 'Total Enterprise Revenue KPI',
      chartType: 'kpi',
      xAxisKey: 'CustomerType',
      yAxisKey: 'Revenue',
      aggregation: 'sum'
    }
  ]);

  // DB Connector Form State
  const [dbConfig, setDbConfig] = useState({
    host: 'localhost',
    port: '5432',
    dbName: 'analytics_db',
    user: 'postgres',
    password: '',
    query: 'SELECT * FROM sales_transactions WHERE region IS NOT NULL;'
  });
  const [isConnectingDb, setIsConnectingDb] = useState(false);

  const columns = useMemo(() => {
    if (!dataset || dataset.length === 0) return [];
    return Object.keys(dataset[0]).map(col => {
      const val = dataset[0][col];
      let type = "string";
      if (typeof val === "number") type = "numeric";
      else if (!isNaN(Date.parse(val)) && typeof val === "string" && val.includes("-")) type = "date";
      return { name: col, type };
    });
  }, [dataset]);

  const uniqueRegions = useMemo(() => {
    const set = new Set(dataset.map(item => item.Region).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [dataset]);

  const uniqueCategories = useMemo(() => {
    const set = new Set(dataset.map(item => item.Category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [dataset]);

  const uniqueCustomerTypes = useMemo(() => {
    const set = new Set(dataset.map(item => item.CustomerType).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [dataset]);

  const filteredDataset = useMemo(() => {
    return dataset.filter(row => {
      const matchRegion = selectedRegion === "All" || row.Region === selectedRegion;
      const matchCategory = selectedCategory === "All" || row.Category === selectedCategory;
      const matchCustomer = selectedCustomerType === "All" || row.CustomerType === selectedCustomerType;
      return matchRegion && matchCategory && matchCustomer;
    });
  }, [dataset, selectedRegion, selectedCategory, selectedCustomerType]);

  const aggregateData = (xAxis, yAxis, aggregation) => {
    if (!xAxis || !yAxis || filteredDataset.length === 0) return [];

    const grouped = {};
    filteredDataset.forEach(row => {
      const key = row[xAxis] ?? "Unknown";
      const rawVal = parseFloat(row[yAxis]);
      const val = isNaN(rawVal) ? 0 : rawVal;

      if (!grouped[key]) {
        grouped[key] = { count: 0, sum: 0, min: val, max: val, values: [] };
      }

      grouped[key].count += 1;
      grouped[key].sum += val;
      grouped[key].min = Math.min(grouped[key].min, val);
      grouped[key].max = Math.max(grouped[key].max, val);
      grouped[key].values.push(val);
    });

    return Object.keys(grouped).map(groupKey => {
      const g = grouped[groupKey];
      let finalVal = 0;
      if (aggregation === 'sum') finalVal = g.sum;
      else if (aggregation === 'avg') finalVal = g.sum / g.count;
      else if (aggregation === 'count') finalVal = g.count;
      else if (aggregation === 'min') finalVal = g.min;
      else if (aggregation === 'max') finalVal = g.max;

      return {
        name: groupKey,
        value: Number(finalVal.toFixed(2))
      };
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length > 1) {
        const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
        const parsedData = lines.slice(1).map((line, idx) => {
          const values = line.split(',').map(v => v.replace(/^"|"$/g, '').trim());
          const obj = { id: idx + 1 };
          headers.forEach((h, i) => {
            const rawVal = values[i];
            const numVal = Number(rawVal);
            obj[h] = !isNaN(numVal) && rawVal !== "" ? numVal : rawVal;
          });
          return obj;
        });
        setDataset(parsedData);
        setDatasetName(file.name);
        setIsUploadModalOpen(false);
      }
    };
    reader.readAsText(file);
  };

  const handleConnectDb = (e) => {
    e.preventDefault();
    setIsConnectingDb(true);
    setTimeout(() => {
      setIsConnectingDb(false);
      setIsDbModalOpen(false);
      setDatasetName(`SQL Query: ${dbConfig.dbName}`);
      // Refresh with generated simulated SQL response
      setDataset([
        { id: 101, Date: "2024-05-01", Region: "Database North", Product: "Cloud DB Cluster", Category: "Software", Sales: 34000, Revenue: 42000, Units: 5, Profit: 12000, CustomerType: "Enterprise" },
        { id: 102, Date: "2024-05-02", Region: "Database East", Product: "Managed PostgreSQL", Category: "Software", Sales: 18000, Revenue: 21000, Units: 8, Profit: 6500, CustomerType: "SMB" },
        { id: 103, Date: "2024-05-03", Region: "Database West", Product: "Analytics Node", Category: "Software", Sales: 29000, Revenue: 35000, Units: 6, Profit: 9000, CustomerType: "Enterprise" }
      ]);
    }, 1200);
  };

  const addWidget = () => {
    const numericCols = columns.filter(c => c.type === 'numeric').map(c => c.name);
    const catCols = columns.map(c => c.name);

    const newW = {
      id: `w_${Date.now()}`,
      title: `Metric Analysis ${widgets.length + 1}`,
      chartType: 'bar',
      xAxisKey: catCols[0] || 'Region',
      yAxisKey: numericCols[0] || 'Sales',
      aggregation: 'sum'
    };
    setWidgets([...widgets, newW]);
  };

  const removeWidget = (id) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const updateWidget = (id, key, val) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, [key]: val } : w));
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'} flex flex-col font-sans transition-colors duration-200`}>
      
      {}
      <header className={`border-b ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm`}>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white font-bold flex items-center shadow-indigo-500/20 shadow-md">
            <LayoutDashboard size={20} className="mr-2" />
            <span className="tracking-wide">StrongBI Studio</span>
          </div>
          <div className="h-5 w-px bg-slate-700/50 mx-1"></div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium flex items-center">
            <FileText size={12} className="mr-1.5" /> {datasetName}
          </span>
        </div>

        {/* Center Toggle: Report vs Data View */}
        <div className={`flex p-1 rounded-lg border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-200 border-slate-300'}`}>
          <button 
            onClick={() => setActiveView('report')}
            className={`flex items-center px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${activeView === 'report' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <BarChart2 size={14} className="mr-1.5" /> Report View
          </button>
          <button 
            onClick={() => setActiveView('data')}
            className={`flex items-center px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${activeView === 'data' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Table size={14} className="mr-1.5" /> Data View ({dataset.length})
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center text-xs px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 transition font-medium"
          >
            <Upload size={14} className="mr-1.5 text-indigo-400" /> Upload File
          </button>
          <button 
            onClick={() => setIsDbModalOpen(true)}
            className="flex items-center text-xs px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 transition font-medium"
          >
            <Database size={14} className="mr-1.5 text-emerald-400" /> Connect SQL
          </button>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700 transition"
          >
            {darkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-slate-600" />}
          </button>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex flex-1 overflow-hidden">

        {}
        <aside className={`w-64 border-r ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} p-4 flex flex-col space-y-5 overflow-y-auto`}>
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3 flex items-center">
              <Filter size={14} className="mr-1.5 text-indigo-400" /> Global Slicers
            </h3>
            
            {/* Filter 1: Region */}
            <div className="mb-4">
              <label className="text-xs font-medium text-slate-300 block mb-1">Region</label>
              <select 
                value={selectedRegion} 
                onChange={(e) => setSelectedRegion(e.target.value)}
                className={`w-full text-xs rounded-md p-2 border ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'} focus:ring-1 focus:ring-indigo-500`}
              >
                {uniqueRegions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Filter 2: Category */}
            <div className="mb-4">
              <label className="text-xs font-medium text-slate-300 block mb-1">Category</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full text-xs rounded-md p-2 border ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'} focus:ring-1 focus:ring-indigo-500`}
              >
                {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Filter 3: Customer Type */}
            <div className="mb-4">
              <label className="text-xs font-medium text-slate-300 block mb-1">Customer Type</label>
              <select 
                value={selectedCustomerType} 
                onChange={(e) => setSelectedCustomerType(e.target.value)}
                className={`w-full text-xs rounded-md p-2 border ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'} focus:ring-1 focus:ring-indigo-500`}
              >
                {uniqueCustomerTypes.map(ct => <option key={ct} value={ct}>{ct}</option>)}
              </select>
            </div>

            <button 
              onClick={() => { setSelectedRegion('All'); setSelectedCategory('All'); setSelectedCustomerType('All'); }}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center font-medium mt-1"
            >
              <RefreshCw size={12} className="mr-1" /> Reset All Filters
            </button>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3 flex items-center">
              <Layers size={14} className="mr-1.5 text-emerald-400" /> Inferred Schema
            </h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {columns.map(col => (
                <div key={col.name} className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-800/40 border border-slate-800/80">
                  <span className="font-mono text-slate-300 truncate max-w-[120px]">{col.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                    col.type === 'numeric' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                    col.type === 'date' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {col.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {}
        <main className="flex-1 overflow-y-auto p-6">
          {activeView === 'report' ? (
            <div>
              {/* Dashboard Canvas Toolbar */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-lg font-bold text-slate-100">Interactive Analytics Canvas</h1>
                  <p className="text-xs text-slate-400">Filtered results: {filteredDataset.length} of {dataset.length} records</p>
                </div>
                <button 
                  onClick={addWidget}
                  className="flex items-center text-xs px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-indigo-600/30 shadow-md transition"
                >
                  <Plus size={14} className="mr-1.5" /> Add Chart Widget
                </button>
              </div>

              {/* Grid Widgets Render */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {widgets.map(w => {
                  const chartData = aggregateData(w.xAxisKey, w.yAxisKey, w.aggregation);
                  
                  return (
                    <div key={w.id} className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'} shadow-lg flex flex-col justify-between`}>
                      
                      {/* Widget Header & Controls */}
                      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/60">
                        <input 
                          type="text" 
                          value={w.title} 
                          onChange={(e) => updateWidget(w.id, 'title', e.target.value)}
                          className="bg-transparent text-sm font-bold text-slate-200 focus:outline-none focus:border-b border-indigo-500"
                        />
                        <button 
                          onClick={() => removeWidget(w.id)}
                          className="text-slate-500 hover:text-rose-400 transition p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Config Controls Row */}
                      <div className="grid grid-cols-4 gap-2 mb-4 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Chart Type</label>
                          <select 
                            value={w.chartType}
                            onChange={(e) => updateWidget(w.id, 'chartType', e.target.value)}
                            className="w-full text-[11px] bg-slate-900 border border-slate-700 rounded p-1 text-slate-200"
                          >
                            <option value="bar">Bar Chart</option>
                            <option value="line">Line Chart</option>
                            <option value="area">Area Chart</option>
                            <option value="pie">Pie Chart</option>
                            <option value="kpi">KPI Card</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">X-Axis (Group)</label>
                          <select 
                            value={w.xAxisKey}
                            onChange={(e) => updateWidget(w.id, 'xAxisKey', e.target.value)}
                            className="w-full text-[11px] bg-slate-900 border border-slate-700 rounded p-1 text-slate-200"
                          >
                            {columns.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Y-Axis (Metric)</label>
                          <select 
                            value={w.yAxisKey}
                            onChange={(e) => updateWidget(w.id, 'yAxisKey', e.target.value)}
                            className="w-full text-[11px] bg-slate-900 border border-slate-700 rounded p-1 text-slate-200"
                          >
                            {columns.filter(c => c.type === 'numeric').map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Aggregate</label>
                          <select 
                            value={w.aggregation}
                            onChange={(e) => updateWidget(w.id, 'aggregation', e.target.value)}
                            className="w-full text-[11px] bg-slate-900 border border-slate-700 rounded p-1 text-slate-200"
                          >
                            <option value="sum">Sum</option>
                            <option value="avg">Average</option>
                            <option value="count">Count</option>
                            <option value="min">Min</option>
                            <option value="max">Max</option>
                          </select>
                        </div>
                      </div>

                      {/* Chart Graphical Engine */}
                      <div className="h-64 w-full flex items-center justify-center">
                        {w.chartType === 'kpi' ? (
                          <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-indigo-900/20 to-slate-900 rounded-xl border border-indigo-500/20">
                            <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold mb-1">
                              {w.aggregation} of {w.yAxisKey}
                            </span>
                            <span className="text-4xl font-extrabold text-white">
                              {chartData.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}
                            </span>
                            <span className="text-xs text-slate-400 mt-2 flex items-center">
                              <ArrowUpRight size={14} className="text-emerald-400 mr-1" /> Dynamic Slicer Aggregate
                            </span>
                          </div>
                        ) : w.chartType === 'bar' ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : w.chartType === 'line' ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : w.chartType === 'area' ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                              <Area type="monotone" dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                            </AreaChart>
                          </ResponsiveContainer>
                        ) : w.chartType === 'pie' ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={{ fontSize: 10 }}>
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : null}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className={`p-5 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-md font-bold text-slate-200">Dataset Table Preview</h2>
                <span className="text-xs text-slate-400">Showing all {filteredDataset.length} rows</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80">
                      {columns.map(col => (
                        <th key={col.name} className="p-3 text-slate-400 font-semibold font-mono">
                          {col.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDataset.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-800/40 hover:bg-slate-800/30 transition">
                        {columns.map(col => (
                          <td key={col.name} className="p-3 text-slate-300">
                            {row[col.name]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {}
      {isDbModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-md font-bold text-slate-100 flex items-center">
                <Database size={18} className="mr-2 text-emerald-400" /> PostgreSQL / MySQL Connector
              </h3>
              <button onClick={() => setIsDbModalOpen(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <form onSubmit={handleConnectDb} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Host</label>
                  <input type="text" value={dbConfig.host} onChange={e => setDbConfig({...dbConfig, host: e.target.value})} className="w-full text-xs p-2 rounded bg-slate-950 border border-slate-800 text-slate-200" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Port</label>
                  <input type="text" value={dbConfig.port} onChange={e => setDbConfig({...dbConfig, port: e.target.value})} className="w-full text-xs p-2 rounded bg-slate-950 border border-slate-800 text-slate-200" />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Database Name</label>
                <input type="text" value={dbConfig.dbName} onChange={e => setDbConfig({...dbConfig, dbName: e.target.value})} className="w-full text-xs p-2 rounded bg-slate-950 border border-slate-800 text-slate-200" />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">SQL Query</label>
                <textarea rows="3" value={dbConfig.query} onChange={e => setDbConfig({...dbConfig, query: e.target.value})} className="w-full text-xs font-mono p-2 rounded bg-slate-950 border border-slate-800 text-emerald-400 focus:outline-none" />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsDbModalOpen(false)} className="px-4 py-2 text-xs bg-slate-800 text-slate-300 rounded hover:bg-slate-700">Cancel</button>
                <button type="submit" disabled={isConnectingDb} className="px-4 py-2 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-500 font-semibold flex items-center">
                  {isConnectingDb ? <RefreshCw size={14} className="animate-spin mr-1.5" /> : <Play size={14} className="mr-1.5" />} Execute & Load Dataframe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-md font-bold text-slate-100 flex items-center">
                <Upload size={18} className="mr-2 text-indigo-400" /> Upload CSV Data File
              </h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-8 text-center bg-slate-950/50 transition">
              <Upload size={32} className="mx-auto text-indigo-400 mb-2" />
              <p className="text-xs text-slate-300 font-medium mb-1">Drag and drop your file here, or click to browse</p>
              <p className="text-[10px] text-slate-500 mb-4">Supports standard CSV files with headers</p>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="fileInput" />
              <label htmlFor="fileInput" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded cursor-pointer transition">
                Select CSV File
              </label>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
