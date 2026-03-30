import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  CheckCircle2,
  FileLock2,
  Gauge,
  KeyRound,
  Loader2,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';
import { uploadEncryptedPayload } from '../services/storachaClient';
import { grantAccessPolicy } from '../services/litAccess';
import { useWallet } from '../context/WalletContext';

function buildSimulatedEEG() {
  const now = Date.now();
  const samples = Array.from({ length: 24 }, (_, idx) => ({
    t: now + idx * 250,
    alpha: Number((Math.random() * 20 + 20).toFixed(2)),
    beta: Number((Math.random() * 15 + 10).toFixed(2)),
    gamma: Number((Math.random() * 8 + 5).toFixed(2)),
  }));

  return {
    schema: 'sim.eeg.v1',
    subject: 'demo-subject',
    createdAt: new Date().toISOString(),
    samples,
  };
}

export default function UploadPage() {
  const { address } = useWallet();
  const eegPayload = useMemo(() => buildSimulatedEEG(), []);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    vaultName: 'NeuraVault Prime',
    subjectId: 'subject-001',
    dataType: 'EEG',
    qualityScore: 'high',
    encryptionMode: 'aes-gcm',
    metadataVisibility: 'private',
    purpose: 'sleep-study',
    granteeWallet: '0xResearchWallet',
    durationHours: 72,
    enableRevocation: true,
  });

  const steps = [
    { title: 'Vault Info', icon: Brain, description: 'Set vault identity and neural data type' },
    { title: 'Stream', icon: Gauge, description: 'Review simulated EEG telemetry stream' },
    { title: 'Encryption', icon: FileLock2, description: 'Configure privacy and metadata visibility' },
    { title: 'Consent', icon: KeyRound, description: 'Assign wallet, purpose, and duration controls' },
    { title: 'Create', icon: ShieldCheck, description: 'Upload encrypted payload and register policy' },
  ];

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateStep = () => {
    const nextErrors = {};

    if (currentStep === 0) {
      if (!form.vaultName.trim()) nextErrors.vaultName = 'Vault name is required';
      if (!form.subjectId.trim()) nextErrors.subjectId = 'Subject id is required';
    }

    if (currentStep === 3) {
      if (!form.granteeWallet.trim()) nextErrors.granteeWallet = 'Wallet is required';
      if (!form.purpose.trim()) nextErrors.purpose = 'Purpose is required';
      if (!Number(form.durationHours) || Number(form.durationHours) < 1) {
        nextErrors.durationHours = 'Duration must be at least 1 hour';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setResult(null);

    try {
      const storageResponse = await uploadEncryptedPayload({
        ...eegPayload,
        vaultName: form.vaultName,
        subjectId: form.subjectId,
        dataType: form.dataType,
        qualityScore: form.qualityScore,
        encryptionMode: form.encryptionMode,
      });

      const cid = storageResponse?.cid || `bafy-demo-${Date.now()}`;

      const consentResponse = await grantAccessPolicy({
        wallet: form.granteeWallet,
        purpose: form.purpose,
        durationHours: Number(form.durationHours),
        recordCid: cid,
        symmetricKeyBase64: storageResponse?.symmetricKeyBase64,
      });

      setResult({
        vault: {
          name: form.vaultName,
          subjectId: form.subjectId,
          owner: address || 'wallet-not-connected',
        },
        storage: storageResponse,
        consent: consentResponse,
      });
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Flow failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 font-mono tracking-tight">VAULT INFO</h2>
              <p className="text-gray-400 text-lg">Define your neural vault profile and stream type.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <label className="text-sm text-gray-300 font-mono font-semibold">
                Vault Name *
                <input
                  value={form.vaultName}
                  onChange={(e) => handleInputChange('vaultName', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-800/50 px-5 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                {errors.vaultName && <p className="mt-2 text-xs text-rose-300">{errors.vaultName}</p>}
              </label>
              <label className="text-sm text-gray-300 font-mono font-semibold">
                Subject Identifier *
                <input
                  value={form.subjectId}
                  onChange={(e) => handleInputChange('subjectId', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-800/50 px-5 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                {errors.subjectId && <p className="mt-2 text-xs text-rose-300">{errors.subjectId}</p>}
              </label>
              <label className="text-sm text-gray-300 font-mono font-semibold">
                Data Type
                <select
                  value={form.dataType}
                  onChange={(e) => handleInputChange('dataType', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-800/50 px-5 py-4 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="EEG">EEG</option>
                  <option value="EEG+HRV">EEG + HRV</option>
                  <option value="Cognitive Stream">Cognitive Stream</option>
                </select>
              </label>
              <label className="text-sm text-gray-300 font-mono font-semibold">
                Quality Band
                <select
                  value={form.qualityScore}
                  onChange={(e) => handleInputChange('qualityScore', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-800/50 px-5 py-4 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="high">High Fidelity</option>
                  <option value="medium">Medium Fidelity</option>
                  <option value="low">Low Fidelity</option>
                </select>
              </label>
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 font-mono tracking-tight">DATA STREAM</h2>
              <p className="text-gray-400 text-lg">Preview the EEG telemetry packet before encryption.</p>
            </div>
            <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-4">
              <pre className="max-h-80 overflow-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-300">
                {JSON.stringify(eegPayload, null, 2)}
              </pre>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 font-mono tracking-tight">ENCRYPTION</h2>
              <p className="text-gray-400 text-lg">Select encryption and metadata policies for this vault.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <label className="text-sm text-gray-300 font-mono font-semibold">
                Encryption Mode
                <select
                  value={form.encryptionMode}
                  onChange={(e) => handleInputChange('encryptionMode', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-800/50 px-5 py-4 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="aes-gcm">AES-GCM</option>
                  <option value="lit-key-wrapped">Lit Key Wrapped</option>
                </select>
              </label>
              <label className="text-sm text-gray-300 font-mono font-semibold">
                Metadata Visibility
                <select
                  value={form.metadataVisibility}
                  onChange={(e) => handleInputChange('metadataVisibility', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-800/50 px-5 py-4 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                >
                  <option value="private">Private</option>
                  <option value="minimal">Minimal</option>
                  <option value="research-shared">Research Shared</option>
                </select>
              </label>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 font-mono tracking-tight">CONSENT RULES</h2>
              <p className="text-gray-400 text-lg">Configure access, purpose scope, and consent duration.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <label className="text-sm text-gray-300 font-mono font-semibold">
                Grantee Wallet *
                <input
                  value={form.granteeWallet}
                  onChange={(e) => handleInputChange('granteeWallet', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-800/50 px-5 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                {errors.granteeWallet && <p className="mt-2 text-xs text-rose-300">{errors.granteeWallet}</p>}
              </label>
              <label className="text-sm text-gray-300 font-mono font-semibold">
                Purpose *
                <input
                  value={form.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-800/50 px-5 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                {errors.purpose && <p className="mt-2 text-xs text-rose-300">{errors.purpose}</p>}
              </label>
              <label className="text-sm text-gray-300 font-mono font-semibold">
                Duration Hours *
                <input
                  type="number"
                  value={form.durationHours}
                  onChange={(e) => handleInputChange('durationHours', Number(e.target.value || 0))}
                  className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-800/50 px-5 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                {errors.durationHours && <p className="mt-2 text-xs text-rose-300">{errors.durationHours}</p>}
              </label>
              <label className="text-sm text-gray-300 font-mono font-semibold flex items-center gap-3 mt-8">
                <input
                  type="checkbox"
                  checked={form.enableRevocation}
                  onChange={(e) => handleInputChange('enableRevocation', e.target.checked)}
                  className="w-4 h-4"
                />
                Enable revocation controls
              </label>
            </div>
          </div>
        );
      default:
        return (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 font-mono tracking-tight">CREATE VAULT</h2>
              <p className="text-gray-400 text-lg">Review and run secure upload + policy registration.</p>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-5 text-2xl text-gray-200">
                <p>Vault: {form.vaultName}</p>
                <p>Subject: {form.subjectId}</p>
                <p>Consent: {form.granteeWallet} / {form.purpose} / {form.durationHours}h</p>
                <p>Owner Wallet: {address || 'Not connected'}</p>
              </div>
              {result && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    Vault Creation Result
                  </p>
                  <pre className="max-h-80 overflow-auto text-xs text-gray-200">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  const progressPercentage = Math.round(((currentStep + 1) / steps.length) * 100);
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen text-white overflow-hidden relative">
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12 mt-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4 font-mono tracking-tighter"
          >
            CREATE YOUR VAULT
          </motion.h1>
          <p className="text-gray-400 text-lg font-mono">
            Build a privacy-preserving neural wallet in minutes
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center">
            {steps.map((step, index) => {
              const isCompleted = currentStep > index;
              const isCurrent = currentStep === index;
              const StepIcon = step.icon;

              return (
                <React.Fragment key={step.title}>
                  <div className="flex items-center relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 relative z-10 transition-all duration-500 ${
                        isCompleted
                          ? 'bg-cyan-500 border-cyan-500'
                          : isCurrent
                          ? 'bg-cyan-500/20 border-cyan-400'
                          : 'bg-transparent border-gray-600'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <StepIcon className={`w-5 h-5 ${isCurrent ? 'text-cyan-400' : 'text-gray-500'}`} />
                      )}
                    </div>
                    <span
                      className={`absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs font-mono font-bold whitespace-nowrap ${
                        isCurrent ? 'text-cyan-400' : isCompleted ? 'text-green-400' : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index !== steps.length - 1 && (
                    <div className="flex-1 h-0.5 mx-4 bg-gray-800">
                      <div
                        className="h-full bg-cyan-500 transition-all duration-500"
                        style={{ width: currentStep > index ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div className="mt-10 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-700"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-sm font-mono">
            <span className="text-gray-400">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-cyan-400">{progressPercentage}% Complete</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto backdrop-blur-xl bg-gray-900/50 border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>

            <div className="mt-12 flex items-center justify-between border-t border-gray-800 pt-8">
              <button
                onClick={prevStep}
                disabled={currentStep === 0 || isSubmitting}
                className="flex items-center px-6 py-3 text-gray-400 hover:text-white transition-colors font-mono disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>

              <button
                onClick={isLastStep ? handleSubmit : nextStep}
                disabled={isSubmitting}
                className="flex items-center px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-mono font-bold transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {isLastStep ? 'CREATE VAULT' : 'Continue'}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
