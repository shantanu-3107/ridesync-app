import React, { useState, useEffect } from 'react';
import { UserProfile, PastRide, AppTheme, Ride, RideRequest } from '../types/ride';
import { sendDataToEmail, exportToCSV, exportToJSON } from '../services/notificationService';
import { 
  X, 
  User, 
  LogIn, 
  Palette, 
  History, 
  Wallet, 
  CheckCircle2, 
  Car, 
  Bike, 
  TrendingUp,
  Camera,
  Upload,
  Check,
  ImageIcon,
  RotateCcw,
  Download,
  Mail,
  FileSpreadsheet,
  Database,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lock
} from 'lucide-react';

const AVATAR_PRESETS = [
  { id: '1', label: 'Rider Black Jacket', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80' },
  { id: '2', label: 'Urban Traveler', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&auto=format&fit=crop&q=80' },
  { id: '3', label: 'Tech Professional', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
  { id: '4', label: 'Commuter Girl', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80' },
  { id: '5', label: 'Biker Helmet', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  { id: '6', label: 'Casual Companion', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80' },
  { id: '7', label: 'Executive Driver', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
  { id: '8', label: 'City Explorer', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },
];

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  pastRides: PastRide[];
  rides: Ride[];
  requests: RideRequest[];
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
  onResetData?: () => void;
  onOpenAuthModal?: () => void;
}

export const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  pastRides,
  rides,
  requests,
  currentTheme,
  onSelectTheme,
  onResetData,
  onOpenAuthModal,
}) => {
  if (!isOpen) return null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [activeTab, setActiveTab] = useState<'profile' | 'signin' | 'theme' | 'history' | 'income' | 'data'>('profile');

  // Admin Data Collection & Notification State
  const [adminEmail, setAdminEmail] = useState(() => {
    return localStorage.getItem('ridepartner_admin_email') || 'shantanumohature@gmail.com';
  });
  const [emailSaveSuccess, setEmailSaveSuccess] = useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleSaveAdminEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminEmail.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    localStorage.setItem('ridepartner_admin_email', adminEmail.trim());
    setEmailSaveSuccess(true);
    setTimeout(() => setEmailSaveSuccess(false), 3000);
  };

  const handleSendTestNotification = async () => {
    setIsSendingTestEmail(true);
    setTestEmailStatus(null);
    try {
      const res = await sendDataToEmail({
        eventType: 'TEST_NOTIFICATION',
        title: 'RidePartner Data Forwarding Active',
        recipientEmail: adminEmail,
        data: {
          status: 'Email sync active & functioning',
          connectedEmail: adminEmail,
          liveActiveRidesCount: rides.length,
          activeCompanionRequestsCount: requests.length,
          completedTripsCount: pastRides.length,
          sentFrom: window.location.origin,
          message: 'All incoming lifts, requests, and fare bargains will be dispatched to this inbox!',
        },
      });
      setTestEmailStatus(res);
    } catch (err: any) {
      setTestEmailStatus({ success: false, message: err?.message || 'Failed to dispatch test email.' });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleDownloadCSV = () => {
    exportToCSV(rides, requests);
    setExportNotice('Exported CSV file downloaded to your device!');
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleDownloadJSON = () => {
    exportToJSON({ user, rides, requests, pastRides });
    setExportNotice('Full JSON backup downloaded to your device!');
    setTimeout(() => setExportNotice(null), 4000);
  };

  // Form states for profile edit
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);
  const [isEditing, setIsEditing] = useState(false);

  // Profile picture modifying state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState(user.avatar);
  const [customUrlInput, setCustomUrlInput] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setNewAvatarUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = () => {
    if (newAvatarUrl.trim()) {
      onUpdateUser({
        ...user,
        avatar: newAvatarUrl.trim(),
      });
    }
    setIsPhotoModalOpen(false);
  };

  // Sign In simulation state
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [loginPhone, setLoginPhone] = useState('+91 98765 43210');

  // Calculate total income from past rides as rider
  const totalRiderIncome = pastRides
    .filter((r) => r.role === 'rider' && r.status === 'completed')
    .reduce((sum, r) => sum + r.fare, 0);

  const completedTripsCount = pastRides.filter((r) => r.status === 'completed').length;
  const fuelSavingsEstimate = Math.round(totalRiderIncome * 0.7);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name,
      phone,
      email,
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto font-body">
      <div className="relative w-full max-w-3xl rounded-[1.5rem] liquid-glass-strong border border-white/20 shadow-2xl p-5 sm:p-7 text-white my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="relative group cursor-pointer"
              onClick={() => {
                setNewAvatarUrl(user.avatar);
                setIsPhotoModalOpen(true);
              }}
              title="Click to Modify Profile Picture"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-13 h-13 rounded-full object-cover ring-2 ring-white/30 group-hover:ring-emerald-400 transition-all shadow-md"
              />
              <span className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                <Camera className="w-4 h-4" />
              </span>
              <span className="absolute -bottom-1 -right-1 bg-black rounded-full p-1 border border-white/20 text-emerald-400 group-hover:scale-110 transition-transform">
                <Camera className="w-3 h-3" />
              </span>
            </div>
            <div>
              <h2 className="text-xl font-heading italic text-white flex items-center gap-2">
                {user.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-white/70">
                <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-white/90">
                  {user.defaultRole === 'rider' ? 'Verified Rider' : 'Verified Passenger'}
                </span>
                <span>•</span>
                <span className="text-amber-300 font-semibold">★ {user.rating}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl liquid-glass border border-white/10 overflow-x-auto shrink-0 mb-5 text-xs font-medium">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-white text-black font-semibold shadow'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Own Info</span>
          </button>

          <button
            onClick={() => setActiveTab('signin')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'signin'
                ? 'bg-white text-black font-semibold shadow'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In / Switch</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'theme'
                ? 'bg-white text-black font-semibold shadow'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Themes</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-white text-black font-semibold shadow'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Past Rides ({pastRides.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('income')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'income'
                ? 'bg-white text-black font-semibold shadow'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Total Income</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'data'
                ? 'bg-white text-black font-semibold shadow'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Data & Email</span>
          </button>
        </div>

        {/* Tab Content Panes (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* TAB 1: OWN INFORMATION */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl liquid-glass border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    Personal Information
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setNewAvatarUrl(user.avatar);
                        setIsPhotoModalOpen(true);
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Change Photo</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-xs text-white hover:text-white/80 underline cursor-pointer"
                    >
                      {isEditing ? 'Cancel Edit' : 'Edit Info'}
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <form onSubmit={handleSaveProfile} className="space-y-3 pt-2">
                    <div>
                      <label className="text-xs text-white/60">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/20 text-sm text-white focus:outline-none focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/60">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/20 text-sm text-white focus:outline-none focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/60">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/20 text-sm text-white focus:outline-none focus:border-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90"
                    >
                      Save Changes
                    </button>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-white/50 block">Name:</span>
                      <strong className="text-sm text-white">{user.name}</strong>
                    </div>
                    <div>
                      <span className="text-white/50 block">Phone:</span>
                      <strong className="text-sm text-white">{user.phone}</strong>
                    </div>
                    <div>
                      <span className="text-white/50 block">Email:</span>
                      <strong className="text-sm text-white">{user.email}</strong>
                    </div>
                    <div>
                      <span className="text-white/50 block">Identity Status:</span>
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Govt ID Verified
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Registered Vehicle Info */}
              {user.vehicle && (
                <div className="p-4 rounded-xl liquid-glass border border-white/10 space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-white/60 flex items-center justify-between">
                    <span>Registered Companion Vehicle</span>
                    <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3 h-3" /> License Verified
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <div className="p-2.5 rounded-xl bg-white/10 text-white">
                      {user.vehicle.type === 'bike' ? <Bike className="w-6 h-6" /> : <Car className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{user.vehicle.model}</div>
                      <div className="text-xs font-mono text-white/70">{user.vehicle.plateNumber}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SIGN IN / SWITCH ACCOUNT */}
          {activeTab === 'signin' && (
            <div className="space-y-4">
              <div className="p-5 rounded-xl liquid-glass border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading italic text-lg text-white">Account Session</h3>
                    <p className="text-xs text-white/60">
                      {isSignedIn ? `Signed in as ${user.name}` : 'Not signed in'}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsSignedIn(!isSignedIn)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isSignedIn
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                        : 'bg-white text-black hover:bg-white/90'
                    }`}
                  >
                    {isSignedIn ? 'Sign Out' : 'Sign In'}
                  </button>
                </div>

                {isSignedIn ? (
                  <div className="space-y-3 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/70">Operating Role:</span>
                      {user.isRoleLocked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span>Role Locked (Cannot Switch)</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-white/50">Unrestricted</span>
                      )}
                    </div>

                    {user.isRoleLocked ? (
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white flex items-center gap-2">
                            {user.defaultRole === 'rider' ? (
                              <>
                                <Car className="w-4 h-4 text-emerald-400" />
                                <span>Verified Rider (Driver)</span>
                              </>
                            ) : (
                              <>
                                <User className="w-4 h-4 text-indigo-400" />
                                <span>Verified User (Passenger)</span>
                              </>
                            )}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-black/40 text-amber-300 border border-amber-400/30">
                            Locked
                          </span>
                        </div>
                        <p className="text-xs text-white/70 leading-relaxed">
                          {user.roleLockedReason ||
                            'Riders and Passengers have distinct safety verification and cannot inter-switch roles.'}
                        </p>
                        <div className="pt-1 flex items-center justify-between text-[11px]">
                          <span className="text-white/50">Need to operate as the other role?</span>
                          {onOpenAuthModal && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onOpenAuthModal();
                              }}
                              className="text-amber-300 hover:text-amber-200 underline font-semibold cursor-pointer"
                            >
                              Register New Account
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            onUpdateUser({ ...user, defaultRole: 'rider' });
                          }}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            user.defaultRole === 'rider'
                              ? 'bg-white/15 border-white/40 text-white'
                              : 'bg-white/[0.02] border-white/10 text-white/60'
                          }`}
                        >
                          <div className="font-bold text-xs text-white">Rider / Driver Mode</div>
                          <div className="text-[11px] text-white/60">Offer lifts & earn fuel cost</div>
                        </button>

                        <button
                          onClick={() => {
                            onUpdateUser({ ...user, defaultRole: 'passenger' });
                          }}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            user.defaultRole === 'passenger'
                              ? 'bg-white/15 border-white/40 text-white'
                              : 'bg-white/[0.02] border-white/10 text-white/60'
                          }`}
                        >
                          <div className="font-bold text-xs text-white">Passenger Mode</div>
                          <div className="text-[11px] text-white/60">Find lifts & bargain fares</div>
                        </button>
                      </div>
                    )}

                    {onOpenAuthModal && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenAuthModal();
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Open Studio Login / Register Portal</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-xs text-white/60">Mobile Number</label>
                      <input
                        type="text"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/20 text-sm text-white"
                      />
                    </div>
                    <button
                      onClick={() => setIsSignedIn(true)}
                      className="w-full py-2.5 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90"
                    >
                      Verify & Sign In (Instant)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: THEME OPTIONS */}
          {activeTab === 'theme' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl liquid-glass border border-white/10 space-y-3">
                <div>
                  <h3 className="font-heading italic text-lg text-white">Appearance & Theme</h3>
                  <p className="text-xs text-white/60">
                    Select your preferred visual atmosphere for the companion platform.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {/* Theme 1: Cinematic Black */}
                  <button
                    onClick={() => onSelectTheme('cinematic-black')}
                    className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                      currentTheme === 'cinematic-black'
                        ? 'bg-white/15 border-white/50 text-white shadow-xl ring-1 ring-white/50'
                        : 'bg-black/60 border-white/10 text-white/70 hover:border-white/30'
                    }`}
                  >
                    <div className="w-full h-8 rounded-lg bg-black border border-white/20 mb-3 flex items-center justify-center text-[10px] text-white font-mono">
                      #000000
                    </div>
                    <div className="font-bold text-xs text-white">Cinematic Black</div>
                    <div className="text-[11px] text-white/60 mt-0.5">High-contrast pure black & liquid glass</div>
                  </button>

                  {/* Theme 2: Midnight Slate */}
                  <button
                    onClick={() => onSelectTheme('midnight-slate')}
                    className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                      currentTheme === 'midnight-slate'
                        ? 'bg-white/15 border-white/50 text-white shadow-xl ring-1 ring-white/50'
                        : 'bg-slate-950 border-white/10 text-white/70 hover:border-white/30'
                    }`}
                  >
                    <div className="w-full h-8 rounded-lg bg-slate-900 border border-slate-700 mb-3 flex items-center justify-center text-[10px] text-slate-300 font-mono">
                      #090D16
                    </div>
                    <div className="font-bold text-xs text-white">Midnight Slate</div>
                    <div className="text-[11px] text-white/60 mt-0.5">Deep slate navy & cool ambient glass</div>
                  </button>

                  {/* Theme 3: Cyber Emerald */}
                  <button
                    onClick={() => onSelectTheme('cyber-emerald')}
                    className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                      currentTheme === 'cyber-emerald'
                        ? 'bg-emerald-500/15 border-emerald-400/50 text-white shadow-xl ring-1 ring-emerald-400/50'
                        : 'bg-[#051311] border-white/10 text-white/70 hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="w-full h-8 rounded-lg bg-[#061f1b] border border-emerald-500/30 mb-3 flex items-center justify-center text-[10px] text-emerald-300 font-mono">
                      #051311
                    </div>
                    <div className="font-bold text-xs text-white">Cyber Emerald</div>
                    <div className="text-[11px] text-emerald-300/80 mt-0.5">Luminous emerald borders & cyber tones</div>
                  </button>
                </div>
              </div>

              {/* Data & Storage Management */}
              <div className="p-4 rounded-xl liquid-glass border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-white/70">
                      Local Data & Session Storage
                    </h4>
                    <p className="text-[11px] text-white/50 mt-0.5">
                      Your rides, profile changes, and bargain chats are securely stored in your browser.
                    </p>
                  </div>

                  {onResetData && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to reset all local rides, messages, and restore clean defaults?')) {
                          onResetData();
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Clean State</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PAST RIDES */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Completed Companion Rides
              </div>

              {pastRides.length === 0 ? (
                <div className="text-center py-10 liquid-glass rounded-xl p-6 text-xs text-white/60">
                  No past rides recorded yet. Start offering or joining lifts!
                </div>
              ) : (
                pastRides.map((ride) => (
                  <div
                    key={ride.id}
                    className="p-3.5 rounded-xl liquid-glass border border-white/10 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {ride.origin} → {ride.destination}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-semibold ${
                            ride.role === 'rider'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {ride.role === 'rider' ? 'You Drove' : 'You Rode'}
                        </span>
                      </div>
                      <div className="text-white/60 flex items-center gap-2">
                        <span>{ride.date}</span>
                        <span>•</span>
                        <span>{ride.vehicleModel}</span>
                        <span>•</span>
                        <span>Companion: {ride.companionName}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-white">
                        {ride.role === 'rider' ? `+₹${ride.fare}` : `-₹${ride.fare}`}
                      </div>
                      <span className="text-[10px] text-emerald-400 capitalize">
                        {ride.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: TOTAL INCOME & EARNINGS DASHBOARD */}
          {activeTab === 'income' && (
            <div className="space-y-4">
              {/* Big Stat Box */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white/15 via-white/5 to-transparent border border-white/20 text-center space-y-1 shadow-2xl">
                <div className="text-xs font-semibold text-white/70 uppercase tracking-widest">
                  Total Income Earned from Lifts
                </div>
                <div className="text-5xl font-heading italic text-white tracking-tight">
                  ₹{totalRiderIncome.toLocaleString()}
                </div>
                <div className="text-xs text-emerald-400 pt-1 flex items-center justify-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>100% Retained • Zero Platform Fees</span>
                </div>
              </div>

              {/* Stat Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-xl liquid-glass border border-white/10">
                  <div className="text-xs text-white/60">Completed Trips</div>
                  <div className="text-2xl font-heading italic text-white mt-1">
                    {completedTripsCount}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl liquid-glass border border-white/10">
                  <div className="text-xs text-white/60">Fuel Split Saved</div>
                  <div className="text-2xl font-heading italic text-emerald-300 mt-1">
                    ₹{fuelSavingsEstimate}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl liquid-glass border border-white/10">
                  <div className="text-xs text-white/60">Avg. Per Trip</div>
                  <div className="text-2xl font-heading italic text-white mt-1">
                    ₹{completedTripsCount > 0 ? Math.round(totalRiderIncome / completedTripsCount) : 0}
                  </div>
                </div>
              </div>

              {/* Earnings Breakdown */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Trip Earnings Breakdown
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {pastRides
                    .filter((r) => r.role === 'rider')
                    .map((r) => (
                      <div
                        key={r.id}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-white">{r.origin} → {r.destination}</div>
                          <div className="text-[11px] text-white/50">{r.date} • Passenger: {r.companionName}</div>
                        </div>
                        <div className="text-sm font-bold text-emerald-400">+₹{r.fare}</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DATA EXPORT & EMAIL NOTIFICATIONS */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              {/* Notice Banner */}
              {exportNotice && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{exportNotice}</span>
                </div>
              )}

              {/* SECTION 1: INSTANT EMAIL ALERTS */}
              <div className="p-4 sm:p-5 rounded-2xl liquid-glass border border-white/10 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading italic text-base text-white">Live Email Notifications</h3>
                    <p className="text-[11px] text-white/60">
                      Receive real-time alerts whenever a lift is posted, companion requests join, or fare bargains are sent.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveAdminEmail} className="space-y-3 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-white/70 block mb-1">
                      Recipient / Admin Email Address
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="relative flex-1">
                        <Mail className="w-4 h-4 text-white/40 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          placeholder="yourname@gmail.com"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-white/90 shadow transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {emailSaveSuccess ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Saved!</span>
                          </>
                        ) : (
                          <span>Save Email</span>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-white/10 text-xs">
                    <p className="text-[11px] text-white/50 leading-relaxed max-w-sm">
                      ✨ Powered by FormSubmit. <em>(Note: Your first notification requires clicking a 1-time activation confirmation in your email inbox)</em>.
                    </p>

                    <button
                      type="button"
                      disabled={isSendingTestEmail}
                      onClick={handleSendTestNotification}
                      className="px-3.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSendingTestEmail ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending Test...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Test Email Alert</span>
                        </>
                      )}
                    </button>
                  </div>

                  {testEmailStatus && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        testEmailStatus.success
                          ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-500/20 border border-rose-500/30 text-rose-300'
                      }`}
                    >
                      {testEmailStatus.success ? (
                        <CheckCircle className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      <div>
                        <strong>{testEmailStatus.success ? 'Success: ' : 'Notice: '}</strong>
                        <span>{testEmailStatus.message}</span>
                        {testEmailStatus.success && (
                          <div className="text-[10px] text-emerald-300/80 mt-0.5">
                            Please check your inbox at <span className="font-mono underline">{adminEmail}</span> (and Spam folder if first time).
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* SECTION 2: EXPORT DATA TO LOCAL DEVICE */}
              <div className="p-4 sm:p-5 rounded-2xl liquid-glass border border-white/10 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading italic text-base text-white">Save Data to Local Device</h3>
                    <p className="text-[11px] text-white/60">
                      Download full data records into Excel/Sheets (.CSV) or JSON format directly onto your computer or phone.
                    </p>
                  </div>
                </div>

                {/* Counters */}
                <div className="grid grid-cols-3 gap-2 text-center py-1">
                  <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10">
                    <div className="text-lg font-heading italic text-white">{rides.length}</div>
                    <div className="text-[10px] text-white/60">Active Lifts</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10">
                    <div className="text-lg font-heading italic text-white">{requests.length}</div>
                    <div className="text-[10px] text-white/60">Companion Requests</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10">
                    <div className="text-lg font-heading italic text-white">{pastRides.length}</div>
                    <div className="text-[10px] text-white/60">Past Rides</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* CSV Export Button */}
                  <button
                    type="button"
                    onClick={handleDownloadCSV}
                    className="p-3.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-left transition-all group flex items-start gap-3 cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors">
                        Download Spreadsheet (.CSV)
                      </div>
                      <div className="text-[11px] text-white/60 mt-0.5 leading-snug">
                        Formatted tabular rows of all rides, routes, companion offers, fares, and timestamps.
                      </div>
                    </div>
                  </button>

                  {/* JSON Backup Button */}
                  <button
                    type="button"
                    onClick={handleDownloadJSON}
                    className="p-3.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-left transition-all group flex items-start gap-3 cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors">
                        Download Full Backup (.JSON)
                      </div>
                      <div className="text-[11px] text-white/60 mt-0.5 leading-snug">
                        Complete raw application state including user profile, active negotiations, and past rides.
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* SECTION 3: STORAGE STATUS & FACTORY RESET */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">Local Storage Status</span>
                  <span className="text-[11px] text-white/50">
                    All user actions are cached in your browser storage and persist across page refreshes.
                  </span>
                </div>
                {onResetData && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Reset all saved lifts, requests, and profile data to defaults?')) {
                        onResetData();
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-[11px] font-medium transition-colors cursor-pointer shrink-0"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear Data</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Picture Modifying / Adding Modal */}
        {isPhotoModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="relative w-full max-w-lg rounded-[1.5rem] liquid-glass-strong border border-white/25 shadow-2xl p-6 text-white animate-in zoom-in-95 duration-150 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading italic text-lg text-white">Modify Profile Picture</h3>
                    <p className="text-xs text-white/60">Upload from device, choose a preset, or enter an image URL.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current Preview */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative">
                  <img
                    src={newAvatarUrl || user.avatar}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-emerald-400/40 shadow-xl"
                  />
                  <span className="absolute bottom-0 right-0 p-1.5 rounded-full bg-emerald-400 text-black shadow">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                </div>
                <span className="text-xs text-white/60 mt-2">Live Avatar Preview</span>
              </div>

              {/* Method 1: Device File Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80 uppercase tracking-wider block">
                  1. Upload from Device
                </label>
                <label className="flex items-center justify-center gap-2.5 p-3 rounded-xl border border-dashed border-white/30 hover:border-white/60 cursor-pointer text-xs text-white/80 hover:text-white transition-colors bg-white/[0.03]">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Choose an image from your computer or phone...</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Method 2: Avatar Presets */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/80 uppercase tracking-wider block">
                  2. Choose from Curated Avatars
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setNewAvatarUrl(preset.url)}
                      className={`p-1.5 rounded-xl border transition-all flex flex-col items-center gap-1 group cursor-pointer ${
                        newAvatarUrl === preset.url
                          ? 'border-emerald-400 bg-emerald-500/20'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/30'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-12 h-12 rounded-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="text-[10px] text-white/70 truncate w-full text-center">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Method 3: Web Image URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80 uppercase tracking-wider block">
                  3. Or Paste Image URL
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
                    <input
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (customUrlInput.trim()) {
                        setNewAvatarUrl(customUrlInput.trim());
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl liquid-glass border border-white/20 text-xs font-medium text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Apply URL
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-4 py-2 rounded-full liquid-glass border border-white/15 text-xs text-white/70 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAvatar}
                  className="px-5 py-2 rounded-full bg-white text-black font-bold text-xs hover:bg-white/90 shadow-lg cursor-pointer"
                >
                  Save Profile Picture
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
