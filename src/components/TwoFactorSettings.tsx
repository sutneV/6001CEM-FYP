"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Shield, Loader2, Copy, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface TwoFactorSettingsProps {
  user: any
  twoFactorEnabled?: boolean
}

export function TwoFactorSettings({ user, twoFactorEnabled }: TwoFactorSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [step, setStep] = useState<'qr' | 'verify' | 'backup'>('qr')

  const handleSetup2FA = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'x-user-data': JSON.stringify(user),
        },
      })

      if (!response.ok) {
        throw new Error('Failed to setup 2FA')
      }

      const data = await response.json()
      setQrCode(data.qrCode)
      setSecret(data.secret)
      setBackupCodes(data.backupCodes)
      setStep('qr')
      setShowSetupDialog(true)
    } catch (error) {
      toast.error('Failed to setup 2FA')
      console.error(error)
    }
    setIsLoading(false)
  }

  const handleVerifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-data': JSON.stringify(user),
        },
        body: JSON.stringify({
          secret,
          token: verificationCode,
          backupCodes,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to enable 2FA')
      }

      setStep('backup')
      toast.success('2FA enabled successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Invalid verification code')
      console.error(error)
    }
    setIsLoading(false)
  }

  const handleDisable2FA = async () => {
    if (!disableCode) {
      toast.error('Please enter your verification code')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-data': JSON.stringify(user),
        },
        body: JSON.stringify({
          token: disableCode,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to disable 2FA')
      }

      toast.success('2FA disabled successfully')
      setShowDisableDialog(false)
      setDisableCode('')
      // Reload page to update 2FA status
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || 'Invalid verification code')
      console.error(error)
    }
    setIsLoading(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const downloadBackupCodes = () => {
    const element = document.createElement('a')
    const file = new Blob([backupCodes.join('\n')], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = '2fa-backup-codes.txt'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success('Backup codes downloaded!')
  }

  const handleFinishSetup = () => {
    setShowSetupDialog(false)
    setStep('qr')
    setVerificationCode('')
    // Reload page to update 2FA status
    window.location.reload()
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-teal-600" />
              <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
            </div>
            <p className="text-sm text-gray-600">
              Add an extra layer of security to your account
            </p>
          </div>
          {twoFactorEnabled && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Enabled</span>
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">What is Two-Factor Authentication?</p>
            <p>
              2FA adds an extra layer of security by requiring a verification code from your
              authenticator app (like Google Authenticator or Authy) in addition to your password.
            </p>
          </div>
        </div>

        {twoFactorEnabled ? (
          <Button
            variant="destructive"
            onClick={() => setShowDisableDialog(true)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Disable 2FA'
            )}
          </Button>
        ) : (
          <Button
            onClick={handleSetup2FA}
            disabled={isLoading}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Enable 2FA
              </>
            )}
          </Button>
        )}
      </div>

      {/* Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {step === 'qr' && 'Scan QR Code'}
              {step === 'verify' && 'Verify Code'}
              {step === 'backup' && 'Backup Codes'}
            </DialogTitle>
            <DialogDescription>
              {step === 'qr' && 'Scan this QR code with your authenticator app'}
              {step === 'verify' && 'Enter the 6-digit code from your authenticator app'}
              {step === 'backup' && 'Save these backup codes in a safe place'}
            </DialogDescription>
          </DialogHeader>

          {step === 'qr' && (
            <div className="space-y-4">
              <div className="flex justify-center p-4 bg-white border rounded-lg">
                <Image src={qrCode} alt="QR Code" width={200} height={200} />
              </div>
              <div className="space-y-2">
                <Label>Or enter this code manually:</Label>
                <div className="flex gap-2">
                  <Input value={secret} readOnly className="font-mono" />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(secret)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button onClick={() => setStep('verify')} className="w-full">
                Next
              </Button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-4 w-full">
              <div className="space-y-2">
                <Label>Verification Code</Label>
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('qr')}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleVerifyAndEnable}
                  disabled={isLoading}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify'
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 'backup' && (
            <div className="space-y-4 w-full">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900 font-medium">
                  Save these backup codes! You can use them to access your account if you lose your
                  authenticator device.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index} className="text-center py-1">
                    {code}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={downloadBackupCodes}
                >
                  Download
                </Button>
                <Button
                  type="button"
                  onClick={() => copyToClipboard(backupCodes.join('\n'))}
                  variant="outline"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy All
                </Button>
              </div>
              <Button
                type="button"
                onClick={handleFinishSetup}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                Finish
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter a verification code from your authenticator app or a backup code to disable 2FA
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Verification Code</Label>
              <Input
                type="text"
                placeholder="Enter code"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value)}
                className="text-center"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDisableDialog(false)
                  setDisableCode('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDisable2FA}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disabling...
                  </>
                ) : (
                  'Disable 2FA'
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
