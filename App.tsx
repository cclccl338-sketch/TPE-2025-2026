import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Overview from './components/Overview';
import Itinerary from './components/Itinerary';
import Weather from './components/Weather';
import MapView from './components/Map';
import { Tab, TripData, START_DATE, END_DATE } from './types';

// Helper to generate date range
const getDatesInRange = (startDate: Date, endDate: Date) => {
  const date = new Date(startDate.getTime());
  const dates = [];
  while (date <= endDate) {
    dates.push(new Date(date).toISOString().split('T')[0]);
    date.setDate(date.getDate() + 1);
  }
  return dates;
};

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<Tab>('overview');
  const [selectedItineraryDate, setSelectedItineraryDate] = useState<string>(START_DATE);
  
  // Initialize trip data with all dates
  const [tripData, setTripData] = useState<TripData>(() => {
      try {
        const saved = localStorage.getItem('taipei_trip_data');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Ensure arrays exist for older saved data
            if (!parsed.shortlist) parsed.shortlist = [];
            if (!parsed.packingList) parsed.packingList = [];
            return parsed;
        }
      } catch (error) {
        console.error("Failed to parse trip data, resetting to default:", error);
        // If local storage is corrupted, we fall through to default initialization
        // This prevents the "Blank Screen" crash
      }

      const dates = getDatesInRange(new Date(START_DATE), new Date(END_DATE));
      const initialItinerary: Record<string, any> = {};
      dates.forEach(d => {
          initialItinerary[d] = { date: d, activities: [] };
      });
      return { itinerary: initialItinerary, shortlist: [], packingList: [] };
  });

  // Persist data
  useEffect(() => {
    try {
      localStorage.setItem('taipei_trip_data', JSON.stringify(tripData));
    } catch (e) {
      console.error("Failed to save data", e);
    }
  }, [tripData]);

  const handleNavigateToDay = (date: string) => {
      setSelectedItineraryDate(date);
      setCurrentTab('itinerary');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'overview':
        return <Overview tripData={tripData} setTripData={setTripData} onNavigateToDay={handleNavigateToDay} />;
      case 'itinerary':
        return <Itinerary tripData={tripData} setTripData={setTripData} initialDate={selectedItineraryDate} />;
      case 'weather':
        return <Weather />;
      case 'map':
        return <MapView />;
      default:
        return <Overview tripData={tripData} setTripData={setTripData} onNavigateToDay={handleNavigateToDay} />;
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#FDFDFD]">
      <main className="flex-1 overflow-hidden relative">
        {renderContent()}
      </main>
      <Navigation currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
};

export default App;