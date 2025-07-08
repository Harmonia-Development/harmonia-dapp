'use client'

import { ReactNode } from 'react'
import {
  TrustlessWorkConfig,
  development,
  mainNet,
} from '@trustless-work/escrow'

interface TrustlessWorkProviderProps {
  children: ReactNode
}

export function TrustlessWorkProvider({ children }: TrustlessWorkProviderProps) {
  // Get configuration from environment variables
  const apiKey = process.env.NEXT_PUBLIC_API_KEY || ""
  const isMainNet = process.env.NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK === 'mainnet'
  const baseURL = isMainNet ? mainNet : development

  return (
    <TrustlessWorkConfig baseURL={baseURL} apiKey={apiKey}>
      {children}
    </TrustlessWorkConfig>
  )
} 