'use client'

import type React from 'react'

import { useState, useRef } from 'react'
import type { Node, Edge } from 'reactflow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Check, Copy, Globe, Eye, EyeOff, Code } from 'lucide-react'
import { cn } from '@/lib/utils'
import FormPreview from './form-preview'
import type { FormSettings as FormSettingsType } from '@/types/form'

interface FormSettingsProps {
  nodes: Node[]
  edges: Edge[]
  startNode: Node | null
  formId: string
  formName: string
  isPublished: boolean
  primaryColor: string
  showBranding: boolean
  /**
   * Callback from the parent editor to update settings on the global form state
   */
  onUpdateSettings: (updates: Partial<FormSettingsType>) => void
  onClose: () => void
}

export default function FormSettings({
  nodes,
  edges,
  startNode,
  formId,
  formName,
  isPublished: initialPublished,
  primaryColor: initialColor,
  showBranding: initialBranding,
  onUpdateSettings,
  onClose,
}: FormSettingsProps) {
  const [isPublished, setIsPublished] = useState(initialPublished)
  const [formTitle, setFormTitle] = useState(
    formName || 'My Conversational Form'
  )
  const [primaryColor, setPrimaryColor] = useState(initialColor)
  const [showBranding, setShowBranding] = useState(initialBranding)
  const [linkCopied, setLinkCopied] = useState(false)
  const [embedCopied, setEmbedCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const linkInputRef = useRef<HTMLInputElement>(null)
  const embedCodeRef = useRef<HTMLTextAreaElement>(null)

  // Generate a shareable link
  const getShareableLink = () => {
    // Use a different route for public form responses
    return `${process.env.NEXT_PUBLIC_APP_URL}/f/${formId}`
  }

  // Generate embed code
  const getEmbedCode = () => {
    const colorHex = (primaryColor || '#3b82f6').replace('#', '')
    return `<script src="https://kleem.ai/embed.js" data-form-id="${formId}" data-color="${colorHex}" data-branding="${
      showBranding ? 'true' : 'false'
    }"></script>`
  }

  // Copy link to clipboard
  const copyLink = () => {
    if (linkInputRef.current) {
      linkInputRef.current.select()
      navigator.clipboard.writeText(linkInputRef.current.value)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }

  // Copy embed code to clipboard
  const copyEmbedCode = () => {
    if (embedCodeRef.current) {
      embedCodeRef.current.select()
      navigator.clipboard.writeText(embedCodeRef.current.value)
      setEmbedCopied(true)
      setTimeout(() => setEmbedCopied(false), 2000)
    }
  }

  // Update form status
  const togglePublishStatus = () => {
    const newStatus = !isPublished
    setIsPublished(newStatus)
    onUpdateSettings({ isPublished: newStatus })
  }

  // Persist changes when local states change
  const handleFormTitleChange = (val: string) => {
    setFormTitle(val)
    onUpdateSettings({ formName: val })
  }

  const handlePrimaryColorChange = (val: string) => {
    setPrimaryColor(val)
    onUpdateSettings({ primaryColor: val })
  }

  const handleShowBrandingChange = (val: boolean) => {
    setShowBranding(val)
    onUpdateSettings({ showBranding: val })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-hidden backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              Form Settings
            </h2>
            <Badge
              variant={isPublished ? 'default' : 'secondary'}
              className={cn(
                'text-xs font-medium',
                isPublished
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-50 text-amber-700'
              )}
            >
              {isPublished ? 'Published' : 'Draft'}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            Close
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Settings panel */}
          <div className="w-full lg:w-[380px] border-b lg:border-b-0 lg:border-r overflow-y-auto bg-gray-50/50">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <div className="px-6 py-4">
                <TabsList className="grid grid-cols-3 bg-gray-100/80 p-1 rounded-lg">
                  <TabsTrigger
                    value="general"
                    className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                  >
                    General
                  </TabsTrigger>
                  <TabsTrigger
                    value="sharing"
                    className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                  >
                    Sharing
                  </TabsTrigger>
                  <TabsTrigger
                    value="appearance"
                    className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                  >
                    Appearance
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 px-6 pb-6">
                <TabsContent value="general" className="space-y-6 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="form-title" className="text-gray-700">
                      Form Title
                    </Label>
                    <Input
                      id="form-title"
                      value={formTitle}
                      onChange={(e) => handleFormTitleChange(e.target.value)}
                      placeholder="Enter form title"
                      className="text-sm sm:text-base border-gray-200 focus:border-gray-300 focus:ring-gray-200"
                    />
                  </div>

                  <div className="space-y-4 rounded-lg border border-gray-200 p-4 bg-white">
                    <div className="space-y-1.5">
                      <Label htmlFor="publish-status" className="text-gray-700">
                        Form Status
                      </Label>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {isPublished
                          ? 'Your form is live and accessible to users'
                          : 'Your form is in draft mode and not publicly accessible'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        id="publish-status"
                        checked={isPublished}
                        onCheckedChange={togglePublishStatus}
                        className="data-[state=checked]:bg-green-500"
                      />
                      <Label
                        htmlFor="publish-status"
                        className="text-sm font-medium"
                      >
                        {isPublished ? 'Published' : 'Draft Mode'}
                      </Label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="sharing" className="space-y-6 mt-0">
                  <div className="space-y-4 rounded-lg border border-gray-200 p-4 bg-white">
                    <div className="space-y-2">
                      <Label className="text-sm sm:text-base font-medium text-gray-700">
                        Direct Link
                      </Label>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Share this link with your users to access the form
                        directly
                      </p>

                      <div className="flex mt-1.5">
                        <Input
                          ref={linkInputRef}
                          readOnly
                          value={getShareableLink()}
                          className="rounded-r-none font-mono text-xs sm:text-sm bg-gray-50 border-gray-200"
                        />
                        <Button
                          onClick={copyLink}
                          variant="secondary"
                          className={cn(
                            'rounded-l-none px-3 sm:px-4',
                            !isPublished && 'opacity-50 cursor-not-allowed'
                          )}
                          disabled={!isPublished}
                        >
                          {linkCopied ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {!isPublished && (
                        <p className="text-xs sm:text-sm text-amber-600 flex items-center gap-1.5 bg-amber-50 px-3 py-2 rounded-md">
                          <EyeOff className="h-3.5 w-3.5" />
                          Publish your form to enable sharing
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 rounded-lg border border-gray-200 p-4 bg-white">
                    <div className="space-y-2">
                      <Label className="text-sm sm:text-base font-medium text-gray-700">
                        Embed Code
                      </Label>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Add this code to your website to embed the
                        conversational form
                      </p>

                      <div className="mt-1.5">
                        <Textarea
                          ref={embedCodeRef}
                          readOnly
                          value={getEmbedCode()}
                          className="font-mono text-xs sm:text-sm h-24 bg-gray-50 border-gray-200"
                          disabled={!isPublished}
                        />
                        <div className="flex justify-end mt-2">
                          <Button
                            onClick={copyEmbedCode}
                            variant="outline"
                            size="sm"
                            disabled={!isPublished}
                            className={cn(
                              'text-xs sm:text-sm',
                              !isPublished && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            {embedCopied ? (
                              <Check className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 mr-1.5" />
                            )}
                            Copy Code
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Card className="border-blue-100">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-50 p-2 rounded-full">
                          <Globe className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            Need help embedding?
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Check out our{' '}
                            <a
                              href="#"
                              className="text-blue-600 hover:underline font-medium"
                            >
                              embedding guide
                            </a>{' '}
                            for step-by-step instructions.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-6 mt-0">
                  <div className="space-y-4 rounded-lg border border-gray-200 p-4 bg-white">
                    <div className="space-y-2">
                      <Label htmlFor="primary-color" className="text-gray-700">
                        Theme Color
                      </Label>
                      <div className="flex gap-3">
                        <div
                          className="w-10 h-10 rounded-lg border shadow-sm"
                          style={{ backgroundColor: primaryColor }}
                          aria-hidden="true"
                        ></div>
                        <Input
                          id="primary-color"
                          type="color"
                          value={primaryColor}
                          onChange={(e) =>
                            handlePrimaryColorChange(e.target.value)
                          }
                          className="w-full h-10 cursor-pointer border-gray-200"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        This color will be used for buttons and accents in your
                        form
                      </p>
                    </div>

                    <div className="pt-2">
                      <Label className="mb-3 block text-gray-700">
                        Quick Colors
                      </Label>
                      <div className="grid grid-cols-6 gap-2">
                        {[
                          { color: '#3b82f6', name: 'Blue' },
                          { color: '#10b981', name: 'Green' },
                          { color: '#8b5cf6', name: 'Purple' },
                          { color: '#f43f5e', name: 'Red' },
                          { color: '#f59e0b', name: 'Orange' },
                          { color: '#6366f1', name: 'Indigo' },
                        ].map(({ color, name }) => (
                          <TooltipProvider key={color}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className={cn(
                                    'h-8 rounded-md border-2 transition-all hover:scale-105',
                                    primaryColor === color
                                      ? 'border-gray-400 shadow-sm'
                                      : 'border-transparent'
                                  )}
                                  style={{ backgroundColor: color }}
                                  onClick={() =>
                                    handlePrimaryColorChange(color)
                                  }
                                />
                              </TooltipTrigger>
                              <TooltipContent>{name}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-lg border border-gray-200 p-4 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label
                          htmlFor="show-branding"
                          className="text-gray-700"
                        >
                          Kleem AI Branding
                        </Label>
                        <p className="text-sm text-gray-500">
                          Display &quot;Powered by Kleem AI&quot; in the form
                          footer
                        </p>
                      </div>
                      <Switch
                        id="show-branding"
                        checked={showBranding}
                        onCheckedChange={handleShowBrandingChange}
                      />
                    </div>
                  </div>
                </TabsContent>
              </div>

              <div className="px-6 py-4 border-t bg-white mt-auto">
                <Button
                  onClick={togglePublishStatus}
                  className={cn(
                    'w-full font-medium',
                    isPublished
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  )}
                >
                  {isPublished ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" /> Unpublish Form
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" /> Publish Form
                    </>
                  )}
                </Button>
              </div>
            </Tabs>
          </div>

          {/* Preview panel */}
          <div className="hidden lg:flex flex-1 flex-col bg-gray-50">
            <div className="px-6 py-4 border-b bg-white/50 backdrop-blur-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-medium text-gray-900">Live Preview</h3>
                <Badge
                  variant={isPublished ? 'default' : 'secondary'}
                  className={cn(
                    'text-xs',
                    isPublished
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-50 text-amber-700'
                  )}
                >
                  {isPublished ? 'Published' : 'Draft'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Code className="h-4 w-4" />
                Embed Preview
              </div>
            </div>

            <div className="flex-1 p-6 overflow-auto">
              <div className="max-w-[640px] mx-auto h-full bg-white rounded-xl border shadow-lg overflow-hidden flex flex-col">
                {/* Browser-like frame */}
                <div className="bg-gray-100/70 border-b px-4 py-2.5 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 flex items-center">
                    <div className="bg-white rounded-md border flex-1 px-3 py-1.5 text-sm text-gray-500 flex items-center">
                      <Globe className="h-3.5 w-3.5 mr-2 text-gray-400" />
                      {getShareableLink()}
                    </div>
                  </div>
                </div>

                {/* Form preview */}
                <div className="flex-1 overflow-auto">
                  {isPublished ? (
                    <FormPreview
                      nodes={nodes}
                      edges={edges}
                      startNode={startNode}
                      customStyles={{
                        primaryColor,
                        showBranding,
                        formTitle,
                      }}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <EyeOff className="h-8 w-8 text-gray-400" />
                      </div>
                      <h2 className="text-xl font-medium text-gray-900 mb-2">
                        Form is in Draft Mode
                      </h2>
                      <p className="text-gray-600 mb-6 max-w-md">
                        This form is currently not published. Only you can see
                        it. Publish it to make it available to users.
                      </p>
                      <Button
                        onClick={togglePublishStatus}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Eye className="mr-2 h-4 w-4" /> Publish Form
                      </Button>
                    </div>
                  )}
                </div>

                {/* Branding footer */}
                {showBranding && (
                  <div className="border-t py-2.5 px-4 text-xs text-center text-gray-500 bg-gray-50/50">
                    Powered by{' '}
                    <a
                      href="#"
                      className="font-medium text-gray-900 hover:underline"
                    >
                      Kleem AI
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
