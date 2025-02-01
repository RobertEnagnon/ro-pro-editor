"use client"

// Importation des hooks React nécessaires
import { useState, useRef, useCallback, useEffect } from "react"

// Importation des composants UI de shadcn/ui
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Importation des icônes de Lucide React
import {
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Upload,
  Download,
  Wand2,
  Loader2,
  Undo,
  Redo,
  Paintbrush,
  Eraser,
} from "lucide-react"

// Importation de l'utilitaire pour combiner les classes CSS
import { cn } from "@/lib/utils"

// Importation du composant SketchPicker de react-color pour le sélecteur de couleur
import { SketchPicker } from "react-color"

// Définition de l'interface pour l'état des filtres
interface FilterState {
  brightness: number
  saturation: number
  inversion: number
  grayscale: number
  contrast: number
  exposure: number
  temperature: number
}

// Définition de l'interface pour l'état des transformations
interface TransformState {
  rotate: number
  flipH: number
  flipV: number
}

// Définition de l'interface pour l'état de l'historique
interface HistoryState {
  filters: FilterState
  transform: TransformState
}

// Définition des filtres prédéfinis
const presetFilters = {
  normal: { brightness: 100, saturation: 100, contrast: 100, exposure: 100, temperature: 0 },
  clarendon: { brightness: 110, saturation: 130, contrast: 120, exposure: 105, temperature: 100 },
  gingham: { brightness: 105, saturation: 90, contrast: 95, exposure: 100, temperature: -30 },
  moon: { brightness: 110, saturation: 0, contrast: 110, exposure: 100, temperature: 0 },
  lark: { brightness: 105, saturation: 110, contrast: 95, exposure: 100, temperature: 10 },
}

