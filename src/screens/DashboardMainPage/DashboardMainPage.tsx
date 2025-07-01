import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUpIcon,
  UsersIcon,
  CalendarIcon,
  GiftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MessageSquareIcon,
  PieChartIcon,
  BarChart3Icon,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useDashboard } from "../../hooks/useDashboard";

export const DashboardMainPage = (): JSX.Element => {
  const { stats, monthlyEngagement, loading, error } = useDashboard();
  const navigate = useNavigate();
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [hoveredDataPoint, setHoveredDataPoint] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-10 space-y-4 md:space-y-7">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-black [font-family:'Roboto',Helvetica]">
            Dashboard
          </h1>
          <p className="mt-2 md:mt-4 text-sm md:text-[15px] text-[#888282] [font-family:'Roboto',Helvetica]">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 lg:p-10 space-y-4 md:space-y-7">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-black [font-family:'Roboto',Helvetica]">
            Dashboard
          </h1>
          <p className="mt-2 md:mt-4 text-sm md:text-[15px] text-red-600">
            Error loading dashboard: {error}
          </p>
        </div>
      </div>
    );
  }

  // Calculate trends from monthly data
  const currentMonth = monthlyEngagement[monthlyEngagement.length - 1];
  const previousMonth = monthlyEngagement[monthlyEngagement.length - 2];
  
  const calculateTrend = (current: number, previous: number) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const usersTrend = currentMonth && previousMonth 
    ? calculateTrend(currentMonth.participants, previousMonth.participants)
    : 2.3;
  const eventsTrend = currentMonth && previousMonth 
    ? calculateTrend(currentMonth.events, previousMonth.events)
    : 5.2;
  const rewardsTrend = 12.3;
  const engagementTrend = 7.5;

  // Metric cards data
  const metricCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      increase: `${usersTrend >= 0 ? '+' : ''}${usersTrend.toFixed(1)}%`,
      isPositive: usersTrend >= 0,
      bgColor: "bg-white",
      icon: <UsersIcon size={32} className="text-black" />,
      onClick: () => navigate('/users')
    },
    { 
      title: "Active Events",
      value: stats.activeEvents.toString(),
      increase: `${eventsTrend >= 0 ? '+' : ''}${eventsTrend.toFixed(1)}%`,
      isPositive: eventsTrend >= 0,
      bgColor: "bg-white",
      icon: <CalendarIcon size={32} className="text-black" />,
      onClick: () => navigate('/events')
    },
    { 
      title: "Rewards Redeemed",
      value: stats.rewardsRedeemed.toString(),
      increase: `+${rewardsTrend}%`,
      isPositive: true,
      bgColor: "bg-white",
      icon: <GiftIcon size={32} className="text-black" />,
      onClick: () => navigate('/rewards')
    },
    {
      title: "Engagement Rate",
      value: `${stats.engagementRate}%`,
      increase: `+${engagementTrend}%`,
      isPositive: true,
      bgColor: "bg-white",
      icon: <TrendingUpIcon size={32} className="text-black" />,
      onClick: () => navigate('/feedback')
    },
  ];

  // Event status data for pie chart
  const eventStatusData = [
    { label: 'Completed', value: 45, color: '#10b981', percentage: 45.0 },
    { label: 'Ongoing', value: 30, color: '#3b82f6', percentage: 30.0 },
    { label: 'Upcoming', value: 25, color: '#f59e0b', percentage: 25.0 }
  ];

  const total = eventStatusData.reduce((sum, item) => sum + item.value, 0);

  // Calculate chart dimensions for monthly engagement - Fixed height
  const minChartWidth = 500;
  const chartWidth = Math.max(minChartWidth, monthlyEngagement.length * 60);
  const chartHeight = 180; // Fixed height to fit in container
  const padding = 40; // Reduced padding
  const maxParticipants = Math.max(...monthlyEngagement.map(m => m.participants));
  const maxEvents = Math.max(...monthlyEngagement.map(m => m.events));
  const maxFeedback = Math.max(...monthlyEngagement.map(m => m.feedback));

  return (
    <div className="p-4 md:p-6 lg:p-10 space-y-4 md:space-y-7 bg-[#f8f8f8] min-h-screen">
      {/* Dashboard Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-black [font-family:'Roboto',Helvetica]">
          Dashboard
        </h1>
        <p className="mt-2 md:mt-4 text-sm md:text-[15px] text-[#888282] [font-family:'Roboto',Helvetica]">
          Overview of sustainability initiatives and engagement metrics
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {metricCards.map((card, index) => (
          <Card
            key={index}
            className="relative h-[121px] bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={card.onClick}
          >
            <CardContent className="p-4 md:p-6 flex flex-col justify-between h-full">
              <div className="flex items-center">
                <div className="mr-3 md:mr-4">{card.icon}</div>
                <span className="text-sm md:text-[15px] font-semibold text-[#6f6b6b] [font-family:'Roboto',Helvetica]">
                  {card.title}
                </span>
              </div>
              <div className="flex items-center mt-4">
                <span className="text-xl md:text-[29px] font-semibold text-[#0f0e0e] [font-family:'Roboto',Helvetica]">
                  {card.value}
                </span>
                <div className="flex items-center ml-2 md:ml-4">
                  {card.isPositive ? (
                    <ArrowUpIcon className="h-4 w-4 md:h-[18px] md:w-[18px] text-green-500 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 md:h-[18px] md:w-[18px] text-red-500 mr-1" />
                  )}
                  <span className={`text-[8px] md:text-[9px] ${card.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {card.increase}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-7">
        {/* Event Overview Chart - Enhanced Pie Chart with Hover and Left Legend */}
        <Card className="bg-white border-none shadow-sm h-[344px] hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6 h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg flex items-center">
                <PieChartIcon className="h-5 w-5 mr-2 text-[#009A5A]" />
                Event Overview
              </h3>
              <Button 
                variant="ghost" 
                className="text-xs text-blue-600 hover:underline p-0 h-auto hover:bg-transparent"
                onClick={() => navigate('/events')}
              >
                View details →
              </Button>
            </div>
            
            <div className="relative h-[250px] flex items-center justify-center">
              {/* Legend on the left */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 space-y-4">
                {eventStatusData.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-3 cursor-pointer transition-all duration-200 hover:scale-105"
                    onMouseEnter={() => setHoveredSegment(index)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  >
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{item.label}</div>
                      <div className="text-gray-600">{item.value} events</div>
                      <div className="text-xs text-gray-500">{item.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pie Chart */}
              <div className="relative ml-32">
                <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="75"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="2"
                  />
                  
                  {/* Pie segments with hover effects */}
                  {eventStatusData.map((item, index) => {
                    const isHovered = hoveredSegment === index;
                    const radius = isHovered ? 78 : 75;
                    const strokeWidth = isHovered ? 22 : 20;
                    
                    let offset = 0;
                    for (let i = 0; i < index; i++) {
                      offset += (eventStatusData[i].percentage / 100) * 471;
                    }
                    
                    return (
                      <circle
                        key={index}
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke={item.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${(item.percentage/100) * 471} 471`}
                        strokeDashoffset={`-${offset}`}
                        className="transition-all duration-300 cursor-pointer"
                        onMouseEnter={() => setHoveredSegment(index)}
                        onMouseLeave={() => setHoveredSegment(null)}
                        style={{
                          filter: isHovered ? 'brightness(1.1)' : 'none',
                          transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                          transformOrigin: '100px 100px'
                        }}
                      />
                    );
                  })}
                  
                  {/* Center circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="40"
                    fill="white"
                    stroke="#e2e8f0"
                    strokeWidth="2"
                  />
                </svg>
                
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{total}</span>
                  <span className="text-sm text-gray-600">Total Events</span>
                </div>

                {/* Hover tooltip */}
                {hoveredSegment !== null && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
                    <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm">
                      <div className="font-medium">{eventStatusData[hoveredSegment].label}</div>
                      <div>{eventStatusData[hoveredSegment].percentage}% ({eventStatusData[hoveredSegment].value} events)</div>
                    </div>
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 mx-auto"></div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Engagement Trends Chart - Fixed Height */}
        <Card className="bg-white border-none shadow-sm h-[344px] hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6 h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg flex items-center">
                <BarChart3Icon className="h-5 w-5 mr-2 text-[#009A5A]" />
                Monthly Engagement Trends
              </h3>
              <Button 
                variant="ghost" 
                className="text-xs text-blue-600 hover:underline p-0 h-auto hover:bg-transparent"
                onClick={() => navigate('/users')}
              >
                View details →
              </Button>
            </div>
            
            {/* Chart Container - Fixed height with scrollable content */}
            <div className="relative h-[250px] w-full overflow-x-auto overflow-y-hidden">
              <div style={{ minWidth: `${chartWidth + padding * 2}px`, height: '100%' }}>
                <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth + padding * 2} ${chartHeight + 40}`} className="overflow-visible">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width={chartWidth / monthlyEngagement.length} height="36" patternUnits="userSpaceOnUse">
                      <path d={`M ${chartWidth / monthlyEngagement.length} 0 L 0 0 0 36`} fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect x={padding} y="0" width={chartWidth} height={chartHeight} fill="url(#grid)" />
                  
                  {/* Y-axis */}
                  <line x1={padding} y1="0" x2={padding} y2={chartHeight} stroke="#e5e7eb" strokeWidth="1"/>
                  
                  {/* X-axis */}
                  <line x1={padding} y1={chartHeight} x2={chartWidth + padding} y2={chartHeight} stroke="#e5e7eb" strokeWidth="1"/>
                  
                  {/* Y-axis labels */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                    <g key={i}>
                      <text 
                        x={padding - 8} 
                        y={chartHeight - ratio * chartHeight + 4} 
                        textAnchor="end" 
                        className="text-xs fill-gray-600"
                      >
                        {Math.round(maxParticipants * ratio)}
                      </text>
                      <line 
                        x1={padding - 4} 
                        y1={chartHeight - ratio * chartHeight} 
                        x2={padding} 
                        y2={chartHeight - ratio * chartHeight} 
                        stroke="#e5e7eb" 
                        strokeWidth="1"
                      />
                    </g>
                  ))}
                  
                  {/* X-axis labels */}
                  {monthlyEngagement.map((month, i) => (
                    <text 
                      key={i}
                      x={padding + (i + 0.5) * (chartWidth / monthlyEngagement.length)} 
                      y={chartHeight + 15} 
                      textAnchor="middle" 
                      className="text-xs fill-gray-600"
                    >
                      {month.month}
                    </text>
                  ))}
                  
                  {/* Participants area gradient */}
                  <defs>
                    <linearGradient id="participantsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{stopColor: '#009A5A', stopOpacity: 0.3}} />
                      <stop offset="100%" style={{stopColor: '#009A5A', stopOpacity: 0}} />
                    </linearGradient>
                  </defs>
                  
                  {/* Area under participants line */}
                  <path
                    fill="url(#participantsGradient)"
                    d={`M ${padding},${chartHeight} ${monthlyEngagement.map((month, i) => {
                      const x = padding + (i + 0.5) * (chartWidth / monthlyEngagement.length);
                      const y = chartHeight - (month.participants / maxParticipants) * chartHeight;
                      return `L ${x},${y}`;
                    }).join(' ')} L ${padding + (chartWidth / monthlyEngagement.length) * (monthlyEngagement.length - 0.5)},${chartHeight} Z`}
                  />
                  
                  {/* Participants line */}
                  <polyline
                    fill="none"
                    stroke="#009A5A"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={monthlyEngagement.map((month, i) => {
                      const x = padding + (i + 0.5) * (chartWidth / monthlyEngagement.length);
                      const y = chartHeight - (month.participants / maxParticipants) * chartHeight;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                  
                  {/* Events line */}
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="5,5"
                    points={monthlyEngagement.map((month, i) => {
                      const x = padding + (i + 0.5) * (chartWidth / monthlyEngagement.length);
                      const y = chartHeight - (month.events / maxEvents) * chartHeight * 0.6;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                  
                  {/* Feedback line */}
                  <polyline
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="2,3"
                    points={monthlyEngagement.map((month, i) => {
                      const x = padding + (i + 0.5) * (chartWidth / monthlyEngagement.length);
                      const y = chartHeight - (month.feedback / maxFeedback) * chartHeight * 0.4;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                  
                  {/* Interactive Data points with hover effects */}
                  {monthlyEngagement.map((month, i) => {
                    const x = padding + (i + 0.5) * (chartWidth / monthlyEngagement.length);
                    const y = chartHeight - (month.participants / maxParticipants) * chartHeight;
                    const isHovered = hoveredDataPoint === i;
                    
                    return (
                      <g key={i}>
                        {/* Hover area for easier interaction */}
                        <rect
                          x={x - 15}
                          y={0}
                          width="30"
                          height={chartHeight}
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredDataPoint(i)}
                          onMouseLeave={() => setHoveredDataPoint(null)}
                        />
                        
                        {/* Main data point */}
                        <circle
                          cx={x}
                          cy={y}
                          r={isHovered ? "7" : "5"}
                          fill="white"
                          stroke="#009A5A"
                          strokeWidth="3"
                          className="transition-all duration-200 cursor-pointer drop-shadow-sm"
                          style={{
                            filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0, 154, 90, 0.3))' : 'none'
                          }}
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r={isHovered ? "3" : "2"}
                          fill="#009A5A"
                          className="pointer-events-none transition-all duration-200"
                        />
                        
                        {/* Hover tooltip */}
                        {isHovered && (
                          <g>
                            {/* Tooltip background */}
                            <rect
                              x={x - 50}
                              y={y - 65}
                              width="100"
                              height="50"
                              rx="6"
                              fill="rgba(0, 0, 0, 0.9)"
                              className="drop-shadow-lg"
                            />
                            
                            {/* Tooltip text */}
                            <text x={x} y={y - 45} textAnchor="middle" className="fill-white text-xs font-medium">
                              {month.month} {month.year}
                            </text>
                            <text x={x} y={y - 32} textAnchor="middle" className="fill-white text-xs">
                              Participants: {month.participants}
                            </text>
                            <text x={x} y={y - 20} textAnchor="middle" className="fill-white text-xs">
                              Events: {month.events}
                            </text>
                            
                            {/* Tooltip arrow */}
                            <polygon
                              points={`${x-4},${y-15} ${x+4},${y-15} ${x},${y-8}`}
                              fill="rgba(0, 0, 0, 0.9)"
                            />
                          </g>
                        )}
                        
                        {/* Vertical line on hover */}
                        {isHovered && (
                          <line
                            x1={x}
                            y1="0"
                            x2={x}
                            y2={chartHeight}
                            stroke="#009A5A"
                            strokeWidth="1"
                            strokeDasharray="3,3"
                            opacity="0.5"
                            className="pointer-events-none"
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Fixed Legend - positioned absolutely to stay in place */}
                <div className="absolute top-2 right-2 bg-white p-2 rounded-lg shadow-lg border z-10">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-0.5 bg-[#009A5A] rounded mr-2"></div>
                      <span className="font-medium">Participants</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-0.5 bg-[#3b82f6] rounded mr-2" style={{backgroundImage: 'repeating-linear-gradient(to right, #3b82f6 0, #3b82f6 2px, transparent 2px, transparent 4px)'}}></div>
                      <span className="font-medium">Events</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-0.5 bg-[#f59e0b] rounded mr-2" style={{backgroundImage: 'repeating-linear-gradient(to right, #f59e0b 0, #f59e0b 1px, transparent 1px, transparent 3px)'}}></div>
                      <span className="font-medium">Feedback</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer" onClick={() => navigate('/events')}>
          <CardContent className="p-6 text-center">
            <CalendarIcon className="h-8 w-8 text-[#009A5A] mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Manage Events</h3>
            <p className="text-sm text-gray-600">Create and track sustainability events</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer" onClick={() => navigate('/users')}>
          <CardContent className="p-6 text-center">
            <UsersIcon className="h-8 w-8 text-[#009A5A] mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">User Management</h3>
            <p className="text-sm text-gray-600">Assign roles and manage points</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer" onClick={() => navigate('/rewards')}>
          <CardContent className="p-6 text-center">
            <GiftIcon className="h-8 w-8 text-[#009A5A] mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Rewards System</h3>
            <p className="text-sm text-gray-600">Track redemptions and points</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer" onClick={() => navigate('/feedback')}>
          <CardContent className="p-6 text-center">
            <MessageSquareIcon className="h-8 w-8 text-[#009A5A] mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">View Feedback</h3>
            <p className="text-sm text-gray-600">Analyze participant responses</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};