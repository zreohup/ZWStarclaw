/* ============================================================
   设置面板组件
   配置 API Key、模型选择等
   ============================================================ */

import { useState } from 'react'
import { useSettingsStore } from '@/stores'
import { Button, Input, Select } from '@/components/ui'
import type { ModelProvider } from '@/lib/llm'
import {
  fetchOpenAICompatibleModels,
  PROVIDER_CONFIGS,
  type OpenAICompatibleModel,
} from '@/lib/llm'

/* ------------------------------------------------------------
   厂商选项
   ------------------------------------------------------------ */

const PROVIDER_OPTIONS: Array<{ value: ModelProvider; label: string }> = [
  { value: 'custom', label: '自定义 (OpenAI 兼容)' },
]

const API_DOCS: Record<ModelProvider, string> = {
  kimi: 'https://platform.kimi.ai',
  gemini: 'https://aistudio.google.com/apikey',
  claude: 'https://console.anthropic.com',
  deepseek: 'https://platform.deepseek.com',
  custom: '',
}

/* ------------------------------------------------------------
   设置面板
   ------------------------------------------------------------ */

interface SettingsPanelProps {
  onClose?: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const {
    provider,
    providerSettings,
    enableThinking,
    enableWebSearch,
    searchApiKey,
    setProvider,
    updateCurrentProvider,
    setEnableThinking,
    setEnableWebSearch,
    setSearchApiKey,
  } = useSettingsStore()

  // 当前厂商的配置
  const currentSettings = providerSettings[provider]

