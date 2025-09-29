import { useState, useEffect } from 'react';
import { get } from '../../utils/api';
import { DashboardSkeleton } from '../ui/Skeleton';

function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [aiStats, setAiStats] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [financialHealth, setFinancialHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch real data only - no mocked fallbacks
        const [analyticsRes, trendsRes, aiStatsRes, healthRes, financialHealthRes] = await Promise.allSettled([
          get('/admin/analytics'),
          get('/admin/trends?days=30'),
          get('/ai/stats'),
          get('/admin/health'),
          get('/admin/financial-health')
        ]);

        // Set only real data
        setAnalytics(analyticsRes.status === 'fulfilled' ? analyticsRes.value.data : null);
        setTrends(trendsRes.status === 'fulfilled' ? trendsRes.value.data : null);
        setAiStats(aiStatsRes.status === 'fulfilled' ? aiStatsRes.value.data?.stats : null);
        setHealthData(healthRes.status === 'fulfilled' ? healthRes.value.data : null);
        setFinancialHealth(financialHealthRes.status === 'fulfilled' ? financialHealthRes.value.data : null);

      } catch (err) {
        console.error('Admin data fetch error:', err);
        setError('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toFixed(0) || '0';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const conversionRate = analytics?.users.total > 0 ? ((analytics.users.premium / analytics.users.total) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="text-white p-4 md:p-0">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 bg-gray-700/50 rounded animate-pulse"></div>
            <div className="h-6 w-24 bg-gray-700/50 rounded animate-pulse"></div>
          </div>
          
          {/* Overview cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-[#171717] border border-[#262626] rounded-2xl p-6">
                <div className="h-6 w-24 bg-gray-700/50 rounded animate-pulse mb-2"></div>
                <div className="h-8 w-16 bg-gray-700/50 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
          
          {/* Main content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#171717] border border-[#262626] rounded-2xl p-6">
              <div className="h-6 w-32 bg-gray-700/50 rounded animate-pulse mb-4"></div>
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-[#171717] border border-[#262626] rounded-xl p-4">
                    <div className="h-6 w-16 bg-gray-700/50 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-12 bg-gray-700/50 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#171717] border border-[#262626] rounded-2xl p-6">
              <div className="h-6 w-32 bg-gray-700/50 rounded animate-pulse mb-4"></div>
              <div className="h-24 bg-gray-700/30 rounded-lg mb-4"></div>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex justify-between">
                    <div className="h-4 w-20 bg-gray-700/50 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-700/50 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-white p-4 md:p-0">
        <div className="bg-red-500/20 border border-red-500 rounded-2xl p-4 text-red-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="text-white p-4 md:p-0 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live Data</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={analytics?.users.total || 0}
          color="text-[#01C38D]"
          bgGradient="from-[#01C38D]/20 to-[#01C38D]/5"
        />
        <MetricCard
          title="Total Transactions"
          value={formatNumber(analytics?.transactions.total || 0)}
          color="text-[#36A2EB]"
          bgGradient="from-[#36A2EB]/20 to-[#36A2EB]/5"
        />
        <MetricCard
          title="Total Volume"
          value={formatCurrency((analytics?.transactions.byType.expenses || 0) + (analytics?.transactions.byType.income || 0) + (analytics?.transactions.byType.savings || 0))}
          color="text-[#FF6384]"
          bgGradient="from-[#FF6384]/20 to-[#FF6384]/5"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          color="text-[#FFCE56]"
          bgGradient="from-[#FFCE56]/20 to-[#FFCE56]/5"
        />
      </div>

      {/* User Metrics and Monthly Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#171717] p-6 rounded-2xl border border-[#262626]">
          <h2 className="text-xl font-semibold mb-4">Growth Metrics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-[#171717] rounded-xl border border-[#262626]">
              <div className="text-2xl font-bold text-[#01C38D]">{analytics?.users.premium || 0}</div>
              <div className="text-sm text-gray-400">Premium Users</div>
            </div>
            <div className="text-center p-4 bg-[#171717] rounded-xl border border-[#262626]">
              <div className="text-2xl font-bold text-[#36A2EB]">{analytics?.users.free || 0}</div>
              <div className="text-sm text-gray-400">Free Users</div>
            </div>
            <div className="text-center p-4 bg-[#171717] rounded-xl border border-[#262626]">
              <div className="text-2xl font-bold text-[#FFCE56]">{analytics?.users.recentSignups || 0}</div>
              <div className="text-sm text-gray-400">Recent Signups</div>
            </div>
            <div className="text-center p-4 bg-[#171717] rounded-xl border border-[#262626]">
              <div className="text-2xl font-bold text-[#FF6384]">{analytics?.categories.total || 0}</div>
              <div className="text-sm text-gray-400">Categories</div>
            </div>
          </div>
        </div>

        <div className="bg-[#171717] p-6 rounded-2xl border border-[#262626]">
          <h2 className="text-xl font-semibold mb-4">Monthly Growth</h2>
          
          {/* Chart Area - Real Data Only */}
          <div className="mb-6">
            <div className="h-24 bg-[#171717] rounded-lg border border-[#262626] p-4 flex items-center justify-center">
              {trends?.monthlyData && trends.monthlyData.length > 0 ? (
                <div className="h-full flex items-end justify-between gap-1 w-full">
                  {trends.monthlyData.map((monthData, i) => {
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const maxValue = Math.max(...trends.monthlyData.map(m => m.value));
                    const height = (monthData.value / maxValue) * 80;
                    const isCurrentMonth = i === new Date().getMonth();
                    
                    return (
                      <div key={i} className="flex flex-col items-center justify-end flex-1 h-full">
                        <div 
                          className={`w-full rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer ${isCurrentMonth ? 'bg-[#01C38D]' : 'bg-[#36A2EB]'}`}
                          style={{ height: `${height}%` }}
                          title={`${monthNames[i]}: ${monthData.value}`}
                        ></div>
                        <div className="text-xs text-gray-400 mt-1 text-center">{monthNames[i]}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <div className="text-sm">No monthly data available</div>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-gray-400 flex-1 mr-2 leading-tight" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>New Users</span>
              <span className="font-semibold text-[#01C38D] flex-shrink-0">+{trends?.monthlyGrowth?.users || 0}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-400 flex-1 mr-2 leading-tight" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>New Transactions</span>
              <span className="font-semibold text-[#36A2EB] flex-shrink-0">+{trends?.monthlyGrowth?.transactions || 0}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-400 flex-1 mr-2 leading-tight" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>Revenue Growth</span>
              <span className="font-semibold text-[#FFCE56] flex-shrink-0">{formatCurrency(trends?.monthlyGrowth?.revenue || 0)}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-400 flex-1 mr-2 leading-tight" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>Avg Daily Volume</span>
              <span className="font-semibold flex-shrink-0">{formatCurrency(trends?.summary?.avgDailyVolume || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Most Used Categories */}
      <div className="bg-gradient-to-br from-[##171717] to-[#242532] p-6 rounded-2xl border border-[#242532]">
        <h2 className="text-xl font-semibold mb-4">Most Used Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(analytics?.categories.mostUsed || []).slice(0, 6).map((category, index) => (
            <div key={index} className="bg-[#171717] p-4 rounded-xl border border-[#262626]">
              <div className="flex items-start justify-between mb-2">
                <span className="font-medium text-white flex-1 mr-2 leading-tight" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>{category.name || 'Category'}</span>
                <span className="text-sm text-gray-400 flex-shrink-0 mt-0.5">#{index + 1}</span>
              </div>
              <div className="text-2xl font-bold text-[#01C38D]">{category.count || 0}</div>
              <div className="text-sm text-gray-400">transactions</div>
            </div>
          ))}
          {(!analytics?.categories.mostUsed || analytics.categories.mostUsed.length === 0) && (
            <div className="col-span-full text-center py-8 text-gray-400">
              No category data available
            </div>
          )}
        </div>
      </div>

      {/* Financial Health Overview */}
      {financialHealth && (
        <div className="bg-[#171717] p-6 rounded-2xl border border-[#262626]">
          <h2 className="text-xl font-semibold mb-4">Financial Health Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="Avg Monthly Income"
              value={formatCurrency(financialHealth.avgMonthlyIncome)}
              color="text-[#01C38D]"
              bgGradient="from-[#01C38D]/20 to-[#01C38D]/5"
            />
            <MetricCard
              title="Avg Monthly Expenses"
              value={formatCurrency(financialHealth.avgMonthlyExpenses)}
              color="text-[#FF6384]"
              bgGradient="from-[#FF6384]/20 to-[#FF6384]/5"
            />
            <MetricCard
              title="Savings Rate"
              value={`${financialHealth.savingsRate}%`}
              color="text-[#36A2EB]"
              bgGradient="from-[#36A2EB]/20 to-[#36A2EB]/5"
            />
            <MetricCard
              title="Total Savings"
              value={formatCurrency(financialHealth.totalSavings)}
              color="text-[#FFCE56]"
              bgGradient="from-[#FFCE56]/20 to-[#FFCE56]/5"
            />
          </div>
        </div>
      )}

      {/* AI Statistics */}
      {aiStats && (
        <div className="bg-[#171717] p-6 rounded-2xl border border-[#262626]">
          <h2 className="text-xl font-semibold mb-4">AI Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricCard
              title="Prediction Accuracy"
              value={`${aiStats.accuracy}%`}
              color="text-[#01C38D]"
              bgGradient="from-[#01C38D]/20 to-[#01C38D]/5"
            />
            <MetricCard
              title="Total Predictions"
              value={formatNumber(aiStats.totalPredictions)}
              color="text-[#36A2EB]"
              bgGradient="from-[#36A2EB]/20 to-[#36A2EB]/5"
            />
          </div>
        </div>
      )}

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#171717] p-6 rounded-2xl border border-[#262626]">
          <h2 className="text-xl font-semibold mb-4">Engagement Metrics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-gray-400 flex-1 mr-2 leading-tight" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>Avg Daily Transactions</span>
              <span className="font-semibold flex-shrink-0">{trends?.summary?.avgDailyTransactions?.toFixed(1) || '0.0'}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-400 flex-1 mr-2 leading-tight" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>Avg Daily Volume</span>
              <span className="font-semibold flex-shrink-0">{formatCurrency(trends?.summary?.avgDailyVolume)}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-400 flex-1 mr-2 leading-tight" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>Total Categories</span>
              <span className="font-semibold flex-shrink-0">{analytics?.categories.total || 0}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-gray-400 flex-1 mr-2 leading-tight" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>Active Users</span>
              <span className="font-semibold flex-shrink-0">{analytics?.users.total || 0}</span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-[#171717] p-6 rounded-2xl border border-[#262626]">
          <h2 className="text-xl font-semibold mb-4">System Health</h2>
          <div className="grid grid-cols-2 gap-4">
            <HealthIndicator 
              label="Database" 
              status={healthData?.checks?.database?.status || "unknown"} 
              value={healthData?.checks?.database?.uptime || "N/A"} 
            />
            <HealthIndicator 
              label="API Response" 
              status={healthData?.checks?.api?.status || "unknown"} 
              value={healthData?.checks?.api?.avgResponseTime || "N/A"} 
            />
            <HealthIndicator 
              label="Memory Usage" 
              status={healthData?.checks?.memory?.status || "unknown"} 
              value={healthData?.checks?.memory?.usage || "N/A"} 
            />
            <HealthIndicator 
              label="Storage" 
              status={healthData?.checks?.storage?.status || "unknown"} 
              value={healthData?.checks?.storage?.free || "N/A"} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function MetricCard({ title, value, color, bgGradient }) {
  return (
    <div className={`bg-gradient-to-br ${bgGradient} p-4 md:p-6 rounded-2xl border border-[#242532] flex flex-col`}>
      <h4 className="text-2xl font-semibold text-white mb-2 leading-tight min-h-[2.5rem] flex items-center justify-center text-center" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>{title}</h4>
      <p className={`text-lg md:text-xl font-bold ${color} mt-auto`} style={{ wordBreak: 'keep-all' }}>{value}</p>
    </div>
  );
}

function HealthIndicator({ label, status, value }) {
  const statusColors = {
    healthy: 'text-green-400 border-green-400/20 bg-green-400/10',
    warning: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10',
    error: 'text-red-400 border-red-400/20 bg-red-400/10',
    unknown: 'text-gray-400 border-gray-400/20 bg-gray-400/10'
  };

  const dotColors = {
    healthy: 'bg-green-400',
    warning: 'bg-yellow-400',
    error: 'bg-red-400',
    unknown: 'bg-gray-400'
  };

  return (
    <div className={`p-3 rounded-lg border ${statusColors[status] || statusColors.unknown}`}>
      <div className="flex items-start justify-between mb-1">
        <span className="text-xs font-medium flex-1 mr-2 leading-tight" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>{label}</span>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${dotColors[status] || dotColors.unknown}`}></div>
      </div>
      <div className="text-sm font-semibold" style={{ wordBreak: 'keep-all' }}>{value}</div>
    </div>
  );
}

export default AdminDashboard;