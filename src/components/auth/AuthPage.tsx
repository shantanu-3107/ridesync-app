import { useState } from 'react';
import FooterBackground from '../studio/FooterBackground';
import BrandLogo from '../studio/BrandLogo';
import { UserProfile, VehicleType } from '../../types/ride';
import { sendDataToEmail } from '../../services/notificationService';
import { 
  ShieldCheck, 
  Car, 
  Bike, 
  Lock, 
  AlertTriangle, 
  ArrowLeft, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  User, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import '../studio/studio.css';

interface AuthPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onCancel: () => void;
  onOpenPureFooter?: () => void;
  initialRole?: 'rider' | 'passenger';
}

export default function AuthPage({
  onLoginSuccess,
  onCancel,
  onOpenPureFooter,
  initialRole = 'rider',
}: AuthPageProps) {
  // Mode: 'signin' or 'register'
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('register');
  
  // Selected Role: 'rider' (Driver) vs 'passenger' (User/Seeker)
  const [selectedRole, setSelectedRole] = useState<'rider' | 'passenger'>(initialRole);

  // Common Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Rider-Specific Fields
  const [drivingLicense, setDrivingLicense] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('bike');
  const [vehicleModel, setVehicleModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');

  // User/Passenger-Specific Fields
  const [govtIdNumber, setGovtIdNumber] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [preferredHub, setPreferredHub] = useState('Bangalore Central');

  // Status and feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic validation
    if (!phone.trim()) {
      setErrorMsg('Please enter your mobile phone number.');
      return;
    }

    if (authMode === 'register' && !name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (authMode === 'register' && selectedRole === 'rider') {
      if (!drivingLicense.trim()) {
        setErrorMsg('Driving License Number is required for Verified Riders.');
        return;
      }
      if (!vehicleModel.trim() || !plateNumber.trim()) {
        setErrorMsg('Vehicle Model and Registration Plate Number are required for Riders.');
        return;
      }
    }

    if (authMode === 'register' && selectedRole === 'passenger') {
      if (!emergencyContact.trim()) {
        setErrorMsg('Emergency Contact phone number is required for passenger security.');
        return;
      }
    }

    setIsSubmitting(true);

    const lockedRoleReason =
      selectedRole === 'rider'
        ? 'Account registered as Verified Rider / Driver. Locked to driver mode to guarantee safety and verified vehicle credentials.'
        : 'Account registered as Verified Passenger. Locked to companion mode to prevent unverified driver hosting.';

    const newUserProfile: UserProfile = {
      name: name.trim() || (selectedRole === 'rider' ? 'Verified Rider' : 'Verified Passenger'),
      email: email.trim() || `${phone.replace(/\D/g, '') || 'user'}@ridepartner.local`,
      phone: phone.trim(),
      avatar:
        selectedRole === 'rider'
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rating: 5.0,
      totalTripsCompleted: 0,
      isVerified: true,
      drivingLicenseVerified: selectedRole === 'rider',
      defaultRole: selectedRole,
      isRoleLocked: true, // Permanent lock: cannot inter-switch
      roleLockedReason: lockedRoleReason,
      vehicle:
        selectedRole === 'rider'
          ? {
              type: vehicleType,
              model: vehicleModel.trim() || 'Hero Splendor / Standard Bike',
              plateNumber: plateNumber.trim().toUpperCase() || 'KA 01 TR 1234',
              image:
                vehicleType === 'bike'
                  ? 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=300&auto=format&fit=crop&q=80'
                  : 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&auto=format&fit=crop&q=80',
            }
          : undefined,
    };

    // Save permanently to localStorage
    try {
      localStorage.setItem('ridepartner_user', JSON.stringify(newUserProfile));
      localStorage.setItem('ridepartner_auth_session', JSON.stringify({
        role: selectedRole,
        isRoleLocked: true,
        authenticatedAt: new Date().toISOString(),
      }));

      // Send live notification to admin email
      const adminEmail = localStorage.getItem('ridepartner_admin_email') || 'shantanumohature@gmail.com';
      await sendDataToEmail({
        eventType: 'TEST_NOTIFICATION',
        title: `New ${selectedRole === 'rider' ? 'Rider (Driver)' : 'User (Passenger)'} ${authMode === 'register' ? 'Registered' : 'Logged In'}`,
        recipientEmail: adminEmail,
        data: {
          role: selectedRole,
          authMode,
          isRoleLocked: 'Permanently Locked (Cannot Inter-switch)',
          name: newUserProfile.name,
          phone: newUserProfile.phone,
          email: newUserProfile.email,
          ...(selectedRole === 'rider'
            ? {
                drivingLicense,
                vehicleType,
                vehicleModel,
                plateNumber,
              }
            : {
                govtIdNumber: govtIdNumber || 'Provided',
                emergencyContact,
                preferredHub,
              }),
        },
      }).catch((err) => console.error('Notification dispatch note:', err));
    } catch (err) {
      console.error('Storage note:', err);
    } finally {
      setIsSubmitting(false);
      onLoginSuccess(newUserProfile);
    }
  };

  return (
    <div className="studio-page-container min-h-screen text-[#080909] relative flex flex-col font-['DM_Sans',Arial,sans-serif] selection:bg-[#080909] selection:text-white">
      {/* Background lavender video with calibrated interactive eye tracking */}
      <FooterBackground />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full px-6 sm:px-12 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f7f8fa]/80 hover:bg-[#f7f8fa] border border-[#080909]/10 text-xs font-semibold text-[#080909] shadow-sm transition-all"
            title="Return to main feed"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to App</span>
          </button>
        </div>

        {/* Center Brand Logo from template */}
        <div className="w-[140px] sm:w-[170px] text-[#080909] transition-transform hover:scale-105">
          <BrandLogo />
        </div>

        {/* Right Action: Pure template view */}
        <div>
          {onOpenPureFooter && (
            <button
              type="button"
              onClick={onOpenPureFooter}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#f7f8fa]/80 hover:bg-[#f7f8fa] border border-[#080909]/10 text-[11px] font-semibold text-[#080909] transition-all"
            >
              <span>View Studio Footer</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-xl bg-white/75 backdrop-blur-xl border border-white/60 shadow-[0_20px_50px_rgba(8,9,9,0.08)] rounded-[2rem] p-6 sm:p-8 space-y-6">
          {/* Header Title in Epilogue Black */}
          <div className="space-y-1.5 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f7f8fa] border border-[#080909]/10 text-xs font-semibold tracking-wide text-[#080909]">
              <Sparkles className="w-3.5 h-3.5 text-[#080909]" />
              <span>
                {authMode === 'register' ? 'have a fresh idea?' : 'welcome back'}
              </span>
            </div>

            <h1 className="font-['Epilogue',Arial,sans-serif] font-black text-2xl sm:text-3xl text-[#080909] tracking-tight leading-tight">
              {authMode === 'register' ? (
                <>
                  join as {selectedRole === 'rider' ? 'verified rider' : 'companion user'}
                </>
              ) : (
                <>
                  sign in to {selectedRole === 'rider' ? 'rider portal' : 'passenger hub'}
                </>
              )}
            </h1>
            <p className="text-xs text-[#080909]/60 max-w-md mx-auto">
              {authMode === 'register'
                ? 'Create your dedicated account. Select your role carefully — roles are permanent and cannot be inter-switched.'
                : 'Enter your credentials to access your pooled rides, chats, and route schedule.'}
            </p>
          </div>

          {/* Step 1: Strict Role Selection (Rider vs Passenger) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#080909]/60 px-1">
              <span>Select Account Role</span>
              <span className="flex items-center gap-1 text-amber-700 text-[11px] lowercase">
                <Lock className="w-3 h-3" /> cannot inter-switch
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Option A: Rider (Driver/Vehicle Owner) */}
              <button
                type="button"
                onClick={() => setSelectedRole('rider')}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  selectedRole === 'rider'
                    ? 'border-[#080909] bg-[#080909] text-white shadow-lg ring-2 ring-[#080909]/20'
                    : 'border-[#080909]/15 bg-white/50 text-[#080909] hover:bg-white/80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-2 rounded-xl ${
                      selectedRole === 'rider' ? 'bg-white/15 text-white' : 'bg-[#080909]/5 text-[#080909]'
                    }`}
                  >
                    <Car className="w-5 h-5" />
                  </div>
                  {selectedRole === 'rider' && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-400 text-black">
                      Active
                    </span>
                  )}
                </div>
                <div className="font-['Epilogue',Arial,sans-serif] font-black text-sm">
                  Rider (Driver)
                </div>
                <div
                  className={`text-[11px] mt-0.5 leading-snug ${
                    selectedRole === 'rider' ? 'text-white/70' : 'text-[#080909]/60'
                  }`}
                >
                  Offer lifts, pick up passengers, cover fuel split
                </div>
              </button>

              {/* Option B: User (Passenger/Companion) */}
              <button
                type="button"
                onClick={() => setSelectedRole('passenger')}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  selectedRole === 'passenger'
                    ? 'border-[#080909] bg-[#080909] text-white shadow-lg ring-2 ring-[#080909]/20'
                    : 'border-[#080909]/15 bg-white/50 text-[#080909] hover:bg-white/80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-2 rounded-xl ${
                      selectedRole === 'passenger' ? 'bg-white/15 text-white' : 'bg-[#080909]/5 text-[#080909]'
                    }`}
                  >
                    <User className="w-5 h-5" />
                  </div>
                  {selectedRole === 'passenger' && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-400 text-black">
                      Active
                    </span>
                  )}
                </div>
                <div className="font-['Epilogue',Arial,sans-serif] font-black text-sm">
                  User (Passenger)
                </div>
                <div
                  className={`text-[11px] mt-0.5 leading-snug ${
                    selectedRole === 'passenger' ? 'text-white/70' : 'text-[#080909]/60'
                  }`}
                >
                  Find lifts, bargain fares, travel with verified hosts
                </div>
              </button>
            </div>

            {/* Non-Inter-Switching Warning Banner */}
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#080909] text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="text-[11px] leading-tight">
                <strong>Strict Role Isolation: </strong>
                <span>
                  {selectedRole === 'rider'
                    ? 'Riders cannot switch to Passenger mode. You will be exclusively verified to offer rides.'
                    : 'Passengers cannot switch to Rider mode. You will be verified as a passenger only.'}
                </span>
              </div>
            </div>
          </div>

          {/* Mode Switcher: Register vs Sign In */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#f7f8fa] border border-[#080909]/10 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 rounded-lg transition-all text-center ${
                authMode === 'register'
                  ? 'bg-white text-[#080909] shadow-sm font-bold'
                  : 'text-[#080909]/60 hover:text-[#080909]'
              }`}
            >
              New Registration
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signin')}
              className={`flex-1 py-2 rounded-lg transition-all text-center ${
                authMode === 'signin'
                  ? 'bg-white text-[#080909] shadow-sm font-bold'
                  : 'text-[#080909]/60 hover:text-[#080909]'
              }`}
            >
              Sign In Existing
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Common Fields */}
            {authMode === 'register' && (
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#080909]/70 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder={selectedRole === 'rider' ? 'e.g. Aarav Sharma' : 'e.g. Diya Patel'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#080909]/20 text-xs text-[#080909] placeholder-[#080909]/40 focus:outline-none focus:border-[#080909] focus:ring-1 focus:ring-[#080909]"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#080909]/70 block mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#080909]/20 text-xs text-[#080909] placeholder-[#080909]/40 focus:outline-none focus:border-[#080909] focus:ring-1 focus:ring-[#080909]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#080909]/70 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#080909]/20 text-xs text-[#080909] placeholder-[#080909]/40 focus:outline-none focus:border-[#080909] focus:ring-1 focus:ring-[#080909]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#080909]/70 block mb-1">
                Password or Secure Passcode
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#080909]/20 text-xs text-[#080909] placeholder-[#080909]/40 focus:outline-none focus:border-[#080909] focus:ring-1 focus:ring-[#080909]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#080909]/50 hover:text-[#080909]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* ROLE-SPECIFIC FIELDS FOR REGISTRATION */}
            {authMode === 'register' && selectedRole === 'rider' && (
              <div className="p-4 rounded-2xl bg-[#080909]/[0.03] border border-[#080909]/10 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#080909]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Rider & Vehicle Credentials (Required for Drivers)</span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#080909]/70 block mb-1">
                    Driving License Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL-1420110012345"
                    value={drivingLicense}
                    onChange={(e) => setDrivingLicense(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#080909]/20 text-xs font-mono text-[#080909] focus:outline-none focus:border-[#080909]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#080909]/70 block mb-1">
                      Vehicle Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setVehicleType('bike')}
                        className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          vehicleType === 'bike'
                            ? 'bg-[#080909] text-white border-[#080909]'
                            : 'bg-white text-[#080909] border-[#080909]/20'
                        }`}
                      >
                        <Bike className="w-3.5 h-3.5" />
                        <span>Bike</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVehicleType('car')}
                        className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          vehicleType === 'car'
                            ? 'bg-[#080909] text-white border-[#080909]'
                            : 'bg-white text-[#080909] border-[#080909]/20'
                        }`}
                      >
                        <Car className="w-3.5 h-3.5" />
                        <span>Car</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#080909]/70 block mb-1">
                      Vehicle Model
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={vehicleType === 'bike' ? 'Royal Enfield 350' : 'Tata Nexon EV'}
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#080909]/20 text-xs text-[#080909] focus:outline-none focus:border-[#080909]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#080909]/70 block mb-1">
                    Registration Plate Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KA 01 MJ 4821"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#080909]/20 text-xs font-mono uppercase text-[#080909] focus:outline-none focus:border-[#080909]"
                  />
                </div>
              </div>
            )}

            {/* ROLE-SPECIFIC FIELDS FOR PASSENGER */}
            {authMode === 'register' && selectedRole === 'passenger' && (
              <div className="p-4 rounded-2xl bg-[#080909]/[0.03] border border-[#080909]/10 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#080909]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Passenger Verification & Safety Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#080909]/70 block mb-1">
                      Govt ID / College ID Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 12-digit Aadhaar / College Roll"
                      value={govtIdNumber}
                      onChange={(e) => setGovtIdNumber(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#080909]/20 text-xs text-[#080909] focus:outline-none focus:border-[#080909]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#080909]/70 block mb-1">
                      Emergency SOS Phone
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 99887 76655 (Family/Kin)"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#080909]/20 text-xs text-[#080909] focus:outline-none focus:border-[#080909]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#080909]/70 block mb-1">
                    Primary Corridor / Home Hub
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Koramangala to Whitefield, Bangalore"
                    value={preferredHub}
                    onChange={(e) => setPreferredHub(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#080909]/20 text-xs text-[#080909] focus:outline-none focus:border-[#080909]"
                  />
                </div>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-full bg-[#080909] hover:bg-[#1a1b1b] text-white font-['Epilogue',Arial,sans-serif] font-black text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Securing your session...</span>
              ) : authMode === 'register' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    Register as Verified {selectedRole === 'rider' ? 'Rider' : 'Passenger'}
                  </span>
                </>
              ) : (
                <span>
                  Sign In as {selectedRole === 'rider' ? 'Rider' : 'Passenger'}
                </span>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="pt-2 text-center border-t border-[#080909]/10">
            <p className="text-[11px] text-[#080909]/60 leading-normal">
              *good things start with one spark. let’s make yours.
            </p>
          </div>
        </div>
      </main>

      {/* Social Row at bottom */}
      <footer className="relative z-10 px-8 pb-6 flex items-center justify-between text-xs text-[#080909]/60">
        <div>
          <span>© 2026 RidePartner Studio. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-3">
          <img src="/linkedin.svg" alt="LinkedIn" className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity" />
          <img src="/instagram.svg" alt="Instagram" className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity" />
          <img src="/tiktok.svg" alt="TikTok" className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity" />
        </div>
      </footer>
    </div>
  );
}
