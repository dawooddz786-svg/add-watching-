import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  UserPlus, 
  Wallet, 
  LayoutDashboard, 
  PlayCircle, 
  Youtube, 
  CheckCircle2, 
  ArrowDownCircle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../lib/utils';

const STEPS = [
  {
    title: 'Step 1: Create Account',
    description: 'First, create your account and log in to access the platform.',
    icon: UserPlus,
    color: 'bg-blue-500',
    visual: (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-2xl p-4">
        <div className="w-48 bg-white rounded-xl shadow-lg p-4 space-y-2">
          <div className="h-2 w-12 bg-slate-200 rounded" />
          <div className="h-8 w-full bg-slate-50 border border-slate-200 rounded" />
          <div className="h-2 w-12 bg-slate-200 rounded" />
          <div className="h-8 w-full bg-slate-50 border border-slate-200 rounded" />
          <div className="h-8 w-full bg-emerald-600 rounded flex items-center justify-center text-[10px] text-white font-bold">Sign Up</div>
        </div>
      </div>
    )
  },
  {
    title: 'Step 2: Deposit Funds',
    description: 'Go to the Deposit section and send your payment via EasyPaisa to the provided number.',
    icon: Wallet,
    color: 'bg-emerald-500',
    visual: (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-2xl p-4">
        <div className="w-48 bg-white rounded-xl shadow-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center text-emerald-600"><Wallet className="w-3 h-3" /></div>
            <div className="h-2 w-16 bg-slate-200 rounded" />
          </div>
          <div className="p-2 bg-emerald-50 rounded border border-emerald-100 text-[8px] text-emerald-700 font-bold">EasyPaisa: 03237697233</div>
          <div className="h-12 w-full border-2 border-dashed border-slate-200 rounded flex items-center justify-center text-[8px] text-slate-400">Upload Screenshot</div>
        </div>
      </div>
    )
  },
  {
    title: 'Step 3: Dashboard Update',
    description: 'Once your deposit is approved, your dashboard will update and tasks will become available.',
    icon: LayoutDashboard,
    color: 'bg-amber-500',
    visual: (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-2xl p-4">
        <div className="w-48 bg-white rounded-xl shadow-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="h-10 bg-emerald-50 rounded border border-emerald-100 p-1">
              <div className="h-1 w-6 bg-emerald-200 rounded mb-1" />
              <div className="h-3 w-10 bg-emerald-600 rounded" />
            </div>
            <div className="h-10 bg-blue-50 rounded border border-blue-100 p-1">
              <div className="h-1 w-6 bg-blue-200 rounded mb-1" />
              <div className="h-3 w-10 bg-blue-600 rounded" />
            </div>
          </div>
          <div className="h-12 w-full bg-slate-50 rounded border border-slate-100 flex items-center px-2 gap-2">
            <div className="w-4 h-4 bg-emerald-100 rounded-full" />
            <div className="h-1.5 w-20 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Step 4: Select Task',
    description: 'Navigate to the Tasks page and choose an available video task to start.',
    icon: PlayCircle,
    color: 'bg-purple-500',
    visual: (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-2xl p-4">
        <div className="w-48 bg-white rounded-xl shadow-lg p-3 space-y-2">
          <div className="h-2 w-16 bg-slate-200 rounded" />
          <div className="p-2 border border-slate-100 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-100 rounded flex items-center justify-center text-emerald-600"><PlayCircle className="w-2 h-2" /></div>
              <div className="h-1.5 w-12 bg-slate-200 rounded" />
            </div>
            <div className="h-4 w-10 bg-slate-900 rounded text-[6px] text-white flex items-center justify-center font-bold">Start</div>
          </div>
          <div className="p-2 border border-emerald-200 bg-emerald-50 rounded-lg flex items-center justify-between scale-105 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-600 rounded flex items-center justify-center text-white"><PlayCircle className="w-2 h-2" /></div>
              <div className="h-1.5 w-12 bg-emerald-700 rounded" />
            </div>
            <div className="h-4 w-10 bg-emerald-600 rounded text-[6px] text-white flex items-center justify-center font-bold">Start</div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Step 5: Watch Video',
    description: 'The task will open a YouTube video. Keep the tab open to progress.',
    icon: Youtube,
    color: 'bg-red-500',
    visual: (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-2xl p-4">
        <div className="w-48 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="h-4 bg-slate-800 flex items-center px-2 gap-1">
            <div className="w-1 h-1 bg-red-400 rounded-full" />
            <div className="w-1 h-1 bg-amber-400 rounded-full" />
            <div className="w-1 h-1 bg-emerald-400 rounded-full" />
          </div>
          <div className="p-4 flex flex-col items-center gap-2">
            <div className="w-full aspect-video bg-slate-900 rounded flex items-center justify-center">
              <Youtube className="w-8 h-8 text-red-600" />
            </div>
            <div className="w-full h-1 bg-slate-200 rounded overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 3, repeat: Infinity }}
                className="h-full bg-red-600"
              />
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Step 6: Complete Task',
    description: 'Once the timer finishes, the task is marked as complete and rewards are added.',
    icon: CheckCircle2,
    color: 'bg-emerald-600',
    visual: (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-2xl p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-48 bg-white rounded-xl shadow-xl p-6 flex flex-col items-center text-center"
        >
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="h-2 w-20 bg-slate-200 rounded mb-2" />
          <div className="h-1.5 w-24 bg-slate-100 rounded" />
        </motion.div>
      </div>
    )
  },
  {
    title: 'Step 7: Request Withdrawal',
    description: 'Go to the Withdraw page, select your method (EasyPaisa/JazzCash), and request your payout.',
    icon: ArrowDownCircle,
    color: 'bg-blue-600',
    visual: (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-2xl p-4">
        <div className="w-48 bg-white rounded-xl shadow-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-blue-600"><ArrowDownCircle className="w-3 h-3" /></div>
            <div className="h-2 w-16 bg-slate-200 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-6 border border-blue-200 bg-blue-50 rounded flex items-center justify-center text-[6px] font-bold text-blue-700">EasyPaisa</div>
            <div className="h-6 border border-slate-100 rounded flex items-center justify-center text-[6px] font-bold text-slate-400">JazzCash</div>
          </div>
          <div className="h-8 w-full bg-slate-900 rounded flex items-center justify-center text-[8px] text-white font-bold">Withdraw Now</div>
        </div>
      </div>
    )
  }
];

export default function TutorialVideo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % STEPS.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % STEPS.length);
    setIsPlaying(false);
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + STEPS.length) % STEPS.length);
    setIsPlaying(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden">
        {/* Video Player Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-white font-bold text-sm tracking-tight">Tutorial: How to Use Ad Watching</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white/70 hover:text-white transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2">
          {/* Visual Side */}
          <div className="aspect-video lg:aspect-square bg-slate-50 p-8 flex items-center justify-center relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full h-full"
              >
                {STEPS[currentStep].visual}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button 
              onClick={prevStep}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur shadow-lg rounded-full flex items-center justify-center text-slate-600 hover:bg-white transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={nextStep}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur shadow-lg rounded-full flex items-center justify-center text-slate-600 hover:bg-white transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Content Side */}
          <div className="p-8 lg:p-12 flex flex-col justify-center bg-white">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg",
                  STEPS[currentStep].color
                )}>
                  {React.createElement(STEPS[currentStep].icon, { className: "w-7 h-7" })}
                </div>
                
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">{STEPS[currentStep].title}</h3>
                  <p className="text-slate-600 text-lg leading-relaxed">
                    {STEPS[currentStep].description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress Indicators */}
            <div className="mt-12 flex gap-2">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentStep(i);
                    setIsPlaying(false);
                  }}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    currentStep === i ? "w-8 bg-emerald-600" : "w-2 bg-slate-200 hover:bg-slate-300"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Video Progress Bar */}
        <div className="h-1 bg-slate-100 relative">
          <motion.div 
            className="absolute inset-y-0 left-0 bg-emerald-600"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      
      <div className="mt-6 flex items-center justify-center gap-4 text-slate-400 text-sm font-medium">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Interactive Tutorial
        </div>
        <div className="w-1 h-1 bg-slate-300 rounded-full" />
        <span>7 Steps to Start</span>
      </div>
    </div>
  );
}
