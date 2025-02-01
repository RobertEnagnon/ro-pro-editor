"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  RotateCcw, RotateCw, FlipHorizontal, FlipVertical, Upload,
  Download, Wand2, Loader2, Undo, Redo, Paintbrush, Eraser,
  Image as ImageIcon, Sliders, Palette, Type
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SketchPicker } from "react-color"
import Image from "next/image"
import ContactSection from "@/components/ContactSection"

// Définition des interfaces pour la gestion des états
interface Filters {
  brightness: number
  saturation: number
  inversion: number
  grayscale: number
  contrast: number
  temperature: number
}

interface Transform {
  rotate: number
  flipH: number
  flipV: number
}

interface TextPosition {
  x: number
  y: number
}

// Valeurs par défaut des filtres
const DEFAULT_FILTERS: Filters = {
  brightness: 100,
  saturation: 100,
  inversion: 0,
  grayscale: 0,
  contrast: 100,
  temperature: 0
}

// Valeurs par défaut des transformations
const DEFAULT_TRANSFORM: Transform = {
  rotate: 0,
  flipH: 1,
  flipV: 1
}

// Filtres prédéfinis
const presetFilters = {
  normal: DEFAULT_FILTERS,
  warm: {
    brightness: 110,
    saturation: 120,
    inversion: 0,
    grayscale: 0,
    contrast: 105,
    temperature: 20
  },
  cool: {
    brightness: 105,
    saturation: 90,
    inversion: 0,
    grayscale: 10,
    contrast: 95,
    temperature: 0
  },
  vintage: {
    brightness: 95,
    saturation: 80,
    inversion: 0,
    grayscale: 30,
    contrast: 110,
    temperature: 15
  },
  dramatic: {
    brightness: 110,
    saturation: 130,
    inversion: 0,
    grayscale: 0,
    contrast: 150,
    temperature: 0
  }
}

