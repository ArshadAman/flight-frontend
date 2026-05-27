"use client";

import { useState } from "react";
import { B2BNavbar } from "@/components/B2BNavbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Bell, Calendar as CalendarIcon, ChevronDown, Minus, Plus, Plane, User, CheckCircle2, Clock, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGroupTravel } from "@/context/GroupTravelContext";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { NotificationModal } from "@/components/NotificationModal";

const flightQuotes = [
  { 
    route: "DEL-BKK", 
    flight: "AI-105", 
    airline: "AIR INDIA",
    dep: "19 Aug,25", 
    depTime: "(04:00)",
    arr: "20 Aug,25", 
    arrTime: "(01:00)",
    stops: "01", 
    ssr: "INR 0.00", 
    fare: "11000.00" 
  },
  { 
    route: "DEL-BKK", 
    flight: "AI-135", 
    airline: "AIR INDIA",
    dep: "19 Aug,25", 
    depTime: "(01:00)",
    arr: "20 Aug,25", 
    arrTime: "(21:00)",
    stops: "00", 
    ssr: "INR 0.00", 
    fare: "12000.00" 
  },
  { 
    route: "BKK-DEL", 
    flight: "AI-105", 
    airline: "AIR INDIA",
    dep: "28 Sep,25", 
    depTime: "(04:00)",
    arr: "30 Sep,25", 
    arrTime: "(01:00)",
    stops: "01", 
    ssr: "INR 0.00", 
    fare: "9000.00" 
  },
  { 
    route: "BKK-DEL", 
    flight: "AI-135", 
    airline: "AIR INDIA",
    dep: "29 Aug,25", 
    depTime: "(01:00)",
    arr: "30 Sep,25", 
    arrTime: "(21:00)",
    stops: "00", 
    ssr: "INR 0.00", 
    fare: "10000.00" 
  }
];

const formSchema = z.object({
  groupName: z.string().min(1, "Group Name is required"),
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  departureDate: z.string().min(1, "Departure Date is required"),
  returnDate: z.string().min(1, "Return Date is required"),
  passengersGroup: z.string().min(1, "Please select a passenger group"),
  expectedFare: z.string().min(1, "Expected Fare is required").regex(/^\d+(\.\d{1,2})?$/, "Must be a valid amount"),
  cabin: z.string().min(1, "Please select a cabin"),
  groupCategory: z.string().min(1, "Group Category is required"),
  timing: z.string().min(1, "Please select a timing"),
  airlinePreference: z.string().min(1, "Please select an airline"),
});

type FormValues = z.infer<typeof formSchema>;

