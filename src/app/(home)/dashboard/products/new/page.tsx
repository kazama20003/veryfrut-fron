"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Loader2, Upload, X, Trash, Info } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { api } from "@/lib/axiosInstance"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Definir interfaces para los datos
interface Category {
  id: number
  name: string
}

interface UnitMeasurement {
  id: number
  name: string
  abbreviation: string
}

// Valores por defecto para el producto
const DEFAULT_PRICE = 4
const DEFAULT_STOCK = 99999999

export default function NewProductPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Estados para los datos
  const [categories, setCategories] = useState<Category[]>([])
  const [unitMeasurements, setUnitMeasurements] = useState<UnitMeasurement[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: DEFAULT_PRICE.toString(),
    stock: DEFAULT_STOCK.toString(),
    imageUrl: "",
    categoryId: "",
    unitMeasurementIds: [] as number[],
  })

  // Estados para la UI
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imagePublicId, setImagePublicId] = useState<string | null>(null)

  // Cargar datos relacionados (categorías y unidades de medida)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Cargar datos en paralelo
        const [categoriesRes, unitsRes] = await Promise.all([api.get("/categories"), api.get("/unit-measurements")])

        setCategories(categoriesRes.data)
        setUnitMeasurements(unitsRes.data)
      } catch (err) {
        console.error("Error al cargar datos:", err)
        setError("No se pudieron cargar los datos necesarios. Por favor, intenta de nuevo.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Manejar cambios en los selects
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Manejar selección de unidades de medida
  const handleUnitMeasurementToggle = (unitId: number) => {
    setFormData((prev) => {
      const currentIds = [...prev.unitMeasurementIds]

      if (currentIds.includes(unitId)) {
        // Si ya está seleccionado, lo quitamos
        return {
          ...prev,
          unitMeasurementIds: currentIds.filter((id) => id !== unitId),
        }
      } else {
        // Si no está seleccionado, lo añadimos
        return {
          ...prev,
          unitMeasurementIds: [...currentIds, unitId],
        }
      }
    })
  }

  // Manejar carga de imagen
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const formData = new FormData()
    formData.append("file", file)

    setIsUploading(true)

    try {
      // Eliminar imagen anterior si existe
      if (imagePublicId) {
        await handleImageDelete()
      }

      // Subir nueva imagen
      const response = await api.post("/uploads", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      const { url, publicId } = response.data

      // Actualizar estado con la nueva imagen
      setImagePreview(url)
      setFormData((prev) => ({ ...prev, imageUrl: url }))
      setImagePublicId(publicId.replace("uploads/", ""))

      toast.success("Imagen cargada correctamente")
    } catch (err) {
      console.error("Error al cargar la imagen:", err)
      toast.error("Error al cargar la imagen", {
        description: "No se pudo cargar la imagen. Por favor, intenta de nuevo.",
      })
    } finally {
      setIsUploading(false)
      // Limpiar el input de archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Manejar eliminación de imagen
  const handleImageDelete = async () => {
    if (!imagePublicId) return

    try {
      await api.delete(`/uploads/${imagePublicId}`)
      setImagePreview(null)
      setFormData((prev) => ({ ...prev, imageUrl: "" }))
      setImagePublicId(null)
      toast.success("Imagen eliminada correctamente")
    } catch (err) {
      console.error("Error al eliminar la imagen:", err)
      toast.error("Error al eliminar la imagen", {
        description: "No se pudo eliminar la imagen. Por favor, intenta de nuevo.",
      })
    }
  }

  // Función para restaurar el stock si llega a cero
  const restoreStockIfZero = async (productId: number) => {
    try {
      await api.patch(`/products/${productId}`, {
        stock: DEFAULT_STOCK,
      })
      console.log(`Stock restaurado a ${DEFAULT_STOCK} para el producto ${productId}`)
    } catch (err) {
      console.error("Error al restaurar el stock:", err)
    }
  }

  // Validar formulario
  const validateForm = () => {
    const errors = []
    if (!formData.name.trim()) errors.push("El nombre del producto es obligatorio")
    if (!formData.categoryId) errors.push("Debes seleccionar una categoría")
    if (formData.unitMeasurementIds.length === 0) errors.push("Debes seleccionar al menos una unidad de medida")

    return errors
  }

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar formulario
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      toast.error("Por favor corrige los siguientes errores:", {
        description: (
          <ul className="list-disc pl-4 mt-2">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        ),
      })
      return
    }

    setIsSaving(true)

    try {
      // Preparar datos para enviar
      const productData = {
        name: formData.name,
        description: formData.description,
        price: DEFAULT_PRICE,
        stock: DEFAULT_STOCK,
        imageUrl: formData.imageUrl,
        categoryId: Number.parseInt(formData.categoryId),
        unitMeasurementIds: formData.unitMeasurementIds,
      }

      // Enviar datos a la API
      const response = await api.post("/products", productData)

      // Si el stock es 0, restaurarlo automáticamente
      if (response.data && response.data.id && response.data.stock === 0) {
        await restoreStockIfZero(response.data.id)
      }

      toast.success("Producto creado correctamente", {
        description: "El nuevo producto ha sido añadido al catálogo.",
      })

      // Redirigir a la lista de productos
      router.push("/dashboard/products")
    } catch (err) {
      console.error("Error al crear producto:", err)
      toast.error("Error al crear el producto", {
        description: "No se pudo crear el producto. Por favor, intenta de nuevo.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-10 w-10 text-green-600 animate-spin mb-4" />
        <p className="text-muted-foreground">Cargando datos necesarios...</p>
      </div>
    )
  }

  // Mostrar error si ocurrió alguno
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 mb-4 text-5xl">⚠️</div>
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button asChild>
          <Link href="/dashboard/products">Volver a productos</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Productos
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Nuevo Producto</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna izquierda - Imagen */}
          <Card className="md:col-span-1 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Imagen del producto</CardTitle>
              <CardDescription>Sube una imagen para el producto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square bg-muted relative rounded-md overflow-hidden">
                {imagePreview ? (
                  <>
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Vista previa"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      onError={() => setImagePreview(null)}
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-90"
                      type="button"
                      onClick={handleImageDelete}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted flex-col gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">Haz clic en Subir imagen</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Subir imagen
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleImageDelete}
                  disabled={!imagePreview || isUploading}
                  className="w-full"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                <h4 className="text-sm font-medium text-blue-700 flex items-center mb-1">
                  <Info className="h-4 w-4 mr-1" />
                  Información
                </h4>
                <p className="text-xs text-blue-600">
                  La imagen se subirá automáticamente al servidor. Si no subes una imagen, el producto se creará sin
                  ella.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Columna derecha - Datos del producto */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Información del producto</CardTitle>
              <CardDescription>Completa los detalles del nuevo producto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nombre del producto */}
              <div className="space-y-1">
                <Label htmlFor="name">
                  Nombre del producto <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Manzanas Orgánicas"
                  required
                />
              </div>

              {/* Categoría */}
              <div className="space-y-1">
                <Label htmlFor="categoryId">
                  Categoría <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => handleSelectChange("categoryId", value)}
                  required
                >
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Unidades de medida */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>
                    Unidades de medida <span className="text-red-500">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="ml-2">
                          {formData.unitMeasurementIds.length} seleccionadas
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Selecciona las unidades en las que se venderá este producto</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="border rounded-md p-3 space-y-3">
                  {formData.unitMeasurementIds.length > 0 && (
                    <div className="flex flex-wrap gap-1 pb-2 border-b">
                      {formData.unitMeasurementIds.map((unitId) => {
                        const unit = unitMeasurements.find((u) => u.id === unitId)
                        return unit ? (
                          <Badge key={unit.id} variant="secondary" className="flex items-center gap-1">
                            {unit.name} ({unit.abbreviation})
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 ml-1"
                              onClick={() => handleUnitMeasurementToggle(unit.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ) : null
                      })}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {unitMeasurements.map((unit) => (
                      <div key={unit.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`unit-${unit.id}`}
                          checked={formData.unitMeasurementIds.includes(unit.id)}
                          onCheckedChange={() => handleUnitMeasurementToggle(unit.id)}
                        />
                        <Label htmlFor={`unit-${unit.id}`} className="text-sm cursor-pointer">
                          {unit.name} ({unit.abbreviation})
                        </Label>
                      </div>
                    ))}
                  </div>

                  {formData.unitMeasurementIds.length === 0 && (
                    <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded-md border border-amber-100">
                      ⚠️ Selecciona al menos una unidad de medida para este producto
                    </p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-1">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe el producto..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Una buena descripción ayuda a los clientes a entender mejor el producto
                </p>
              </div>

              {/* Nota informativa sobre precio y stock */}
              <div className="bg-green-50 p-3 rounded-md border border-green-100">
                <h4 className="text-sm font-medium text-green-700 flex items-center mb-1">
                  <Info className="h-4 w-4 mr-1" />
                  Información sobre precio y stock
                </h4>
                <p className="text-xs text-green-600">
                  El precio por defecto será de ${DEFAULT_PRICE} y el stock se establecerá automáticamente en{" "}
                  {DEFAULT_STOCK.toLocaleString()} unidades. Si el stock llega a cero, se restaurará automáticamente.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button variant="outline" type="button" asChild>
                <Link href="/dashboard/products">Cancelar</Link>
              </Button>

              <Button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Crear producto
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
