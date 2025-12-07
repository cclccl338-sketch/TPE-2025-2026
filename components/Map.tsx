import React from 'react';
import Button from './Button';

const MapView: React.FC = () => {
    
    const handleOpenGoogleMaps = () => {
        // Opens the specific area in Google Maps App or Browser
        window.open('https://www.google.com/maps/search/?api=1&query=Taipei+City', '_blank');
    };

    return (
        <div className="h-full w-full relative bg-[#F5F5F5]">
            {/* Background Placeholder mimicking a map */}
            <div className="absolute inset-0 opacity-10">
                 <div className="w-full h-full bg-[#D7CCC8]" style={{
                     backgroundImage: 'radial-gradient(#8D6E63 2px, transparent 2px)', 
                     backgroundSize: '24px 24px'
                 }}></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center space-y-8">
                <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center text-[#8D6E63] mb-4 border border-[#E0E0E0]">
                     <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                </div>
                
                <div>
                    <h2 className="text-3xl font-serif font-bold text-[#3E2723] mb-3">Explore Taipei</h2>
                    <p className="text-[#5D4037] max-w-xs mx-auto leading-relaxed font-light">
                        Discover the streets, find your path, and connect with the city.
                    </p>
                </div>

                <Button size="lg" onClick={handleOpenGoogleMaps} className="w-full max-w-xs shadow-lg shadow-[#3E2723]/20 bg-[#3E2723] hover:bg-[#4E342E] text-[#FAF9F6] rounded-lg py-4 font-bold text-lg tracking-wide">
                    Open Google Maps
                </Button>

                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg border border-[#D7CCC8] max-w-xs mx-auto shadow-sm">
                    <p className="text-xs text-[#5D4037] font-medium">
                        <span className="text-[#556B2F]">Tip:</span> You can verify specific locations directly in the Itinerary tab.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MapView;