'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Globe, Copy } from 'lucide-react'

export const MockSettingPage = () => {
  const [settings, setSettings] = useState({
    formId: 'cmb3q3pp10004hzkctgvwbg28',
    formName: 'Kleem AI careers',
    isPublished: true,
    primaryColor: '#0066FF',
    showBranding: true,
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg sm:text-xl font-semibold">Form Settings</h1>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Published
          </Badge>
        </div>
        <Button variant="ghost" size="sm">
          Close
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row flex-1 h-[calc(100%-130px)] overflow-hidden">
        {/* Left Panel */}
        <div className="w-full lg:w-[400px] border-b lg:border-b-0 lg:border-r flex flex-col">
          <Tabs defaultValue="sharing" className="flex flex-col h-full">
            <TabsList className="flex w-full border-b px-1 h-12 shrink-0">
              <TabsTrigger
                value="general"
                className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none"
              >
                General
              </TabsTrigger>
              <TabsTrigger
                value="sharing"
                className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none"
              >
                Sharing
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none"
              >
                Appearance
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-6">
                <TabsContent value="general" className="mt-0 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="form-title">Form Title</Label>
                      <Input
                        id="form-title"
                        value={settings.formName}
                        onChange={(e) =>
                          setSettings({ ...settings, formName: e.target.value })
                        }
                        className="bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Form Status</Label>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div>Published</div>
                          <div className="text-sm text-gray-500">
                            Your form is live and accessible to users
                          </div>
                        </div>
                        <Switch
                          checked={settings.isPublished}
                          onCheckedChange={(checked) =>
                            setSettings({ ...settings, isPublished: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="sharing" className="mt-0 space-y-6">
                  {/* Direct Link Section */}
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold">Direct Link</h3>
                    <p className="text-sm text-gray-500">
                      Share this link with your users to access the form
                      directly
                    </p>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={`http://localhost:3000/f/${settings.formId}`}
                        className="bg-gray-50 text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Embed Code Section */}
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold">Embed Code</h3>
                    <p className="text-sm text-gray-500">
                      Add this code to your website to embed the conversational
                      form
                    </p>
                    <div className="relative">
                      <pre className="bg-gray-50 p-3 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">
                        {`<script\n  src="https://kleem.ai/embed.js"\n  data-form-id="${settings.formId}"\n></script>`}
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute right-2 top-2"
                      >
                        Copy Code
                      </Button>
                    </div>
                  </div>

                  {/* Help Section */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex gap-3">
                      <Globe className="h-5 w-5 text-blue-500 shrink-0" />
                      <div>
                        <h4 className="font-medium">Need help embedding?</h4>
                        <p className="text-sm text-gray-600">
                          Check out our{' '}
                          <a href="#" className="text-blue-500 hover:underline">
                            embedding guide
                          </a>{' '}
                          for step-by-step instructions.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="appearance" className="mt-0 space-y-6">
                  {/* Theme Color Section */}
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold">Theme Color</h3>
                    <div className="flex gap-3">
                      <div
                        className="w-10 h-10 rounded-lg border shadow-sm shrink-0"
                        style={{ backgroundColor: settings.primaryColor }}
                      />
                      <Input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            primaryColor: e.target.value,
                          })
                        }
                        className="h-10 w-full"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      This color will be used for buttons and accents in your
                      form
                    </p>
                  </div>

                  {/* Quick Colors */}
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold">Quick Colors</h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        '#0066FF',
                        '#10B981',
                        '#8B5CF6',
                        '#EF4444',
                        '#F59E0B',
                        '#6366F1',
                      ].map((color) => (
                        <button
                          key={color}
                          className="w-10 h-10 rounded-lg border shadow-sm shrink-0"
                          style={{ backgroundColor: color }}
                          onClick={() =>
                            setSettings({ ...settings, primaryColor: color })
                          }
                        />
                      ))}
                    </div>
                  </div>

                  {/* Branding Section */}
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold">
                      Kleem AI Branding
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm text-gray-500">
                          Display &quot;Powered by Kleem AI&quot; in the form
                          footer
                        </p>
                      </div>
                      <Switch
                        checked={settings.showBranding}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, showBranding: checked })
                        }
                      />
                    </div>
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Live Preview</h2>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Published
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm hidden sm:flex"
                >
                  <span className="flex items-center gap-1">
                    <Copy className="h-4 w-4" />
                    Embed Preview
                  </span>
                </Button>
              </div>
            </div>

            {/* Browser Preview */}
            <div className="border rounded-lg shadow-sm overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border-b">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 flex items-center gap-1.5 px-2 py-1 bg-white rounded text-xs text-gray-600">
                  <Globe className="w-3 h-3" />
                  <span className="truncate">
                    http://localhost:3000/f/{settings.formId}
                  </span>
                </div>
              </div>

              {/* Form Preview Content */}
              <div className="p-4 sm:p-6 min-h-[400px] bg-white">
                <div className="max-w-xl mx-auto space-y-6">
                  <h1 className="text-xl sm:text-2xl font-bold">
                    {settings.formName}
                  </h1>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0">
                      KA
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="text-sm sm:text-base">
                        &quot;Hey there! 👋 I&apos;m excited to get to know you
                        better. What&apos;s your name?&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              {settings.showBranding && (
                <div className="border-t p-3 text-center text-sm text-gray-500">
                  Powered by Kleem AI
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="border-t p-4 shrink-0">
        <Button
          variant="destructive"
          className="w-full bg-orange-500 hover:bg-orange-600"
          size="lg"
        >
          Unpublish Form
        </Button>
      </div>
    </div>
  )
}
