export interface AIConfig {
  provider: 'deepseek' | 'openai' | 'moonshot' | 'siliconflow' | 'qwen' | 'custom';
  apiBaseUrl: string;
  apiKey: string;
  model: string;
  isEnabled: boolean;
}

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'deepseek',
  apiBaseUrl: 'https://api.deepseek.com',
  apiKey: '',
  model: 'deepseek-chat',
  isEnabled: true,
};

export interface AIProviderPreset {
  id: AIConfig['provider'];
  name: string;
  desc: string;
  defaultBaseUrl: string;
  defaultModel: string;
  docUrl: string;
  badge?: string;
}

export const AI_PROVIDER_PRESETS: AIProviderPreset[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek (深度求索)',
    desc: '推荐 · 极高性价比与卓越的中文文学修辞理解 · 响应极速',
    defaultBaseUrl: 'https://api.deepseek.com',
    defaultModel: 'deepseek-chat',
    docUrl: 'https://platform.deepseek.com/',
    badge: '推荐首选',
  },
  {
    id: 'openai',
    name: 'OpenAI (GPT-4o)',
    desc: '全球顶尖大模型 · 标杆级英文语料与复杂句式推理',
    defaultBaseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    docUrl: 'https://platform.openai.com/',
  },
  {
    id: 'moonshot',
    name: 'Moonshot (Kimi)',
    desc: '月之暗面长上下文大模型 · 中英文叙事语境理解',
    defaultBaseUrl: 'https://api.moonshot.cn/v1',
    defaultModel: 'moonshot-v1-8k',
    docUrl: 'https://platform.moonshot.cn/',
  },
  {
    id: 'siliconflow',
    name: 'SiliconFlow (硅基流动)',
    desc: '国内多模型云端 API 聚合服务 · 支持 DeepSeek V3 极速推理',
    defaultBaseUrl: 'https://api.siliconflow.cn/v1',
    defaultModel: 'deepseek-ai/DeepSeek-V3',
    docUrl: 'https://cloud.siliconflow.cn/',
  },
  {
    id: 'qwen',
    name: 'Qwen (通义千问)',
    desc: '阿里云百炼官方 OpenAI 兼容接口 · 中文文学修养深厚',
    defaultBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-plus',
    docUrl: 'https://bailian.console.aliyun.com/',
  },
  {
    id: 'custom',
    name: 'Custom (自定义 OpenAI 兼容端点)',
    desc: '支持 OneAPI、NewAPI、Ollama、LocalAI 等任何兼容 OpenAI 格式的服务',
    defaultBaseUrl: '',
    defaultModel: '',
    docUrl: '',
  },
];

export function loadAIConfig(): AIConfig {
  if (typeof window === 'undefined') return DEFAULT_AI_CONFIG;
  try {
    const raw = localStorage.getItem('wilde_ai_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_AI_CONFIG, ...parsed };
    }
  } catch (e) {
    console.warn('[AIConfig] Failed to load config from localStorage:', e);
  }
  return DEFAULT_AI_CONFIG;
}

export function saveAIConfig(config: AIConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('wilde_ai_config', JSON.stringify(config));
  } catch (e) {
    console.warn('[AIConfig] Failed to save config to localStorage:', e);
  }
}
