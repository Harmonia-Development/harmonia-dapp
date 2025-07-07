'use client'

import { useState } from 'react'
import {
  useInitializeEscrow,
  useSendTransaction,
} from "@trustless-work/escrow/hooks"
import {
  InitializeMultiReleaseEscrowPayload,
  InitializeSingleReleaseEscrowPayload
} from "@trustless-work/escrow/types"
import { useWallet } from '@/lib/wallet/context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

export default function EscrowTestPage() {
  const [contractId, setContractId] = useState<string>('')
  const [escrowData, setEscrowData] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [escrowType, setEscrowType] = useState<'single-release' | 'multi-release'>('multi-release')

  // Form data for escrow creation
  const [formData, setFormData] = useState({
    title: 'Demo Escrow Contract',
    description: 'Test escrow for Harmonia DAO integration',
    amount: '1000',
    platformFee: '100',
    receiverAddress: '',
    approverAddress: '',
    markerAddress: '',
    releaserAddress: '',
    resolverAddress: ''
  })

  // Environment variables for display
  const apiKey = process.env.NEXT_PUBLIC_TRUSTLESS_WORK_API_KEY
  const network = process.env.NEXT_PUBLIC_TRUSTLESS_WORK_NETWORK || 'development'
  const isMainNet = network === 'mainnet'

  // Wallet integration
  const { isConnected, address, signTransaction } = useWallet()

  // Trustless Work hooks
  const { deployEscrow } = useInitializeEscrow()
  const { sendTransaction } = useSendTransaction()

  // Toast for notifications
  const { toast } = useToast()

  const createEscrowPayload = (): InitializeSingleReleaseEscrowPayload | InitializeMultiReleaseEscrowPayload => {
    const basePayload = {
      signer: address || '',
      engagementId: `harmonia-demo-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      roles: {
        serviceProvider: formData.receiverAddress || address || '',
        platformAddress: address || '',
        releaseSigner: formData.releaserAddress || address || '',
        disputeResolver: formData.resolverAddress || address || ''
      },
      // trustline: {
      //   address: 'USDC-GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5', // Testnet USDC
      //   decimals: 6
      // },
      platformFee: Number(formData.platformFee) * 1000000
    }

    if (escrowType === 'multi-release') {
      return {
        ...basePayload,
        milestones: [
          {
            description: 'Milestone 1',
            amount: Math.floor(Number(formData.amount) * 1000000 * 0.5) // 50%
          },
          {
            description: 'Milestone 2',
            amount: Math.floor(Number(formData.amount) * 1000000 * 0.5) // 50%
          }
        ]
      } as InitializeMultiReleaseEscrowPayload
    } else {
      return {
        ...basePayload,
        amount: Number(formData.amount) * 1000000, // Convert to microunits (6 decimals)
        milestones: [{
          description: 'Milestone 1',
        }]
      } as InitializeSingleReleaseEscrowPayload
    }
  }

  const handleCreateEscrow = async () => {
    if (!apiKey) {
      setError('API key is required. Please check your environment variables.')
      return
    }

    if (!isConnected || !address) {
      setError('Please connect your Stellar wallet first.')
      return
    }

    setIsLoading(true)
    setError('')
    setEscrowData('')

    try {
      // Step 1: Create the payload
      const payload = createEscrowPayload()

      console.log('Creating escrow with payload:', payload)

      // Step 2: Deploy escrow (get unsigned transaction)
      const { unsignedTransaction } = await deployEscrow(
        payload,
        escrowType
      )

      if (!unsignedTransaction) {
        throw new Error('Unsigned transaction is missing from deployEscrow response.')
      }

      console.log('Unsigned transaction received:', unsignedTransaction)

      // Step 3: Sign the transaction using wallet
      const signedResult = await signTransaction(unsignedTransaction)

      if (!signedResult?.signedTxXdr) {
        throw new Error('Signed transaction is missing.')
      }

      console.log('Transaction signed successfully')

      // Step 4: Send the signed transaction
      const result = await sendTransaction(signedResult.signedTxXdr)

      console.log('Transaction result:', result)

      // Step 5: Handle response
      if (result.status === 'SUCCESS') {
        toast({
          title: "Success!",
          description: "Escrow created successfully",
        })
        setError('✅ Escrow created successfully!')
        setEscrowData(JSON.stringify({
          status: 'SUCCESS',
          escrowType,
          transactionResult: result,
          payload: payload,
          signedBy: address,
          timestamp: new Date().toISOString()
        }, null, 2))
      } else {
        throw new Error(`Transaction failed with status: ${result.status}`)
      }

    } catch (err) {
      console.error('Failed to create escrow:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create escrow'
      setError(`❌ ${errorMessage}`)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFetchEscrow = async () => {
    if (!contractId.trim()) {
      setError('Please enter a contract ID')
      return
    }

    setError('Fetching escrow functionality will be implemented once we have created escrows to fetch.')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Demo Escrow UI
        </h1>
        <p className="text-muted-foreground">
          Create real Trustless Work escrows using deployEscrow → signTransaction → sendTransaction flow
        </p>
        <div className="flex gap-2 mt-4 flex-wrap">
          <Badge variant={isMainNet ? "default" : "secondary"}>
            {isMainNet ? "MainNet" : "Development"}
          </Badge>
          <Badge variant={apiKey ? "default" : "destructive"}>
            {apiKey ? "API Key Configured" : "API Key Missing"}
          </Badge>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Wallet Connected" : "Wallet Disconnected"}
          </Badge>
          {isConnected && address && (
            <Badge variant="outline" className="font-mono text-xs">
              {`${address.slice(0, 4)}...${address.slice(-4)}`}
            </Badge>
          )}
        </div>
      </div>

      {error && (
        <div className={`mb-6 p-4 rounded-lg border ${error.includes('✅')
          ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200'
          : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200'
          }`}>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Create Escrow Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create Escrow</CardTitle>
            <CardDescription>
              Configure and deploy a new Trustless Work escrow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount (USDC)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="escrowType">Escrow Type</Label>
              <Select value={escrowType} onValueChange={(value: 'single-release' | 'multi-release') => setEscrowType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multi-release">Multi-Release (2 milestones)</SelectItem>
                  <SelectItem value="single-release">Single-Release</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="receiverAddress">Receiver Address (optional)</Label>
              <Input
                id="receiverAddress"
                placeholder={`Default: ${address ? `${address.slice(0, 8)}...` : 'Your wallet'}`}
                value={formData.receiverAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, receiverAddress: e.target.value }))}
              />
            </div>

            <Button
              onClick={handleCreateEscrow}
              disabled={isLoading || !apiKey || !isConnected}
              className="w-full"
            >
              {isLoading ? "Creating Escrow..." : "Create Escrow"}
            </Button>
          </CardContent>
        </Card>


        {/* Quick Test for Fetch */}
        <Card>
          <CardHeader>
            <CardTitle>Fetch Escrow by ID</CardTitle>
            <CardDescription>
              Test fetching escrow data (will be implemented after creating escrows)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contractId">Contract ID</Label>
              <Input
                id="contractId"
                placeholder="Enter escrow contract ID"
                value={contractId}
                onChange={(e) => setContractId(e.target.value)}
              />
            </div>
            <Button
              onClick={handleFetchEscrow}
              disabled={!contractId.trim()}
              className="w-full"
              variant="outline"
            >
              Fetch Escrow
            </Button>
          </CardContent>
        </Card>
      </div >

      {/* Escrow Result Display */}
      {
        escrowData && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Escrow Creation Result</CardTitle>
              <CardDescription>
                Complete transaction details and escrow information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
                {escrowData}
              </pre>
            </CardContent>
          </Card>
        )
      }

    </div >
  )
} 