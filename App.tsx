
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import MetricCard from './components/MetricCard';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts';
import { 
  Search, Bell, User, MessageSquare, Send, Sparkles, 
  AlertCircle, CheckCircle2, Ticket, Settings, 
  PieChart as PieChartIcon, Filter, Download, Plus,
  ChevronRight, Zap, Target, History, RefreshCw, Layers
} from 'lucide-react';
import { generateMarketingPlan } from './services/geminiService';
import { ChatMessage, MarketingPlan, AppView, CouponStrategy } from './types';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

const INITIAL_DATA = [
  { name: '抖音投放', value: 45000 },
  { name: '微信私域', value: 25000 },
  { name: '淘宝直通车', value: 35000 },
  { name: '搜索关键词', value: 15000 },
];

const HISTORICAL_PERFORMANCE = [
  { month: '1月', budget: 4000, revenue: 12000, roi: 3.0 },
  { month: '2月', budget: 5000, revenue: 15000, roi: 3.0 },
  { month: '3月', budget: 6000, revenue: 18000, roi: 3.0 },
  { month: '4月', budget: 7000, revenue: 22000, roi: 3.1 },
  { month: '5月', budget: 8500, revenue: 28000, roi: 3.3 },
  { month: '6月', budget: 10000, revenue: 35000, roi: 3.5 },
];