  const [localApiKey, setLocalApiKey] = useState(currentSettings.apiKey)
  const [localBaseUrl, setLocalBaseUrl] = useState(currentSettings.customBaseUrl)
  const [localModel, setLocalModel] = useState(currentSettings.customModel)
  const [localSearchApiKey, setLocalSearchApiKey] = useState(searchApiKey)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pendingProvider, setPendingProvider] = useState<ModelProvider | null>(null)
  const [availableModels, setAvailableModels] = useState<OpenAICompatibleModel[]>([])
  const [modelsLoading, setModelsLoading] = useState(false)
  const [modelsError, setModelsError] = useState<string | null>(null)

  // 检查是否有未保存的修改
  const hasUnsavedChanges =
    localApiKey !== currentSettings.apiKey ||
    localBaseUrl !== currentSettings.customBaseUrl ||
    localModel !== currentSettings.customModel ||
    localSearchApiKey !== searchApiKey

  // 切换厂商时，检查是否有未保存修改
  const handleProviderChange = (newProvider: ModelProvider) => {
    if (newProvider === provider) return

    if (hasUnsavedChanges) {
      setPendingProvider(newProvider)
    } else {
      switchToProvider(newProvider)
    }
  }

  // 实际切换厂商
  const switchToProvider = (newProvider: ModelProvider) => {
    setProvider(newProvider)
    const newSettings = providerSettings[newProvider]
    setLocalApiKey(newSettings.apiKey)
    setLocalBaseUrl(newSettings.customBaseUrl)
    setLocalModel(newSettings.customModel)
    setPendingProvider(null)
  }

  // 保存并切换
  const handleSaveAndSwitch = () => {
    updateCurrentProvider({
      apiKey: localApiKey,
      customBaseUrl: localBaseUrl,
      customModel: localModel,
    })
    setSearchApiKey(localSearchApiKey)
    if (pendingProvider) {
      switchToProvider(pendingProvider)
    }
  }

  // 放弃修改并切换
  const handleDiscardAndSwitch = () => {
    if (pendingProvider) {
      switchToProvider(pendingProvider)
    }
  }

  // 当前厂商的默认配置
  const defaultConfig = PROVIDER_CONFIGS[provider]
  const docUrl = API_DOCS[provider]

  const handleSave = () => {
    updateCurrentProvider({
      apiKey: localApiKey,
      customBaseUrl: localBaseUrl,
      customModel: localModel,
    })
    setSearchApiKey(localSearchApiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleFetchModels = async () => {
    setModelsLoading(true)
    setModelsError(null)

    try {
      const models = await fetchOpenAICompatibleModels(
        localApiKey,
        localBaseUrl || defaultConfig.baseUrl
      )
      setAvailableModels(models)
      if (models.length === 0) {
        setModelsError('未获取到模型列表，请检查当前 API Key 是否支持 /models')
      }
      if (!localModel.trim() && models.some((model) => model.id === defaultConfig.defaultModel)) {
        setLocalModel(defaultConfig.defaultModel)
      }
    } catch (error) {
      setAvailableModels([])
      setModelsError(error instanceof Error ? error.message : '模型获取失败')
    } finally {
      setModelsLoading(false)
    }
  }

  // 判断是否有自定义值（用于高亮显示）
  const hasCustomBaseUrl = localBaseUrl.trim() !== ''
  const hasCustomModel = localModel.trim() !== ''

  return (
    <div className="glass p-6 w-full max-w-md relative">
      {/* 未保存修改确认对话框 */}
      {pendingProvider && (
        <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center z-10 p-4">
          <div className="bg-night-light p-5 rounded-xl max-w-sm w-full space-y-4">
            <p className="text-text-secondary text-sm">
              当前配置有未保存的修改，切换厂商将丢失这些修改。
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleDiscardAndSwitch}
                className="flex-1 !bg-white/10 hover:!bg-white/20"
              >
                放弃修改
              </Button>
              <Button onClick={handleSaveAndSwitch} className="flex-1">
                保存并切换
              </Button>
            </div>
            <button
              onClick={() => setPendingProvider(null)}
              className="w-full text-sm text-text-muted hover:text-text transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">设置</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* 横幅提示 */}
      <div className="mb-4 p-3 rounded-lg bg-star/10 border border-star/20 text-sm text-text-secondary">
        <span className="text-star">ⓘ</span> 使用中转 API？展开下方「高级设置」修改 URL 和模型
      </div>

      <div className="space-y-4">
        {/* 厂商选择 */}
        <Select
          label="AI 厂商"
          options={PROVIDER_OPTIONS}
          value={provider}
          onChange={(e) => handleProviderChange(e.target.value as ModelProvider)}
        />

        {/* API Key */}
        <Input
          label="API Key"
          type="password"
          placeholder="输入你的 API Key"
          value={localApiKey}
          onChange={(e) => setLocalApiKey(e.target.value)}
        />

        {/* API 文档链接 */}
        {docUrl && (
          <p className="text-xs text-text-muted">
            获取 API Key:{' '}
            <a href={docUrl} target="_blank" rel="noopener" className="text-star hover:underline">
              {docUrl.replace('https://', '')}
            </a>
          </p>
        )}

        {/* 高级设置折叠区 */}
        <div className="border-t border-white/10 pt-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors w-full"
          >
            <span className={`transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>▶</span>
            高级设置
            {(hasCustomBaseUrl || hasCustomModel) && (
              <span className="text-xs text-amber px-1.5 py-0.5 rounded bg-amber/10">已修改</span>
            )}
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4">
              {/* BaseURL */}
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">
                  BaseURL
                  {hasCustomBaseUrl && <span className="text-amber ml-2 text-xs">已覆盖</span>}
                </label>
                <input
                  type="text"
                  placeholder={defaultConfig.baseUrl}
                  value={localBaseUrl}
                  onChange={(e) => setLocalBaseUrl(e.target.value)}
                  className={`
                    w-full px-3 py-2 rounded-lg text-sm
                    bg-white/5 border transition-colors
                    placeholder:text-text-muted/50
                    focus:outline-none focus:ring-1
                    ${hasCustomBaseUrl
                      ? 'border-amber/50 focus:border-amber focus:ring-amber/30 text-text'
                      : 'border-white/10 focus:border-star focus:ring-star/30 text-text-secondary'
                    }
                  `}
                />
                <p className="text-xs text-text-muted mt-1">
                  默认: {defaultConfig.baseUrl}
                </p>
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">
                  Model
                  {hasCustomModel && <span className="text-amber ml-2 text-xs">已覆盖</span>}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={defaultConfig.defaultModel}
                    value={localModel}
                    onChange={(e) => setLocalModel(e.target.value)}
                    className={`
                      min-w-0 flex-1 px-3 py-2 rounded-lg text-sm
                      bg-white/5 border transition-colors
                      placeholder:text-text-muted/50
                      focus:outline-none focus:ring-1
                      ${hasCustomModel
                        ? 'border-amber/50 focus:border-amber focus:ring-amber/30 text-text'
                        : 'border-white/10 focus:border-star focus:ring-star/30 text-text-secondary'
                      }
                    `}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleFetchModels}
                    disabled={modelsLoading || !localApiKey.trim()}
                    className="shrink-0"
                  >
                    {modelsLoading ? '获取中' : '获取模型'}
                  </Button>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  默认: {defaultConfig.defaultModel}
                </p>
                {modelsError && (
                  <p className="text-xs text-misfortune mt-1">{modelsError}</p>
                )}
                {availableModels.length > 0 && (
                  <div className="mt-2">
                    <select
                      value={availableModels.some((model) => model.id === localModel) ? localModel : ''}
                      onChange={(e) => {
                        if (e.target.value) setLocalModel(e.target.value)
                      }}
                      className="
                        w-full px-3 py-2 rounded-lg text-sm
                        bg-white/5 border border-white/10 text-text-secondary
                        focus:outline-none focus:border-star focus:ring-1 focus:ring-star/30
                      "
                    >
                      <option value="">选择已获取模型</option>
                      {availableModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.ownedBy ? `${model.id} · ${model.ownedBy}` : model.id}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-text-muted mt-1">
                      已获取 {availableModels.length} 个模型
                    </p>
                  </div>
                )}
              </div>

              {/* 思考模式开关 */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`
                    w-10 h-6 rounded-full relative transition-colors
                    ${enableThinking ? 'bg-star' : 'bg-white/10'}
                  `}
                  onClick={() => setEnableThinking(!enableThinking)}
                >
                  <div
                    className={`
                      absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                      ${enableThinking ? 'left-5' : 'left-1'}
                    `}
                  />
                </div>
                <div>
                  <span className="text-sm text-text-secondary group-hover:text-text transition-colors">
                    启用深度思考
                  </span>
                  <p className="text-xs text-text-muted">
                    需当前 OpenAI 兼容模型支持 thinking / reasoning 参数
                  </p>
                </div>
              </label>

              {/* 联网搜索开关 */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`
                    w-10 h-6 rounded-full relative transition-colors
                    ${enableWebSearch ? 'bg-star' : 'bg-white/10'}
                  `}
                  onClick={() => setEnableWebSearch(!enableWebSearch)}
                >
                  <div
                    className={`
                      absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                      ${enableWebSearch ? 'left-5' : 'left-1'}
                    `}
                  />
                </div>
                <div>
                  <span className="text-sm text-text-secondary group-hover:text-text transition-colors">
                    启用联网搜索
                  </span>
                  <p className="text-xs text-text-muted">
                    {provider === 'kimi' || provider === 'gemini'
                      ? '使用原生搜索能力'
                      : '需配置 Tavily API'}
                  </p>
                </div>
              </label>

              {/* Tavily API Key (非 Kimi/Gemini 显示) */}
              {enableWebSearch && provider !== 'kimi' && provider !== 'gemini' && (
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">
                    Tavily API Key
                    {localSearchApiKey.trim() && <span className="text-amber ml-2 text-xs">已配置</span>}
                  </label>
                  <input
                    type="password"
                    placeholder="输入 Tavily API Key"
                    value={localSearchApiKey}
                    onChange={(e) => setLocalSearchApiKey(e.target.value)}
                    className={`
                      w-full px-3 py-2 rounded-lg text-sm
                      bg-white/5 border transition-colors
                      placeholder:text-text-muted/50
                      focus:outline-none focus:ring-1
                      ${localSearchApiKey.trim()
                        ? 'border-amber/50 focus:border-amber focus:ring-amber/30 text-text'
                        : 'border-white/10 focus:border-star focus:ring-star/30 text-text-secondary'
                      }
                    `}
                  />
                  <p className="text-xs text-text-muted mt-1">
                    获取 API Key:{' '}
                    <a
                      href="https://tavily.com"
                      target="_blank"
                      rel="noopener"
                      className="text-star hover:underline"
                    >
                      tavily.com
                    </a>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 保存按钮 */}
        <Button onClick={handleSave} className="w-full" disabled={!hasUnsavedChanges && !saved}>
          {saved ? '✓ 已保存' : hasUnsavedChanges ? '保存设置 *' : '保存设置'}
        </Button>

        {/* 隐私提示 */}
        <p className="text-xs text-text-muted text-center">
          API Key 仅保存在你的浏览器本地，不会上传到任何服务器。
        </p>
      </div>
    </div>
  )
}