export default function PhotoEditor() {
  // États pour la gestion de l'image et des modifications
  const [image, setImage] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [transform, setTransform] = useState<Transform>(DEFAULT_TRANSFORM)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<{ filters: Filters; transform: Transform }[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  // États pour les outils de dessin
  const [drawMode, setDrawMode] = useState<"brush" | "eraser" | null>(null)
  const [brushColor, setBrushColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [isDrawing, setIsDrawing] = useState(false)
  
  // États pour le texte
  const [text, setText] = useState("")
  const [textColor, setTextColor] = useState("#000000")
  const [textSize, setTextSize] = useState(24)
  const [textPosition, setTextPosition] = useState<TextPosition>({ x: 50, y: 50 })

  // Références pour les éléments DOM
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)

  /**
   * Gère le changement de fichier image
   * @param e - Événement de changement de fichier
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImage(reader.result as string)
        resetAll()
      }
      reader.readAsDataURL(file)
    }
  }

  /**
   * Réinitialise tous les paramètres à leurs valeurs par défaut
   */
  const resetAll = () => {
    setFilters(DEFAULT_FILTERS)
    setTransform(DEFAULT_TRANSFORM)
    setText("")
    setTextColor("#000000")
    setTextSize(24)
    setTextPosition({ x: 50, y: 50 })
    setBrushColor("#000000")
    setBrushSize(5)
    setDrawMode(null)
    setHistory([])
    setHistoryIndex(-1)
  }

  /**
   * Gère la rotation de l'image
   * @param direction - Direction de rotation ("left" ou "right")
   */
  const handleRotate = (direction: "left" | "right") => {
    setTransform((prev) => {
      const newTransform = {
        ...prev,
        rotate: prev.rotate + (direction === "left" ? -90 : 90)
      }
      addToHistory(filters, newTransform)
      return newTransform
    })
  }

  /**
   * Gère le retournement de l'image
   * @param direction - Direction du retournement ("horizontal" ou "vertical")
   */
  const handleFlip = (direction: "horizontal" | "vertical") => {
    setTransform((prev) => {
      const newTransform = {
        ...prev,
        flipH: direction === "horizontal" ? prev.flipH * -1 : prev.flipH,
        flipV: direction === "vertical" ? prev.flipV * -1 : prev.flipV
      }
      addToHistory(filters, newTransform)
      return newTransform
    })
  }

  /**
   * Ajoute un état à l'historique des modifications
   * @param newFilters - Nouveaux filtres à ajouter
   * @param newTransform - Nouvelles transformations à ajouter
   */
  const addToHistory = (newFilters: Filters, newTransform: Transform) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ filters: newFilters, transform: newTransform })
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  /**
   * Annule la dernière modification
   */
  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      setFilters(prevState.filters)
      setTransform(prevState.transform)
      setHistoryIndex(historyIndex - 1)
    }
  }

  /**
   * Rétablit la dernière modification annulée
   */
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setFilters(nextState.filters)
      setTransform(nextState.transform)
      setHistoryIndex(historyIndex + 1)
    }
  }

  /**
   * Sauvegarde l'image modifiée
   */
  const saveImage = useCallback(() => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = imageRef.current

    if (img && ctx) {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight

      ctx.filter = `brightness(${filters.brightness}%) saturate(${filters.saturation}%) 
                   invert(${filters.inversion}%) grayscale(${filters.grayscale}%)
                   contrast(${filters.contrast}%) sepia(${filters.temperature}%)`

      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((transform.rotate * Math.PI) / 180)
      ctx.scale(transform.flipH, transform.flipV)
      ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2)

      const link = document.createElement("a")
      // link.download =( Math.random()*100).toString()+(Math.random()*100).toString() + "edited_image.jpg"
      link.download =( Math.random()*100).toString()+(Math.random()*100).toString() + "edited_image.png"
      link.href = canvas.toDataURL()
      link.click()
    }
  }, [filters, transform])

 
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

  /**
   * Applique un filtre prédéfini
   * @param preset - Nom du filtre prédéfini
   */
  const applyPresetFilter = (preset: keyof typeof presetFilters) => {
    setFilters(presetFilters[preset])
    addToHistory(presetFilters[preset], transform)
  }

  /**
   * Active/désactive le mode de dessin
   * @param mode - Mode de dessin ("brush" ou "eraser")
   */
  const toggleDrawMode = (mode: "brush" | "eraser") => {
    setDrawMode(drawMode === mode ? null : mode)
  }

  /**
   * Initialise le canvas pour le dessin
   */
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      const context = canvas.getContext("2d")
      if (context) {
        context.lineCap = "round"
        context.strokeStyle = brushColor
        context.lineWidth = brushSize
        contextRef.current = context
      }
    }
  }, [brushColor, brushSize])

  /**
   * Gère le début du dessin
   * @param e - Événement de souris
   */
  const handleDrawStart = (e: React.MouseEvent) => {
    if (!drawMode) return
    setIsDrawing(true)
    const { offsetX, offsetY } = e.nativeEvent
    contextRef.current?.beginPath()
    contextRef.current?.moveTo(offsetX, offsetY)
  }

  /**
   * Gère le dessin en cours
   * @param e - Événement de souris
   */
  const handleDraw = (e: React.MouseEvent) => {
    if (!isDrawing || !drawMode) return
    const { offsetX, offsetY } = e.nativeEvent
    contextRef.current?.lineTo(offsetX, offsetY)
    contextRef.current?.stroke()
  }

  /**
   * Gère la fin du dessin
   */
  const handleDrawEnd = () => {
    setIsDrawing(false)
  }

  // Initialise le canvas lors du chargement
  useEffect(() => {
    initializeCanvas()
  }, [initializeCanvas])

  // Met à jour les propriétés du contexte de dessin
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = drawMode === "eraser" ? "#ffffff" : brushColor
      contextRef.current.lineWidth = brushSize
    }
  }, [brushColor, brushSize, drawMode])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Image src="/logo-romagic.jpg" alt="Logo" width={60} height={60} className="rounded-xl" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                RoMagic Pro
              </h1>
              <p className="text-muted-foreground">Éditeur de photos professionnel</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={undo} 
              disabled={!image || historyIndex <= 0}
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={redo} 
              disabled={!image || historyIndex >= history.length - 1}
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Card className="bg-background/60 backdrop-blur-sm border-2">
          <CardContent className="p-6">
            <div className="grid lg:grid-cols-[1fr,400px] gap-8">
              {/* Zone de prévisualisation */}
              <div className="order-1 lg:order-1">
                <div className="relative aspect-video w-full bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                      ref={imageRef}
                      src={image || "/undraw_photos_re_pvh3.svg"}
                      width={imageRef.current?.naturalWidth || 0}
                      height={imageRef.current?.naturalHeight || 0}
                      alt="Aperçu de l'image"
                      className={cn(
                        "max-w-full max-h-full object-contain transition-all duration-300",
                        loading && "opacity-50 scale-98"
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
                      className="absolute pointer-events-none"
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

                <div className="flex flex-wrap gap-2 mt-4">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <Button 
                    size="lg"
                    className="flex-1"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choisir une image
                  </Button>
                  <Button 
                    size="lg"
                    variant="secondary"
                    className="flex-1"
                    onClick={resetAll}
                    disabled={!image}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Réinitialiser
                  </Button>
                  <Button 
                    size="lg"
                    variant="secondary"
                    className="flex-1"
                    onClick={saveImage}
                    disabled={!image}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Enregistrer
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1"
                    onClick={removeBackground}
                    disabled={!image || loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4 mr-2" />
                    )}
                    {"Supprimer l'arrière-plan"}
                  </Button>
                </div>
              </div>

              {/* Panneau de contrôle */}
              <div className="order-2 lg:order-2">
                <Tabs defaultValue="filters" className="w-full">
                  <TabsList className="w-full grid grid-cols-4 mb-6">
                    <TabsTrigger value="filters" className="flex gap-2">
                      <Sliders className="w-4 h-4" />
                      <span className="hidden sm:inline">Filtres</span>
                    </TabsTrigger>
                    <TabsTrigger value="transform" className="flex gap-2">
                      <ImageIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Transformer</span>
                    </TabsTrigger>
                    <TabsTrigger value="draw" className="flex gap-2">
                      <Palette className="w-4 h-4" />
                      <span className="hidden sm:inline">Dessiner</span>
                    </TabsTrigger>
                    <TabsTrigger value="text" className="flex gap-2">
                      <Type className="w-4 h-4" />
                      <span className="hidden sm:inline">Texte</span>
                    </TabsTrigger>
                  </TabsList>

                  <div className="bg-background/40 backdrop-blur-sm rounded-lg p-6">
                    {/* Contenu de l'onglet Filtres */}
                    <TabsContent value="filters" className="space-y-6">
                      <div className="grid gap-6">
                        <Select 
                          onValueChange={(value: keyof typeof presetFilters) => applyPresetFilter(value)}
                          disabled={!image}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Filtres prédéfinis" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(presetFilters).map((preset) => (
                              <SelectItem key={preset} value={preset}>
                                {preset.charAt(0).toUpperCase() + preset.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <div className="space-y-4">
                          {Object.entries(filters).map(([key, value]) => (
                            <div key={key}>
                              <div className="flex justify-between mb-2">
                                <Label className="text-sm font-medium">
                                  {key.charAt(0).toUpperCase() + key.slice(1)}
                                </Label>
                                <span className="text-sm text-muted-foreground">{value}%</span>
                              </div>
                              <Slider
                                value={[value]}
                                min={0}
                                max={key === "temperature" ? 200 : 200}
                                step={1}
                                className="my-2"
                                disabled={!image}
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
                      </div>
                    </TabsContent>

                    {/* Contenu de l'onglet Transformer */}
                    <TabsContent value="transform">
                      <div className="grid grid-cols-2 gap-4">
                        <Button 
                          variant="outline" 
                          onClick={() => handleRotate("left")} 
                          className="h-24"
                          disabled={!image}
                        >
                          <RotateCcw className="w-6 h-6 mr-2" />
                          Rotation Gauche
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleRotate("right")} 
                          className="h-24"
                          disabled={!image}
                        >
                          <RotateCw className="w-6 h-6 mr-2" />
                          Rotation Droite
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleFlip("horizontal")} 
                          className="h-24"
                          disabled={!image}
                        >
                          <FlipHorizontal className="w-6 h-6 mr-2" />
                          Retourner H
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleFlip("vertical")} 
                          className="h-24"
                          disabled={!image}
                        >
                          <FlipVertical className="w-6 h-6 mr-2" />
                          Retourner V
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Contenu de l'onglet Dessiner */}
                    <TabsContent value="draw" className="space-y-6">
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            variant={drawMode === "brush" ? "default" : "outline"}
                            onClick={() => toggleDrawMode("brush")}
                            className="h-20"
                            disabled={!image}
                          >
                            <Paintbrush className="w-6 h-6 mr-2" />
                            Pinceau
                          </Button>
                          <Button
                            variant={drawMode === "eraser" ? "default" : "outline"}
                            onClick={() => toggleDrawMode("eraser")}
                            className="h-20"
                            disabled={!image}
                          >
                            <Eraser className="w-6 h-6 mr-2" />
                            Gomme
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label>Couleur du pinceau</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full h-10 mt-2"
                                  style={{ backgroundColor: brushColor }}
                                  disabled={!image}
                                />
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <SketchPicker 
                                  color={brushColor} 
                                  onChange={(color) => setBrushColor(color.hex)} 
                                />
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div>
                            <div className="flex justify-between mb-2">
                              <Label>Taille du pinceau</Label>
                              <span className="text-sm text-muted-foreground">{brushSize}px</span>
                            </div>
                            <Slider
                              value={[brushSize]}
                              min={1}
                              max={50}
                              step={1}
                              disabled={!image}
                              onValueChange={([value]) => setBrushSize(value)}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Contenu de l'onglet Texte */}
                    <TabsContent value="text" className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <Label>Texte</Label>
                          <Input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Entrez votre texte ici"
                            className="mt-2"
                            disabled={!image}
                          />
                        </div>

                        <div>
                          <Label>Couleur du texte</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full h-10 mt-2"
                                style={{ backgroundColor: textColor }}
                                disabled={!image}
                              />
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <SketchPicker 
                                color={textColor} 
                                onChange={(color) => setTextColor(color.hex)} 
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <Label>Taille du texte</Label>
                            <span className="text-sm text-muted-foreground">{textSize}px</span>
                          </div>
                          <Slider
                            value={[textSize]}
                            min={10}
                            max={100}
                            step={1}
                            disabled={!image}
                            onValueChange={([value]) => setTextSize(value)}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <Label>Position X</Label>
                            <span className="text-sm text-muted-foreground">{textPosition.x}%</span>
                          </div>
                          <Slider
                            value={[textPosition.x]}
                            min={0}
                            max={100}
                            step={1}
                            disabled={!image}
                            onValueChange={([value]) => setTextPosition((prev) => ({ ...prev, x: value }))}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <Label>Position Y</Label>
                            <span className="text-sm text-muted-foreground">{textPosition.y}%</span>
                          </div>
                          <Slider
                            value={[textPosition.y]}
                            min={0}
                            max={100}
                            step={1}
                            disabled={!image}
                            onValueChange={([value]) => setTextPosition((prev) => ({ ...prev, y: value }))}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>

        <ContactSection />
      </div>
    </div>
  )
}