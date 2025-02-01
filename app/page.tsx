"use client"

// Importation des hooks React nécessaires
import { useState, useRef, useCallback } from "react"

// Importation des composants UI de shadcn/ui
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Importation des icônes de Lucide React
import { RotateCcw, RotateCw, FlipHorizontal, FlipVertical, Upload, Download, Wand2, Loader2 } from "lucide-react"

// Importation de l'utilitaire pour combiner les classes CSS
import { cn } from "@/lib/utils"

// Définition de l'interface pour l'état des filtres
interface FilterState {
  brightness: number
  saturation: number
  inversion: number
  grayscale: number
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
  })
  // État pour les transformations (rotation et retournement)
  const [transform, setTransform] = useState({
    rotate: 0,
    flipH: 1,
    flipV: 1,
  })

  // Références pour accéder aux éléments DOM
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

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
    })
    setTransform({
      rotate: 0,
      flipH: 1,
      flipV: 1,
    })
  }

  // Fonction pour gérer la rotation de l'image
  const handleRotate = (direction: "left" | "right") => {
    setTransform((prev) => ({
      ...prev,
      rotate: prev.rotate + (direction === "left" ? -90 : 90),
    }))
  }

  // Fonction pour gérer le retournement de l'image
  const handleFlip = (direction: "horizontal" | "vertical") => {
    setTransform((prev) => ({
      ...prev,
      [direction === "horizontal" ? "flipH" : "flipV"]:
        prev[direction === "horizontal" ? "flipH" : "flipV"] === 1 ? -1 : 1,
    }))
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
                 invert(${filters.inversion}%) grayscale(${filters.grayscale}%)`

    // Application des transformations
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((transform.rotate * Math.PI) / 180)
    ctx.scale(transform.flipH, transform.flipV)
    ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height)

    // Création et déclenchement du téléchargement
    const link = document.createElement("a")
    link.download = "image-editee.jpg"
    link.href = canvas.toDataURL("image/jpeg", 0.8)
    link.click()
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
                </TabsList>

                {/* Onglet des filtres */}
                <TabsContent value="filters" className="space-y-4">
                  <div className="space-y-4">
                    {/* Contrôle de la luminosité */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Luminosité: {filters.brightness}%</label>
                      <Slider
                        value={[filters.brightness]}
                        min={0}
                        max={200}
                        step={1}
                        onValueChange={([value]) => setFilters((prev) => ({ ...prev, brightness: value }))}
                      />
                    </div>

                    {/* Contrôle de la saturation */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Saturation: {filters.saturation}%</label>
                      <Slider
                        value={[filters.saturation]}
                        min={0}
                        max={200}
                        step={1}
                        onValueChange={([value]) => setFilters((prev) => ({ ...prev, saturation: value }))}
                      />
                    </div>

                    {/* Contrôle de l'inversion */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Inversion: {filters.inversion}%</label>
                      <Slider
                        value={[filters.inversion]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={([value]) => setFilters((prev) => ({ ...prev, inversion: value }))}
                      />
                    </div>

                    {/* Contrôle des niveaux de gris */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Niveaux de gris: {filters.grayscale}%</label>
                      <Slider
                        value={[filters.grayscale]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={([value]) => setFilters((prev) => ({ ...prev, grayscale: value }))}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Onglet des transformations */}
                <TabsContent value="transform" className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Boutons de rotation */}
                    <Button variant="outline" onClick={() => handleRotate("left")} className="w-full">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Rotation Gauche
                    </Button>

                    <Button variant="outline" onClick={() => handleRotate("right")} className="w-full">
                      <RotateCw className="w-4 h-4 mr-2" />
                      Rotation Droite
                    </Button>

                    {/* Boutons de retournement */}
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
              </div>
            </div>

            {/* Zone d'aperçu de l'image */}
            <div className="relative min-h-[400px] border rounded-lg overflow-hidden bg-muted/10">
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  ref={imageRef}
                  src={image || "/placeholder.svg"}
                  alt="Aperçu de l'image"
                  className={cn(
                    "max-w-full max-h-full object-contain transition-transform duration-200",
                    loading && "opacity-50",
                  )}
                  style={{
                    filter: `brightness(${filters.brightness}%) saturate(${filters.saturation}%) 
                            invert(${filters.inversion}%) grayscale(${filters.grayscale}%)`,
                    transform: `rotate(${transform.rotate}deg) scale(${transform.flipH}, ${transform.flipV})`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

