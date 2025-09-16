"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Eye, Download, Trash2, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageItem {
  id: string
  url: string
  name: string
  type: string
  size: number
  uploadedAt: Date
  folder?: string
}

interface ImageGalleryProps {
  images: ImageItem[]
  onDelete?: (id: string) => void
  onView?: (image: ImageItem) => void
  className?: string
  showActions?: boolean
}

export function ImageGallery({ images, onDelete, onView, className, showActions = true }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileTypeColor = (type: string): string => {
    if (type.startsWith("image/")) return "bg-blue-100 text-blue-800"
    if (type === "application/pdf") return "bg-red-100 text-red-800"
    return "bg-gray-100 text-gray-800"
  }

  const isImage = (type: string): boolean => {
    return type.startsWith("image/")
  }

  const handleDownload = async (image: ImageItem) => {
    try {
      const response = await fetch(image.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = image.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading file:", error)
    }
  }

  if (images.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No files uploaded yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              {/* Image Preview */}
              <div className="aspect-square bg-muted relative overflow-hidden">
                {isImage(image.type) ? (
                  <img src={image.url || "/placeholder.svg"} alt={image.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📄</div>
                      <p className="text-xs text-muted-foreground">PDF</p>
                    </div>
                  </div>
                )}

                {/* Overlay Actions */}
                {showActions && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="secondary" onClick={() => setSelectedImage(image)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>{selectedImage?.name}</DialogTitle>
                        </DialogHeader>
                        {selectedImage && (
                          <div className="space-y-4">
                            {isImage(selectedImage.type) ? (
                              <img
                                src={selectedImage.url || "/placeholder.svg"}
                                alt={selectedImage.name}
                                className="w-full max-h-96 object-contain rounded-lg"
                              />
                            ) : (
                              <div className="text-center p-8">
                                <div className="text-6xl mb-4">📄</div>
                                <p className="text-lg font-semibold">{selectedImage.name}</p>
                                <p className="text-muted-foreground">PDF Document</p>
                                <Button className="mt-4" onClick={() => window.open(selectedImage.url, "_blank")}>
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Open PDF
                                </Button>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>Size: {formatFileSize(selectedImage.size)}</span>
                              <span>Uploaded: {selectedImage.uploadedAt.toLocaleDateString()}</span>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button size="sm" variant="secondary" onClick={() => handleDownload(image)}>
                      <Download className="h-4 w-4" />
                    </Button>

                    {onDelete && (
                      <Button size="sm" variant="destructive" onClick={() => onDelete(image.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate flex-1">{image.name}</p>
                  <Badge variant="outline" className={getFileTypeColor(image.type)}>
                    {image.type.split("/")[1]?.toUpperCase() || "FILE"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatFileSize(image.size)}</span>
                  <span>{image.uploadedAt.toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
