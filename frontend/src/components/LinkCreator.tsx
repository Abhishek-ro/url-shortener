import React, { useState, useEffect } from 'react';
import {
  Link as LinkIcon,
  Lock,
  Shield,
  Settings2,
  Download,
  Rocket,
  Sparkles,
  Loader2,
  Globe2,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Target,
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { createShortLink } from '../services/link.service';
import { getUrlMetadata } from '../services/metadata.service';
import { generateQRCode } from '../services/qr.service';
import { addLinkToCampaign } from '../services/campaign.service';
import { useCampaigns } from '../hooks/useCampaigns';
import { UrlMetadata } from '../types/metadata';

const LinkCreator: React.FC = () => {
  const { campaigns } = useCampaigns();
  const [destination, setDestination] = useState('https://github.com');
  const [alias, setAlias] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [isExpiring, setIsExpiring] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [isProtected, setIsProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [maxClicksPerMin, setMaxClicksPerMin] = useState(100);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [pickerHour, setPickerHour] = useState(12);
  const [pickerMinute, setPickerMinute] = useState(0);
  const [datePickerError, setDatePickerError] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [metadata, setMetadata] = useState<UrlMetadata | null>(null);
  const [isMetadataLoading, setIsMetadataLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const [createdShortCode, setCreatedShortCode] = useState('');

  useEffect(() => {
    if (!createdShortCode) {
      setQrCodeUrl('');
      return;
    }

    const generateQR = async () => {
      setIsLoadingQR(true);
      try {
        const actualShortUrl = `${import.meta.env.VITE_API_URL}/${createdShortCode}`;
        const qr = await generateQRCode(actualShortUrl, {
          fgColor: '#0f172a',
          bgColor: '#ffffff',
          size: 300,
        });
        setQrCodeUrl(qr);
      } catch (e) {
        console.error('QR Generation failed:', e);
        setQrCodeUrl('');
      } finally {
        setIsLoadingQR(false);
      }
    };

    generateQR();
  }, [createdShortCode]);

  useEffect(() => {
    if (!destination.trim() || !destination.startsWith('http')) {
      setMetadata(null);
      return;
    }

    const handler = setTimeout(async () => {
      setIsMetadataLoading(true);
      try {
        const data = await getUrlMetadata(destination);
        if (data) {
          setMetadata(data);
        }
      } catch (e) {
        console.error('Metadata fetch failed:', e);
      } finally {
        setIsMetadataLoading(false);
      }
    }, 800);

    return () => clearTimeout(handler);
  }, [destination]);

  const suggestAlias = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({
        apiKey: (import.meta.env.VITE_GEMINI_KEY as string) || '',
      });
      const model = (ai as any).getGenerativeModel({
        model: 'gemini-1.5-flash',
      });
      const prompt = `Generate 1 professional, short URL alias (max 12 characters, lowercase, no spaces, kebab-case only) for: ${destination}. Output ONLY the string, nothing else.`;
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim().toLowerCase();
      const cleanAlias = text.replace(/[^a-z0-9-]/g, '').substring(0, 12);
      setAlias(cleanAlias || 'link-' + Date.now().toString().slice(-6));
    } catch (error) {
      console.error('AI Error:', error);
      setAlias('link-' + Date.now().toString().slice(-6));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreate = async () => {
    if (!destination.trim()) {
      alert('Please enter a destination URL');
      return;
    }

    if (!destination.startsWith('http')) {
      alert('URL must start with http:// or https://');
      return;
    }

    if (isProtected && !password.trim()) {
      alert('Please enter a password for password-protected links');
      return;
    }

    if (isExpiring && !expiresAt) {
      alert('Please select an expiration date');
      return;
    }

    setIsCreating(true);
    setSuccessMessage('');

    try {
      console.log('🔗 Creating link with options:', {
        destination,
        isProtected,
        isExpiring,
        isRateLimited,
        maxClicksPerMin,
        campaignId: selectedCampaign,
      });

      const link = await createShortLink(destination, {
        isProtected,
        password: isProtected ? password : undefined,
        isExpiring,
        expiresAt: isExpiring ? new Date(expiresAt).toISOString() : undefined,
        isRateLimited,
        maxClicksPerMin: isRateLimited ? maxClicksPerMin : undefined,
      });

      if (selectedCampaign) {
        await addLinkToCampaign(selectedCampaign, link.id);
        console.log('✅ Link added to campaign:', selectedCampaign);
      }

      console.log('✅ Link created:', link);
      setCreatedShortCode(link.shortCode);
      setSuccessMessage(`✅ Link created! Short code: ${link.shortCode}`);

      const backendUrl = import.meta.env.VITE_API_URL.replace('/api', '');
      const actualShortUrl = `${backendUrl}/${link.shortCode}`;
      const qr = await generateQRCode(actualShortUrl, {
        fgColor: '#0f172a',
        bgColor: '#ffffff',
        size: 300,
      });
      setQrCodeUrl(qr);
    } catch (error: any) {
      console.error('❌ Error creating link:', error);
      console.error('   Status:', error.response?.status);
      console.error('   Data:', error.response?.data);
      console.error('   Message:', error.message);
      alert(
        error.response?.data?.error ||
          error.message ||
          'Failed to create link. Please try again. Check console for details.',
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateNewLink = () => {
    setDestination('https://github.com');
    setAlias('');
    setSelectedCampaign('');
    setSuccessMessage('');
    setCreatedShortCode('');
    setQrCodeUrl('');
    setIsExpiring(false);
    setExpiresAt('');
    setIsProtected(false);
    setPassword('');
    setIsRateLimited(false);
    setMaxClicksPerMin(100);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleSelectDate = (day: number) => {
    const newDate = new Date(
      pickerDate.getFullYear(),
      pickerDate.getMonth(),
      day,
      pickerHour,
      pickerMinute,
    );
    const isoString = newDate.toISOString().slice(0, 16);
    setExpiresAt(isoString);
    setPickerDate(newDate);
  };

  const handlePrevMonth = () => {
    const newDate = new Date(
      pickerDate.getFullYear(),
      pickerDate.getMonth() - 1,
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newDate >= today) {
      setPickerDate(newDate);
    }
  };

  const handleNextMonth = () => {
    setPickerDate(
      new Date(pickerDate.getFullYear(), pickerDate.getMonth() + 1),
    );
  };

  const handleConfirmDate = () => {
    const newDate = new Date(
      pickerDate.getFullYear(),
      pickerDate.getMonth(),
      pickerDate.getDate(),
      pickerHour,
      pickerMinute,
    );

    if (newDate <= new Date()) {
      setDatePickerError('Please select a future date and time');
      setTimeout(() => setDatePickerError(''), 3000);
      return;
    }

    const isoString = newDate.toISOString().slice(0, 16);
    setExpiresAt(isoString);
    setShowDatePicker(false);
    setDatePickerError('');
  };

  const isDateInPast = (year: number, month: number, day: number) => {
    const checkDate = new Date(year, month, day);
    checkDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const isMonthInPast = (year: number, month: number) => {
    const checkDate = new Date(year, month, 1);
    checkDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(pickerDate);
    const firstDay = getFirstDayOfMonth(pickerDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const isValidUrl = destination.startsWith('http');

  return (
    <div className='max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500'>
      {/* Header */}
      <div>
        <h1 className='text-4xl font-extrabold text-white mb-3'>
          Create Short Link
        </h1>
        <p className='text-slate-400 text-lg'>
          Shorten any URL and track analytics in real-time.
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className='bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top'>
          <Check className='w-5 h-5 flex-shrink-0' />
          <p className='font-bold'>{successMessage}</p>
        </div>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        {/* Left Column: Form */}
        <div className='lg:col-span-8 space-y-6'>
          {/* Main Input Card */}
          <div className='bg-slate-900/40 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6 backdrop-blur-sm'>
            <div className='flex items-center gap-3 text-blue-400 mb-2'>
              <LinkIcon className='w-5 h-5' />
              <h3 className='font-bold text-lg tracking-tight'>
                Destination URL
              </h3>
            </div>

            <div className='space-y-2'>
              <input
                type='url'
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder='https://example.com/very/long/url'
                className={`w-full bg-slate-950 border-2 rounded-xl py-4 px-5 text-slate-200 focus:outline-none transition-all font-medium text-base ${
                  isValidUrl
                    ? 'border-blue-500/50 focus:ring-2 focus:ring-blue-500/50'
                    : 'border-slate-700 focus:ring-2 focus:ring-red-500/50'
                }`}
              />
              {!isValidUrl && destination.trim() && (
                <p className='text-red-400 text-sm font-medium'>
                  ⚠️ URL must start with http:// or https://
                </p>
              )}
            </div>

            {/* Metadata Preview */}
            {metadata && metadata.title && (
              <div className='bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-2xl overflow-hidden animate-in fade-in p-4 flex items-start gap-3'>
                {metadata.favicon && (
                  <img
                    src={metadata.favicon}
                    className='w-8 h-8 rounded flex-shrink-0 mt-1'
                    alt='Favicon'
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className='flex-1 min-w-0'>
                  <p className='text-white font-bold text-sm truncate'>
                    {metadata.title}
                  </p>
                  <p className='text-slate-400 text-xs line-clamp-1 mt-1'>
                    {metadata.description || destination}
                  </p>
                </div>
              </div>
            )}

            {isMetadataLoading && (
              <div className='flex items-center gap-2 text-slate-400 text-sm'>
                <Loader2 className='w-4 h-4 animate-spin' />
                Fetching page info...
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div className='bg-slate-900/40 border border-slate-800 p-8 rounded-3xl shadow-xl space-y-4 backdrop-blur-sm'>
            <div className='flex items-center gap-3 text-blue-400 mb-4'>
              <Settings2 className='w-6 h-6' />
              <h3 className='font-bold text-lg tracking-tight'>Options</h3>
            </div>

            <div className='space-y-4'>
              {/* Campaign Selection */}
              {campaigns.length > 0 && (
                <div className='p-4 border border-slate-700 rounded-xl bg-slate-800/20'>
                  <label className='block'>
                    <div className='flex items-center gap-2 mb-3'>
                      <Target className='w-4 h-4 text-amber-500' />
                      <p className='font-bold text-white text-sm'>
                        Add to Campaign (Optional)
                      </p>
                    </div>
                    <select
                      value={selectedCampaign}
                      onChange={(e) => setSelectedCampaign(e.target.value)}
                      className='w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500 text-sm'
                    >
                      <option value=''>None</option>
                      {campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.totalLinks} links)
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              <label className='flex items-center gap-4 p-4 border border-slate-700 rounded-xl hover:bg-slate-800/20 cursor-pointer transition-all'>
                <input
                  type='checkbox'
                  checked={isExpiring}
                  onChange={(e) => setIsExpiring(e.target.checked)}
                  className='w-5 h-5 cursor-pointer accent-blue-500'
                />
                <div className='flex-1 min-w-0'>
                  <p className='font-bold text-white text-sm'>
                    Link Expiration
                  </p>
                  <p className='text-slate-400 text-xs'>Set expiry date</p>
                </div>
              </label>
              {isExpiring && (
                <div className='space-y-3'>
                  <button
                    type='button'
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className='w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl'
                  >
                    <Calendar className='w-5 h-5' />
                    {expiresAt
                      ? `Expires: ${new Date(expiresAt).toLocaleDateString()} ${new Date(expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : 'Select expiration date & time'}
                  </button>

                  {showDatePicker && (
                    <div className='bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl'>
                      {/* Month/Year Navigation */}
                      <div className='flex items-center justify-between mb-4'>
                        <button
                          type='button'
                          onClick={handlePrevMonth}
                          disabled={isMonthInPast(
                            pickerDate.getFullYear(),
                            pickerDate.getMonth() - 1,
                          )}
                          className={`p-2 rounded-lg transition-all ${
                            isMonthInPast(
                              pickerDate.getFullYear(),
                              pickerDate.getMonth() - 1,
                            )
                              ? 'text-slate-600 cursor-not-allowed opacity-50'
                              : 'hover:bg-slate-700 text-blue-400'
                          }`}
                        >
                          <ChevronLeft className='w-5 h-5' />
                        </button>
                        <h3 className='text-white font-bold text-lg'>
                          {pickerDate.toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                          })}
                        </h3>
                        <button
                          type='button'
                          onClick={handleNextMonth}
                          className='p-2 hover:bg-slate-700 rounded-lg transition-all'
                        >
                          <ChevronRight className='w-5 h-5 text-blue-400' />
                        </button>
                      </div>

                      {/* Day of week headers */}
                      <div className='grid grid-cols-7 gap-2'>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                          (day) => (
                            <div
                              key={day}
                              className='text-center text-slate-400 text-xs font-semibold py-2'
                            >
                              {day}
                            </div>
                          ),
                        )}
                      </div>

                      {/* Calendar days */}
                      <div className='grid grid-cols-7 gap-2'>
                        {renderCalendar().map((day, idx) => {
                          const isPast = day
                            ? isDateInPast(
                                pickerDate.getFullYear(),
                                pickerDate.getMonth(),
                                day,
                              )
                            : false;
                          const isSelected =
                            day === pickerDate.getDate() &&
                            pickerDate.getMonth() === new Date().getMonth() &&
                            pickerDate.getFullYear() ===
                              new Date().getFullYear();

                          return (
                            <button
                              key={`day-${idx}`}
                              type='button'
                              onClick={() =>
                                day && !isPast && handleSelectDate(day)
                              }
                              disabled={!day || isPast}
                              className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                                !day
                                  ? 'text-transparent'
                                  : isPast
                                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                                    : isSelected
                                      ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600 cursor-pointer'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>

                      {/* Time picker */}
                      <div className='flex gap-2 items-center pt-4 border-t border-slate-700'>
                        <Clock className='w-4 h-4 text-slate-400' />
                        <select
                          value={pickerHour}
                          onChange={(e) =>
                            setPickerHour(parseInt(e.target.value))
                          }
                          className='flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500'
                        >
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={i}>
                              {String(i).padStart(2, '0')}:00
                            </option>
                          ))}
                        </select>
                        <select
                          value={pickerMinute}
                          onChange={(e) =>
                            setPickerMinute(parseInt(e.target.value))
                          }
                          className='flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500'
                        >
                          {[0, 15, 30, 45].map((min) => (
                            <option key={min} value={min}>
                              :{String(min).padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Error message */}
                      {datePickerError && (
                        <div className='bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg flex items-center gap-2 animate-in slide-in-from-top'>
                          <svg
                            className='w-5 h-5 flex-shrink-0'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                              clipRule='evenodd'
                            />
                          </svg>
                          <p className='text-sm font-semibold'>
                            {datePickerError}
                          </p>
                        </div>
                      )}

                      {/* Confirm button */}
                      <button
                        type='button'
                        onClick={handleConfirmDate}
                        className='w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-all'
                      >
                        ✓ Confirm
                      </button>
                    </div>
                  )}
                </div>
              )}

              <label className='flex items-center gap-4 p-4 border border-slate-700 rounded-xl hover:bg-slate-800/20 cursor-pointer transition-all'>
                <input
                  type='checkbox'
                  checked={isProtected}
                  onChange={(e) => setIsProtected(e.target.checked)}
                  className='w-5 h-5 cursor-pointer accent-blue-500'
                />
                <div className='flex-1 min-w-0'>
                  <p className='font-bold text-white text-sm'>
                    Password Protection
                  </p>
                  <p className='text-slate-400 text-xs'>Require password</p>
                </div>
              </label>
              {isProtected && (
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Enter password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 pr-10 text-white text-sm focus:outline-none focus:border-blue-500 transition-all'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors'
                  >
                    {showPassword ? (
                      <EyeOff className='w-4 h-4' />
                    ) : (
                      <Eye className='w-4 h-4' />
                    )}
                  </button>
                </div>
              )}

              <label className='flex items-center gap-4 p-4 border border-slate-700 rounded-xl hover:bg-slate-800/20 cursor-pointer transition-all'>
                <input
                  type='checkbox'
                  checked={isRateLimited}
                  onChange={(e) => setIsRateLimited(e.target.checked)}
                  className='w-5 h-5 cursor-pointer accent-blue-500'
                />
                <div className='flex-1 min-w-0'>
                  <p className='font-bold text-white text-sm'>Rate Limiting</p>
                  <p className='text-slate-400 text-xs'>Prevent abuse</p>
                </div>
              </label>
              {isRateLimited && (
                <div className='space-y-2'>
                  <label className='text-sm font-semibold text-slate-300'>
                    Max clicks per minute: {maxClicksPerMin}
                  </label>
                  <input
                    type='range'
                    min='10'
                    max='1000'
                    step='10'
                    value={maxClicksPerMin}
                    onChange={(e) =>
                      setMaxClicksPerMin(parseInt(e.target.value))
                    }
                    className='w-full accent-blue-500'
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: QR Preview */}
        <div className='lg:col-span-4'>
          <div className='bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-sm sticky top-24 space-y-6'>
            <div className='text-center'>
              <h4 className='text-xs font-bold text-slate-500 uppercase tracking-widest mb-6'>
                Preview
              </h4>

              {/* QR Code */}
              <div className='bg-white p-6 rounded-2xl flex flex-col items-center justify-center min-h-[280px] mb-6 shadow-lg'>
                {isLoadingQR ? (
                  <div className='flex flex-col items-center gap-3'>
                    <Loader2 className='w-8 h-8 text-blue-600 animate-spin' />
                    <p className='text-slate-500 text-sm'>Generating QR...</p>
                  </div>
                ) : qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt='QR Code'
                    className='w-auto max-w-full animate-in fade-in duration-300'
                  />
                ) : (
                  <div className='flex flex-col items-center gap-3 text-slate-400'>
                    <Rocket className='w-8 h-8' />
                    <p className='text-sm font-semibold'>
                      Create a link to see QR code
                    </p>
                    <p className='text-xs'>
                      Fill the form and click "Create Link"
                    </p>
                  </div>
                )}
              </div>

              {/* Short Link Display - Shows ONLY after creation */}
              {createdShortCode && (
                <div className='space-y-3 animate-in slide-in-from-bottom-3'>
                  <p className='text-xs font-bold text-green-400 uppercase tracking-widest'>
                    ✅ Your Short Link Created!
                  </p>
                  <div className='bg-gradient-to-r from-blue-900 to-slate-900 border-2 border-blue-500/50 rounded-xl p-4 flex items-center justify-between group hover:border-blue-500/80 transition-all shadow-lg'>
                    <code className='text-blue-300 font-mono text-sm font-bold break-all'>
                      {`${import.meta.env.VITE_API_URL.replace('/api', '')}/${createdShortCode}`}
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${import.meta.env.VITE_API_URL.replace('/api', '')}/${createdShortCode}`,
                        )
                      }
                      className='text-slate-400 hover:text-white ml-3 transition-colors flex-shrink-0'
                    >
                      {copiedCode ===
                      `${import.meta.env.VITE_API_URL.replace('/api', '')}/${createdShortCode}` ? (
                        <Check className='w-5 h-5 text-green-400' />
                      ) : (
                        <Copy className='w-5 h-5' />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Download QR */}
            {qrCodeUrl && (
              <div className='grid grid-cols-2 gap-3'>
                <button className='bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-700 shadow-lg'>
                  <Download className='w-4 h-4' />
                  <span>PNG</span>
                </button>
                <button className='bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-700 shadow-lg'>
                  <Download className='w-4 h-4' />
                  <span>SVG</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className='sticky bottom-8 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl flex items-center justify-between shadow-2xl z-40 flex-wrap gap-4'>
        <div className='flex items-center gap-2 text-slate-400 text-sm'>
          <Shield className='w-4 h-4 text-blue-500 flex-shrink-0' />
          <span>All links are secure & encrypted</span>
        </div>
        <div className='flex gap-4 w-full sm:w-auto flex-wrap sm:flex-nowrap'>
          {createdShortCode ? (
            <>
              <button
                onClick={handleCreateNewLink}
                className='text-slate-400 hover:text-white px-6 font-bold transition-colors flex-1 sm:flex-none'
              >
                Create New Link
              </button>
              <button
                onClick={() => {
                  const url = `${import.meta.env.VITE_API_URL.replace('/api', '')}/${createdShortCode}`;
                  window.open(url, '_blank');
                }}
                className='bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-green-900/40 flex-1 sm:flex-none'
              >
                Test Link <ExternalLink className='w-4 h-4' />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setDestination('https://github.com');
                  setAlias('');
                  setSuccessMessage('');
                }}
                className='text-slate-400 hover:text-white px-6 font-bold transition-colors flex-1 sm:flex-none'
              >
                Clear
              </button>
              <button
                onClick={handleCreate}
                disabled={isCreating || !isValidUrl}
                className='bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-10 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-900/40 disabled:cursor-not-allowed flex-1 sm:flex-none'
              >
                {isCreating ? (
                  <>
                    <Loader2 className='w-5 h-5 animate-spin' />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Link <Rocket className='w-5 h-5' />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkCreator;
