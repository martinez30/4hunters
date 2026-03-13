'use client'
import { createContext, useContext, useState } from 'react'

type AIProvider = 'anthropic' | 'gemini' | 'openai'

interface ProviderContextType {
  provider: AIProvider | null
  setProvider: (p: AIProvider) => void
}

const ProviderContext = createContext<ProviderContextType>({
  provider: null,
  setProvider: () => {},
})

export function ProviderContextProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<AIProvider | null>(null)
  return (
    <ProviderContext.Provider value={{ provider, setProvider }}>
      {children}
    </ProviderContext.Provider>
  )
}

export const useProvider = () => useContext(ProviderContext)
