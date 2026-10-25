import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Languages,
  HelpCircle,
  Activity,
  Check,
  ShieldCheck,
  Lightbulb,
  Lock,
  Unlock,
  Wind,
  Layers
} from 'lucide-react';
import { VehicleState, LocationState, ActivityLog } from '../types';
import { parseVoiceCommand, speakText, CommandExecutionResult } from '../utils/voiceAssistant';
import { soundFx } from '../utils/audio';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleState;
  location: LocationState;
  onApplyChanges: (changes: Partial<VehicleState>, log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  onTriggerFindMyCar: () => void;
  soundEnabled: boolean;
  voiceFeedbackEnabled: boolean;
  activities?: ActivityLog[];
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  location,
  onApplyChanges,
  onTriggerFindMyCar,
  soundEnabled,
  voiceFeedbackEnabled,
  activities = []
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [lastResult, setLastResult] = useState<CommandExecutionResult | null>(null);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [currentLang, setCurrentLang] = useState<'en-US' | 'hi-IN'>('en-US');
  const [showLogTab, setShowLogTab] = useState<boolean>(false);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = true;
        recog.lang = currentLang;

        recog.onstart = () => {
          setIsListening(true);
          soundFx.playClick(soundEnabled);
        };

        recog.onresult = (event: any) => {
          const current = event.resultIndex;
          const text = event.results[current][0].transcript;
          setTranscript(text);
          if (event.results[current].isFinal) {
            handleProcessCommand(text);
          }
        };

        recog.onerror = () => {
          setIsListening(false);
        };

        recog.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recog;
      }
    }
  }, [currentLang, soundEnabled]);

  const toggleListening = () => {
    if (!speechSupported) {
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = currentLang;
          recognitionRef.current.start();
        }
      } catch {
        // Recognition already started or busy
      }
    }
  };

  const handleProcessCommand = (commandStr: string) => {
    if (!commandStr.trim()) return;

    soundFx.playClick(soundEnabled);
    const result = parseVoiceCommand(commandStr, vehicle, location);
    setLastResult(result);

    if (result.understood) {
      if (result.appliedChanges) {
        onApplyChanges(result.appliedChanges, {
          action: `Voice: ${result.actionTaken}`,
          category: result.category,
          source: 'voice',
          details: `Recognized [${result.intent}]: "${commandStr}"`
        });
      }

      if (result.triggerFindMyCar) {
        onTriggerFindMyCar();
      }

      // Audio feedback
      if (result.appliedChanges?.doorsLocked === true) soundFx.playLock(soundEnabled);
      if (result.appliedChanges?.doorsLocked === false) soundFx.playUnlock(soundEnabled);
      if (result.appliedChanges?.masterSecurityArmed === true) soundFx.playArmSecurity(soundEnabled);
      if (result.appliedChanges?.masterSecurityArmed === false) soundFx.playDisarmSecurity(soundEnabled);

      // Voice Text-to-Speech response if enabled
      if (voiceFeedbackEnabled) {
        const reply = currentLang === 'hi-IN' ? result.responseTextHi : result.responseTextEn;
        speakText(reply, currentLang);
      }
    } else {
      // Clarification or unrecognized
      if (voiceFeedbackEnabled) {
        const reply = currentLang === 'hi-IN' ? result.responseTextHi : result.responseTextEn;
        speakText(reply, currentLang);
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setTranscript(inputText);
    handleProcessCommand(inputText);
    setInputText('');
  };

  if (!isOpen) return null;

  const sampleCommandsHinglish = [
    'light on karo',
    'car lock karo',
    'window kholo',
    'dicky kholo',
    'security on karo',
    'gaadi kahan hai',
    'light off karo',
    'car unlock karo',
    'window band karo',
    'dicky band karo',
    'security off karo',
    'driver safety on karo'
  ];

  const voiceActivities = activities.filter(a => a.source === 'voice');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl cyber-panel rounded-3xl p-5 md:p-6 border border-cyan-500/40 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/15 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-300 neon-glow-cyan">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                SmartGuard Voice AI Copilot
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  NLU INTENT ENGINE
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Natural speech in Hindi, Hinglish &amp; English with typed input fallback
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <button
              onClick={() => setCurrentLang(prev => prev === 'en-US' ? 'hi-IN' : 'en-US')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-cyan-300 transition-colors font-mono"
              title="Toggle Speech Recognition Language"
            >
              <Languages className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentLang === 'hi-IN' ? 'हिंदी (Mic Active)' : 'English (Mic Active)'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center Microphone Orb & Listening Status */}
        <div className="flex flex-col items-center justify-center py-2 text-center">
          <div className="relative">
            {isListening && (
              <div className="absolute inset-0 rounded-full bg-cyan-500/30 animate-ping" />
            )}
            <button
              onClick={toggleListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all ${
                isListening
                  ? 'bg-red-500 border-red-300 text-white shadow-lg shadow-red-500/50 scale-105'
                  : 'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-300 text-black hover:scale-105 neon-glow-cyan'
              }`}
              title={isListening ? 'Click to stop listening' : 'Click to talk (Hindi / Hinglish / English)'}
            >
              <Mic className={`w-8 h-8 ${isListening ? 'animate-pulse' : ''}`} />
            </button>
          </div>

          <div className="mt-2.5">
            <span className="text-sm font-semibold text-white">
              {isListening ? 'Listening... Speak in Hindi, Hinglish, or English' : 'Tap microphone or type command below'}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {speechSupported ? 'Browser Web Speech API Connected (Continuous Audio Sync)' : 'Web Speech API unavailable on this browser; typed input fallback active below'}
            </p>
          </div>

          {/* Transcript preview if present */}
          {transcript && (
            <div className="mt-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-cyan-300 font-mono text-xs max-w-md">
              Recognized Audio: <strong className="text-white">“{transcript}”</strong>
            </div>
          )}
        </div>

        {/* Command Execution Result Box */}
        {lastResult && (
          <div className={`p-4 rounded-xl border flex flex-col gap-2 text-xs transition-all ${
            lastResult.understood 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
              : lastResult.needsClarification
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                : 'bg-red-950/40 border-red-500/40 text-red-200'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {lastResult.understood ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span className="font-bold text-white text-sm">
                  {lastResult.actionTaken}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-cyan-300 border border-cyan-500/30">
                  INTENT: {lastResult.intent} ({(lastResult.confidence * 100).toFixed(0)}%)
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  lastResult.understood 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {lastResult.understood ? 'STATE SYNCHRONIZED' : 'CLARIFICATION NEEDED'}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-300 pl-6 flex items-center gap-2">
              <span>Command:</span>
              <span className="font-mono text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                “{lastResult.rawCommand}”
              </span>
            </div>

            <p className="text-xs text-slate-200 pl-6 leading-relaxed">
              {currentLang === 'hi-IN' ? lastResult.responseTextHi : lastResult.responseTextEn}
            </p>

            {/* Clarification suggestions pills if ambiguous or unrecognized */}
            {lastResult.clarificationSuggestions && lastResult.clarificationSuggestions.length > 0 && (
              <div className="mt-2 pl-6 pt-2 border-t border-amber-500/20">
                <span className="text-[10px] uppercase font-mono text-amber-300 block mb-1.5">
                  Did you mean one of these? Click to execute:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {lastResult.clarificationSuggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTranscript(sug);
                        handleProcessCommand(sug);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 text-amber-200 hover:text-white text-[11px] font-mono transition-all flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-amber-400" />
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Typed-Command Input Fallback */}
        <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type in Hindi, Hinglish, or English (e.g. light on karo, car lock karo, window kholo, dicky kholo)..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 text-xs text-white placeholder-slate-500 outline-none transition-colors"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            Execute
          </button>
        </form>

        {/* Toggle between Suggestions & Recent Voice Activity Log */}
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLogTab(false)}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all ${
                !showLogTab 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Suggested Commands
            </button>
            <button
              onClick={() => setShowLogTab(true)}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all flex items-center gap-1.5 ${
                showLogTab 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3 h-3 text-cyan-400" />
              Voice Event Log ({voiceActivities.length})
            </button>
          </div>

          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
            Shared App State Synchronized
          </span>
        </div>

        {/* Tab 1: Suggestions Chips */}
        {!showLogTab ? (
          <div>
            <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto pr-1">
              {sampleCommandsHinglish.map((cmd, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTranscript(cmd);
                    handleProcessCommand(cmd);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 text-[11px] text-cyan-200 hover:text-white transition-all font-mono"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Tab 2: Timestamped Voice Activities Log */
          <div className="flex flex-col gap-1.5 max-h-[130px] overflow-y-auto pr-1">
            {voiceActivities.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-500">
                No voice actions recorded yet in this session.
              </div>
            ) : (
              voiceActivities.slice(0, 6).map(act => (
                <div
                  key={act.id}
                  className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-200">{act.action}</span>
                    {act.details && (
                      <span className="text-slate-400 ml-2 font-mono text-[10px]">{act.details}</span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 shrink-0">{act.timestamp}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Prototype Disclaimer */}
        <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 text-center">
          Prototype Simulation Mode: Voice actions trigger internal state updates across the visual car schematic, dashboard gauges, and sentry logs. No real vehicle hardware is controlled.
        </div>
      </div>
    </div>
  );
};
