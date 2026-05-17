"use client";

import { PlaneTakeoff, Clock } from "lucide-react";

export type Flight = {
    id: string;
    airline: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    price: number;
    stops: number;
};

export function FlightResults({ flights, isLoading }: { flights: Flight[], isLoading: boolean }) {
    if (isLoading) {
        return (
            <div className="w-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (flights.length === 0) {
        return (
            <div className="w-full text-center py-12 bg-white rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-700">No flights found</h3>
                <p className="text-slate-500 mt-2">Try adjusting your search criteria</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4 max-w-4xl mx-auto mt-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Available Flights</h3>

            {flights.map((flight) => (
                <div key={flight.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                            {flight.airline.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">{flight.airline}</p>
                            <p className="text-sm text-slate-500">{flight.id}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8 w-full md:w-auto flex-1 justify-center">
                        <div className="text-center">
                            <p className="font-bold text-xl text-slate-900">{flight.departureTime}</p>
                            <p className="text-sm text-slate-500">{flight.origin}</p>
                        </div>

                        <div className="flex flex-col items-center flex-1 max-w-[200px]">
                            <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {flight.duration}
                            </p>
                            <div className="w-full relative flex items-center justify-center">
                                <div className="absolute w-full h-[2px] bg-slate-200"></div>
                                <PlaneTakeoff className="w-4 h-4 text-primary relative z-10 bg-white px-0.5" />
                            </div>
                            <p className="text-xs font-semibold text-primary mt-1">
                                {flight.stops === 0 ? "Non-stop" : `${flight.stops} Stop`}
                            </p>
                        </div>

                        <div className="text-center">
                            <p className="font-bold text-xl text-slate-900">{flight.arrivalTime}</p>
                            <p className="text-sm text-slate-500">{flight.destination}</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:items-end w-full md:w-auto gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                        <p className="text-2xl font-extrabold text-slate-900">
                            ₹{flight.price.toLocaleString('en-IN')}
                        </p>
                        <button className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary/90 transition-colors w-full md:w-auto">
                            Book Now
                        </button>
                    </div>

                </div>
            ))}
        </div>
    );
}