// Composant principal de l'éditeur de photos
export default function PhotoEditor() {
  // État pour stocker l'URL de l'image actuelle
  const [image, setImage] = useState<string>("/undraw_photos_re_pvh3.svg")
  // État pour gérer le chargement lors de la suppression de l'arrière-plan
  const [loading, setLoading] = useState(false)
  // État pour les valeurs des filtres
  const [filters, setFilters] = useState<FilterState>({
    brightness: 100,
    saturation: 100,
    inversion: 0,
    grayscale: 0,
    contrast: 100,
    exposure: 100,
    temperature: 0,
  })
  // État pour les transformations (rotation et retournement)
  const [transform, setTransform] = useState<TransformState>({
    rotate: 0,
    flipH: 1,
    flipV: 1,
  })
  // État pour l'historique des modifications
  const [history, setHistory] = useState<HistoryState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  // État pour le mode de dessin actif
  const [drawMode, setDrawMode] = useState<"brush" | "eraser" | null>(null)
  // État pour la couleur du pinceau
  const [brushColor, setBrushColor] = useState("#000000")
  // État pour la taille du pinceau
  const [brushSize, setBrushSize] = useState(5)
  // État pour le texte à ajouter sur l'image
  const [text, setText] = useState("")
  // État pour la position du texte
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 })
  // État pour la couleur du texte
  const [textColor, setTextColor] = useState("#000000")
  // État pour la taille du texte
  const [textSize, setTextSize] = useState(20)
  // État pour indiquer si le dessin est actif
  const [isDrawing, setIsDrawing] = useState(false)

  // Références pour accéder aux éléments DOM
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Effet pour initialiser l'historique
  useEffect(() => {
    if (historyIndex === -1) {
      setHistory([{ filters, transform }])
      setHistoryIndex(0)
    }
  }, [historyIndex, filters, transform])

  // Fonction pour gérer le changement de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImage(url)
      resetFilters()
    }
  }

  // Fonction pour réinitialiser tous les filtres et transformations
  const resetFilters = () => {
    setFilters({
      brightness: 100,
      saturation: 100,
      inversion: 0,
      grayscale: 0,
      contrast: 100,
      exposure: 100,
      temperature: 0,
    })
    setTransform({
      rotate: 0,
      flipH: 1,
      flipV: 1,
    })
    addToHistory()
  }

  // Fonction pour gérer la rotation de l'image
  const handleRotate = (direction: "left" | "right") => {
    setTransform((prev) => {
      const newTransform = {
        ...prev,
        rotate: prev.rotate + (direction === "left" ? -90 : 90),
      }
      addToHistory(filters, newTransform)
      return newTransform
    })
  }

  // Fonction pour gérer le retournement de l'image
  const handleFlip = (direction: "horizontal" | "vertical") => {
    setTransform((prev) => {
      const newTransform = {
        ...prev,
        [direction === "horizontal" ? "flipH" : "flipV"]:
          prev[direction === "horizontal" ? "flipH" : "flipV"] === 1 ? -1 : 1,
      }
      addToHistory(filters, newTransform)
      return newTransform
    })
  }

  // Fonction pour ajouter un état à l'historique
  const addToHistory = (newFilters = filters, newTransform = transform) => {
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), { filters: newFilters, transform: newTransform }])
    setHistoryIndex((prev) => prev + 1)
  }

  // Fonction pour annuler la dernière modification
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1)
      const prevState = history[historyIndex - 1]
      setFilters(prevState.filters)
      setTransform(prevState.transform)
    }
  }

  // Fonction pour rétablir la dernière modification annulée
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1)
      const nextState = history[historyIndex + 1]
      setFilters(nextState.filters)
      setTransform(nextState.transform)
    }
  }

  // Fonction pour appliquer un filtre prédéfini
  const applyPresetFilter = (preset: keyof typeof presetFilters) => {
    setFilters((prev) => {
      const newFilters = { ...prev, ...presetFilters[preset] }
      addToHistory(newFilters, transform)
      return newFilters
    })
  }

  // Fonction pour sauvegarder l'image éditée
  const saveImage = useCallback(async () => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = imageRef.current

    if (!ctx || !img) return

    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight

    // Application des filtres
    ctx.filter = `brightness(${filters.brightness}%) saturate(${filters.saturation}%) 
                  invert(${filters.inversion}%) grayscale(${filters.grayscale}%)
                  contrast(${filters.contrast}%) sepia(${filters.temperature}%)`

    // Application des transformations
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((transform.rotate * Math.PI) / 180)
    ctx.scale(transform.flipH, transform.flipV)
    ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height)

    // Ajout du texte
    ctx.font = `${textSize}px Arial`
    ctx.fillStyle = textColor
    ctx.fillText(text, textPosition.x, textPosition.y)

    // Création et déclenchement du téléchargement
    const link = document.createElement("a")
    link.download = "image-editee.jpg"
    link.href = canvas.toDataURL("image/jpeg", 0.8)
    link.click()
  }, [filters, transform, text, textPosition, textColor, textSize])

  // Fonction pour supprimer l'arrière-plan de l'image
  const removeBackground = async () => {
    if (!fileInputRef.current?.files?.[0]) return

    setLoading(true)
    const formData = new FormData()
    formData.append("image_file", fileInputRef.current.files[0])
    formData.append("size", "regular")

    try {
      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY || "",
        },
        body: formData,
      })

      const blob = await response.blob()
      setImage(URL.createObjectURL(blob))
    } catch (error) {
      console.error("Error removing background:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour commencer le dessin
  const handleDrawStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Vérifier si un mode de dessin est actif
    if (!drawMode) return

    // Activer le dessin
    setIsDrawing(true)

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.strokeStyle = drawMode === "brush" ? brushColor : "#FFFFFF"
    ctx.lineWidth = brushSize
    ctx.lineCap = "round"
  }

  // Fonction pour dessiner
  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Vérifier si le dessin est actif et si un mode de dessin est sélectionné
    if (!isDrawing || !drawMode) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    // const x = e.clientX 
    const y = e.clientY - rect.top
    // const y = e.clientY

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  // Ajouter une fonction pour arrêter le dessin
  const handleDrawEnd = () => {
    setIsDrawing(false)
  }

  // Fonction pour activer/désactiver le mode dessin
  const toggleDrawMode = (mode: "brush" | "eraser" | null) => {
    setDrawMode((prevMode) => (prevMode === mode ? null : mode))
    setIsDrawing(false) // Réinitialiser l'état de dessin lors du changement de mode
  }

  // Rendu du composant
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card className="bg-background">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-6">Éditeur de Photos Pro</h1>

          <div className="grid md:grid-cols-[300px,1fr] gap-6">
            {/* Panneau de contrôle */}
            <div className="space-y-6">
              <Tabs defaultValue="filters" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="filters" className="flex-1">
                    Filtres
                  </TabsTrigger>
                  <TabsTrigger value="transform" className="flex-1">
                    Transformer
                  </TabsTrigger>
                  <TabsTrigger value="draw" className="flex-1">
                    Dessiner
                  </TabsTrigger>
                  <TabsTrigger value="text" className="flex-1">
                    Texte
                  </TabsTrigger>
                </TabsList>

                {/* Onglet des filtres */}
                <TabsContent value="filters" className="space-y-4">
                  <div className="space-y-4">
                    {Object.entries(filters).map(([key, value]) => (
                      <div key={key}>
                        <Label className="text-sm font-medium mb-2 block">
                          {key.charAt(0).toUpperCase() + key.slice(1)}: {value}%
                        </Label>
                        <Slider
                          value={[value]}
                          min={0}
                          max={key === "temperature" ? 200 : 200}
                          step={1}
                          onValueChange={([newValue]) => {
                            setFilters((prev) => {
                              const newFilters = { ...prev, [key]: newValue }
                              addToHistory(newFilters, transform)
                              return newFilters
                            })
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <Select onValueChange={(value: keyof typeof presetFilters) => applyPresetFilter(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un filtre prédéfini" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(presetFilters).map((preset) => (
                        <SelectItem key={preset} value={preset}>
                          {preset.charAt(0).toUpperCase() + preset.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TabsContent>

                {/* Onglet des transformations */}
                <TabsContent value="transform" className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => handleRotate("left")} className="w-full">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Rotation Gauche
                    </Button>
                    <Button variant="outline" onClick={() => handleRotate("right")} className="w-full">
                      <RotateCw className="w-4 h-4 mr-2" />
                      Rotation Droite
                    </Button>
                    <Button variant="outline" onClick={() => handleFlip("horizontal")} className="w-full">
                      <FlipHorizontal className="w-4 h-4 mr-2" />
                      Retourner H
                    </Button>
                    <Button variant="outline" onClick={() => handleFlip("vertical")} className="w-full">
                      <FlipVertical className="w-4 h-4 mr-2" />
                      Retourner V
                    </Button>
                  </div>
                </TabsContent>

                {/* Onglet de dessin */}
                <TabsContent value="draw" className="space-y-4">
                  <div className="space-y-2">
                    <Button
                      variant={drawMode === "brush" ? "default" : "outline"}
                      onClick={() => toggleDrawMode("brush")}
                      className="w-full"
                    >
                      <Paintbrush className="w-4 h-4 mr-2" />
                      {drawMode === "brush" ? "Désactiver" : "Activer"} Pinceau
                    </Button>
                    <Button
                      variant={drawMode === "eraser" ? "default" : "outline"}
                      onClick={() => toggleDrawMode("eraser")}
                      className="w-full"
                    >
                      <Eraser className="w-4 h-4 mr-2" />
                      {drawMode === "eraser" ? "Désactiver" : "Activer"} Gomme
                    </Button>
                    <div className="flex items-center space-x-2">
                      <Label>Couleur:</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-[80px] h-[25px]"
                            style={{ backgroundColor: brushColor }}
                          />
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <SketchPicker color={brushColor} onChange={(color) => setBrushColor(color.hex)} />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label>Taille du pinceau: {brushSize}px</Label>
                      <Slider
                        value={[brushSize]}
                        min={1}
                        max={50}
                        step={1}
                        onValueChange={([value]) => setBrushSize(value)}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Onglet de texte */}
                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Texte:</Label>
                    <Input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Entrez votre texte ici"
                    />
                    <div className="flex items-center space-x-2">
                      <Label>Couleur:</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-[80px] h-[25px]"
                            style={{ backgroundColor: textColor }}
                          />
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <SketchPicker color={textColor} onChange={(color) => setTextColor(color.hex)} />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label>Taille du texte: {textSize}px</Label>
                      <Slider
                        value={[textSize]}
                        min={10}
                        max={100}
                        step={1}
                        onValueChange={([value]) => setTextSize(value)}
                      />
                    </div>
                    <div>
                      <Label>Position X: {textPosition.x}</Label>
                      <Slider
                        value={[textPosition.x]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={([value]) => setTextPosition((prev) => ({ ...prev, x: value }))}
                      />
                    </div>
                    <div>
                      <Label>Position Y: {textPosition.y}</Label>
                      <Slider
                        value={[textPosition.y]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={([value]) => setTextPosition((prev) => ({ ...prev, y: value }))}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Boutons d'action principaux */}
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  aria-label="Sélectionner une image à éditer"
                />
                <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Choisir une image
                </Button>
                <Button variant="outline" className="w-full" onClick={resetFilters}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>
                <Button className="w-full" onClick={saveImage}>
                  <Download className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
                <Button variant="secondary" className="w-full" onClick={removeBackground} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                  Supprimer l'arrière-plan
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={undo} disabled={historyIndex <= 0}>
                    <Undo className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                  <Button variant="outline" onClick={redo} disabled={historyIndex >= history.length - 1}>
                    <Redo className="w-4 h-4 mr-2" />
                    Rétablir
                  </Button>
                </div>
              </div>
            </div>

            {/* Zone d'aperçu de l'image */}
            <div className="relative min-h-[400px] border rounded-lg overflow-hidden bg-muted/10">
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  ref={imageRef}
                  src={image || "/undraw_photos_re_pvh3.svg"}
                  alt="Aperçu de l'image"
                  className={cn(
                    "max-w-full max-h-full object-contain transition-transform duration-200",
                    loading && "opacity-50",
                  )}
                  style={{
                    filter: `brightness(${filters.brightness}%) saturate(${filters.saturation}%) 
                            invert(${filters.inversion}%) grayscale(${filters.grayscale}%)
                            contrast(${filters.contrast}%) sepia(${filters.temperature}%)`,
                    transform: `rotate(${transform.rotate}deg) scale(${transform.flipH}, ${transform.flipV})`,
                  }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                  onMouseDown={handleDrawStart}
                  onMouseMove={handleDraw}
                  onMouseUp={handleDrawEnd}
                  onMouseLeave={handleDrawEnd}
                />
                <div
                  className="absolute"
                  style={{
                    left: `${textPosition.x}%`,
                    top: `${textPosition.y}%`,
                    color: textColor,
                    fontSize: `${textSize}px`,
                  }}
                >
                  {text}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

