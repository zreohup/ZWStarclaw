import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchOpenAICompatibleModels } from './llm'

describe('fetchOpenAICompatibleModels', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches and sorts OpenAI-compatible models', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        data: [
          { id: 'gpt-4o-mini', owned_by: 'openai' },
          { id: 'claude-compatible' },
          { owned_by: 'missing-id' },
        ],
      }),
    } as Partial<Response>)
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      fetchOpenAICompatibleModels('  nk-test  ', 'https://nodekey.xinghanyun.cn/v1/')
    ).resolves.toEqual([
      { id: 'claude-compatible', ownedBy: undefined },
      { id: 'gpt-4o-mini', ownedBy: 'openai' },
    ])

    expect(fetchMock).toHaveBeenCalledWith(
      'https://nodekey.xinghanyun.cn/v1/models',
      expect.objectContaining({
        method: 'GET',
        headers: { Authorization: 'Bearer nk-test' },
        signal: expect.any(AbortSignal),
      })
    )
  })

  it('surfaces upstream response status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    } as Partial<Response>))

    await expect(
      fetchOpenAICompatibleModels('nk-test', 'https://nodekey.xinghanyun.cn/v1')
    ).rejects.toThrow('模型获取失败：401')
  })

  it('wraps browser network failures with an actionable message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    await expect(
      fetchOpenAICompatibleModels('nk-test', 'https://nodekey.xinghanyun.cn/v1')
    ).rejects.toThrow('模型获取失败，请检查 API Key、BaseURL 或网络权限')
  })
})
