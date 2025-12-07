import React, { useState, useEffect } from 'react';
import { TripData, Activity, ActivityType, START_DATE, generateUUID } from '../types';
import Button from './Button';
import { generateDaySuggestion } from '../services/geminiService';

interface ItineraryProps {
  tripData: TripData;
  setTripData: React.Dispatch<React.SetStateAction<TripData>>;
  initialDate?: string;
}

const EXCHANGE_RATE_TWD_TO_MYR = 0.146;

const Itinerary: React.FC<ItineraryProps> = ({ tripData, setTripData, initialDate }) => {
  const sortedDates = Object.keys(tripData.itinerary).sort();
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || sortedDates[0] || '2025-12-15');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    time: '09:00',
    type: ActivityType.SITE,
    costTWD: 0,
    location: '',
    description: ''
  });

  useEffect(() => {
    if (initialDate && sortedDates.includes(initialDate)) {
      setSelectedDate(initialDate);
    }
  }, [initialDate, sortedDates]);

  const currentDayPlan = tripData.itinerary[selectedDate] || { date: selectedDate, activities: [] };

  // Calculate Daily Total
  const dailyTotalCost = currentDayPlan.activities.reduce((sum, act) => sum + (Number(act.costTWD) || 0), 0);

  const formatCurrency = (twd: number) => {
    const myr = twd * EXCHANGE_RATE_TWD_TO_MYR;
    return (
        <span>
            NT${twd.toLocaleString()} <span className="opacity-70 text-[0.9em]">(RM{myr.toLocaleString(undefined, { maximumFractionDigits: 0 })})</span>
        </span>
    );
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const plan = await generateDaySuggestion(selectedDate, "Local street food, historical temples, and night markets.");
    if (plan) {
      setTripData(prev => ({
        ...prev,
        itinerary: {
          ...prev.itinerary,
          [selectedDate]: { ...plan, dailyNote: prev.itinerary[selectedDate]?.dailyNote || '' }
        }
      }));
    }
    setIsGenerating(false);
  };

  const handleDeleteActivity = (id: string) => {
      setTripData(prev => {
          const updatedPlan = { ...currentDayPlan, activities: currentDayPlan.activities.filter(a => a.id !== id) };
          return { ...prev, itinerary: { ...prev.itinerary, [selectedDate]: updatedPlan } };
      });
  };

  const handleSaveActivity = () => {
      const activity: Activity = {
          id: generateUUID(),
          time: newActivity.time || '00:00',
          location: newActivity.location || 'Untitled Activity', // Default if empty
          description: newActivity.description || '',
          type: newActivity.type || ActivityType.OTHER,
          costTWD: Number(newActivity.costTWD) || 0,
          notes: newActivity.notes
      };

      setTripData(prev => ({
          ...prev,
          itinerary: {
              ...prev.itinerary,
              [selectedDate]: {
                  ...currentDayPlan,
                  activities: [...currentDayPlan.activities, activity]
              }
          }
      }));
      setShowAddModal(false);
      setNewActivity({ time: '09:00', type: ActivityType.SITE, costTWD: 0, location: '', description: '' });
  };

  const handleNoteChange = (note: string) => {
    setTripData(prev => ({
        ...prev,
        itinerary: {
            ...prev.itinerary,
            [selectedDate]: {
                ...currentDayPlan,
                dailyNote: note
            }
        }
    }));
  };

  const openMap = (location: string) => {
      const query = encodeURIComponent(`${location}, Taipei, Taiwan`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  // Minimalist indicators using left borders or small dots
  const getActivityStyles = (type: ActivityType) => {
      switch (type) {
          case ActivityType.TRANSPORT: return { border: 'border-[#5D4037]', text: 'text-[#5D4037]', bg: 'bg-[#EFEBE9]' }; // Deep Brown
          case ActivityType.MEAL: return { border: 'border-[#556B2F]', text: 'text-[#556B2F]', bg: 'bg-[#F1F8E9]' };      // Warm Olive
          case ActivityType.SITE: return { border: 'border-[#9E9D24]', text: 'text-[#9E9D24]', bg: 'bg-[#F9FBE7]' };      // Gold/Olive
          case ActivityType.OTHER: return { border: 'border-[#8D6E63]', text: 'text-[#8D6E63]', bg: 'bg-[#EFEBE9]' };     // Taupe
          default: return { border: 'border-gray-400', text: 'text-gray-600', bg: 'bg-gray-50' };
      }
  };

  // Helper to add transport description
  const handleTransportClick = (mode: string) => {
      setNewActivity(prev => ({
          ...prev,
          description: prev.description ? `${prev.description} (Via ${mode})` : `Via ${mode}`
      }));
  };

  // Helper for Meal types
  const handleMealTypeClick = (mealType: string) => {
      setNewActivity(prev => ({
          ...prev,
          description: prev.description ? `[${mealType}] ${prev.description}` : `[${mealType}]`
      }));
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF9F6] pb-20 font-sans">
      {/* Date Selector Header */}
      <div className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E0E0E0] safe-top">
        <div className="flex items-center space-x-2 overflow-x-auto p-3 no-scrollbar">
            {sortedDates.map(date => {
                const d = new Date(date);
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = d.getDate();
                
                // Calculate Day X
                const startDateObj = new Date(START_DATE);
                const currentDateObj = new Date(date);
                // Difference in milliseconds
                const diffTime = currentDateObj.getTime() - startDateObj.getTime();
                // Difference in days (add 1 because start date is Day 1)
                const dayIndex = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;

                const isActive = date === selectedDate;
                return (
                    <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-[4.5rem] rounded-lg border transition-all duration-300 ${
                            isActive 
                            ? 'bg-[#3E2723] border-[#3E2723] text-[#FAF9F6] shadow-md transform scale-105' 
                            : 'bg-white border-[#E0E0E0] text-[#8D6E63] hover:border-[#BCAAA4]'
                        }`}
                    >
                        <span className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${isActive ? 'text-[#9E9D24]' : 'text-[#556B2F]'}`}>Day {dayIndex}</span>
                        <span className={`text-[10px] uppercase font-medium tracking-wide ${isActive ? 'text-[#D7CCC8]' : 'text-[#A1887F]'}`}>{dayName}</span>
                        <span className="text-lg font-serif leading-none mt-0.5">{dayNum}</span>
                    </button>
                )
            })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex justify-between items-end mb-6">
            <div>
                <h2 className="text-2xl font-serif font-bold text-[#3E2723] tracking-wide">
                    {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </h2>
                <div className="flex items-center space-x-3 mt-1">
                    <span className="text-[#5D4037] text-sm font-medium">
                        {currentDayPlan.activities.length} Activities
                    </span>
                    <span className="text-[#D7CCC8]">•</span>
                    <span className="text-[#556B2F] text-sm font-bold bg-[#F1F8E9] px-2 py-0.5 rounded border border-[#DCEDC8]">
                        {formatCurrency(dailyTotalCost)}
                    </span>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                {currentDayPlan.activities.length === 0 && (
                    <Button size="sm" onClick={handleGenerate} isLoading={isGenerating} variant="secondary" className="border-[#A1887F] text-[#5D4037]">
                    ✨ Suggest Plan
                    </Button>
                )}
            </div>
        </div>

        {currentDayPlan.activities.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-[#D7CCC8]">
                <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4 text-[#BCAAA4]">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </div>
                <p className="text-[#8D6E63] font-medium mb-6">A blank canvas for your day.</p>
                <Button onClick={() => setShowAddModal(true)} variant="primary">Add First Activity</Button>
            </div>
        ) : (
            <div className="space-y-6 relative pl-2">
                {/* Timeline Line */}
                <div className="absolute left-[21px] top-4 bottom-4 w-px bg-[#D7CCC8] z-0"></div>

                {currentDayPlan.activities.sort((a,b) => a.time.localeCompare(b.time)).map((activity) => {
                    const styles = getActivityStyles(activity.type);
                    return (
                    <div key={activity.id} className="relative z-10 pl-10 group">
                        {/* Timeline Node */}
                        <div className={`absolute left-[15px] top-5 w-3 h-3 rounded-full border-2 border-[#FAF9F6] shadow-sm ${styles.bg.replace('bg-', 'bg-').replace('text-', 'bg-')} ring-1 ring-[#BCAAA4]`}></div>

                        <div className={`bg-white p-5 rounded-lg shadow-sm border-l-4 ${styles.border} hover:shadow-md transition-shadow`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#FAF9F6] text-[#5D4037] border border-[#E0E0E0]">
                                    {activity.time}
                                </span>
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => openMap(activity.location)} 
                                        className="text-[#A1887F] hover:text-[#5D4037] transition-colors"
                                        title="View on Map"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteActivity(activity.id)} 
                                        className="text-[#D7CCC8] hover:text-[#A1887F] transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                            <h3 className="font-serif font-bold text-[#3E2723] leading-tight mb-2 text-lg">{activity.location}</h3>
                            <p className="text-[#5D4037] text-sm mb-4 leading-relaxed font-light">{activity.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-3 text-xs border-t border-[#F5F5F5] pt-3">
                                <span className={`font-bold tracking-wide uppercase ${styles.text}`}>
                                    {activity.type}
                                </span>
                                <span className="flex items-center font-medium text-[#8D6E63]">
                                    {formatCurrency(activity.costTWD)}
                                </span>
                                {activity.notes && (
                                    <span className="flex items-center text-[#5D4037] bg-[#EFEBE9] px-2 py-1 rounded font-medium">
                                        💡 {activity.notes}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )})}
            </div>
        )}

        {/* Daily Summary & Notes Section */}
        <div className="mt-10">
            <div className="bg-white rounded-lg p-5 shadow-sm border border-[#E0E0E0] relative overflow-hidden group focus-within:ring-1 focus-within:ring-[#8D6E63] transition-all">
                <div className="flex items-center gap-2 mb-3">
                     <svg className="w-5 h-5 text-[#8D6E63]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                     <h3 className="font-serif font-bold text-[#3E2723]">Reflections & Notes</h3>
                </div>
                <textarea
                    value={currentDayPlan.dailyNote || ''}
                    onChange={(e) => handleNoteChange(e.target.value)}
                    placeholder="Capture the moment, track expenses, or write a memory..."
                    className="w-full bg-[#FAF9F6] rounded-lg p-3 text-sm text-[#3E2723] placeholder-[#BCAAA4] focus:bg-white focus:outline-none transition-colors resize-none min-h-[120px] font-light leading-relaxed"
                />
            </div>
        </div>

        <div className="h-24"></div>
      </div>

      {/* Floating Add Button */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-[#3E2723] text-[#FAF9F6] rounded-full shadow-xl shadow-[#3E2723]/30 flex items-center justify-center hover:bg-[#4E342E] hover:scale-105 transition-all active:scale-95 z-40 focus:outline-none focus:ring-4 focus:ring-[#D7CCC8]"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
      </button>

      {/* Add Activity Modal */}
      {showAddModal && (
          <div className="fixed inset-0 bg-[#1A120B]/50 z-[60] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
              <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 shadow-2xl animate-slide-up sm:animate-fade-in max-h-[90vh] overflow-y-auto border border-[#E0E0E0]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-serif font-bold text-[#3E2723]">New Memory</h3>
                    <button onClick={() => setShowAddModal(false)} className="p-2 bg-[#F5F5F5] rounded-full text-[#8D6E63] hover:bg-[#E0E0E0]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>

                  <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[#8D6E63] uppercase tracking-widest">Time</label>
                            <input 
                                type="time" 
                                value={newActivity.time} 
                                onChange={(e) => setNewActivity({...newActivity, time: e.target.value})}
                                className="w-full p-3 bg-[#FAF9F6] border border-[#D7CCC8] rounded-lg focus:ring-1 focus:ring-[#5D4037] focus:border-[#5D4037] outline-none transition-all font-medium text-[#3E2723]"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-[#8D6E63] uppercase tracking-widest">Cost (TWD)</label>
                            <input 
                                type="number" 
                                placeholder="0"
                                value={newActivity.costTWD} 
                                onChange={(e) => setNewActivity({...newActivity, costTWD: Number(e.target.value)})}
                                className="w-full p-3 bg-[#FAF9F6] border border-[#D7CCC8] rounded-lg focus:ring-1 focus:ring-[#5D4037] focus:border-[#5D4037] outline-none transition-all font-medium text-[#3E2723]"
                            />
                        </div>
                      </div>

                      <div className="space-y-2">
                          <label className="text-xs font-bold text-[#8D6E63] uppercase tracking-widest">Category</label>
                          <div className="grid grid-cols-4 gap-2">
                              {[ActivityType.SITE, ActivityType.MEAL, ActivityType.TRANSPORT, ActivityType.OTHER].map(type => (
                                  <button
                                    key={type}
                                    onClick={() => setNewActivity({...newActivity, type})}
                                    className={`p-2 rounded-lg text-xs font-bold border transition-all ${
                                        newActivity.type === type 
                                        ? `bg-[#3E2723] text-[#FAF9F6] border-[#3E2723]` 
                                        : 'bg-white border-[#D7CCC8] text-[#5D4037] hover:bg-[#FAF9F6]'
                                    }`}
                                  >
                                      {type}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Meal Options Helper */}
                      {newActivity.type === ActivityType.MEAL && (
                          <div className="bg-[#F1F8E9] p-4 rounded-lg border border-[#DCEDC8]">
                               <label className="text-[10px] font-bold text-[#556B2F] uppercase mb-2 block tracking-widest">Meal Type</label>
                               <div className="flex flex-wrap gap-2">
                                   {['Breakfast', 'Lunch', 'Tea', 'Dinner', 'Supper', 'Snack', 'Others'].map(meal => (
                                       <button 
                                            key={meal}
                                            onClick={() => handleMealTypeClick(meal)}
                                            className="px-3 py-1.5 bg-white text-[#33691E] text-xs font-semibold rounded border border-[#C5E1A5] hover:bg-[#DCEDC8] transition-colors shadow-sm"
                                       >
                                           {meal}
                                       </button>
                                   ))}
                               </div>
                          </div>
                      )}

                      {/* Transport Options Helper */}
                      {newActivity.type === ActivityType.TRANSPORT && (
                          <div className="bg-[#EFEBE9] p-4 rounded-lg border border-[#D7CCC8]">
                               <label className="text-[10px] font-bold text-[#5D4037] uppercase mb-2 block tracking-widest">Transport Mode</label>
                               <div className="flex flex-wrap gap-2">
                                   {['MRT', 'Bus', 'HSR', 'Taxi/Uber', 'YouBike', 'TRA Train'].map(mode => (
                                       <button 
                                            key={mode}
                                            onClick={() => handleTransportClick(mode)}
                                            className="px-3 py-1.5 bg-white text-[#4E342E] text-xs font-semibold rounded border border-[#D7CCC8] hover:bg-[#D7CCC8] transition-colors shadow-sm"
                                       >
                                           {mode}
                                       </button>
                                   ))}
                               </div>
                          </div>
                      )}

                      <div className="space-y-1">
                          <label className="text-xs font-bold text-[#8D6E63] uppercase tracking-widest flex justify-between">
                              Location
                              <button 
                                onClick={() => newActivity.location && openMap(newActivity.location)}
                                disabled={!newActivity.location}
                                className="text-[#556B2F] hover:underline disabled:opacity-50 disabled:no-underline flex items-center normal-case"
                              >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                  Verify on Map
                              </button>
                          </label>
                          <input 
                              type="text" 
                              placeholder="e.g., Taipei 101"
                              value={newActivity.location} 
                              onChange={(e) => setNewActivity({...newActivity, location: e.target.value})}
                              className="w-full p-3 bg-[#FAF9F6] border border-[#D7CCC8] rounded-lg focus:ring-1 focus:ring-[#5D4037] focus:border-[#5D4037] outline-none transition-all font-medium text-[#3E2723]"
                          />
                      </div>

                      <div className="space-y-1">
                          <label className="text-xs font-bold text-[#8D6E63] uppercase tracking-widest">Notes</label>
                          <textarea 
                              rows={3}
                              placeholder="Details..."
                              value={newActivity.description} 
                              onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                              className="w-full p-3 bg-[#FAF9F6] border border-[#D7CCC8] rounded-lg focus:ring-1 focus:ring-[#5D4037] focus:border-[#5D4037] outline-none transition-all text-sm text-[#3E2723]"
                          />
                      </div>

                      <div className="pt-4 flex gap-3">
                        <Button variant="ghost" className="flex-1 border border-[#D7CCC8]" onClick={() => setShowAddModal(false)}>Cancel</Button>
                        <Button className="flex-[2] bg-[#3E2723]" onClick={handleSaveActivity}>Save</Button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Itinerary;