const STRATEGIES: CouponStrategy[] = [
  { type: '满减券', value: '100-20', targetSegment: '沉睡30天用户', triggerCondition: 'APP推送', efficiency: 18.5, status: 'RUNNING' },
  { type: '折扣券', value: '8.5折', targetSegment: '高客单价潜在用户', triggerCondition: '加购后1小时', efficiency: 24.2, status: 'RUNNING' },
  { type: '新人礼', value: '50无门槛', targetSegment: '注册未首单用户', triggerCondition: '注册完成', efficiency: 32.1, status: 'TESTING' },
];

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: '您好！我是您的智能营销助手。您可以切换左侧菜单查看不同维度的分析，或直接在这里向我提问，如：“帮我分析下个月的预算分配方案”。' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePlan, setActivePlan] = useState<MarketingPlan | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isGenerating) return;
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setIsGenerating(true);

    try {
      const plan = await generateMarketingPlan(userInput);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `根据您的实时需求，我已为您生成了 **${plan.name}**。该方案着重于 ${plan.objective}，您可以直接在“预算分配”页查看详细明细。`,
        plan 
      }]);
      setActivePlan(plan);
      // Automatically switch to contextually relevant view if plan generated
      if (userInput.includes('预算') || userInput.includes('钱')) setActiveView(AppView.BUDGET);
      else if (userInput.includes('券') || userInput.includes('优惠')) setActiveView(AppView.COUPONS);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，系统暂时繁忙。请确保网络连接正常并重试。' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Sub-Views Rendering ---

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="本月总预算消耗" value="124,500" change={12} isTrendUp={true} prefix="¥" />
        <MetricCard title="整体 ROI" value="4.82" change={8.5} isTrendUp={true} />
        <MetricCard title="发券核销率" value="28.4%" change={3.2} isTrendUp={false} />
        <MetricCard title="预估增量GMV" value="452,000" change={15.4} isTrendUp={true} prefix="¥" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">各渠道预算分布</h3>
            <button className="text-slate-400 hover:text-slate-600"><Filter className="w-4 h-4" /></button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={INITIAL_DATA} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                  {INITIAL_DATA.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">投放趋势分析</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-indigo-500" /> 预算</span>
              <span className="flex items-center gap-1 text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-pink-500" /> 收入</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HISTORICAL_PERFORMANCE}>
                <defs>
                  <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip />
                <Area type="monotone" dataKey="budget" stroke="#6366f1" fillOpacity={1} fill="url(#colorBudget)" strokeWidth={2} />
                <Area type="monotone" dataKey="revenue" stroke="#ec4899" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBudgetView = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-xl font-bold text-slate-800">预算智能调优</h3>
          <p className="text-slate-500 text-sm">AI实时扫描全渠道ROI，为您推荐最优分配方案</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> 导出报表
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
            <Zap className="w-4 h-4" /> 立即优化计划
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-slate-800">各渠道预算微调 (人工/AI 协同)</h4>
              <span className="text-xs font-bold text-indigo-600 px-2 py-1 bg-indigo-50 rounded-lg">剩余未分配: ¥0</span>
            </div>
            <div className="space-y-8">
              {[
                { name: '抖音信息流', current: 45000, recommended: 52000, roi: 5.4 },
                { name: '微信朋友圈', current: 25000, recommended: 18000, roi: 3.2 },
                { name: '天猫品专', current: 35000, recommended: 35000, roi: 4.8 },
                { name: '小红书KOL', current: 15000, recommended: 19500, roi: 6.1 },
              ].map((channel, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-700">{channel.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-400">ROI: {channel.roi}</span>
                      <span className="text-sm font-bold text-slate-900">¥{channel.current.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full" style={{ width: `${(channel.current / 60000) * 100}%` }} />
                    <div className="absolute top-0 left-0 h-full border-r-2 border-white opacity-0 group-hover:opacity-100" style={{ left: `${(channel.recommended / 60000) * 100}%` }} />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] text-slate-400">预估下限 ¥10,000</span>
                    <span className="text-[10px] text-indigo-500 font-bold">AI 建议: ¥{channel.recommended.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-xl shadow-indigo-100">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-200" />
              <h4 className="font-bold">AI 调优洞察</h4>
            </div>
            <p className="text-sm text-indigo-100 leading-relaxed mb-6">
              基于过去24小时数据，我们发现“小红书KOL”渠道的点击率提升了24%，建议追加 <b>¥4,500</b> 预算以捕捉潜在流量红利。同时，“微信朋友圈”进入衰退期，建议缩减 15% 预算。
            </p>
            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold border border-white/20 transition-all">
              查看完整策略报告
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-4">场景模拟器</h4>
            <div className="space-y-4">
              <p className="text-xs text-slate-500">如果下个月总预算增加 <b>20%</b></p>
              <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">预估 ROI 将达到</span>
                  <span className="text-emerald-600 font-bold">+0.45</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">额外增量 GMV</span>
                  <span className="text-emerald-600 font-bold">¥84,000</span>
                </div>
              </div>
              <button className="w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900">
                运行更多模拟
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCouponView = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-800">全路径自动化发券</h3>
          <p className="text-slate-500 text-sm">根据用户实时行为匹配最优权益方案</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100">
          <Plus className="w-4 h-4" /> 新建发券策略
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STRATEGIES.map((strat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-200 transition-all hover:shadow-md group relative">
            <div className={`absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              strat.status === 'RUNNING' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {strat.status === 'RUNNING' ? '投放中' : 'AB测试中'}
            </div>
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Ticket className="w-6 h-6 text-rose-500" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">{strat.type} · {strat.value}</h4>
            <p className="text-sm text-slate-500 mb-6">针对: {strat.targetSegment}</p>
            
            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1"><Zap className="w-3 h-3" /> 触发条件</span>
                <span className="text-xs font-bold text-slate-700">{strat.triggerCondition}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1"><Target className="w-3 h-3" /> 当前转化率</span>
                <span className="text-sm font-bold text-emerald-600">{strat.efficiency}%</span>
              </div>
            </div>
            
            <div className="mt-6 flex gap-2">
              <button className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100">调整逻辑</button>
              <button className="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100">查看报表</button>
            </div>
          </div>
        ))}
        {/* Placeholder for new strategy */}
        <div className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-400 hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-all">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium">添加智能推荐策略</span>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200">
        <h4 className="font-bold text-slate-800 mb-6">策略联动画布 (简易视图)</h4>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-xs font-bold text-slate-400 mb-2 uppercase">发现/进店</p>
            <div className="py-2 bg-white rounded-lg shadow-sm text-sm font-medium">新人千人千面礼包</div>
          </div>
          <ChevronRight className="text-slate-300 w-5 h-5 flex-shrink-0" />
          <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-xs font-bold text-slate-400 mb-2 uppercase">加购行为</p>
            <div className="py-2 bg-white rounded-lg shadow-sm text-sm font-medium">限时凑单满减券</div>
          </div>
          <ChevronRight className="text-slate-300 w-5 h-5 flex-shrink-0" />
          <div className="flex-1 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
            <p className="text-xs font-bold text-indigo-400 mb-2 uppercase">流失预警</p>
            <div className="py-2 bg-indigo-600 text-white rounded-lg shadow-md text-sm font-bold">大额回流无门槛券</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalysisView = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-800">全链路效果回溯</h3>
          <p className="text-slate-500 text-sm">从流量引入到最终转化的归因深度解析</p>
        </div>
        <div className="flex bg-white border border-slate-200 rounded-xl p-1">
          <button className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-sm">昨日</button>
          <button className="px-4 py-1.5 text-slate-500 hover:text-slate-700 text-xs font-medium">近7天</button>
          <button className="px-4 py-1.5 text-slate-500 hover:text-slate-700 text-xs font-medium">本月</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <div className="flex justify-between items-center mb-8">
          <h4 className="font-bold text-slate-800">营销漏斗转化分析</h4>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1 text-slate-500"><div className="w-2 h-2 bg-indigo-500 rounded-full" /> 展现人数</span>
            <span className="flex items-center gap-1 text-slate-500"><div className="w-2 h-2 bg-pink-500 rounded-full" /> 点击人数</span>
            <span className="flex items-center gap-1 text-slate-500"><div className="w-2 h-2 bg-amber-500 rounded-full" /> 最终成交</span>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={HISTORICAL_PERFORMANCE}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize:12, fill: '#94a3b8'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize:12, fill: '#94a3b8'}} />
              <Tooltip />
              <Bar dataKey="revenue" name="GMV" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              <Line type="monotone" dataKey="roi" name="ROI趋势" stroke="#f59e0b" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h4 className="font-bold text-slate-800 mb-6">渠道归因权重 (MTA)</h4>
          <div className="space-y-6">
            {[
              { name: '直接打开', val: 35, color: 'bg-indigo-500' },
              { name: '搜索关键词', val: 25, color: 'bg-pink-500' },
              { name: 'KOL种草', val: 20, color: 'bg-emerald-500' },
              { name: '朋友圈广告', val: 15, color: 'bg-amber-500' },
              { name: '其他', val: 5, color: 'bg-slate-400' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-600">{item.name}</span>
                  <span className="font-bold text-slate-900">{item.val}%</span>
                </div>
                <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center">
          <div className="text-center mb-6">
            <h4 className="font-bold text-slate-800">流失漏斗洞察</h4>
            <p className="text-xs text-slate-500">发现 32% 的用户在“填写收货地址”环节流失</p>
          </div>
          <div className="relative w-full max-w-xs space-y-1">
            <div className="w-full bg-indigo-600 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold">100% 访问落地页</div>
            <div className="w-[85%] mx-auto bg-indigo-500 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold">85% 点击商品</div>
            <div className="w-[60%] mx-auto bg-indigo-400 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold">60% 加入购物车</div>
            <div className="w-[40%] mx-auto bg-amber-500 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold">40% 确认订单</div>
            <div className="w-[12%] mx-auto bg-emerald-500 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold">12% 支付成功</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {activeView === AppView.DASHBOARD && '智能决策概览'}
              {activeView === AppView.BUDGET && '预算智能调优'}
              {activeView === AppView.COUPONS && '自动化发券策略'}
              {activeView === AppView.ANALYSIS && '效果深度回溯'}
            </h2>
            <p className="text-slate-500 text-sm">
              {activeView === AppView.DASHBOARD && '实时监控您的营销矩阵健康度'}
              {activeView === AppView.BUDGET && 'AI协助进行动态渠道配比优化'}
              {activeView === AppView.COUPONS && '精细化人群权益匹配与链路追踪'}
              {activeView === AppView.ANALYSIS && '通过MTA模型透视多端转化贡献'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="全局搜索..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48" />
            </div>
            <button className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 relative"><Bell className="w-5 h-5 text-slate-600" /><span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" /></button>
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
              <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden border border-indigo-200"><User className="w-5 h-5 text-indigo-600" /></div>
              <div className="text-left hidden lg:block"><p className="text-sm font-semibold text-slate-800">Admin</p><p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Chief Growth Officer</p></div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3 pb-20">
            {activeView === AppView.DASHBOARD && renderDashboard()}
            {activeView === AppView.BUDGET && renderBudgetView()}
            {activeView === AppView.COUPONS && renderCouponView()}
            {activeView === AppView.ANALYSIS && renderAnalysisView()}
          </div>

          <aside className="xl:col-span-1">
            <div className="bg-white h-[calc(100vh-160px)] rounded-3xl border border-slate-200 shadow-xl flex flex-col sticky top-8 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center"><Sparkles className="text-white w-4 h-4" /></div>
                  <div><h3 className="text-sm font-bold text-slate-800">智能助手</h3><div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /><span className="text-[10px] text-emerald-500 font-bold">2.5 PRO ACTIVE</span></div></div>
                </div>
                <button className="text-slate-400 hover:text-indigo-600"><RefreshCw className="w-4 h-4" /></button>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                      {msg.content}
                      {msg.plan && (
                        <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-800">
                          <div className="flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4 text-indigo-600" /><span className="text-xs font-bold">新方案已准备就绪</span></div>
                          <button onClick={() => setActiveView(AppView.BUDGET)} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all">在预算页查看明细</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 rounded-tl-none shadow-sm flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                      <span className="text-xs text-slate-500 font-medium italic">正在进行深度策略推演...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
                  {["下月预算建议", "优惠券AB测试", "渠道归因报告"].map((tip, i) => (
                    <button key={i} onClick={() => setUserInput(tip)} className="flex-shrink-0 text-[10px] px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all font-bold">
                      {tip}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())} placeholder="输入指令或提问..." className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none min-h-[90px]" />
                  <button onClick={handleSendMessage} disabled={isGenerating || !userInput.trim()} className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all ${userInput.trim() && !isGenerating ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-200 text-slate-400'}`}><Send className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default App;
