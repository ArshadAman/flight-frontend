"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  User, 
  Upload, 
  Phone, 
  Award, 
  Plus, 
  Trash2, 
  Edit2, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Bell, 
  Building, 
  Users, 
  Image as ImageIcon, 
  BookOpen, 
  Save, 
  Check,
  X,
  Calendar,
  ChevronDown,
  Plane,
  Coins,
  Contact2,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { B2BNavbar } from "@/components/B2BNavbar";
import { Footer } from "@/components/Footer";

type TabType = "update-profile" | "manage-user" | "change-logo" | "customer-profile" | "notice-board" | "contact";

export default function B2BMyAccountPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<TabType>("update-profile");
    
    // Modals & Popups
    const [isCreateSubUserOpen, setIsCreateSubUserOpen] = useState(false);
    const [isAddCustOpen, setIsAddCustOpen] = useState(false);

    // Real-time search filters
    const [userSearchName, setUserSearchName] = useState("");
    const [userSearchEmail, setUserSearchEmail] = useState("all");
    const [userSearchStatus, setUserSearchStatus] = useState("all");
    
    const [custSearchFirstName, setCustSearchFirstName] = useState("");
    const [custSearchLastName, setCustSearchLastName] = useState("");

    // Auto-detect tabs and action triggers
    useEffect(() => {
        const tab = searchParams.get("tab") as TabType;
        if (tab && ["update-profile", "manage-user", "change-logo", "customer-profile", "notice-board", "contact"].includes(tab)) {
            setActiveTab(tab);
        }
        
        const action = searchParams.get("action");
        if (action === "create-sub-user") {
            setActiveTab("manage-user");
            setIsCreateSubUserOpen(true);
        }
    }, [searchParams]);

    const setTab = (tab: TabType) => {
        setActiveTab(tab);
        router.push(`/b2b/my-account?tab=${tab}`);
    };

    // --- State & Forms matching screenshots ---
    
    // Tab 1: Update Profile State
    const [isIataAccredited, setIsIataAccredited] = useState(true);
    const [profileForm, setProfileForm] = useState({
        agencyName: "Destiny Holidays & Travels",
        legalName: "Destiny Travels Pvt Ltd",
        regNumber: "REG-908234-A",
        vatNumber: "VAT-8902411",
        address: "402, 4th Floor, Signature Towers, Sector 30",
        postalCode: "122001",
        country: "India",
        city: "Gurugram",
        website: "https://www.destinyholidays.com",
        businessType: "Private Limited",
        iataNumber: "98723456",
        odcCode: "ODC-GDS-90",
        contactName: "Sanjay Kumar",
        jobTitle: "Managing Director",
        email: "sanjay@destinyholidays.com",
        mobile: "46666700",
        altPhone: "",
        username: "sanjay_b2b",
        password: "••••••••••••",
        markets: "Domestic & International",
        channels: "B2B Agent Network",
        issueAirline: "YES",
        specialization: "Leisure & Corporate Travel"
    });
    const [isProfileEditing, setIsProfileEditing] = useState(false);
    const [showProfileSuccess, setShowProfileSuccess] = useState(false);

    // Tab 2: Manage User Data (Harshit Chirgania rows)
    const [usersList, setUsersList] = useState([
        { id: 1, name: "Harshit Chirgania", email: "Harshit.Chirgania123@gmail.com", phone: "46666700", creationDate: "15SEP/25", status: "Active", checked: false },
        { id: 2, name: "Harshit Chirgania", email: "Harshit.Chirgania123@gmail.com", phone: "46666700", creationDate: "15SEP/25", status: "Active", checked: false },
        { id: 3, name: "Harshit Chirgania", email: "Harshit.Chirgania123@gmail.com", phone: "46666700", creationDate: "15SEP/25", status: "Active", checked: true }, // Checked as in screenshot
        { id: 4, name: "Harshit Chirgania", email: "Harshit.Chirgania123@gmail.com", phone: "46666700", creationDate: "15SEP/25", status: "Active", checked: false },
        { id: 5, name: "Harshit Chirgania", email: "Harshit.Chirgania123@gmail.com", phone: "46666700", creationDate: "15SEP/25", status: "Active", checked: false },
        { id: 6, name: "Harshit Chirgania", email: "Harshit.Chirgania123@gmail.com", phone: "46666700", creationDate: "15SEP/25", status: "Active", checked: false },
        { id: 7, name: "Harshit Chirgania", email: "Harshit.Chirgania123@gmail.com", phone: "46666700", creationDate: "15SEP/25", status: "Active", checked: false },
    ]);

    // Sub-user form modal fields
    const [subUserForm, setSubUserForm] = useState({
        email: "",
        title: "Mr",
        firstName: "",
        lastName: "",
        mobile: "",
        address1: "",
        address2: "",
        country: "India",
        state: "",
        city: "",
        pincode: ""
    });

    // Tab 4: Manage Customer Profile Data
    const [customers, setCustomers] = useState([
        { id: 1, title: "Mr", firstName: "Harshit", lastName: "Chirgania", dob: "04/04/96", place: "Bhopal, Madhya Pradesh, INDIA", phone: "46666700", email: "Harshit.Chirgania123@gmail.com", lastBooking: "BKK → BOM", creationDate: "15SEP/25", type: "Retail" },
        { id: 2, title: "Mr", firstName: "Harshit", lastName: "Chirgania", dob: "04/04/96", place: "Bhopal, Madhya Pradesh, INDIA", phone: "46666700", email: "Harshit.Chirgania123@gmail.com", lastBooking: "BKK → BOM", creationDate: "15SEP/25", type: "Retail" },
        { id: 3, title: "Mr", firstName: "Harshit", lastName: "Chirgania", dob: "04/04/96", place: "Bhopal, Madhya Pradesh, INDIA", phone: "46666700", email: "Harshit.Chirgania123@gmail.com", lastBooking: "BKK → BOM", creationDate: "15SEP/25", type: "Corporate" },
        { id: 4, title: "Mr", firstName: "Harshit", lastName: "Chirgania", dob: "04/04/96", place: "Bhopal, Madhya Pradesh, INDIA", phone: "46666700", email: "Harshit.Chirgania123@gmail.com", lastBooking: "BKK → BOM", creationDate: "15SEP/25", type: "Retail" },
        { id: 5, title: "Mr", firstName: "Harshit", lastName: "Chirgania", dob: "04/04/96", place: "Bhopal, Madhya Pradesh, INDIA", phone: "46666700", email: "Harshit.Chirgania123@gmail.com", lastBooking: "BKK → BOM", creationDate: "15SEP/25", type: "Retail" },
        { id: 6, title: "Mr", firstName: "Harshit", lastName: "Chirgania", dob: "04/04/96", place: "Bhopal, Madhya Pradesh, INDIA", phone: "46666700", email: "Harshit.Chirgania123@gmail.com", lastBooking: "BKK → BOM", creationDate: "15SEP/25", type: "Corporate" },
        { id: 7, title: "Mr", firstName: "Harshit", lastName: "Chirgania", dob: "04/04/96", place: "Bhopal, Madhya Pradesh, INDIA", phone: "46666700", email: "Harshit.Chirgania123@gmail.com", lastBooking: "BKK → BOM", creationDate: "15SEP/25", type: "Retail" },
    ]);

    // Customer Profile add form 15-fields state (Screenshot 1)
    const [newCustForm, setNewCustForm] = useState({
        type: "Retail",
        title: "Mr",
        firstName: "",
        lastName: "",
        dob: "",
        mobile: "",
        email: "",
        passportNumber: "",
        location: "",
        nationality: "",
        country: "India",
        state: "",
        city: "",
        issueDate: "",
        expireDate: ""
    });

    // Logo state
    const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
    const [logoFileName, setLogoFileName] = useState("No file chosen");

    // Contact form state
    const [contactMessage, setContactMessage] = useState("");
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [showMessageSuccess, setShowMessageSuccess] = useState(false);

    // Filters implementation
    const filteredUsers = usersList.filter(user => {
        const matchesName = user.name.toLowerCase().includes(userSearchName.toLowerCase());
        const matchesEmail = userSearchEmail === "all" ? true : user.email.toLowerCase().includes(userSearchEmail.toLowerCase());
        const matchesStatus = userSearchStatus === "all" ? true : user.status.toLowerCase() === userSearchStatus.toLowerCase();
        return matchesName && matchesEmail && matchesStatus;
    });

    const filteredCustomers = customers.filter(cust => {
        const matchesFirst = cust.firstName.toLowerCase().includes(custSearchFirstName.toLowerCase());
        const matchesLast = cust.lastName.toLowerCase().includes(custSearchLastName.toLowerCase());
        return matchesFirst && matchesLast;
    });

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProfileEditing(false);
        setShowProfileSuccess(true);
        setTimeout(() => setShowProfileSuccess(false), 3000);
    };

    const handleCreateSubUserSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newUser = {
            id: Date.now(),
            name: `${subUserForm.firstName} ${subUserForm.lastName}`,
            email: subUserForm.email || "agent@destinyholidays.com",
            phone: subUserForm.mobile || "46666700",
            creationDate: "20MAY/26",
            status: "Active",
            checked: false
        };
        setUsersList([newUser, ...usersList]);
        setIsCreateSubUserOpen(false);
        // Clear sub-user modal form
        setSubUserForm({
            email: "",
            title: "Mr",
            firstName: "",
            lastName: "",
            mobile: "",
            address1: "",
            address2: "",
            country: "India",
            state: "",
            city: "",
            pincode: ""
        });
    };

    const handleCreateCustomerSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newCust = {
            id: Date.now(),
            title: newCustForm.title,
            firstName: newCustForm.firstName || "Harshit",
            lastName: newCustForm.lastName || "Chirgania",
            dob: newCustForm.dob || "04/04/96",
            place: newCustForm.location || "Bhopal, Madhya Pradesh, INDIA",
            phone: newCustForm.mobile || "46666700",
            email: newCustForm.email || "Harshit.Chirgania123@gmail.com",
            lastBooking: "BKK → BOM",
            creationDate: "15SEP/25",
            type: newCustForm.type
        };
        setCustomers([newCust, ...customers]);
        setIsAddCustOpen(false);
        setNewCustForm({
            type: "Retail",
            title: "Mr",
            firstName: "",
            lastName: "",
            dob: "",
            mobile: "",
            email: "",
            passportNumber: "",
            location: "",
            nationality: "",
            country: "India",
            state: "",
            city: "",
            issueDate: "",
            expireDate: ""
        });
    };

    const handleLogoUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Logo co-branding updated successfully!");
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSendingMessage(true);
        setTimeout(() => {
            setIsSendingMessage(false);
            setShowMessageSuccess(true);
            setContactMessage("");
            setTimeout(() => setShowMessageSuccess(false), 3000);
        }, 1200);
    };

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
            <B2BNavbar />
            
            {/* Dark Red Gradient Header */}
            <div className="w-full bg-gradient-to-r from-[#DF1B24] via-[#6e0f1d] to-[#121021] pt-8 pb-16 px-4 md:px-10 lg:px-20 relative z-0 flex flex-col justify-between items-start">
                <div className="text-[12px] font-semibold text-white/60 mb-2 flex items-center gap-1">
                    <span>Sanjay</span>
                    <span>→</span>
                    <span className="text-white/90">Profile management</span>
                </div>
                
                {/* Dynamically adjust banner text based on secondary notice-board tab */}
                {activeTab === "notice-board" ? (
                    <h1 className="text-white font-extrabold text-[28px] mt-2 select-none animate-in fade-in duration-200">
                        Notice Board
                    </h1>
                ) : activeTab === "contact" ? (
                    <h1 className="text-white font-extrabold text-[28px] mt-2 select-none animate-in fade-in duration-200">
                        Contact Support
                    </h1>
                ) : (
                    /* Navigation Tab Links (Matches Screenshots) */
                    <div className="flex flex-wrap items-center gap-6 md:gap-10 text-[14px] md:text-[15px] font-bold text-white/80 mt-2">
                        {[
                            { id: "update-profile", label: "Update Profile" },
                            { id: "manage-user", label: "Manager User" },
                            { id: "change-logo", label: "Change logo" },
                            { id: "customer-profile", label: "Manage Customer Profile" },
                        ].map((t) => (
                            <div 
                                key={t.id} 
                                className="flex flex-col items-center justify-center relative cursor-pointer py-1" 
                                onClick={() => setTab(t.id as TabType)}
                            >
                                <span className={activeTab === t.id ? "text-white font-extrabold" : "text-white/70 hover:text-white transition-colors"}>
                                    {t.label}
                                </span>
                                {activeTab === t.id && <div className="absolute -bottom-1 w-1.5 h-1.5 bg-[#DF1B24] rounded-full" />}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-10 lg:px-16 -mt-8 relative z-10 pb-20">
                <div className="bg-[#fcfcfc] w-full rounded-2xl p-6 md:p-10 shadow-xl border border-slate-100 min-h-[500px]">
                    
                    {/* TAB: UPDATE PROFILE */}
                    {activeTab === "update-profile" && (
                        <div className="animate-in fade-in duration-300">
                            {/* Update Profile Card Header */}
                            <div className="bg-[#102a43] text-white rounded-t-xl px-6 py-4 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-[17px] font-extrabold tracking-wide uppercase">Update Profile:</h2>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setIsProfileEditing(!isProfileEditing)}
                                    className="border border-white/40 hover:bg-white/10 rounded px-4 py-1.5 text-[12px] font-extrabold flex items-center gap-1 transition-all"
                                >
                                    <Edit2 size={13} />
                                    <span>{isProfileEditing ? "Cancel" : "Edit"}</span>
                                </button>
                            </div>

                            {/* Form Box */}
                            <div className="bg-white border border-t-0 border-slate-200 rounded-b-xl p-6 shadow-sm">
                                {/* Accreditation Radios */}
                                <div className="flex flex-wrap items-center gap-8 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                        <input 
                                            type="radio" 
                                            name="accreditation" 
                                            checked={isIataAccredited} 
                                            onChange={() => setIsIataAccredited(true)}
                                            className="w-4.5 h-4.5 text-[#DF1B24] focus:ring-[#DF1B24]" 
                                        />
                                        <span className="text-[13px] font-extrabold text-slate-700">B2B Travel Agent (IATA Accredited)</span>
                                    </label>
                                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                        <input 
                                            type="radio" 
                                            name="accreditation" 
                                            checked={!isIataAccredited} 
                                            onChange={() => setIsIataAccredited(false)}
                                            className="w-4.5 h-4.5 text-[#DF1B24] focus:ring-[#DF1B24]" 
                                        />
                                        <span className="text-[13px] font-extrabold text-slate-700">B2B Travel Agent (Non-IATA Accredited)</span>
                                    </label>
                                </div>

                                <span className="text-red-500 font-extrabold text-[12px] block mb-6">* Compulsory to fill</span>

                                <form onSubmit={handleSaveProfile} className="space-y-8">
                                    
                                    {/* Agency Information */}
                                    <div>
                                        <div className="bg-sky-50/70 border-l-[4px] border-sky-500 text-sky-900 font-extrabold text-[13px] px-4 py-2 mb-4 uppercase tracking-wider rounded-r">
                                            Agency Information
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Agency / Trading Name *</label>
                                                <input type="text" required disabled={!isProfileEditing} value={profileForm.agencyName} onChange={(e) => setProfileForm({...profileForm, agencyName: e.target.value})} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 focus:border-[#DF1B24] outline-none disabled:bg-slate-50 disabled:text-slate-400" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Legal Company Name</label>
                                                <input type="text" disabled={!isProfileEditing} value={profileForm.legalName} onChange={(e) => setProfileForm({...profileForm, legalName: e.target.value})} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 focus:border-[#DF1B24] outline-none disabled:bg-slate-50 disabled:text-slate-400" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Company Registration Number</label>
                                                <input type="text" disabled={!isProfileEditing} value={profileForm.regNumber} onChange={(e) => setProfileForm({...profileForm, regNumber: e.target.value})} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 focus:border-[#DF1B24] outline-none disabled:bg-slate-50 disabled:text-slate-400" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">VAT Identification Number</label>
                                                <input type="text" disabled={!isProfileEditing} value={profileForm.vatNumber} onChange={(e) => setProfileForm({...profileForm, vatNumber: e.target.value})} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 focus:border-[#DF1B24] outline-none disabled:bg-slate-50 disabled:text-slate-400" />
                                            </div>
                                            
                                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                                <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Address (Street Name) *</label>
                                                <input type="text" required disabled={!isProfileEditing} value={profileForm.address} onChange={(e) => setProfileForm({...profileForm, address: e.target.value})} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 focus:border-[#DF1B24] outline-none disabled:bg-slate-50 disabled:text-slate-400" />
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 md:col-span-2">
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Postal Code *</label>
                                                    <input type="text" required disabled={!isProfileEditing} value={profileForm.postalCode} onChange={(e) => setProfileForm({...profileForm, postalCode: e.target.value})} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 focus:border-[#DF1B24] outline-none disabled:bg-slate-50 disabled:text-slate-400" />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Country Name *</label>
                                                    <select disabled={!isProfileEditing} value={profileForm.country} onChange={(e) => setProfileForm({...profileForm, country: e.target.value})} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 focus:border-[#DF1B24] outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer">
                                                        <option value="India">India</option>
                                                        <option value="Nepal">Nepal</option>
                                                    </select>
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">City Name *</label>
                                                    <select disabled={!isProfileEditing} value={profileForm.city} onChange={(e) => setProfileForm({...profileForm, city: e.target.value})} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 focus:border-[#DF1B24] outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer">
                                                        <option value="Gurugram">Gurugram</option>
                                                        <option value="Bhopal">Bhopal</option>
                                                        <option value="Delhi">Delhi</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Agency Website URL</label>
                                                <input type="text" disabled={!isProfileEditing} value={profileForm.website} onChange={(e) => setProfileForm({...profileForm, website: e.target.value})} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 focus:border-[#DF1B24] outline-none disabled:bg-slate-50 disabled:text-slate-400" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Types of Business</label>
                                                <select disabled={!isProfileEditing} value={profileForm.businessType} onChange={(e) => setProfileForm({...profileForm, businessType: e.target.value})} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 focus:border-[#DF1B24] outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer">
                                                    <option value="Private Limited">Private Limited</option>
                                                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                                                    <option value="Partnership">Partnership</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">IATA Number *</label>
                                                <input type="text" required disabled={!isProfileEditing} value={profileForm.iataNumber} onChange={(e) => setProfileForm({...profileForm, iataNumber: e.target.value})} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 focus:border-[#DF1B24] outline-none disabled:bg-slate-50 disabled:text-slate-400" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">ODC / PCC Code (If Applicable)</label>
                                                <input type="text" disabled={!isProfileEditing} value={profileForm.odcCode} onChange={(e) => setProfileForm({...profileForm, odcCode: e.target.value})} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 focus:border-[#DF1B24] outline-none disabled:bg-slate-50 disabled:text-slate-400" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Primary Contact Details */}
                                    <div>
                                        <div className="bg-sky-50/70 border-l-[4px] border-sky-500 text-sky-900 font-extrabold text-[13px] px-4 py-2 mb-4 uppercase tracking-wider rounded-r">
                                            Primary Contact Details
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Contact Person Name *</label>
                                                <input type="text" required disabled={!isProfileEditing} value={profileForm.contactName} onChange={(e) => setProfileForm({...profileForm, contactName: e.target.value})} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 focus:border-[#DF1B24] outline-none disabled:bg-slate-50 disabled:text-slate-400" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Job Title / Position</label>
                                                <input type="text" disabled={!isProfileEditing} value={profileForm.jobTitle} onChange={(e) => setProfileForm({...profileForm, jobTitle: e.target.value})} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 focus:border-[#DF1B24] outline-none disabled:bg-slate-50 disabled:text-slate-400" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Email Address *</label>
                                                <input type="email" required disabled={!isProfileEditing} value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 focus:border-[#DF1B24] outline-none disabled:bg-slate-50 disabled:text-slate-400" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Mobile / Phone Number *</label>
                                                <input type="text" required disabled={!isProfileEditing} value={profileForm.mobile} onChange={(e) => setProfileForm({...profileForm, mobile: e.target.value})} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 focus:border-[#DF1B24] outline-none disabled:bg-slate-50 disabled:text-slate-400" />
                                            </div>
                                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                                <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Alternate Contact Number (Optional)</label>
                                                <input type="text" disabled={!isProfileEditing} value={profileForm.altPhone} onChange={(e) => setProfileForm({...profileForm, altPhone: e.target.value})} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 focus:border-[#DF1B24] outline-none disabled:bg-slate-50 disabled:text-slate-400" />
                                            </div>

                                            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-150 grid grid-cols-2 gap-4 md:col-span-2">
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Create Username *</label>
                                                    <input type="text" required disabled={!isProfileEditing} value={profileForm.username} onChange={(e) => setProfileForm({...profileForm, username: e.target.value})} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 focus:border-[#DF1B24] outline-none disabled:bg-slate-50 disabled:text-slate-400 bg-white" />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Create Password *</label>
                                                    <input type="password" required disabled={!isProfileEditing} value={profileForm.password} onChange={(e) => setProfileForm({...profileForm, password: e.target.value})} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 focus:border-[#DF1B24] outline-none disabled:bg-slate-50 disabled:text-slate-400 bg-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sales & Market Focus */}
                                    <div>
                                        <div className="bg-sky-50/70 border-l-[4px] border-sky-500 text-sky-900 font-extrabold text-[13px] px-4 py-2 mb-4 uppercase tracking-wider rounded-r">
                                            Sales & Market Focus
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Markets Served</label>
                                                <select disabled={!isProfileEditing} value={profileForm.markets} onChange={(e) => setProfileForm({...profileForm, markets: e.target.value})} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 focus:border-[#DF1B24] outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer">
                                                    <option value="Domestic & International">Domestic & International</option>
                                                    <option value="Only Domestic">Only Domestic</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Main Sales Channels</label>
                                                <select disabled={!isProfileEditing} value={profileForm.channels} onChange={(e) => setProfileForm({...profileForm, channels: e.target.value})} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 focus:border-[#DF1B24] outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer">
                                                    <option value="B2B Agent Network">B2B Agent Network</option>
                                                    <option value="Online / OTA">Online / OTA</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Do You Currently Issue Airline Under Your Own IATA?</label>
                                                <select disabled={!isProfileEditing} value={profileForm.issueAirline} onChange={(e) => setProfileForm({...profileForm, issueAirline: e.target.value})} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 focus:border-[#DF1B24] outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer">
                                                    <option value="YES">YES</option>
                                                    <option value="NO">NO</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Area of Specialization</label>
                                                <select disabled={!isProfileEditing} value={profileForm.specialization} onChange={(e) => setProfileForm({...profileForm, specialization: e.target.value})} className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-[13px] font-semibold text-slate-800 focus:border-[#DF1B24] outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer">
                                                    <option value="Leisure & Corporate Travel">Leisure & Corporate Travel</option>
                                                    <option value="Adventure Travel">Adventure Travel</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {isProfileEditing && (
                                        <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                                            <button 
                                                type="submit"
                                                className="bg-[#DF1B24] hover:bg-[#C1161E] text-white font-extrabold text-[14px] px-8 py-3 rounded-full shadow-md active:scale-95 transition-all"
                                            >
                                                Submit
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setIsProfileEditing(false)}
                                                className="border border-slate-350 hover:bg-slate-50 text-slate-700 font-extrabold text-[14px] px-8 py-3 rounded-full transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}

                                    {showProfileSuccess && (
                                        <div className="flex items-center gap-1.5 text-emerald-600 font-extrabold text-[13px] animate-in fade-in">
                                            <CheckCircle2 size={16} />
                                            <span>Profile changes submitted successfully! Credentials verified.</span>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    )}

                    {/* TAB: MANAGE USER */}
                    {activeTab === "manage-user" && (
                        <div className="animate-in fade-in duration-300">
                            {/* Header Section */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <h3 className="font-extrabold text-[16px] text-slate-800">Sanjay → Profile management</h3>
                                <button 
                                    onClick={() => setIsCreateSubUserOpen(true)}
                                    className="bg-[#DF1B24] hover:bg-[#C1161E] text-white font-extrabold text-[13px] px-6 py-2.5 rounded-full flex items-center gap-1 shadow-md active:scale-95 transition-all"
                                >
                                    Add New User
                                </button>
                            </div>

                            {/* Filter Bar */}
                            <div className="bg-slate-50 p-6 rounded-xl border border-sky-400 shadow-sm flex flex-wrap items-end gap-5 mb-8">
                                <div className="flex flex-col gap-1 w-full sm:w-[160px]">
                                    <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">Name</label>
                                    <input 
                                        type="text" 
                                        value={userSearchName}
                                        onChange={(e) => setUserSearchName(e.target.value)}
                                        placeholder="Enter name" 
                                        className="w-full bg-transparent border-b border-slate-300 pb-1 text-slate-800 text-[13px] font-semibold outline-none focus:border-[#DF1B24]" 
                                    />
                                </div>
                                <div className="flex flex-col gap-1 w-full sm:w-[160px]">
                                    <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">Email</label>
                                    <select 
                                        value={userSearchEmail}
                                        onChange={(e) => setUserSearchEmail(e.target.value)}
                                        className="w-full bg-transparent border-b border-slate-300 pb-1 text-slate-800 text-[13px] font-semibold outline-none focus:border-[#DF1B24] cursor-pointer"
                                    >
                                        <option value="all">All</option>
                                        <option value="Harshit.Chirgania123@gmail.com">Harshit.Chirgania123@gmail.com</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1 w-full sm:w-[130px]">
                                    <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">From</label>
                                    <input type="date" className="bg-transparent border-b border-slate-300 pb-1 outline-none w-full text-slate-800 text-[13px] font-semibold cursor-pointer" />
                                </div>
                                <div className="flex flex-col gap-1 w-full sm:w-[130px]">
                                    <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">To</label>
                                    <input type="date" className="bg-transparent border-b border-slate-300 pb-1 outline-none w-full text-slate-800 text-[13px] font-semibold cursor-pointer" />
                                </div>
                                <div className="flex flex-col gap-1 w-full sm:w-[130px]">
                                    <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">Status</label>
                                    <select 
                                        value={userSearchStatus}
                                        onChange={(e) => setUserSearchStatus(e.target.value)}
                                        className="w-full bg-transparent border-b border-slate-300 pb-1 text-slate-800 text-[13px] font-semibold outline-none focus:border-[#DF1B24] cursor-pointer"
                                    >
                                        <option value="all">All</option>
                                        <option value="Active">Active</option>
                                        <option value="Suspended">Suspended</option>
                                    </select>
                                </div>
                                <button className="bg-[#DF1B24] hover:bg-[#C1161E] text-white px-8 py-2 rounded-full font-bold text-[13px] transition-colors shadow-sm ml-auto sm:w-auto w-full">
                                    Search
                                </button>
                            </div>

                            {/* Users Table */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-extrabold text-slate-800 text-[15px]">Showing {filteredUsers.length}</h3>
                                <div className="flex items-center gap-1 cursor-pointer text-slate-500 text-[13px] font-semibold">
                                    Sort by <span className="font-bold text-slate-800">Recommended</span>
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </div>

                            <div className="w-full overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
                                <table className="w-full min-w-[800px] border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100 text-left text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                                            <th className="py-4 px-5 w-12 text-center"></th>
                                            <th className="py-4 px-5">Name</th>
                                            <th className="py-4 px-5">Email</th>
                                            <th className="py-4 px-5">Phone</th>
                                            <th className="py-4 px-5">Creation Date</th>
                                            <th className="py-4 px-5">Status</th>
                                            <th className="py-4 px-5 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredUsers.map((usr) => (
                                            <tr key={usr.id} className="hover:bg-slate-50/30 transition-colors">
                                                <td className="py-5 px-5 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={usr.checked} 
                                                        onChange={(e) => {
                                                            setUsersList(usersList.map(u => u.id === usr.id ? {...u, checked: e.target.checked} : u));
                                                        }}
                                                        className="w-4 h-4 text-[#DF1B24] border-slate-300 rounded focus:ring-[#DF1B24] cursor-pointer"
                                                    />
                                                </td>
                                                <td className="py-5 px-5 font-bold text-slate-700 text-[13.5px]">{usr.name}</td>
                                                <td className="py-5 px-5 font-semibold text-slate-500 text-[13px]">{usr.email}</td>
                                                <td className="py-5 px-5 font-medium text-slate-500 text-[13px]">{usr.phone}</td>
                                                <td className="py-5 px-5 font-bold text-slate-500 text-[13px]">{usr.creationDate}</td>
                                                <td className="py-5 px-5">
                                                    <span className={cn(
                                                        "px-3 py-0.5 rounded-full text-[11px] font-bold border",
                                                        usr.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"
                                                    )}>
                                                        {usr.status}
                                                    </span>
                                                </td>
                                                <td className="py-5 px-5 text-center">
                                                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                          <path d="M12 20h9" />
                                                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB: CHANGE LOGO */}
                    {activeTab === "change-logo" && (
                        <div className="animate-in fade-in duration-300">
                            <h3 className="font-extrabold text-[16px] text-slate-800 mb-6">Sanjay → Profile management</h3>

                            <form onSubmit={handleLogoUploadSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                                    
                                    {/* Upload Dash Area */}
                                    <div className="lg:col-span-2 border-2 border-dashed border-slate-200 bg-[#edf5fd]/40 rounded-2xl p-12 flex flex-col items-center justify-center text-center relative group">
                                        <div className="absolute inset-0 bg-transparent flex items-center justify-center p-4">
                                            {uploadedLogo ? (
                                                <img src={uploadedLogo} alt="Uploaded logo" className="max-h-24 max-w-full object-contain" />
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <div className="flex items-center gap-1 bg-[#DF1B24]/10 rounded-xl p-3 mb-2">
                                                        <div className="text-[#DF1B24] shrink-0 font-extrabold animate-pulse">
                                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                              <rect x="3" y="8" width="18" height="13" rx="2" />
                                                              <path d="M16 8V6a4 4 0 0 0-8 0v2" />
                                                            </svg>
                                                        </div>
                                                        <div className="flex flex-col items-start leading-none select-none">
                                                            <span className="font-extrabold text-[#DF1B24] text-[16px]">My</span>
                                                            <span className="font-extrabold text-[#DF1B24] text-[15px]">Travel Deal</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                        />
                                    </div>

                                    {/* Instructions box */}
                                    <div className="bg-[#edf5fd]/40 border border-sky-100 rounded-2xl p-6 text-[13px] font-semibold text-slate-700 leading-relaxed">
                                        <h4 className="font-extrabold text-[14px] text-slate-800 mb-3">Instructions to upload a Logo:</h4>
                                        <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                            <li>Logo Dimension should not be more than <span className="font-bold text-slate-850">300px*80px</span></li>
                                            <li>Maximum file size upload limit is <span className="font-bold text-slate-850">1MB</span></li>
                                            <li>Image type for logo is <span className="font-bold text-slate-850">.gif, .jpeg, .jpg, .png</span></li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Choose File Bar */}
                                <div className="flex items-center gap-3">
                                    <label className="border border-slate-350 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-[13px] px-6 py-2 rounded-full cursor-pointer transition-colors shadow-sm">
                                        Choose file
                                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                                    </label>
                                    <span className="text-[13px] text-slate-500 font-medium">{logoFileName}</span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                                    <button type="submit" className="bg-[#DF1B24] hover:bg-[#C1161E] text-white font-extrabold text-[14px] px-10 py-3 rounded-full shadow-md active:scale-95 transition-all">
                                        Upload
                                    </button>
                                    <button type="button" onClick={() => {
                                        setUploadedLogo(null);
                                        setLogoFileName("No file chosen");
                                    }} className="border border-slate-350 hover:bg-slate-50 text-slate-700 font-extrabold text-[14px] px-10 py-3 rounded-full transition-all">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TAB: MANAGE CUSTOMER PROFILE */}
                    {activeTab === "customer-profile" && (
                        <div className="animate-in fade-in duration-300">
                            {/* Header Section */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <h3 className="font-extrabold text-[16px] text-slate-800">Sanjay → Profile management</h3>
                                <button 
                                    onClick={() => setIsAddCustOpen(true)}
                                    className="bg-[#DF1B24] hover:bg-[#C1161E] text-white font-extrabold text-[13px] px-6 py-2.5 rounded-full flex items-center gap-1 shadow-md active:scale-95 transition-all"
                                >
                                    Add New Customer
                                </button>
                            </div>

                            {/* Filter Bar */}
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-end gap-5 mb-8">
                                <div className="flex flex-col gap-1 w-full sm:w-[220px]">
                                    <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">First Name</label>
                                    <input 
                                        type="text" 
                                        value={custSearchFirstName}
                                        onChange={(e) => setCustSearchFirstName(e.target.value)}
                                        placeholder="Enter first name" 
                                        className="w-full bg-transparent border-b border-slate-300 pb-1 text-slate-800 text-[13px] font-semibold outline-none focus:border-[#DF1B24]" 
                                    />
                                </div>
                                <div className="flex flex-col gap-1 w-full sm:w-[220px]">
                                    <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">Last Name</label>
                                    <input 
                                        type="text" 
                                        value={custSearchLastName}
                                        onChange={(e) => setCustSearchLastName(e.target.value)}
                                        placeholder="Enter last name" 
                                        className="w-full bg-transparent border-b border-slate-300 pb-1 text-slate-800 text-[13px] font-semibold outline-none focus:border-[#DF1B24]" 
                                    />
                                </div>
                                <button className="bg-[#DF1B24] hover:bg-[#C1161E] text-white px-8 py-2 rounded-full font-bold text-[13px] transition-colors shadow-sm ml-auto sm:w-auto w-full">
                                    Search
                                </button>
                            </div>

                            {/* Customer Table */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-extrabold text-slate-800 text-[15px]">Showing {filteredCustomers.length}</h3>
                                <div className="flex items-center gap-1 cursor-pointer text-slate-500 text-[13px] font-semibold">
                                    Sort by <span className="font-bold text-slate-800">Recommended</span>
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </div>

                            <div className="w-full overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
                                <table className="w-full min-w-[950px] border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100 text-left text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                                            <th className="py-4 px-5">Title</th>
                                            <th className="py-4 px-5">First Name</th>
                                            <th className="py-4 px-5">Last Name</th>
                                            <th className="py-4 px-5">Date of Birth</th>
                                            <th className="py-4 px-5">Place(City, State, Country)</th>
                                            <th className="py-4 px-5">Mobile No.</th>
                                            <th className="py-4 px-5">Customer Email</th>
                                            <th className="py-4 px-5">Last booking</th>
                                            <th className="py-4 px-5">Creation Date</th>
                                            <th className="py-4 px-5 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredCustomers.map((cust) => (
                                            <tr key={cust.id} className="hover:bg-slate-50/30 transition-colors">
                                                <td className="py-5 px-5 font-bold text-slate-700 text-[13px]">{cust.title}</td>
                                                <td className="py-5 px-5 font-bold text-slate-700 text-[13.5px]">{cust.firstName}</td>
                                                <td className="py-5 px-5 font-bold text-slate-700 text-[13.5px]">{cust.lastName}</td>
                                                <td className="py-5 px-5 font-bold text-slate-500 text-[13px]">{cust.dob}</td>
                                                <td className="py-5 px-5 font-semibold text-slate-500 text-[13px]">{cust.place}</td>
                                                <td className="py-5 px-5 font-medium text-slate-500 text-[13px]">{cust.phone}</td>
                                                <td className="py-5 px-5 font-semibold text-slate-500 text-[13px]">{cust.email}</td>
                                                <td className="py-5 px-5 font-bold text-primary text-[12.5px]">{cust.lastBooking}</td>
                                                <td className="py-5 px-5 font-bold text-slate-500 text-[13px]">{cust.creationDate}</td>
                                                <td className="py-5 px-5 text-center">
                                                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                          <path d="M12 20h9" />
                                                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB: NOTICE BOARD (Screenshot 2) */}
                    {activeTab === "notice-board" && (
                        <div className="animate-in fade-in duration-300">
                            {/* 4-column block layout matching screenshot 2 exactly */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 select-none mt-2">
                                
                                {/* 1. Airline information */}
                                <div className="flex flex-col border border-slate-200/80 rounded-xl overflow-hidden shadow-sm bg-white min-h-[420px]">
                                    <div className="bg-[#fff0f1] text-[#DF1B24] font-extrabold text-[14px] py-3.5 px-5 border-b border-slate-150 uppercase tracking-wide flex items-center gap-2">
                                        <Plane className="w-4 h-4 text-[#DF1B24]" />
                                        <span>Airline information</span>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col gap-4 text-[13px] font-semibold text-slate-700">
                                        <div className="p-3 bg-red-50/50 rounded-lg border border-red-100">
                                            <span className="text-[11px] font-extrabold text-red-600 block mb-1">ALERT</span>
                                            <p className="text-slate-700 text-[12.5px] leading-relaxed">Air India operations to Kathmandu suspended due to airport maintenance waivers.</p>
                                        </div>
                                        <div className="p-3 bg-blue-50/30 rounded-lg border border-blue-100">
                                            <span className="text-[11px] font-extrabold text-blue-600 block mb-1">UPDATE</span>
                                            <p className="text-slate-700 text-[12.5px] leading-relaxed">Indigo introduces extra bags luggage allowances for Gulf sectors starting next week.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Finance Information */}
                                <div className="flex flex-col border border-slate-200/80 rounded-xl overflow-hidden shadow-sm bg-white min-h-[420px]">
                                    <div className="bg-[#fff0f1] text-[#DF1B24] font-extrabold text-[14px] py-3.5 px-5 border-b border-slate-150 uppercase tracking-wide flex items-center gap-2">
                                        <Coins className="w-4 h-4 text-[#DF1B24]" />
                                        <span>Finance Information</span>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col gap-4 text-[13px] font-semibold text-slate-700">
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
                                            <span className="text-[11px] font-extrabold text-slate-500 block mb-1">DEPOSIT WINDOW</span>
                                            <p className="text-slate-700 text-[12.5px] leading-relaxed">Instant net banking wallet deposit service upgraded with 0% extra gateway charges.</p>
                                        </div>
                                        <div className="p-3 bg-amber-50/30 rounded-lg border border-amber-100">
                                            <span className="text-[11px] font-extrabold text-amber-600 block mb-1">PROMOTION</span>
                                            <p className="text-slate-700 text-[12.5px] leading-relaxed">Earn 1.5% loyalty points bonus on credit card requests processed before Friday midnight.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Contact Information */}
                                <div className="flex flex-col border border-slate-200/80 rounded-xl overflow-hidden shadow-sm bg-white min-h-[420px]">
                                    <div className="bg-[#fff0f1] text-[#DF1B24] font-extrabold text-[14px] py-3.5 px-5 border-b border-slate-150 uppercase tracking-wide flex items-center gap-2">
                                        <Contact2 className="w-4 h-4 text-[#DF1B24]" />
                                        <span>Contact Information</span>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col gap-4 text-[13px] font-semibold text-slate-700">
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-150 space-y-1">
                                            <span className="text-[11px] font-extrabold text-slate-500 block">B2B HELPDESK</span>
                                            <span className="block text-[13px] font-bold text-slate-800">Support Desk: +91 99999-88888</span>
                                            <span className="block text-[12px] text-slate-500 font-medium">Desk timings: 24/7 Hotline support</span>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-150 space-y-1">
                                            <span className="text-[11px] font-extrabold text-slate-500 block">ACCOUNT MANAGER</span>
                                            <span className="block text-[13px] font-bold text-slate-800">Anand Kumar (Sr Head)</span>
                                            <span className="block text-[12px] text-slate-500 font-medium">anand.k@mytraveldeal.com</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 4. Others */}
                                <div className="flex flex-col border border-slate-200/80 rounded-xl overflow-hidden shadow-sm bg-white min-h-[420px]">
                                    <div className="bg-[#fff0f1] text-[#DF1B24] font-extrabold text-[14px] py-3.5 px-5 border-b border-slate-150 uppercase tracking-wide flex items-center gap-2">
                                        <Settings className="w-4 h-4 text-[#DF1B24]" />
                                        <span>Others</span>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col gap-4 text-[13px] font-semibold text-slate-700">
                                        <div className="p-3 bg-blue-50/20 rounded-lg border border-blue-100">
                                            <span className="text-[11px] font-extrabold text-blue-600 block mb-1">PORTAL SYSTEM</span>
                                            <p className="text-slate-700 text-[12.5px] leading-relaxed">Dedicated B2B agent mobile ticketing application launching soon on Play Store.</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
                                            <span className="text-[11px] font-extrabold text-slate-500 block mb-1">GDS ANNOUNCEMENT</span>
                                            <p className="text-slate-700 text-[12.5px] leading-relaxed">Dynamic seat mapping features enabled on Sabre direct airline connections.</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* TAB: CONTACT SUPPORT */}
                    {activeTab === "contact" && (
                        <div className="animate-in fade-in duration-300">
                            <h2 className="text-[22px] font-extrabold text-slate-800 mb-2">B2B Helpdesk & Escalation</h2>
                            <p className="text-[14px] text-slate-500 font-medium mb-8">
                                Connect with your dedicated B2B Account Manager or file an instant support ticket for refund/booking issues.
                            </p>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                <div className="lg:col-span-1 flex flex-col gap-6">
                                    <div className="border border-slate-150 rounded-2xl p-6 bg-slate-50/50 flex flex-col gap-6">
                                        <h3 className="font-extrabold text-[15px] text-slate-800">Your Account Manager</h3>
                                        
                                        <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200/50 shadow-sm">
                                            <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center font-extrabold text-primary text-[16px]">
                                                AK
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-[14px] text-slate-800">Anand Kumar</h4>
                                                <span className="text-[11px] font-bold text-slate-400 uppercase">Senior Account Head</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3.5 text-[13px] font-semibold text-slate-700">
                                            <div className="flex items-center gap-2.5">
                                                <Phone className="text-primary w-4.5 h-4.5" />
                                                <span>+91 98765 43210</span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <Mail className="text-primary w-4.5 h-4.5" />
                                                <span className="text-slate-600">anand.k@mytraveldeal.com</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border border-slate-150 rounded-2xl p-6 bg-[#6e0f1d]/5 flex flex-col gap-4">
                                        <h3 className="font-extrabold text-[15px] text-slate-800">Emergency Ticketing Hotlines</h3>
                                        <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
                                            Need immediate booking changes within 4 hours of departure? Use our 24/7 dedicated agents line.
                                        </p>
                                        <div className="font-extrabold text-[18px] text-[#DF1B24]">
                                            1800-400-5050 (Toll Free)
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-2 border border-slate-200 rounded-2xl p-6 bg-white flex flex-col">
                                    <h3 className="font-extrabold text-[15px] text-slate-800 mb-4">Open Support Incident</h3>
                                    
                                    <form onSubmit={handleSendMessage} className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Ticket Category</label>
                                                <select className="border border-slate-200 rounded-lg px-3.5 py-3 outline-none focus:border-[#DF1B24] text-[13px] font-semibold text-slate-700 bg-white">
                                                    <option>Refund / Voiding Escalation</option>
                                                    <option>Name Correction Request</option>
                                                    <option>API Webhook / GDS Failure</option>
                                                    <option>Wallet Deposit Issue</option>
                                                    <option>Other Query</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Booking Ref (PNR)</label>
                                                <input type="text" placeholder="e.g. DEL-89472" className="border border-slate-200 rounded-lg px-3.5 py-3 outline-none focus:border-[#DF1B24] text-[13px] font-semibold text-slate-800 placeholder:text-slate-300" />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Describe Support Ticket</label>
                                            <textarea 
                                                rows={5}
                                                placeholder="Explain the problem in detail to expedite the correction request..."
                                                value={contactMessage}
                                                onChange={(e) => setContactMessage(e.target.value)}
                                                required
                                                className="border border-slate-200 rounded-lg px-3.5 py-3 outline-none focus:border-[#DF1B24] text-[13px] font-semibold text-slate-800 placeholder:text-slate-400 resize-none"
                                            />
                                        </div>

                                        <div className="flex items-center gap-4 pt-2">
                                            <button 
                                                type="submit" 
                                                disabled={isSendingMessage}
                                                className="bg-[#DF1B24] hover:bg-[#C1161E] text-white font-bold text-[13px] py-3.5 px-6 rounded-full flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                {isSendingMessage ? "Sending..." : "Submit Incident"}
                                            </button>

                                            {showMessageSuccess && (
                                                <div className="flex items-center gap-1.5 text-emerald-600 font-extrabold text-[13px] animate-in fade-in">
                                                    <CheckCircle2 size={16} />
                                                    <span>Support ticket successfully submitted! Reference AK-9081</span>
                                                </div>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CREATE SUB USER MODAL (Image 3 Overlay) */}
            {isCreateSubUserOpen && (
                <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-[550px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-[#DF1B24] via-[#6e0f1d] to-[#121021] px-6 py-4 flex items-center justify-between text-white border-b border-slate-200">
                            <h2 className="font-extrabold text-[15px] uppercase tracking-wider">Create sub user</h2>
                            <button onClick={() => setIsCreateSubUserOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Modal Body Form */}
                        <form onSubmit={handleCreateSubUserSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            <div className="grid grid-cols-3 gap-x-4 gap-y-3.5 text-[13px] font-semibold text-slate-700 items-center">
                                
                                <span className="text-slate-500">Email Id</span>
                                <input type="email" required placeholder="--" value={subUserForm.email} onChange={(e) => setSubUserForm({...subUserForm, email: e.target.value})} className="col-span-2 outline-none text-[13px] text-slate-800 placeholder:text-slate-300 border border-slate-200 rounded px-3 py-1.5 focus:border-[#DF1B24]" />
                                
                                <span className="text-slate-500">Title</span>
                                <select value={subUserForm.title} onChange={(e) => setSubUserForm({...subUserForm, title: e.target.value})} className="col-span-2 outline-none text-[13px] text-slate-800 bg-white border border-slate-200 rounded px-3 py-1.5 focus:border-[#DF1B24] cursor-pointer">
                                    <option value="Mr">Mr</option>
                                    <option value="Mrs">Mrs</option>
                                    <option value="Ms">Ms</option>
                                </select>

                                <span className="text-slate-500">First Name</span>
                                <input type="text" required placeholder="--" value={subUserForm.firstName} onChange={(e) => setSubUserForm({...subUserForm, firstName: e.target.value})} className="col-span-2 outline-none text-[13px] text-slate-800 placeholder:text-slate-300 border border-slate-200 rounded px-3 py-1.5 focus:border-[#DF1B24]" />

                                <span className="text-slate-500">Last Name</span>
                                <input type="text" required placeholder="--" value={subUserForm.lastName} onChange={(e) => setSubUserForm({...subUserForm, lastName: e.target.value})} className="col-span-2 outline-none text-[13px] text-slate-800 placeholder:text-slate-300 border border-slate-200 rounded px-3 py-1.5 focus:border-[#DF1B24]" />

                                <span className="text-slate-500">Customer Mobile</span>
                                <input type="text" required placeholder="--" value={subUserForm.mobile} onChange={(e) => setSubUserForm({...subUserForm, mobile: e.target.value})} className="col-span-2 outline-none text-[13px] text-slate-800 placeholder:text-slate-300 border border-slate-200 rounded px-3 py-1.5 focus:border-[#DF1B24]" />

                                <span className="text-slate-500">Address 1</span>
                                <input type="text" placeholder="--" value={subUserForm.address1} onChange={(e) => setSubUserForm({...subUserForm, address1: e.target.value})} className="col-span-2 outline-none text-[13px] text-slate-800 placeholder:text-slate-300 border border-slate-200 rounded px-3 py-1.5 focus:border-[#DF1B24]" />

                                <span className="text-slate-500">Address 2</span>
                                <input type="text" placeholder="--" value={subUserForm.address2} onChange={(e) => setSubUserForm({...subUserForm, address2: e.target.value})} className="col-span-2 outline-none text-[13px] text-slate-800 placeholder:text-slate-300 border border-slate-200 rounded px-3 py-1.5 focus:border-[#DF1B24]" />

                                <span className="text-slate-500">Country</span>
                                <select value={subUserForm.country} onChange={(e) => setSubUserForm({...subUserForm, country: e.target.value})} className="col-span-2 outline-none text-[13px] text-slate-800 bg-white border border-slate-200 rounded px-3 py-1.5 focus:border-[#DF1B24] cursor-pointer">
                                    <option value="India">India</option>
                                    <option value="Nepal">Nepal</option>
                                </select>

                                <span className="text-slate-500">State</span>
                                <select value={subUserForm.state} onChange={(e) => setSubUserForm({...subUserForm, state: e.target.value})} className="col-span-2 outline-none text-[13px] text-slate-800 bg-white border border-slate-200 rounded px-3 py-1.5 focus:border-[#DF1B24] cursor-pointer">
                                    <option value="">--</option>
                                    <option value="Haryana">Haryana</option>
                                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                                    <option value="Delhi">Delhi</option>
                                </select>

                                <span className="text-slate-500">City</span>
                                <select value={subUserForm.city} onChange={(e) => setSubUserForm({...subUserForm, city: e.target.value})} className="col-span-2 outline-none text-[13px] text-slate-800 bg-white border border-slate-200 rounded px-3 py-1.5 focus:border-[#DF1B24] cursor-pointer">
                                    <option value="">--</option>
                                    <option value="Gurugram">Gurugram</option>
                                    <option value="Bhopal">Bhopal</option>
                                    <option value="New Delhi">New Delhi</option>
                                </select>

                                <span className="text-slate-500">Pincode</span>
                                <input type="text" placeholder="--" value={subUserForm.pincode} onChange={(e) => setSubUserForm({...subUserForm, pincode: e.target.value})} className="col-span-2 outline-none text-[13px] text-slate-800 placeholder:text-slate-300 border border-slate-200 rounded px-3 py-1.5 focus:border-[#DF1B24]" />
                            </div>

                            {/* Buttons footer */}
                            <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                                <button type="button" onClick={() => setIsCreateSubUserOpen(false)} className="flex-1 border border-slate-350 hover:bg-slate-50 text-slate-700 font-extrabold text-[13.5px] py-2.5 rounded-full transition-colors active:scale-98">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 bg-[#DF1B24] hover:bg-[#C1161E] text-white font-extrabold text-[13.5px] py-2.5 rounded-full transition-colors shadow-md active:scale-98">
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD NEW CUSTOMER DETAILS MODAL (Screenshot 1 Overlay - 15 Fields) */}
            {isAddCustOpen && (
                <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-[550px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-[#DF1B24] via-[#6e0f1d] to-[#121021] px-6 py-4 flex items-center justify-between text-white border-b border-slate-200">
                            <h2 className="font-extrabold text-[15px] uppercase tracking-wider">Add new customer details</h2>
                            <button onClick={() => setIsAddCustOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Modal Body Form */}
                        <form onSubmit={handleCreateCustomerSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            <div className="grid grid-cols-3 gap-x-4 gap-y-3.5 text-[13px] font-semibold text-slate-700 items-center">
                                
                                <span className="text-slate-500">Type</span>
                                <select value={newCustForm.type} onChange={(e) => setNewCustForm({...newCustForm, type: e.target.value})} className="col-span-2 outline-none text-[13px] text-slate-800 bg-white border border-slate-200 rounded px-3 py-1.5 focus:border-[#DF1B24] cursor-pointer">
                                    <option value="Select Type">Select Type</option>
                                    <option value="Retail">Retail</option>
                                    <option value="Corporate">Corporate</option>
                                </select>

                                <span className="text-slate-500">Title</span>
                                <select value={newCustForm.title} onChange={(e) => setNewCustForm({...newCustForm, title: e.target.value})} className="col-span-2 outline-none text-[13px] text-slate-800 bg-white border border-slate-200 rounded px-3 py-1.5 focus:border-[#DF1B24] cursor-pointer">
                                    <option value="--">--</option>
                                    <option value="Mr">Mr</option>
                                    <option value="Mrs">Mrs</option>
                                    <option value="Ms">Ms</option>
                                </select>
                                
                                <span className="text-slate-500">First Name</span>
                                <input type="text" required placeholder="--" value={newCustForm.firstName} onChange={(e) => setNewCustForm({...newCustForm, firstName: e.target.value})} className="col-span-2 outline-none text-[13px] text-slate-800 placeholder:text-slate-300 border border-slate-200 rounded px-3 py-1.5 focus:border-[#DF1B24]" />
                                
                                <span className="text-slate-500">Last Name</span>
                                <input type="text" required placeholder="--" value={newCustForm.lastName} onChange={(e) => setNewCustForm({...newCustForm, lastName: e.target.value})} className="col-span-2 outline-none text-[13px] text-slate-800 placeholder:text-slate-300 border border-slate-200 rounded px-3 py-1.5 focus:border-[#DF1B24]" />

                                <span className="text-slate-500">Date of Birth</span>
                                <div className="col-span-2 flex items-center border border-slate-200 rounded px-3 py-1.5 relative bg-white">
                                    <input type="text" placeholder="Dd/Mm/Yyyy" value={newCustForm.dob} onChange={(e) => setNewCustForm({...newCustForm, dob: e.target.value})} className="outline-none text-[13px] text-slate-800 placeholder:text-slate-300 w-full" />
                                    <Calendar className="w-4 h-4 text-slate-400 shrink-0 ml-1.5" />
                                </div>

                                <span className="text-slate-500">Customer Mobile</span>
                                <input type="text" placeholder="--" value={newCustForm.mobile} onChange={(e) => setNewCustForm({...newCustForm, mobile: e.target.value})} className="col-span-2 outline-none text-[13px] text-slate-800 placeholder:text-slate-300 border border-slate-200 rounded px-3 py-1.5 focus:border-[#DF1B24]" />

                                <span className="text-slate-500">Email ID</span>
                                <input type="email" placeholder="--" value={newCustForm.email} onChange={(e) => setNewCustForm({...newCustForm, email: e.target.value})} className="col-span-2 outline-none text-[13px] text-slate-800 placeholder:text-slate-300 border border-slate-200 rounded px-3 py-1.5 focus:border-[#DF1B24]" />

                                <span className="text-slate-500">Passport Number</span>
                                <input type="text" placeholder="--" value={newCustForm.passportNumber} onChange={(e) => setNewCustForm({...newCustForm, passportNumber: e.target.value})} className="col-span-2 outline-none text-[13px] text-slate-800 placeholder:text-slate-300 border border-slate-200 rounded px-3 py-1.5 focus:border-[#DF1B24]" />

                                <span className="text-slate-500">Location</span>
                                <input type="text" placeholder="--" value={newCustForm.location} onChange={(e) => setNewCustForm({...newCustForm, location: e.target.value})} className="col-span-2 outline-none text-[13px] text-slate-800 placeholder:text-slate-300 border border-slate-200 rounded px-3 py-1.5 focus:border-[#DF1B24]" />

                                <span className="text-slate-500">Nationality</span>
                                <input type="text" placeholder="--" value={newCustForm.nationality} onChange={(e) => setNewCustForm({...newCustForm, nationality: e.target.value})} className="col-span-2 outline-none text-[13px] text-slate-800 placeholder:text-slate-300 border border-slate-200 rounded px-3 py-1.5 focus:border-[#DF1B24]" />

                                <span className="text-slate-500">Country</span>
                                <select value={newCustForm.country} onChange={(e) => setNewCustForm({...newCustForm, country: e.target.value})} className="col-span-2 outline-none text-[13px] text-slate-800 bg-white border border-slate-200 rounded px-3 py-1.5 focus:border-[#DF1B24] cursor-pointer">
                                    <option value="--">--</option>
                                    <option value="India">India</option>
                                    <option value="Nepal">Nepal</option>
                                </select>

                                <span className="text-slate-500">State</span>
                                <select value={newCustForm.state} onChange={(e) => setNewCustForm({...newCustForm, state: e.target.value})} className="col-span-2 outline-none text-[13px] text-slate-800 bg-white border border-slate-200 rounded px-3 py-1.5 focus:border-[#DF1B24] cursor-pointer">
                                    <option value="--">--</option>
                                    <option value="Haryana">Haryana</option>
                                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                                </select>

                                <span className="text-slate-500">City</span>
                                <select value={newCustForm.city} onChange={(e) => setNewCustForm({...newCustForm, city: e.target.value})} className="col-span-2 outline-none text-[13px] text-slate-800 bg-white border border-slate-200 rounded px-3 py-1.5 focus:border-[#DF1B24] cursor-pointer">
                                    <option value="--">--</option>
                                    <option value="Gurugram">Gurugram</option>
                                    <option value="Bhopal">Bhopal</option>
                                </select>

                                <span className="text-slate-500">Issue Date</span>
                                <div className="col-span-2 flex items-center border border-slate-200 rounded px-3 py-1.5 relative bg-white">
                                    <input type="text" placeholder="Dd/Mm/Yyyy" value={newCustForm.issueDate} onChange={(e) => setNewCustForm({...newCustForm, issueDate: e.target.value})} className="outline-none text-[13px] text-slate-800 placeholder:text-slate-300 w-full" />
                                    <Calendar className="w-4 h-4 text-slate-400 shrink-0 ml-1.5" />
                                </div>

                                <span className="text-slate-500">Expire Date</span>
                                <div className="col-span-2 flex items-center border border-slate-200 rounded px-3 py-1.5 relative bg-white">
                                    <input type="text" placeholder="Dd/Mm/Yyyy" value={newCustForm.expireDate} onChange={(e) => setNewCustForm({...newCustForm, expireDate: e.target.value})} className="outline-none text-[13px] text-slate-800 placeholder:text-slate-300 w-full" />
                                    <Calendar className="w-4 h-4 text-slate-400 shrink-0 ml-1.5" />
                                </div>

                            </div>

                            {/* Buttons footer */}
                            <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                                <button type="button" onClick={() => setIsAddCustOpen(false)} className="flex-1 border border-slate-350 hover:bg-slate-50 text-slate-700 font-extrabold text-[13.5px] py-2.5 rounded-full transition-colors active:scale-98">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 bg-[#DF1B24] hover:bg-[#C1161E] text-white font-extrabold text-[13.5px] py-2.5 rounded-full transition-colors shadow-md active:scale-98">
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </main>
    );
}
