import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Upload, Database, Table, BarChart2, Plus, Trash2, Filter, RefreshCw, 
  Download, Play, Layers, Sun, Moon, CheckCircle2, ChevronRight, FileText, 
  Settings, Grid, LayoutDashboard, Sliders, ArrowUpRight, Shield, AlertCircle, GripHorizontal, Maximize2
} from 'lucide-react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const handleFileUpload = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8005";

  try {
    const res = await fetch(`${API_BASE_URL}/api/upload`, {
      method: "POST",
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

const COLOR_PALETTE = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6', '#ec4899'];

const INITIAL_LAYOUT = [
  { x: 0, y: 0, w: 2, h: 2, i: 'w1', static: false },
  { x: 2, y: 0, w: 2, h: 2, i: 'w2', static: false },
  { x: 4, y: 0, w: 2, h: 2, i: 'w3', static: false },
  { x: 0, y: 2, w: 2, h: 2, i: 'w4', static: false },
];

export default function App() {
  const [dataset, setDataset] = useState(INITIAL_SAMPLE_DATA);
  const [datasetName, setDatasetName] = useState("Global_Sales_Dataset.csv");
  const [activeView, setActiveView] = useState("report");
  const [darkMode, setDarkMode] = useState(true);
  
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCustomerType, setSelectedCustomerType] = useState("All");
  
  const [layout, setLayout] = useState(INITIAL_LAYOUT);
  const [isEditMode, setIsEditMode] = useState(false);

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
      title: 'Sales Trend Over Time',
      chartType: 'line',
      xAxisKey: 'Date',
      yAxisKey: 'Sales',
      aggregation: 'sum'
    },
    {
      id: 'w3',
      title: 'Profit Distribution',
      chartType: 'pie',
      xAxisKey: 'Category',
      yAxisKey: 'Profit',
      aggregation: 'sum'
    },
    {
      id: 'w4',
      title: 'Enterprise Revenue',
      chartType: 'kpi',
      xAxisKey: 'CustomerType',
      yAxisKey: 'Revenue',
      aggregation: 'sum'
    }
  ]);

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
      title: `New Chart ${widgets.length + 1}`,
      chartType: 'bar',
      xAxisKey: catCols[0] || 'Region',
      yAxisKey: numericCols[0] || 'Sales',
      aggregation: 'sum'
    };
    setWidgets([...widgets, newW]);
    
    const newLayout = { x: 0, y: Infinity, w: 2, h: 2, i: newW.id };
    setLayout([...layout, newLayout]);
  };

  const removeWidget = (id) => {
    setWidgets(widgets.filter(w => w.id !== id));
    setLayout(layout.filter(l => l.i !== id));
  };

  const updateWidget = (id, key, val) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, [key]: val } : w));
  };

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };

  const renderChart = (widget, chartData) => {
    const commonProps = {
      margin: { top: 5, right: 5, bottom: 5, left: 5 }
    };

    switch(widget.chartType) {
      case 'kpi':
        return (
          <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-purple-900/30 to-transparent rounded-lg border border-purple-500/20 p-4">
            <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold mb-2 opacity-70">
              {widget.aggregation} {widget.yAxisKey}
            </span>
            <span className="text-5xl font-extrabold text-white tabular-nums">
              {chartData.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 mt-3 flex items-center">
              <ArrowUpRight size={14} className="text-emerald-400 mr-1" /> Based on filters
            </span>
          </div>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderColor: 'rgba(139, 92, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
              />
              <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderColor: 'rgba(139, 92, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
              />
              <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3, fill: '#06b6d4' }} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderColor: 'rgba(139, 92, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={{ fontSize: 11, fill: '#e2e8f0' }}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderColor: 'rgba(139, 92, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans transition-colors duration-300`}>
      
      {/* Header */}
      <header className={`border-b ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'} px-6 py-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur-sm`}>
        <div className="flex items-center space-x-4">
          <div className="p-2.5 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg text-white font-bold flex items-center shadow-lg shadow-purple-500/20">
            <LayoutDashboard size={20} className="mr-2" />
            <span className="tracking-wider text-sm">PowerBI Studio</span>
          </div>
          <div className={`h-6 w-px ${darkMode ? 'bg-slate-700/50' : 'bg-slate-300'} mx-2`}></div>
          <span className={`text-xs px-3 py-1.5 rounded-full ${darkMode ? 'bg-purple-500/15 border border-purple-500/30 text-purple-300' : 'bg-purple-100 border border-purple-300 text-purple-700'} font-medium flex items-center`}>
            <FileText size={12} className="mr-1.5" /> {datasetName}
          </span>
        </div>

        {/* Center Controls */}
        <div className={`flex gap-3 items-center`}>
          <div className={`flex p-1 rounded-lg border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
            <button 
              onClick={() => setActiveView('report')}
              className={`flex items-center px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${activeView === 'report' ? 'bg-purple-600 text-white shadow-sm' : `${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'}`}`}
            >
              <BarChart2 size={14} className="mr-1.5" /> Report
            </button>
            <button 
              onClick={() => setActiveView('data')}
              className={`flex items-center px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${activeView === 'data' ? 'bg-purple-600 text-white shadow-sm' : `${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'}`}`}
            >
              <Table size={14} className="mr-1.5" /> Data
            </button>
          </div>

          {activeView === 'report' && (
            <button 
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center text-xs px-3 py-1.5 rounded-lg transition font-medium ${isEditMode ? 'bg-purple-600 text-white' : `${darkMode ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700' : 'bg-slate-200 hover:bg-slate-300 border border-slate-300'}`}`}
            >
              <Grid size={14} className="mr-1.5" /> {isEditMode ? 'Done Editing' : 'Edit Layout'}
            </button>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className={`flex items-center text-xs px-3 py-1.5 rounded-lg transition font-medium ${darkMode ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-700'}`}
          >
            <Upload size={14} className="mr-1.5 text-purple-400" /> Upload
          </button>
          <button 
            onClick={() => setIsDbModalOpen(true)}
            className={`flex items-center text-xs px-3 py-1.5 rounded-lg transition font-medium ${darkMode ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-700'}`}
          >
            <Database size={14} className="mr-1.5 text-cyan-400" /> SQL
          </button>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-1.5 rounded-lg transition ${darkMode ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700' : 'bg-slate-200 hover:bg-slate-300 border border-slate-300'}`}
          >
            {darkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-slate-600" />}
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden gap-6 p-6">
        
        {/* Sidebar */}
        <aside className={`w-72 flex-shrink-0 overflow-y-auto rounded-xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} p-5 space-y-6`}>
          
          {/* Filters Section */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-4 flex items-center">
              <Filter size={14} className="mr-2 text-purple-400" /> Filters
            </h3>
            
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Region</label>
                <select 
                  value={selectedRegion} 
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className={`w-full text-xs rounded-lg p-2.5 border transition ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-purple-500' : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-purple-500'} focus:outline-none focus:ring-1 focus:ring-purple-500/30`}
                >
                  {uniqueRegions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Category</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full text-xs rounded-lg p-2.5 border transition ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-purple-500' : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-purple-500'} focus:outline-none focus:ring-1 focus:ring-purple-500/30`}
                >
                  {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Customer Type</label>
                <select 
                  value={selectedCustomerType} 
                  onChange={(e) => setSelectedCustomerType(e.target.value)}
                  className={`w-full text-xs rounded-lg p-2.5 border transition ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-purple-500' : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-purple-500'} focus:outline-none focus:ring-1 focus:ring-purple-500/30`}
                >
                  {uniqueCustomerTypes.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                </select>
              </div>

              <button 
                onClick={() => { setSelectedRegion('All'); setSelectedCategory('All'); setSelectedCustomerType('All'); }}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center font-semibold mt-2 transition"
              >
                <RefreshCw size={12} className="mr-1.5" /> Reset Filters
              </button>
            </div>
          </div>

          <div className={`border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'} pt-6`}>
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-4 flex items-center">
              <Layers size={14} className="mr-2 text-cyan-400" /> Schema
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {columns.map(col => (
                <div key={col.name} className={`flex items-center justify-between text-xs p-2.5 rounded-lg border transition ${darkMode ? 'bg-slate-800/40 border-slate-800/80 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                  <span className="font-mono text-slate-300 truncate max-w-[140px]">{col.name}</span>
                  <span className={`text-[10px] px-2 py-1 rounded font-semibold whitespace-nowrap ${
                    col.type === 'numeric' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20' : 
                    col.type === 'date' ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20' : 
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {col.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={`border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'} pt-6`}>
            <p className="text-xs text-slate-500">Filtered: <span className="text-purple-400 font-semibold">{filteredDataset.length}</span> / {dataset.length} rows</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {activeView === 'report' ? (
            <div>
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-100">Analytics Dashboard</h1>
                  <p className="text-sm text-slate-400 mt-1">{isEditMode ? '✏️ Drag tiles to reposition, resize from corners' : 'Interactive analytics canvas'}</p>
                </div>
                <button 
                  onClick={addWidget}
                  className="flex items-center text-sm px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold shadow-lg shadow-purple-600/30 transition-all"
                >
                  <Plus size={16} className="mr-2" /> Add Chart
                </button>
              </div>

              {/* Grid Layout */}
              <ResponsiveGridLayout
                className={`rounded-xl border ${darkMode ? 'border-slate-800' : 'border-slate-200'} p-4 ${darkMode ? 'bg-slate-900/30' : 'bg-slate-50'}`}
                layout={layout}
                onLayoutChange={handleLayoutChange}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 6, md: 4, sm: 3, xs: 2, xxs: 1 }}
                rowHeight={200}
                isDraggable={isEditMode}
                isResizable={isEditMode}
                compactType="vertical"
                preventCollision={false}
                useCSSTransforms={true}
                containerPadding={[0, 0]}
                margin={[16, 16]}
              >
                {widgets.map(w => {
                  const chartData = aggregateData(w.xAxisKey, w.yAxisKey, w.aggregation);
                  
                  return (
                    <div 
                      key={w.id} 
                      className={`group rounded-lg border transition-all ${darkMode ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'} shadow-lg overflow-hidden flex flex-col`}
                    >
                      {/* Header */}
                      <div className={`px-4 py-3 border-b ${darkMode ? 'border-slate-800/60 bg-slate-900/50' : 'border-slate-200 bg-slate-50'} flex items-center justify-between`}>
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {isEditMode && (
                            <GripHorizontal size={16} className="text-slate-500 flex-shrink-0 cursor-move" />
                          )}
                          <input 
                            type="text" 
                            value={w.title} 
                            onChange={(e) => updateWidget(w.id, 'title', e.target.value)}
                            className={`flex-1 text-sm font-semibold ${darkMode ? 'bg-transparent text-slate-200 focus:text-white' : 'bg-transparent text-slate-900'} focus:outline-none border-b-2 ${darkMode ? 'border-transparent focus:border-purple-500' : 'border-transparent focus:border-purple-500'} px-1 py-0.5 truncate`}
                          />
                        </div>
                        <button 
                          onClick={() => removeWidget(w.id)}
                          className="text-slate-500 hover:text-rose-400 transition p-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Config Controls */}
                      <div className={`px-4 py-3 border-b ${darkMode ? 'border-slate-800/40 bg-slate-950/40' : 'border-slate-200 bg-slate-50'} grid grid-cols-4 gap-2`}>
                        <div>
                          <label className={`text-[10px] block mb-1 font-semibold ${darkMode ? 'text-slate-500' : 'text-slate-600'}`}>Chart</label>
                          <select 
                            value={w.chartType}
                            onChange={(e) => updateWidget(w.id, 'chartType', e.target.value)}
                            className={`w-full text-[11px] rounded p-1.5 border ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'} focus:outline-none focus:ring-1 focus:ring-purple-500/30`}
                          >
                            <option value="bar">Bar</option>
                            <option value="line">Line</option>
                            <option value="area">Area</option>
                            <option value="pie">Pie</option>
                            <option value="kpi">KPI</option>
                          </select>
                        </div>

                        <div>
                          <label className={`text-[10px] block mb-1 font-semibold ${darkMode ? 'text-slate-500' : 'text-slate-600'}`}>Group By</label>
                          <select 
                            value={w.xAxisKey}
                            onChange={(e) => updateWidget(w.id, 'xAxisKey', e.target.value)}
                            className={`w-full text-[11px] rounded p-1.5 border ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'} focus:outline-none focus:ring-1 focus:ring-purple-500/30`}
                          >
                            {columns.map(c => <option key={c.name} value={c.name}>{c.name.slice(0, 8)}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className={`text-[10px] block mb-1 font-semibold ${darkMode ? 'text-slate-500' : 'text-slate-600'}`}>Measure</label>
                          <select 
                            value={w.yAxisKey}
                            onChange={(e) => updateWidget(w.id, 'yAxisKey', e.target.value)}
                            className={`w-full text-[11px] rounded p-1.5 border ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'} focus:outline-none focus:ring-1 focus:ring-purple-500/30`}
                          >
                            {columns.filter(c => c.type === 'numeric').map(c => <option key={c.name} value={c.name}>{c.name.slice(0, 8)}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className={`text-[10px] block mb-1 font-semibold ${darkMode ? 'text-slate-500' : 'text-slate-600'}`}>Agg</label>
                          <select 
                            value={w.aggregation}
                            onChange={(e) => updateWidget(w.id, 'aggregation', e.target.value)}
                            className={`w-full text-[11px] rounded p-1.5 border ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'} focus:outline-none focus:ring-1 focus:ring-purple-500/30`}
                          >
                            <option value="sum">Sum</option>
                            <option value="avg">Avg</option>
                            <option value="count">Count</option>
                            <option value="min">Min</option>
                            <option value="max">Max</option>
                          </select>
                        </div>
                      </div>

                      {/* Chart Area */}
                      <div className="flex-1 overflow-hidden p-4">
                        {renderChart(w, chartData)}
                      </div>
                    </div>
                  );
                })}
              </ResponsiveGridLayout>
            </div>
          ) : (
            <div className={`p-6 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Data Table</h2>
                <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{filteredDataset.length} rows</span>
              </div>
              <div className="overflow-x-auto rounded-lg">
                <table className={`w-full text-left text-xs border-collapse`}>
                  <thead>
                    <tr className={`border-b ${darkMode ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50'}`}>
                      {columns.map(col => (
                        <th key={col.name} className={`p-3 font-semibold font-mono ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          {col.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDataset.map((row, idx) => (
                      <tr key={idx} className={`border-b transition ${darkMode ? 'border-slate-800/40 hover:bg-slate-800/30' : 'border-slate-200 hover:bg-slate-50'}`}>
                        {columns.map(col => (
                          <td key={col.name} className={`p-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
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

      {/* DB Modal */}
      {isDbModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-xl max-w-lg w-full p-6 shadow-2xl ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
            <div className={`flex justify-between items-center mb-5 pb-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className="text-lg font-bold flex items-center">
                <Database size={20} className="mr-2 text-cyan-400" /> SQL Connection
              </h3>
              <button onClick={() => setIsDbModalOpen(false)} className={`text-2xl leading-none ${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'}`}>✕</button>
            </div>

            <form onSubmit={handleConnectDb} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Host" value={dbConfig.host} onChange={e => setDbConfig({...dbConfig, host: e.target.value})} className={`text-xs p-2.5 rounded border ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:ring-1 focus:ring-purple-500/30`} />
                <input type="text" placeholder="Port" value={dbConfig.port} onChange={e => setDbConfig({...dbConfig, port: e.target.value})} className={`text-xs p-2.5 rounded border ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:ring-1 focus:ring-purple-500/30`} />
              </div>

              <input type="text" placeholder="Database" value={dbConfig.dbName} onChange={e => setDbConfig({...dbConfig, dbName: e.target.value})} className={`w-full text-xs p-2.5 rounded border ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:ring-1 focus:ring-purple-500/30`} />

              <textarea rows="4" placeholder="SQL Query" value={dbConfig.query} onChange={e => setDbConfig({...dbConfig, query: e.target.value})} className={`w-full text-xs font-mono p-2.5 rounded border ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:ring-1 focus:ring-purple-500/30 resize-none`} />

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setIsDbModalOpen(false)} className={`px-4 py-2 text-xs rounded-lg font-medium transition ${darkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>Cancel</button>
                <button type="submit" disabled={isConnectingDb} className="px-4 py-2 text-xs bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold flex items-center transition disabled:opacity-50">
                  {isConnectingDb ? <RefreshCw size={14} className="animate-spin mr-2" /> : <Play size={14} className="mr-2" />} Execute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-xl max-w-md w-full p-6 shadow-2xl ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
            <div className={`flex justify-between items-center mb-5 pb-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <h3 className="text-lg font-bold flex items-center">
                <Upload size={20} className="mr-2 text-purple-400" /> Upload CSV
              </h3>
              <button onClick={() => setIsUploadModalOpen(false)} className={`text-2xl leading-none ${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'}`}>✕</button>
            </div>

            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition ${darkMode ? 'border-slate-700 hover:border-purple-500 bg-slate-950/50' : 'border-slate-300 hover:border-purple-400 bg-slate-50'}`}>
              <Upload size={40} className="mx-auto text-purple-400 mb-3" />
              <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Drag file here or click to browse</p>
              <p className={`text-[11px] ${darkMode ? 'text-slate-500' : 'text-slate-600'} mb-5`}>CSV format with headers</p>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="fileInput" />
              <label htmlFor="fileInput" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg cursor-pointer transition inline-block">
                Select File
              </label>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
