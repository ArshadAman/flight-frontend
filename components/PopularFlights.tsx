import React, { useState } from 'react';
import { Logo } from './ui/logo';
import { RedUnderline } from './ui/red-underline';

export function PopularFlights() {
  const [activeTab, setActiveTab] = useState<'flights' | 'airlines'>('flights');

  const popularFlights = [
    'Flight to Singapore',
    'Flight to Japan',
    'Flight to Maldives',
    'Flight to New York',
    'Flight to London',
    'Flight to Dubai',
    'Flight to Paris',
    'Flight to Bangkok',
    'Flight to Sydney',
    'Flight to Bali',
    'Flight to Tokyo',
    'Flight to Seoul',
    'Flight to Rome',
    'Flight to Amsterdam',
    'Flight to Switzerland',
    'Flight to Barcelona',
    'Flight to Venice',
    'Flight to Istanbul',
    'Flight to Athens',
    'Flight to Cairo'
  ];

  const popularAirlines = [
    'Singapore Airlines',
    'Qatar Airways',
    'Emirates',
    'ANA All Nippon Airways',
    'Cathay Pacific Airways',
    'Japan Airlines',
    'Turkish Airlines',
    'EVA Air',
    'Air France',
    'Swiss International Air Lines'
  ];

  const itemsToDisplay = activeTab === 'flights' ? popularFlights : popularAirlines;

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1200px] pt-12 pb-20 mb-10">
      <div className="flex flex-col mb-10">
        <h2 className="text-xl font-bold text-primary tracking-widest uppercase mb-4 flex items-center gap-3 text-slate-600">
          <Logo />
          POPULAR FLIGHTS
        </h2>
        <div className="relative inline-block self-start">
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-700 leading-tight pb-2">
            Travel Deal Recommendations
          </h3>
          <RedUnderline />
        </div>
      </div>

      <div className="flex flex-col w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200">
          <button
            className={`flex-1 py-4 text-[16px] sm:text-[18px] font-bold transition-colors ${
              activeTab === 'flights' 
                ? 'bg-pink-50 text-primary border-b-2 border-primary' 
                : 'text-slate-500 hover:text-slate-700 bg-white'
            }`}
            onClick={() => setActiveTab('flights')}
          >
            Popular Flights
          </button>
          <button
            className={`flex-1 py-4 text-[16px] sm:text-[18px] font-bold transition-colors ${
              activeTab === 'airlines' 
                ? 'bg-pink-50 text-primary border-b-2 border-primary' 
                : 'text-slate-500 hover:text-slate-700 bg-white'
            }`}
            onClick={() => setActiveTab('airlines')}
          >
            Popular Airlines and Airports
          </button>
        </div>

        {/* Grid View */}
        <div className="p-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-6 gap-x-4">
            {itemsToDisplay.map((item, index) => (
              <div key={index} className="flex items-center gap-2 group cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-primary transition-colors" />
                <span className="text-[15px] font-medium text-slate-600 group-hover:text-primary transition-colors">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
