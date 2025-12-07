import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { TripData, START_DATE, ActivityType, DayPlan } from '../types';

interface OverviewProps {
  tripData: TripData;
  setTripData: React.Dispatch<React.SetStateAction<TripData>>;
  onNavigateToDay: (date: string) => void;
}

const Overview: React.FC<OverviewProps> = ({ tripData, setTripData, onNavigateToDay }) => {
  const today = new Date();
  const startDate = new Date(START_DATE);
  
  // Calculate countdown
  const diffTime = startDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isOngoing = diffDays <= 0 && diffDays > -22; 
  const isFinished = diffDays <= -22;

  // State for new items
  const [newItemText, setNewItemText] = useState('');
  const [newPackingItemText, setNewPackingItemText] = useState('');

  // Calculate Budget using Rich & Dark Woods Palette
  const budgetData = useMemo(() => {
    const data = [
      { name: 'Transport', value: 0, color: '#5D4037' }, // Deep Brown
      { name: 'Food', value: 0, color: '#556B2F' },      // Warm Olive
      { name: 'Sites', value: 0, color: '#9E9D24' },     // Antique Gold
      { name: 'Other', value: 0, color: '#8D6E63' },     // Taupe
    ];

    Object.values(tripData.itinerary).forEach((day: unknown) => {
      const d = day as DayPlan;
      d.activities.forEach(act => {
        const cost = act.costTWD || 0;
        if (act.type === ActivityType.TRANSPORT) data[0].value += cost;
        else if (act.type === ActivityType.MEAL) data[1].value += cost;
        else if (act.type === ActivityType.SITE) data[2].value += cost;
        else data[3].value += cost;
      });
    });

    return data.filter(d => d.value > 0);
  }, [tripData]);

  const totalCost = budgetData.reduce((acc, curr) => acc + curr.value, 0);

  // Helper to open map
  const openMap = (location: string) => {
      const query = encodeURIComponent(`${location}, Taipei, Taiwan`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  // Shortlist Handlers
  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    const newItem = {
      id: crypto.randomUUID(),
      text: newItemText.trim(),
      checked: false
    };
    setTripData(prev => ({
      ...prev,
      shortlist: [...(prev.shortlist || []), newItem]
    }));
    setNewItemText('');
  };

  const handleToggleItem = (id: string) => {
    setTripData(prev => ({
      ...prev,
      shortlist: prev.shortlist.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    }));
  };

  const handleDeleteItem = (id: string) => {
    setTripData(prev => ({
      ...prev,
      shortlist: prev.shortlist.filter(item => item.id !== id)
    }));
  };

  // Packing List Handlers
  const handleAddPackingItem = () => {
    if (!newPackingItemText.trim()) return;
    const newItem = {
      id: crypto.randomUUID(),
      text: newPackingItemText.trim(),
      checked: false
    };
    setTripData(prev => ({
      ...prev,
      packingList: [...(prev.packingList || []), newItem]
    }));
    setNewPackingItemText('');
  };

  const handleTogglePackingItem = (id: string) => {
    setTripData(prev => ({
      ...prev,
      packingList: prev.packingList.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    }));
  };

  const handleDeletePackingItem = (id: string) => {
    setTripData(prev => ({
      ...prev,
      packingList: prev.packingList.filter(item => item.id !== id)
    }));
  };

  return (
    <div className="p-4 space-y-6 pb-24 h-full overflow-y-auto bg-[#FAF9F6]">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#3E2723] to-[#2D1B15] text-[#FAF9F6] shadow-lg p-8">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-[#5D4037] opacity-40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-[#8D6E63] opacity-20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-serif mb-2 tracking-wide text-[#FAF9F6]">Taipei Journey</h1>
          <p className="text-[#D7CCC8] text-sm font-medium mb-6 tracking-wider uppercase">Dec 15, 2025 - Jan 5, 2026</p>
          
          <div className="bg-[#FAF9F6]/10 backdrop-blur-md border border-[#FAF9F6]/20 rounded-xl p-5 text-center shadow-inner">
            {isFinished ? (
               <span className="text-2xl font-semibold">Trip Completed</span>
            ) : isOngoing ? (
              <span className="text-2xl font-semibold">Enjoy your journey</span>
            ) : (
              <div>
                 <span className="text-5xl font-light text-[#FAF9F6]">{diffDays}</span>
                 <span className="text-xs font-bold ml-3 uppercase tracking-widest text-[#D7CCC8]">Days until departure</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Places to Visit (Shortlist) */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] p-6">
        <div className="flex items-center justify-between mb-4 pl-1 border-l-2 border-[#556B2F]">
            <h2 className="text-lg font-semibold text-[#3E2723] leading-none tracking-tight">Places to Visit</h2>
            <span className="text-xs font-medium text-[#8D6E63] uppercase tracking-wider">Wishlist</span>
        </div>
        
        <div className="flex justify-between items-center px-1 mb-2">
             <label className="text-[10px] font-bold text-[#A1887F] uppercase tracking-widest">Location</label>
             <button 
                onClick={() => newItemText && openMap(newItemText)}
                disabled={!newItemText}
                className="text-[10px] font-bold text-[#556B2F] hover:text-[#33691E] disabled:opacity-30 disabled:cursor-not-allowed flex items-center transition-colors uppercase tracking-wider"
             >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Check Map
             </button>
        </div>

        <div className="flex gap-2 mb-4">
            <input 
                type="text" 
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                placeholder="Jiufen Old Street..."
                className="flex-1 bg-[#FAF9F6] border border-[#D7CCC8] rounded-lg px-4 py-2 text-sm text-[#3E2723] placeholder-[#A1887F] focus:outline-none focus:ring-1 focus:ring-[#5D4037] focus:border-[#5D4037] transition-all"
            />
            <button 
                onClick={handleAddItem}
                className="bg-[#556B2F] text-white p-2 rounded-lg shadow-sm hover:bg-[#33691E] transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </button>
        </div>

        <div className="space-y-1">
            {(tripData.shortlist && tripData.shortlist.length > 0) ? (
                tripData.shortlist.map(item => (
                    <div key={item.id} className="flex items-center justify-between group hover:bg-[#FAF9F6] rounded-lg p-2 transition-colors -mx-2">
                        <div className="flex items-center space-x-3 flex-1 overflow-hidden">
                            <button 
                                onClick={() => handleToggleItem(item.id)}
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${item.checked ? 'bg-[#556B2F] border-[#556B2F]' : 'border-[#A1887F]'}`}
                            >
                                {item.checked && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </button>
                            <span 
                                className={`text-sm truncate cursor-pointer font-medium ${item.checked ? 'text-[#A1887F] line-through' : 'text-[#3E2723]'}`}
                                onClick={() => openMap(item.text)}
                            >
                                {item.text}
                            </span>
                        </div>
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => openMap(item.text)}
                                className="text-[#A1887F] hover:text-[#5D4037] p-1.5"
                                title="View on Map"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </button>
                            <button 
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-[#A1887F] hover:text-[#8D6E63] p-1.5"
                                title="Remove"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-6 text-[#A1887F] text-xs italic font-light">
                    Your list is waiting to be filled.
                </div>
            )}
        </div>
      </div>

      {/* Packing List */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] p-6">
        <div className="flex items-center justify-between mb-4 pl-1 border-l-2 border-[#9E9D24]">
            <h2 className="text-lg font-semibold text-[#3E2723] leading-none tracking-tight">Packing List</h2>
            <span className="text-xs font-medium text-[#8D6E63] uppercase tracking-wider">Essentials</span>
        </div>
        
        <div className="flex gap-2 mb-4">
            <input 
                type="text" 
                value={newPackingItemText}
                onChange={(e) => setNewPackingItemText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPackingItem()}
                placeholder="Passport, Camera..."
                className="flex-1 bg-[#FAF9F6] border border-[#D7CCC8] rounded-lg px-4 py-2 text-sm text-[#3E2723] placeholder-[#A1887F] focus:outline-none focus:ring-1 focus:ring-[#9E9D24] focus:border-[#9E9D24] transition-all"
            />
            <button 
                onClick={handleAddPackingItem}
                className="bg-[#9E9D24] text-white p-2 rounded-lg shadow-sm hover:bg-[#827717] transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </button>
        </div>

        <div className="space-y-1">
            {(tripData.packingList && tripData.packingList.length > 0) ? (
                tripData.packingList.map(item => (
                    <div key={item.id} className="flex items-center justify-between group hover:bg-[#FAF9F6] rounded-lg p-2 transition-colors -mx-2">
                        <div className="flex items-center space-x-3 flex-1 overflow-hidden">
                            <button 
                                onClick={() => handleTogglePackingItem(item.id)}
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${item.checked ? 'bg-[#9E9D24] border-[#9E9D24]' : 'border-[#A1887F]'}`}
                            >
                                {item.checked && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </button>
                            <span className={`text-sm truncate font-medium ${item.checked ? 'text-[#A1887F] line-through' : 'text-[#3E2723]'}`}>
                                {item.text}
                            </span>
                        </div>
                        <button 
                            onClick={() => handleDeletePackingItem(item.id)}
                            className="text-[#A1887F] hover:text-[#8D6E63] p-1 opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                ))
            ) : (
                <div className="text-center py-6 text-[#A1887F] text-xs italic font-light">
                    Start packing.
                </div>
            )}
        </div>
      </div>

      {/* Budget Visualization */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#5D4037] via-[#556B2F] to-[#9E9D24]"></div>
        <h2 className="text-lg font-semibold text-[#3E2723] mb-4 pl-1 border-l-2 border-[#5D4037] leading-none tracking-tight">Estimated Budget</h2>
        <div className="h-64 w-full">
            {totalCost > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={budgetData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        cornerRadius={2}
                        stroke="none"
                    >
                        {budgetData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip 
                        formatter={(value: number) => `NT$${value.toLocaleString()}`} 
                        contentStyle={{borderRadius: '8px', border: '1px solid #D7CCC8', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', backgroundColor: '#FAF9F6', color: '#3E2723'}}
                        itemStyle={{ color: '#3E2723' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-[#A1887F] bg-[#FAF9F6] rounded-lg border border-dashed border-[#D7CCC8]">
                    <p className="font-medium">No cost data</p>
                    <p className="text-xs mt-1">Add activities to visualize budget</p>
                </div>
            )}
        </div>
        <div className="text-center mt-4 p-3 bg-[#FAF9F6] rounded-lg border border-[#E0E0E0]">
            <span className="text-xs text-[#8D6E63] uppercase font-bold tracking-widest">Total Estimated</span>
            <div className="text-2xl font-bold text-[#3E2723] mt-1 font-serif">NT${totalCost.toLocaleString()}</div>
            <div className="text-sm font-medium text-[#5D4037] mt-1">
                ≈ RM{(totalCost * 0.146).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;