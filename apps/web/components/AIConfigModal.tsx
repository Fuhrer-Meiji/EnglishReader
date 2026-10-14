'use client';

/* Hallmark · component: AIConfigModal · genre: editorial · theme: newsprint-warm / moroccan-leather
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (APCA / WCAG 2.1 AAA)
 */

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  X,
  Key,
  Globe,
  Cpu,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Zap,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import {
  AIConfig,
  AI_PROVIDER_PRESETS,
  DEFAULT_AI_CONFIG,
  loadAIConfig,
  saveAIConfig,
} from '../lib/aiConfig';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: (config: AIConfig) => void;
}

export const AIConfigModal: React.FC<AIConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [config, setConfig] = useState<AIConfig>(DEFAULT_AI_CONFIG);
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loaded = loadAIConfig();
      setConfig(loaded);
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectProvider = (presetId: AIConfig['provider']) => {
    const preset = AI_PROVIDER_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setTestResult(null);
    if (preset.id === 'custom') {
      setConfig((prev) => ({
        ...prev,
        provider: 'custom',
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        provider: preset.id,
        apiBaseUrl: preset.defaultBaseUrl,
        model: preset.defaultModel,
      }));
    }
  };

  const handleTestConnection = async () => {
    if (!config.apiKey.trim()) {
      setTestResult({
        success: false,
        message: '请先填写 API Key 再进行测试',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'test',
          apiBaseUrl: config.apiBaseUrl,
          apiKey: config.apiKey,
          model: config.model,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `测试失败 (HTTP ${res.status})`);
      }

      setTestResult({
        success: true,
        message: `测试成功！模型响应正常`,
        latencyMs: data.latencyMs,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || '连接失败，请检查 Base URL 与 API Key 是否有效',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    saveAIConfig(config);
    setSaveSuccess(true);
    onConfigSaved?.(config);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleClear = () => {
    const reset = { ...DEFAULT_AI_CONFIG, apiKey: '' };
    setConfig(reset);
    saveAIConfig(reset);
    setTestResult(null);
    setSaveSuccess(false);
    onConfigSaved?.(reset);
  };

  const currentPreset = AI_PROVIDER_PRESETS.find((p) => p.id === config.provider);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[var(--color-paper-elevated)] text-[var(--color-ink)] rounded-2xl border border-[var(--color-rule)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[var(--color-rule)] bg-[var(--color-paper-2)]/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-accent)]/15 text-[var(--color-accent)] flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-book-serif font-medium text-base text-[var(--color-ink)]">
                大模型伴读接口配置 (BYOK)
              </h3>
              <p className="text-xs text-[var(--color-ink-muted)] font-meta-mono mt-0.5">
                支持任何 OpenAI 兼容接口 · 私有密钥仅存于本地浏览器
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-3)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-2)] font-meta-mono flex items-center justify-between">
              <span>选择大模型服务商</span>
              {currentPreset?.docUrl && (
                <a
                  href={currentPreset.docUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[var(--color-accent)] hover:underline inline-flex items-center gap-1 font-normal lowercase"
                >
                  <span>获取密钥</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AI_PROVIDER_PRESETS.map((preset) => {
                const isSelected = config.provider === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectProvider(preset.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between min-h-[64px] ${
                      isSelected
                        ? 'bg-[var(--color-paper)] border-[var(--color-accent)] shadow-xs ring-1 ring-[var(--color-accent)]'
                        : 'bg-[var(--color-paper-2)]/60 border-[var(--color-rule)] hover:bg-[var(--color-paper-2)]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-medium truncate ${isSelected ? 'text-[var(--color-accent)] font-semibold' : 'text-[var(--color-ink)]'}`}>
                          {preset.name.split(' ')[0]}
                        </span>
                        {preset.badge && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-meta-mono">
                            {preset.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[var(--color-ink-muted)] line-clamp-1 mt-0.5 font-meta-mono">
                        {preset.defaultModel || '自定义'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            {currentPreset?.desc && (
              <p className="text-[11px] text-[var(--color-ink-muted)] font-meta-mono">
                💡 {currentPreset.desc}
              </p>
            )}
          </div>

          {/* Form Inputs */}
          <div className="space-y-4">
            {/* API Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-ink-2)] font-meta-mono flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  <span>API Key (密钥)</span>
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>仅本地加密保存</span>
                </span>
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={config.apiKey}
                  onChange={(e) => {
                    setConfig({ ...config, apiKey: e.target.value.trim() });
                    setTestResult(null);
                  }}
                  placeholder="sk-..."
                  className="w-full pl-3 pr-10 py-2.5 bg-[var(--color-paper-2)]/80 border border-[var(--color-rule)] rounded-xl text-xs font-mono text-[var(--color-ink)] placeholder-[var(--color-ink-muted)] focus:outline-hidden focus:border-[var(--color-accent)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] p-1 cursor-pointer"
                  title={showKey ? '隐藏密钥' : '显示密钥'}
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Base URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-ink-2)] font-meta-mono flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>API 接口地址 (Base URL)</span>
              </label>
              <input
                type="text"
                value={config.apiBaseUrl}
                onChange={(e) => {
                  setConfig({ ...config, apiBaseUrl: e.target.value.trim() });
                  setTestResult(null);
                }}
                placeholder="例如：https://api.deepseek.com"
                className="w-full px-3 py-2.5 bg-[var(--color-paper-2)]/80 border border-[var(--color-rule)] rounded-xl text-xs font-mono text-[var(--color-ink)] placeholder-[var(--color-ink-muted)] focus:outline-hidden focus:border-[var(--color-accent)] transition-colors"
              />
            </div>

            {/* Model Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-ink-2)] font-meta-mono flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>模型名称 (Model)</span>
              </label>
              <input
                type="text"
                value={config.model}
                onChange={(e) => {
                  setConfig({ ...config, model: e.target.value.trim() });
                  setTestResult(null);
                }}
                placeholder="例如：deepseek-chat 或 gpt-4o-mini"
                className="w-full px-3 py-2.5 bg-[var(--color-paper-2)]/80 border border-[var(--color-rule)] rounded-xl text-xs font-mono text-[var(--color-ink)] placeholder-[var(--color-ink-muted)] focus:outline-hidden focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
          </div>

          {/* Test & Status Feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 animate-in fade-in duration-150 ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                )}
                <span className="truncate">{testResult.message}</span>
              </div>
              {testResult.latencyMs !== undefined && (
                <span className="text-[11px] font-mono shrink-0 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 font-medium">
                  {testResult.latencyMs}ms
                </span>
              )}
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>配置已安全保存！正在激活 AI 伴读模式...</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[var(--color-rule)] bg-[var(--color-paper-2)]/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 rounded-xl text-xs text-[var(--color-ink-muted)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer font-medium flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置</span>
            </button>

            <button
              type="button"
              disabled={isTesting || !config.apiKey}
              onClick={handleTestConnection}
              className="px-3.5 py-2 rounded-xl bg-[var(--color-paper)] hover:bg-[var(--color-paper-elevated)] border border-[var(--color-rule)] hover:border-[var(--color-accent)] text-xs font-medium text-[var(--color-ink)] transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--color-accent)]" />
                  <span>测速中...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  <span>测试连接</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)] transition-colors cursor-pointer font-medium"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[var(--color-accent)] hover:opacity-90 text-white text-xs font-medium transition-opacity cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>保存并启用</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
