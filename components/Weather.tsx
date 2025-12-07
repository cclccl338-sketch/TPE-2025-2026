import React, { useEffect, useState } from 'react';
import { getWeatherAdvice } from '../services/geminiService';
import Button from './Button';

const Weather: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Taipei Coordinates
  const LAT = 25.0330;
  const LNG = 121.5654;

  const fetchWeather = async () => {
    setLoading(true);
    const result = await getWeatherAdvice(LAT, LNG);
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4 h-full bg-[#FAF9F6] pb-24 overflow-y-auto font-sans">
      <div className="flex justify-between items-center mb-6 safe-top pt-4">
        <div>
            <h1 className="text-2xl font-serif font-bold text-[#3E2723] tracking-wide">Forecast</h1>
            <p className="text-[#8D6E63] text-sm font-medium">Taipei City</p>
        </div>
        <Button size="sm" variant="ghost" onClick={fetchWeather} isLoading={loading} className="text-[#5D4037] bg-[#EFEBE9]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </Button>
      </div>

      {loading && !data ? (
         <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5D4037]"></div>
            <p className="text-[#8D6E63] font-medium animate-pulse">Retrieving CWA data...</p>
         </div>
      ) : data ? (
          <div className="space-y-6">
              
              {/* Main Advice Card */}
              <div className="bg-gradient-to-br from-[#3E2723] to-[#2D1B15] rounded-xl p-6 text-[#FAF9F6] shadow-lg relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                         <h2 className="text-lg font-bold opacity-90 flex items-center font-serif">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                            Travel Advice
                         </h2>
                         {data.umbrellaNeeded && (
                             <span className="bg-[#FAF9F6]/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold flex items-center shadow-sm text-[#FAF9F6] border border-[#FAF9F6]/30">
                                 ☂️ Rain Expected
                             </span>
                         )}
                    </div>
                    <p className="text-lg font-light leading-relaxed text-[#D7CCC8]">
                        "{data.clothingAdvice}"
                    </p>
                  </div>
                  {/* Decorative */}
                  <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#8D6E63] opacity-20 rounded-full blur-3xl"></div>
              </div>

              {/* Forecast List */}
              <div>
                  <h3 className="text-[#5D4037] font-bold mb-3 flex items-center pl-1 font-serif justify-between">
                      <span className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-[#9E9D24]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          3-Day Outlook
                      </span>
                  </h3>
                  <div className="grid gap-3">
                      {data.forecast?.map((day: any, idx: number) => (
                          <div key={idx} className="bg-white p-4 rounded-lg border border-[#E0E0E0] flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                              <div>
                                  <p className="text-xs font-bold text-[#8D6E63] uppercase tracking-widest mb-1">{day.dayName}</p>
                                  <p className="text-xl font-bold text-[#3E2723] font-serif">{day.temp}</p>
                              </div>
                              <div className="text-right">
                                  <p className="text-[#5D4037] font-medium">{day.condition}</p>
                                  <p className="text-xs text-[#556B2F] font-bold flex items-center justify-end mt-1">
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                      {day.rainChance} Rain
                                  </p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

               {/* General Outlook */}
               <div className="bg-white p-6 rounded-xl border border-[#E0E0E0] shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-[#8D6E63]"></div>
                   <h3 className="text-[#3E2723] font-bold mb-2 flex items-center font-serif">
                       <svg className="w-5 h-5 mr-2 text-[#9E9D24]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       Seasonal Note
                   </h3>
                   <p className="text-[#5D4037] text-sm leading-relaxed font-light">{data.generalOutlook}</p>
               </div>

               <div className="text-center pt-2">
                   <p className="text-[10px] text-[#8D6E63] uppercase tracking-widest opacity-60 flex items-center justify-center gap-1">
                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                       Source: Central Weather Administration (CWA)
                   </p>
               </div>
          </div>
      ) : (
          <div className="text-center text-[#BCAAA4] mt-20 flex flex-col items-center">
              <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
              No weather data available.
          </div>
      )}
    </div>
  );
};

export default Weather;