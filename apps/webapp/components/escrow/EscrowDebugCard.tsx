import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface EscrowData {
  id: string
  amount: number
  description: string
  status: string
  createdAt: string
  updatedAt: string
  recipientAddress: string
  senderAddress: string
  [key: string]: string | number | boolean | null | undefined
}

interface EscrowDebugCardProps {
  escrow: EscrowData
}

export default function EscrowDebugCard({ escrow }: EscrowDebugCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'created':
        return 'default'
      case 'completed':
      case 'released':
        return 'default'
      case 'cancelled':
      case 'disputed':
        return 'destructive'
      case 'pending':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const formatValue = (key: string, value: string | number | boolean | null | undefined) => {
    if (value === null || value === undefined) {
      return 'N/A'
    }

    // Format dates
    if (key.includes('Date') || key.includes('At')) {
      try {
        return new Date(value.toString()).toLocaleString()
      } catch {
        return value.toString()
      }
    }

    // Format addresses
    if (key.toLowerCase().includes('address')) {
      return value.toString()
    }

    // Format amounts
    if (key.toLowerCase().includes('amount')) {
      return typeof value === 'number' ? value.toLocaleString() : value.toString()
    }

    return value.toString()
  }

  const importantFields = ['id', 'status', 'amount', 'description', 'senderAddress', 'recipientAddress', 'createdAt', 'updatedAt']
  const otherFields = Object.keys(escrow).filter(key => !importantFields.includes(key))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Escrow Contract Details
              <Badge variant={getStatusVariant(escrow.status)}>
                {escrow.status || 'Unknown'}
              </Badge>
            </CardTitle>
            <CardDescription>
              ID: {escrow.id}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Key Information */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
              Key Information
            </h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Field</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importantFields.map(key => {
                  if (escrow[key] !== undefined) {
                    return (
                      <TableRow key={key}>
                        <TableCell className="font-medium">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {formatValue(key, escrow[key])}
                        </TableCell>
                      </TableRow>
                    )
                  }
                  return null
                })}
              </TableBody>
            </Table>
          </div>

          {/* Additional Fields */}
          {otherFields.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
                Additional Fields
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Field</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherFields.map(key => (
                    <TableRow key={key}>
                      <TableCell className="font-medium">
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatValue(key, escrow[key])}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Raw JSON */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
              Raw JSON Data
            </h4>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-64">
              {JSON.stringify(escrow, null, 2)}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 