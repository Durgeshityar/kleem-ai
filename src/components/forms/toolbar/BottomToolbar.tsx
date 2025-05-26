import { Panel } from 'reactflow'
import { Button } from '../../ui/button'
import { Toggle } from '../../ui/toggle'
import { Grid, Maximize, Minimize, PlayCircle, Settings } from 'lucide-react'

interface BottomToolbarProps {
  setIsSettingsOpen: (value: boolean) => void
  setIsPreviewMode: (value: boolean) => void
  snapToGrid: boolean
  setSnapToGrid: (value: boolean) => void
  isZoomedOut: boolean
  toggleZoom: () => void
}

const SettingsAndPreviewButtons = ({
  setIsSettingsOpen,
  setIsPreviewMode,
}: Pick<BottomToolbarProps, 'setIsSettingsOpen' | 'setIsPreviewMode'>) => (
  <div className="flex flex-wrap gap-2">
    <Button
      variant="outline"
      size="sm"
      onClick={() => setIsSettingsOpen(true)}
      className="flex items-center gap-1.5 bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 h-8"
    >
      <Settings className="h-4 w-4" />
      <span className="hidden sm:inline">Settings</span>
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={() => setIsPreviewMode(true)}
      className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 h-8"
    >
      <PlayCircle className="h-4 w-4" />
      <span className="hidden sm:inline">Preview</span>
    </Button>
  </div>
)

const GridAndZoomControls = ({
  snapToGrid,
  setSnapToGrid,
  isZoomedOut,
  toggleZoom,
}: Pick<
  BottomToolbarProps,
  'snapToGrid' | 'setSnapToGrid' | 'isZoomedOut' | 'toggleZoom'
>) => (
  <div className="flex gap-2">
    <Toggle
      pressed={snapToGrid}
      onPressedChange={setSnapToGrid}
      aria-label="Toggle snap to grid"
      className="shrink-0 h-8 w-8"
    >
      <Grid className="h-4 w-4" />
    </Toggle>
    <Button
      variant="outline"
      size="icon"
      onClick={toggleZoom}
      className="shrink-0 h-8 w-8"
    >
      {isZoomedOut ? (
        <Maximize className="h-4 w-4" />
      ) : (
        <Minimize className="h-4 w-4" />
      )}
    </Button>
  </div>
)

export const BottomToolbar = ({
  setIsSettingsOpen,
  setIsPreviewMode,
  snapToGrid,
  setSnapToGrid,
  isZoomedOut,
  toggleZoom,
}: BottomToolbarProps) => {
  return (
    <Panel
      position="bottom-left"
      className="flex flex-wrap gap-2 m-2 max-w-[calc(100vw-1rem)]"
    >
      <SettingsAndPreviewButtons
        setIsSettingsOpen={setIsSettingsOpen}
        setIsPreviewMode={setIsPreviewMode}
      />
      <GridAndZoomControls
        snapToGrid={snapToGrid}
        setSnapToGrid={setSnapToGrid}
        isZoomedOut={isZoomedOut}
        toggleZoom={toggleZoom}
      />
    </Panel>
  )
}
