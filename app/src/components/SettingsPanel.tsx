/* ============================================================
   设置面板组件
   配置 API Key、模型选择等
   ============================================================ */

import { useEffect, useState } from 'react'
import { useSettingsStore } from '@/stores'
import { Button, Input } from '@/components/ui'
import {
  fetchOpenAICompatibleModels,
  PROVIDER_CONFIGS,
  type OpenAICompatibleModel,
} from '@/lib/llm'

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

  useEffect(() => {
    if (provider !== 'custom') {
      setProvider('custom')
    }
  }, [provider, setProvider])

  // NodeKey 使用 OpenAI 兼容协议，对应内部 custom 配置。
  const currentSettings = providerSettings.custom

  const [localApiKey, setLocalApiKey] = useState(currentSettings.apiKey)
  const [localBaseUrl, setLocalBaseUrl] = useState(currentSettings.customBaseUrl)
  const [localModel, setLocalModel] = useState(currentSettings.customModel)
  const [localSearchApiKey, setLocalSearchApiKey] = useState(searchApiKey)
  const [saved, setSaved] = useState(false)
  const [availableModels, setAvailableModels] = useState<OpenAICompatibleModel[]>([])
  const [modelsLoading, setModelsLoading] = useState(false)
  const [modelsError, setModelsError] = useState<string | null>(null)

  // 检查是否有未保存的修改
  const hasUnsavedChanges =
    localApiKey !== currentSettings.apiKey ||
    localBaseUrl !== currentSettings.customBaseUrl ||
    localModel !== currentSettings.customModel ||
    localSearchApiKey !== searchApiKey

  const defaultConfig = PROVIDER_CONFIGS.custom

  const handleSave = () => {
    setProvider('custom')
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
    <div className="glass p-6 w-full max-w-md max-h-[85vh] overflow-y-auto relative">
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

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">
            AI 厂商
          </label>
          <div className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-text">
            Nodekey
          </div>
        </div>

        {/* API Key */}
        <Input
          label="API Key"
          type="password"
          placeholder="输入你的 API Key"
          value={localApiKey}
          onChange={(e) => setLocalApiKey(e.target.value)}
        />

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
              需配置 Tavily API
            </p>
          </div>
        </label>

        {/* Tavily API Key */}
        {enableWebSearch && (
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