export default function GroupTravelPage() {
  const router = useRouter();
  const { addRequest } = useGroupTravel();
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [selectedFlights, setSelectedFlights] = useState<number[]>([]);
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [isNegotiateSuccessOpen, setIsNegotiateSuccessOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const handleCloseNegotiateModal = () => {
    setIsNegotiateSuccessOpen(false);
    setIsNegotiating(false);
  };
  
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupName: "Harshit786",
      origin: "Delhi(DEL)",
      destination: "Bangkok(BKK)",
      departureDate: "19 Aug, 25",
      returnDate: "28 Sep, 25",
      passengersGroup: "",
      expectedFare: "",
      cabin: "",
      groupCategory: "",
      timing: "",
      airlinePreference: "",
    }
  });

  const totalPassengers = adults + children + infants;

  const watchedValues = watch();

  const handleFormSubmit = (data: FormValues) => {

      // Generate request ID and timestamp
      const requestId = `GRP${Date.now().toString().slice(-10)}`;
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const requestDate = `${pad(now.getDate())} ${months[now.getMonth()]},${String(now.getFullYear()).slice(2)}(${pad(now.getHours())}:${pad(now.getMinutes())})`;
      // Valid till = 3 days from now
      const validTillDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const validTill = `${pad(validTillDate.getDate())} ${months[validTillDate.getMonth()]}, ${String(validTillDate.getFullYear()).slice(2)}(${pad(validTillDate.getHours())}:${pad(validTillDate.getMinutes())})`;

      // Extract short codes from origin/destination (e.g., "Delhi(DEL)" → "DEL")
      const extractCode = (val: string) => {
        const match = val.match(/\(([^)]+)\)/);
        return match ? match[1] : val.slice(0, 3).toUpperCase();
      };

      const airlineLabel: Record<string, string> = {
        "air-india": "AIR INDIA",
        "indigo": "INDIGO",
        "vistara": "VISTARA",
      };

      addRequest({
        id: requestId,
        groupName: data.groupName,
        requestId,
        status: "Payment pending",
        airline: airlineLabel[data.airlinePreference] || data.airlinePreference.toUpperCase(),
        requestDate,
        validTill,
        origin: extractCode(data.origin),
        destination: extractCode(data.destination),
        departureDate: data.departureDate,
        returnDate: data.returnDate,
        passengersGroup: data.passengersGroup,
        expectedFare: data.expectedFare,
        cabin: data.cabin,
        groupCategory: data.groupCategory,
        timing: data.timing,
        airlinePreference: data.airlinePreference,
        adults,
        children,
        infants,
      });

      setIsModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <B2BNavbar />

      {/* Red Status Bar */}
      <div className="bg-[#D60D26] text-white px-4 md:px-8 py-2 md:py-3 flex justify-between items-center text-[14px] md:text-[16px]">
        <div className="flex gap-2 items-center">
          <span className="font-semibold text-[20px] md:text-[22px]">Group Travel</span>
          <span className="text-white/70">—</span>
          <span>New Booking</span>
        </div>
        <div className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setNotificationOpen(true)}>
          <Bell className="w-5 h-5" /> <span>Notification(0)</span>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white border-b border-gray-200 overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max justify-center px-4">
          {[
            { id: 1, label: "Booking" },
            { id: 2, label: "Quoted" },
            { id: 3, label: "Under Negotiation" },
            { id: 4, label: "Agent Confirmed" },
            { id: 5, label: "Submitted" },
          ].map((step) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all ${
                activeStep === step.id ? "border-[#D60D26]" : "border-transparent"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[14px] font-bold border transition-colors ${
                  activeStep === step.id
                    ? "border-[#D60D26] text-[#D60D26]"
                    : "border-gray-400 text-gray-400"
                }`}
              >
                {step.id}
              </div>
              <span
                className={`text-[16px] font-semibold transition-colors ${
                  activeStep === step.id ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 md:px-8 py-8 flex-1 flex flex-col items-center">
        
        {activeStep === 1 && (
          <>
            {/* White Card background similar to Figma */}
            <div className="w-full max-w-[1100px] bg-[#F2FBFF] border border-gray-100/50 shadow-sm rounded-[24px] p-6 md:p-10 mb-10">
              
              <h2 className="text-[22px] md:text-[24px] font-bold text-gray-800 mb-6">Group request details:</h2>
              
              {/* Group 1 details */}
              <div className="w-full max-w-sm mb-10">
                <div className="relative">
                  <label className="text-[14px] text-gray-500 absolute top-0 left-0">Group Name</label>
                  <Input
                    {...register("groupName")}
                    className={`pt-6 pb-2 px-0 border-0 border-b ${errors.groupName ? 'border-red-500' : 'border-gray-300'} rounded-none shadow-none focus-visible:ring-0 focus-visible:border-gray-500 bg-transparent h-auto text-[18px] font-semibold`}
                  />
                  {errors.groupName && <span className="text-red-500 text-[11px] font-semibold mt-1 block"> {errors.groupName.message} </span>}
                </div>
              </div>

              <h3 className="text-[22px] font-bold text-gray-800 mb-5">Group 1:</h3>

              {/* Radio Buttons */}
              <div className="flex flex-wrap gap-4 md:gap-6 mb-8">
                <label className="flex items-center gap-2 text-[15px] md:text-[16px] text-gray-500 cursor-pointer">
                  <input type="radio" name="trip" className="accent-[#D60D26] w-4 h-4 cursor-pointer" /> One Way
                </label>
                <label className="flex items-center gap-2 text-[15px] md:text-[16px] font-bold text-gray-900 cursor-pointer">
                  <input type="radio" name="trip" defaultChecked className="accent-[#D60D26] w-4 h-4 cursor-pointer" /> Round Trip
                </label>
                <label className="flex items-center gap-2 text-[15px] md:text-[16px] text-gray-500 cursor-pointer">
                  <input type="radio" name="trip" className="accent-[#D60D26] w-4 h-4 cursor-pointer" /> Multi City
                </label>
              </div>

              {/* Main Layout Split: Left (Tabs) & Right (Pricing/Passenger Config) */}
              <div className="flex flex-col xl:flex-row gap-8 lg:gap-12">
                
                {/* Left Content Column */}
                <div className="flex-1">
                  <Tabs defaultValue="main" className="w-full">
                    <TabsList className="bg-transparent border-b border-gray-200 w-full justify-start h-auto p-0 space-x-2 md:space-x-8 rounded-none">
                      <TabsTrigger
                        value="main"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#D60D26] data-[state=active]:text-gray-900 data-[state=active]:bg-[#F2FBFF] bg-[#F2FBFF] data-[state=inactive]:text-gray-500 px-6 py-3 data-[state=active]:shadow-none text-[16px] font-bold"
                      >
                        Main Details
                      </TabsTrigger>
                      <TabsTrigger
                        value="preference"
                        className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-[#D60D26] data-[state=active]:text-gray-900 data-[state=active]:bg-[#F2FBFF] bg-[#F2FBFF] data-[state=inactive]:text-gray-500 px-6 py-3 data-[state=active]:shadow-none text-[16px] font-bold"
                      >
                        Preference
                      </TabsTrigger>
                    </TabsList>

                    {/* Main Details content */}
                    <TabsContent value="main" className="pt-6 bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 mt-4 outline-none">
                      
                      <h4 className="text-[16px] font-bold text-gray-800 mb-6">Travel details:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_1fr_1fr] md:gap-x-6 gap-y-6 items-center">
                        
                        {/* Origin */}
                        <div className="relative">
                          <label className="text-[13px] text-gray-500 absolute top-[-10px] left-0">Origin</label>
                          <Input
                            {...register("origin")}
                            className={`pb-2 pt-2 px-0 border-0 border-b ${errors.origin ? 'border-red-500' : 'border-gray-200'} rounded-none shadow-none focus-visible:ring-0 focus-visible:border-gray-500 h-auto text-[16px] text-gray-900 bg-transparent`}
                          />
                          {errors.origin && <span className="text-red-500 text-[11px] font-semibold mt-1 block"> {errors.origin.message} </span>}
                        </div>
                        
                        {/* Swap icon */}
                        <div className="flex justify-center shrink-0">
                          <div className="w-9 h-9 rounded-full border border-[#D60D26] text-[#D60D26] flex items-center justify-center cursor-pointer">
                            <ArrowRightLeft className="w-5 h-5 transform rotate-90 md:rotate-0" />
                          </div>
                        </div>

                        {/* Destination */}
                        <div className="relative">
                          <label className="text-[13px] text-gray-500 absolute top-[-10px] left-0">Destination</label>
                          <Input
                            {...register("destination")}
                            className={`pb-2 pt-2 px-0 border-0 border-b ${errors.destination ? 'border-red-500' : 'border-gray-200'} rounded-none shadow-none focus-visible:ring-0 focus-visible:border-gray-500 h-auto text-[16px] text-gray-900 bg-transparent`}
                          />
                          {errors.destination && <span className="text-red-500 text-[11px] font-semibold mt-1 block"> {errors.destination.message} </span>}
                        </div>

                        {/* Departure Date */}
                        <div className="relative">
                          <label className="text-[13px] text-gray-500 absolute top-[-10px] left-0 hover:text-gray-700 cursor-pointer z-10 w-full flex justify-between">
                            Departure Date
                          </label>
                          <div className="relative flex items-center">
                            <Input
                              {...register("departureDate")}
                              className={`pb-2 pt-2 px-0 border-0 border-b ${errors.departureDate ? 'border-red-500' : 'border-gray-200'} rounded-none shadow-none focus-visible:ring-0 focus-visible:border-gray-500 h-auto text-[16px] text-gray-900 bg-transparent w-full`}
                            />
                            <CalendarIcon className="w-5 h-5 text-gray-400 absolute right-0 bottom-3 pointer-events-none" />
                          </div>
                          {errors.departureDate && <span className="text-red-500 text-[11px] font-semibold mt-1 block"> {errors.departureDate.message} </span>}
                        </div>

                        {/* Return Date */}
                        <div className="relative">
                          <label className="text-[13px] text-gray-500 absolute top-[-10px] left-0 hover:text-gray-700 cursor-pointer z-10 w-full flex justify-between">
                            Return Date
                          </label>
                          <div className="relative flex items-center">
                            <Input
                              {...register("returnDate")}
                              className={`pb-2 pt-2 px-0 border-0 border-b ${errors.returnDate ? 'border-red-500' : 'border-gray-200'} rounded-none shadow-none focus-visible:ring-0 focus-visible:border-gray-500 h-auto text-[16px] text-gray-900 bg-transparent w-full`}
                            />
                            <CalendarIcon className="w-5 h-5 text-gray-400 absolute right-0 bottom-3 pointer-events-none" />
                          </div>
                          {errors.returnDate && <span className="text-red-500 text-[11px] font-semibold mt-1 block"> {errors.returnDate.message} </span>}
                        </div>

                      </div>

                      <h4 className="text-[16px] font-bold text-gray-800 mb-6 mt-10">Passenger details:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 gap-y-8 md:gap-y-10 items-end">
                        
                        {/* No of Passengers */}
                        <div className="relative">
                          <Controller
                            name="passengersGroup"
                            control={control}
                            render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className={`px-0 py-2 border-0 border-b ${errors.passengersGroup ? 'border-red-500' : 'border-gray-200'} rounded-none shadow-none h-auto focus:ring-0 text-[16px] text-gray-500 bg-transparent`}>
                                  <SelectValue placeholder="No. Of Passengers" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="group1" className="text-[16px]">Group 1 (1-10)</SelectItem>
                                  <SelectItem value="group2" className="text-[16px]">Group 2 (11-20)</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {errors.passengersGroup && <span className="text-red-500 text-[11px] font-semibold mt-1 block"> {errors.passengersGroup.message} </span>}
                        </div>

                        {/* Expected Fare */}
                        <div className="relative">
                          <Input
                            {...register("expectedFare")}
                            placeholder="Expected Fare"
                            className={`px-0 py-2 border-0 border-b ${errors.expectedFare ? 'border-red-500' : 'border-gray-200'} rounded-none shadow-none h-auto focus-visible:ring-0 focus-visible:border-gray-500 text-[16px] text-gray-500 bg-transparent`}
                          />
                          {errors.expectedFare && <span className="text-red-500 text-[11px] font-semibold mt-1 block"> {errors.expectedFare.message} </span>}
                        </div>

                        {/* Cabin */}
                        <div className="relative">
                          <Controller
                            name="cabin"
                            control={control}
                            render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className={`px-0 py-2 border-0 border-b ${errors.cabin ? 'border-red-500' : 'border-gray-200'} rounded-none shadow-none h-auto focus:ring-0 text-[16px] text-gray-500 bg-transparent`}>
                                  <SelectValue placeholder="Cabin" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="economy" className="text-[16px]">Economy</SelectItem>
                                  <SelectItem value="premium" className="text-[16px]">Premium Economy</SelectItem>
                                  <SelectItem value="business" className="text-[16px]">Business</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {errors.cabin && <span className="text-red-500 text-[11px] font-semibold mt-1 block"> {errors.cabin.message} </span>}
                        </div>

                        {/* Group Category */}
                        <div className="relative">
                          <Input
                            {...register("groupCategory")}
                            placeholder="Group Category"
                            className={`px-0 py-2 border-0 border-b ${errors.groupCategory ? 'border-red-500' : 'border-gray-200'} rounded-none shadow-none h-auto focus-visible:ring-0 focus-visible:border-gray-500 text-[16px] text-gray-500 bg-transparent`}
                          />
                          {errors.groupCategory && <span className="text-red-500 text-[11px] font-semibold mt-1 block"> {errors.groupCategory.message} </span>}
                        </div>

                      </div>
                    </TabsContent>

                    {/* Preference Content Component */}
                    <TabsContent value="preference" className="pt-6 bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 mt-4 outline-none">
                      
                      <h4 className="text-[16px] font-bold text-gray-800 mb-6">Flight Preference:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center w-full max-w-md">
                        
                        <div className="relative">
                            <Controller
                              name="timing"
                              control={control}
                              render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger className={`px-0 py-2 border-0 border-b ${errors.timing ? 'border-red-500' : 'border-gray-200'} rounded-none shadow-none h-auto focus:ring-0 text-[16px] text-gray-500 bg-transparent`}>
                                    <SelectValue placeholder="Timing" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="morning" className="text-[16px]">Morning</SelectItem>
                                    <SelectItem value="afternoon" className="text-[16px]">Afternoon</SelectItem>
                                    <SelectItem value="evening" className="text-[16px]">Evening</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            {errors.timing && <span className="text-red-500 text-[11px] font-semibold mt-1 block"> {errors.timing.message} </span>}
                          </div>

                        <div className="relative">
                            <Controller
                              name="airlinePreference"
                              control={control}
                              render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger className={`px-0 py-2 border-0 border-b ${errors.airlinePreference ? 'border-red-500' : 'border-gray-200'} rounded-none shadow-none h-auto focus:ring-0 text-[16px] text-gray-500 bg-transparent`}>
                                    <SelectValue placeholder="Airline Preference" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="air-india" className="text-[16px]">Air India</SelectItem>
                                    <SelectItem value="indigo" className="text-[16px]">IndiGo</SelectItem>
                                    <SelectItem value="vistara" className="text-[16px]">Vistara</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            {errors.airlinePreference && <span className="text-red-500 text-[11px] font-semibold mt-1 block"> {errors.airlinePreference.message} </span>}
                          </div>

                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  {/* Flight Details Block below tabs (based on Figma) */}
                  <div className="mt-12">
                    <h3 className="text-[17px] font-semibold text-gray-900 mb-6">Flight Details:</h3>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-20">
                        
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-4 text-[22px] font-bold text-gray-900 mb-2">
                              <span className="text-[18px] md:text-[22px]">{watchedValues.origin || "Origin"}</span>
                              <Plane className="w-6 h-6 text-[#D60D26] transform rotate-45" />
                              <span className="text-[18px] md:text-[22px]">{watchedValues.destination || "Destination"}</span>
                          </div>
                          <span className="text-gray-700 text-[16px] font-medium">{watchedValues.departureDate || "Date"}</span>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-4 text-[22px] font-bold text-gray-900 mb-2">
                              <span className="text-[18px] md:text-[22px]">{watchedValues.destination || "Destination"}</span>
                              <Plane className="w-6 h-6 text-[#D60D26] transform rotate-45" />
                              <span className="text-[18px] md:text-[22px]">{watchedValues.origin || "Origin"}</span>
                          </div>
                          <span className="text-gray-700 text-[16px] font-medium">{watchedValues.returnDate || "Date"}</span>
                        </div>

                    </div>
                  </div>
                </div>

                {/* Right Content Column (Popover & Pricing grid) */}
                <div className="w-full xl:w-[280px] shrink-0 xl:pt-[54px]">
                  
                  {/* Pricing Grid */}
                  <div className="mb-6 grid grid-cols-2 lg:grid-cols-2 gap-4">
                      <Input 
                        placeholder="Per pax" 
                        className="bg-white border-gray-200 rounded-[10px] text-center shadow-sm placeholder:text-gray-400 text-[16px]"
                      />
                      <Input 
                        defaultValue="180000" 
                        className="bg-white border-gray-200 rounded-[10px] text-center shadow-sm text-[16px]"
                      />
                  </div>

                  {/* Passenger Popover container */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full bg-white flex items-center justify-between px-4 py-8 border-gray-200 rounded-[12px] shadow-sm hover:bg-gray-50/50 group text-[16px]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[16px] text-gray-500 font-normal">No. Of Passengers</span>
                        </div>
                        <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </Button>
                    </PopoverTrigger>
                    
                    {/* Popover Content Matching Figma */}
                    <PopoverContent className="w-[280px] p-0 rounded-[12px] shadow-xl border-gray-200" align="end">
                      
                      {/* Popover Header/Trigger Preview Inside */}
                      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-[12px]">
                        <span className="text-[16px] text-gray-500 font-normal mt-[-5px]">No. Of Passengers</span>
                        <ChevronDown className="w-5 h-5 text-gray-400 transform rotate-180" />
                      </div>

                      <div className="bg-[#F2FBFF] py-2 px-4 flex justify-end">
                        <span className="text-[14px] font-bold text-gray-900 flex items-center gap-1.5"><User className="w-4 h-4"/> {totalPassengers} Adult{totalPassengers > 1 ? 's' : ''}</span>
                      </div>

                      <div className="p-4 space-y-4 bg-white rounded-b-[12px]">
                        {/* Adults */}
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[16px] font-bold text-gray-900">Adults</span>
                            <span className="text-[12px] text-gray-400">12+ years old</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setAdults(Math.max(1, adults - 1))}
                              className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 transition"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-[16px] font-semibold w-3 text-center">{adults}</span>
                            <button
                              onClick={() => setAdults(adults + 1)}
                              className="w-7 h-7 rounded-full border border-[#D60D26] flex items-center justify-center text-[#D60D26] hover:bg-[#D60D26] hover:text-white transition"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Children */}
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[16px] font-bold text-gray-900">Children</span>
                            <span className="text-[12px] text-gray-400">2-11 years old</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setChildren(Math.max(0, children - 1))}
                              className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 transition"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-[16px] font-semibold w-3 text-center">{children}</span>
                            <button
                              onClick={() => setChildren(children + 1)}
                              className="w-7 h-7 rounded-full border border-[#D60D26] flex items-center justify-center text-[#D60D26] hover:bg-[#D60D26] hover:text-white transition"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Infant */}
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[16px] font-bold text-gray-900">Infant</span>
                            <span className="text-[12px] text-gray-400">Under 2 years old</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setInfants(Math.max(0, infants - 1))}
                              className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 transition"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-[16px] font-semibold w-3 text-center">{infants}</span>
                            <button
                              onClick={() => setInfants(infants + 1)}
                              className="w-7 h-7 rounded-full border border-[#D60D26] flex items-center justify-center text-[#D60D26] hover:bg-[#D60D26] hover:text-white transition"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="pt-2">
                          <p className="text-[11px] text-gray-400 italic font-medium leading-[1.2]">NOTE: Infant Not Add In Passengers</p>
                        </div>

                      </div>
                    </PopoverContent>
                  </Popover>

                </div>

              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full max-w-[1100px] flex flex-col sm:flex-row gap-4 mb-20 text-[16px] md:text-[18px]">
              <Button variant="outline" className="flex-1 py-5 md:py-7 rounded-full border-gray-900 text-gray-900 font-bold hover:bg-gray-50 flex gap-2 w-full text-[16px] md:text-[18px]">
                Cancel 
                <span className="transform rotate-45 text-[18px] md:text-[20px] leading-none mt-[-2px]">⭧</span>
              </Button>
              
              <Button onClick={handleSubmit(handleFormSubmit)} className="flex-1 py-5 md:py-7 rounded-full bg-[#D60D26] hover:bg-[#D60D26] font-bold text-white flex gap-2 w-full text-[16px] md:text-[18px]">
                Proceed 
                <span className="transform rotate-45 text-[18px] md:text-[20px] leading-none mt-[-2px]">⭧</span>
              </Button>

              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md rounded-[20px] p-0 border-0 overflow-y-auto max-h-[90vh] no-scrollbar outline-none">
                  <DialogTitle className="sr-only">Booking Details</DialogTitle>
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-green-500 rounded-full flex items-center justify-center w-8 h-8 shrink-0">
                        <CheckCircle2 className="text-white w-5 h-5" />
                      </div>
                      <h3 className="text-[17px] font-bold text-green-600 tracking-tight">Ticket change request submitted</h3>
                    </div>
                    
                    <p className="text-gray-500 text-[15px] leading-[1.6] mb-8 font-medium">
                      We're Processing your request. Reference ID: <span className="text-gray-800 font-bold">GRP1134718273</span>. Expect your auto quote in your inbox shortly. Our Response time is 24-48 hours
                    </p>

                    <div className="flex justify-end">
                      <Button 
                        onClick={() => {
                          setIsModalOpen(false);
                          setActiveStep(2);
                        }}
                        className="bg-[#D60D26] hover:bg-[#D60D26] text-white px-8 py-2.5 rounded-full font-bold shadow-sm"
                      >
                        Okay
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </>
        )}

        {activeStep === 2 && (
          <div className="w-full max-w-[1200px] bg-slate-50/50 p-6 md:p-8 rounded-[24px]">
            <h3 className="text-[20px] font-bold text-slate-800 mb-8">Request details:</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* Customer Request Column */}
              <div className="flex flex-col">
                <div className="bg-[#F2FBFF] text-slate-800 font-bold px-5 py-2.5 rounded-t-[14px] w-max text-[15px] tracking-tight">
                  Customer Request
                </div>
                
                <div className="bg-white p-6 md:p-8 rounded-b-[20px] rounded-tr-[20px] shadow-sm border border-slate-100 space-y-8">
                  
                  {/* Flight Route Blocks */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50/30">
                      <div className="flex items-center gap-3 font-bold text-[17px] text-slate-800">
                        <span>DEL</span>
                        <div className="w-6 h-6 rounded-full border border-[#D60D26] flex items-center justify-center">
                           <ArrowRightLeft className="w-3.5 h-3.5 text-[#D60D26]" />
                        </div>
                        <span>BKK</span>
                      </div>
                      <span className="text-[13px] text-slate-400 font-bold mt-1">19 Aug, 25</span>
                    </div>

                    <div className="flex-1 border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50/30">
                      <div className="flex items-center gap-3 font-bold text-[17px] text-slate-800">
                        <span>BKK</span>
                        <div className="w-6 h-6 rounded-full border border-[#D60D26] flex items-center justify-center">
                           <ArrowRightLeft className="w-3.5 h-3.5 text-[#D60D26]" />
                        </div>
                        <span>DEL</span>
                      </div>
                      <span className="text-[13px] text-slate-400 font-bold mt-1">28 Sep, 25</span>
                    </div>
                  </div>

                  {/* Details List */}
                  <div className="space-y-0 text-[15px]">
                    {[
                      { label: "Request Id", value: "GRP1134718273" },
                      { label: "Group name", value: "Harshit 786" },
                      { label: "Group category", value: "Other" },
                      { label: "Request by", value: "Harshit.xyz@gmail.com" },
                      { label: "Number of pax", value: "12(12A)" },
                      { label: "Flexible on dates", value: "NO" },
                      { label: "Requested date", value: "01 Aug, 2025(03:24)" },
                      { label: "Airline", value: "AIRINDIA" },
                      { label: "Remarks", value: "..." },
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row justify-start sm:justify-between items-start sm:items-center py-4 border-b border-slate-50 last:border-0 font-medium gap-1 sm:gap-4">
                        <span className="text-slate-400 text-[14px] sm:text-[15px]">{item.label}</span>
                        <span className="text-slate-800 font-bold text-[14px] sm:text-[15px] break-all sm:break-normal">{item.value}</span>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

              {/* Agent Response Column */}
              <div className="flex flex-col h-full">
                <div className="bg-[#F2FBFF] text-slate-800 font-bold px-5 py-2.5 rounded-t-[14px] w-max text-[15px] tracking-tight">
                  Agent Response
                </div>
                
                <div className="bg-white p-6 md:p-8 rounded-b-[20px] rounded-tr-[20px] shadow-sm border border-slate-100 h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-[#888] font-bold text-[18px]">INR 00.00</h4>
                      <p className="text-slate-400 text-[12px] font-medium">Total fare(Base fare + taxes)</p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-md font-bold text-[11px] uppercase tracking-wider">
                      Fare Quoted
                    </span>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-slate-400 font-medium">Adult fare/pax</span>
                      <span className="text-[#888] font-bold">INR 00.00</span>
                    </div>
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-slate-400 font-medium">Last responded on</span>
                      <span className="text-slate-800 font-bold">01 Aug, 2025(06:24)</span>
                    </div>
                  </div>

                  {/* Time Limit Box */}
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-800 font-bold text-[14px]">Time limit</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[13px]">
                        <span className="text-slate-400 font-medium">Request Expiry</span>
                        <span className="text-slate-800 font-bold">04 Aug, 2025(06:24)</span>
                      </div>
                      <div className="flex justify-between items-center text-[13px]">
                        <span className="text-slate-400 font-medium">Immediate payment</span>
                        <span className="text-slate-800 font-bold">100%</span>
                      </div>
                      <div className="flex justify-between items-center text-[13px]">
                        <span className="text-slate-400 font-medium">Passenger</span>
                        <span className="text-slate-800 font-bold">2 days after user action</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[#888] font-bold text-[14px] italic cursor-pointer hover:underline">
                    *Select flight quote given by agent <span className="underline italic">"Flight Quotes"</span>
                  </p>
                </div>
              </div>

            </div>

            {/* Warning Text */}
            <div className="mt-8">
              <p className="text-[#D60D26] text-[14px] font-bold leading-relaxed">
                (Fare are available first come first serve basis. The quoted fare may get invalid without intimation. Seats are not guaranteed until booked. Taxes are subject to change)
              </p>
            </div>

            {/* Flight Quotes Section */}
            <div className="mt-10">
              {!isNegotiating ? (
                <>
                  <h3 className="text-[18px] font-bold text-slate-800 mb-6">Flight quotes suggested</h3>
                  
                  {/* Airline Tabs */}
                  <div className="flex gap-4 mb-0">
                    <button className="bg-[#F2FBFF] text-[#D60D26] font-bold px-6 py-3 rounded-t-xl border-t-2 border-[#D60D26] text-[14px] flex items-center gap-2">
                      AIR INDIA <span className="text-[10px]">✈</span>
                    </button>
                    <button className="bg-white text-[#888] font-bold px-6 py-3 rounded-t-xl border border-b-0 border-slate-100 text-[14px] flex items-center gap-2">
                      IndiGo <span className="text-[10px]">✈</span>
                    </button>
                  </div>

                  {/* Flight Quotes Table */}
                  <div className="bg-white rounded-b-xl rounded-tr-xl border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto w-full">
                      <div className="min-w-[900px] xl:min-w-0">
                        {/* Table Header */}
                    <div className="grid grid-cols-[1.2fr_1.5fr_1.2fr_1.2fr_0.8fr_1fr_1.2fr_0.8fr] gap-4 bg-slate-50/50 px-6 py-4 border-b border-slate-100 text-[13px] font-bold text-slate-400">
                      <span>Route</span>
                      <span>Flight number</span>
                      <span>Departure date</span>
                      <span>Arrival date</span>
                      <span>Stops</span>
                      <span>SSR</span>
                      <span>Group fare</span>
                      <span className="text-center">Action</span>
                    </div>

                {/* Table Rows */}
                <div className="p-4 space-y-4">
                  {flightQuotes.map((quote, idx) => (
                    <div key={idx} className="grid grid-cols-[1.2fr_1.5fr_1.2fr_1.2fr_0.8fr_1fr_1.2fr_0.8fr] gap-4 items-center bg-white border border-slate-100 rounded-xl px-4 py-4 shadow-sm">
                      <span className="text-[14px] font-bold text-slate-800">{quote.route}</span>
                      
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-[#D60D26] italic">{quote.airline}</span>
                        <span className="text-[14px] font-bold text-slate-800">{quote.flight}</span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-slate-800">{quote.dep}</span>
                        <span className="text-[11px] text-slate-400 font-bold">{quote.depTime}</span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-slate-800">{quote.arr}</span>
                        <span className="text-[11px] text-slate-400 font-bold">{quote.arrTime}</span>
                      </div>

                      <span className="text-[14px] font-bold text-slate-800">{quote.stops}</span>
                      
                      <span className="text-[14px] font-bold text-[#888]">{quote.ssr}</span>

                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-[#888]">INR {quote.fare}</span>
                        <span className="text-[11px] text-[#888] font-bold underline cursor-pointer">Fare breakdown</span>
                      </div>

                      <div className="flex justify-center">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-slate-300 accent-[#D60D26] cursor-pointer"
                          checked={selectedFlights.includes(idx)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFlights([...selectedFlights, idx]);
                            } else {
                              setSelectedFlights(selectedFlights.filter(id => id !== idx));
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <h4 className="text-slate-800 font-bold text-[18px]">Negotiate</h4>
                  
                  <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                      <span className="text-slate-500 text-[14px] font-medium">Fare advised (taxes included)</span>
                      <span className="text-[#888] font-bold text-[14px]">INR 20,000.00 / Per pax</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <label className="text-slate-800 font-bold text-[14px]">Total Fare/per pax (taxes included)(INR)</label>
                      <input 
                        type="number" 
                        placeholder="Per pax" 
                        className="border border-slate-200 rounded-lg p-3 outline-none focus:border-[#D60D26] w-full md:w-48 text-[14px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <textarea 
                        placeholder="Remarks" 
                        className="w-full border border-slate-200 rounded-lg p-4 h-32 outline-none focus:border-[#D60D26] text-[14px] resize-none"
                      ></textarea>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button 
                        onClick={(e) => { e.preventDefault(); setIsNegotiateSuccessOpen(true); }}
                        className="bg-[#D60D26] hover:bg-[#D60D26] text-white rounded-full px-12 py-6 text-[15px] font-bold"
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Term and conditions */}
            <div className={`mt-10 transition-opacity duration-300 ${isNegotiating ? 'opacity-30 pointer-events-none' : ''}`}>
              <h3 className="text-[18px] font-bold text-slate-800 mb-6">Term and conditions</h3>
              <div className="w-full h-48 bg-slate-200 rounded-xl mb-6 shadow-inner border border-slate-300/50"></div>
              
              <label className="flex items-center gap-3 text-[14px] text-slate-500 font-medium cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="accent-[#D60D26] w-4 h-4 rounded cursor-pointer transition-all"
                  checked={isTermsAgreed}
                  onChange={(e) => setIsTermsAgreed(e.target.checked)}
                /> 
                <span className="group-hover:text-slate-700 transition-colors">I Agree To The Terms And Conditions</span>
              </label>
            </div>

            {/* Bottom Action Buttons */}
            <div className="mt-12 mb-10 flex flex-col md:flex-row gap-4">
              <button 
                disabled={!isTermsAgreed || selectedFlights.length === 0 || isNegotiating}
                onClick={() => setIsNegotiating(true)}
                className={`flex-1 py-4 font-bold rounded-full transition-all text-[16px] border ${
                  isNegotiating ? 'bg-white border-slate-200 text-slate-300 cursor-not-allowed' : 
                  (!isTermsAgreed || selectedFlights.length === 0) ? 'bg-white border-slate-200 text-slate-300 opacity-50 cursor-not-allowed' : 
                  'bg-white border-slate-300 text-slate-800 hover:bg-slate-50 shadow-sm'
                }`}
              >
                Negotiate
              </button>
              <button 
                disabled={!isTermsAgreed || selectedFlights.length === 0 || isNegotiating}
                className={`flex-1 py-4 font-bold rounded-full transition-all text-[16px] border ${
                  isNegotiating ? 'bg-white border-slate-200 text-slate-300 cursor-not-allowed' : 
                  (!isTermsAgreed || selectedFlights.length === 0) ? 'bg-white border-slate-200 text-slate-300 opacity-50 cursor-not-allowed' : 
                  'bg-white border-slate-300 text-slate-800 hover:bg-slate-50 shadow-sm'
                }`}
              >
                Decline
              </button>
              <button 
                disabled={!isTermsAgreed || selectedFlights.length === 0 || isNegotiating}
                className={`flex-1 py-4 font-bold rounded-full transition-all text-[16px] flex items-center justify-center gap-2 ${
                  isNegotiating ? 'bg-[#F2FBFF] text-[#FFA8B3] cursor-not-allowed' : 
                  (!isTermsAgreed || selectedFlights.length === 0) ? 'bg-[#D60D26] text-white opacity-30 cursor-not-allowed' : 
                  'bg-[#D60D26] text-white hover:bg-[#D60D26] shadow-md'
                }`}
              >
                Accept <ArrowUpRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <Dialog 
          open={isNegotiateSuccessOpen} 
          onOpenChange={(open) => {
            if (!open) handleCloseNegotiateModal();
            else setIsNegotiateSuccessOpen(true);
          }}
        >
          <DialogContent className="max-w-md bg-white p-0 overflow-y-auto max-h-[90vh] no-scrollbar rounded-2xl border-none shadow-2xl">
            <div className="bg-[#F2FBFF] p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <DialogTitle className="text-green-600 font-bold text-[16px]">Negotiate Fare sent</DialogTitle>
                </div>
                <DialogClose className="text-slate-400 hover:text-slate-600 outline-none" />
              </div>
              
              <div className="mt-2">
                <DialogDescription className="text-slate-500 text-[14px]">
                  Your fare request has been sent successfully
                </DialogDescription>
              </div>

              <div className="flex justify-end mt-4">
                <button 
                  onClick={handleCloseNegotiateModal}
                  className="bg-[#D60D26] hover:bg-[#D60D26] text-white rounded-full px-10 py-3 text-[14px] font-bold transition-colors shadow-md"
                >
                  Okay
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
      <NotificationModal isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} />
    </main>
  );
}
