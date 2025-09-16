"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InvestorSidebar } from "@/components/investor-sidebar"
import { ImageUpload } from "@/components/image-upload"
import { ImageGallery } from "@/components/image-gallery"
import { Upload, FolderOpen, ImageIcon } from "lucide-react"

interface ImageItem {
  id: string
  url: string
  name: string
  type: string
  size: number
  uploadedAt: Date
  folder?: string
}

export default function MediaManagementPage() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchImages()
  }, [selectedFolder])

  const fetchImages = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedFolder !== "all") {
        params.append("folder", selectedFolder)
      }

      const response = await fetch(`/api/images?${params}`)
      if (response.ok) {
        const data = await response.json()
        setImages(
          data.map((item: any) => ({
            ...item,
            id: item._id,
            uploadedAt: new Date(item.uploadedAt),
          })),
        )
      }
    } catch (error) {
      console.error("Error fetching images:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpload = async (url: string) => {
    // Refresh the gallery after upload
    fetchImages()
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/images/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setImages((prev) => prev.filter((img) => img.id !== id))
      }
    } catch (error) {
      console.error("Error deleting image:", error)
    }
  }

  const folders = ["all", "pitch-decks", "logos", "documents", "presentations"]
  const filteredImages = selectedFolder === "all" ? images : images.filter((img) => img.folder === selectedFolder)

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <InvestorSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading media...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <InvestorSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Media Management</h1>
            <p className="text-muted-foreground">Upload and manage files, pitch decks, and documents</p>
          </div>

          <div className="space-y-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Files
                </CardTitle>
                <CardDescription>Upload pitch decks, documents, and images</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pitch-decks" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="pitch-decks">Pitch Decks</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="images">Images</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pitch-decks">
                    <ImageUpload
                      onUpload={handleUpload}
                      folder="pitch-decks"
                      acceptedTypes={[
                        "application/pdf",
                        "application/vnd.ms-powerpoint",
                        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                      ]}
                      maxSize={20}
                    />
                  </TabsContent>

                  <TabsContent value="documents">
                    <ImageUpload
                      onUpload={handleUpload}
                      folder="documents"
                      acceptedTypes={[
                        "application/pdf",
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                      ]}
                      maxSize={15}
                    />
                  </TabsContent>

                  <TabsContent value="images">
                    <ImageUpload
                      onUpload={handleUpload}
                      folder="images"
                      acceptedTypes={["image/jpeg", "image/png", "image/webp", "image/gif"]}
                      maxSize={5}
                      multiple
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Gallery Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    <CardTitle>File Gallery</CardTitle>
                  </div>
                  <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select folder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Files</SelectItem>
                      <SelectItem value="pitch-decks">Pitch Decks</SelectItem>
                      <SelectItem value="documents">Documents</SelectItem>
                      <SelectItem value="images">Images</SelectItem>
                      <SelectItem value="logos">Logos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CardDescription>
                  {filteredImages.length} file{filteredImages.length !== 1 ? "s" : ""} in{" "}
                  {selectedFolder === "all" ? "all folders" : selectedFolder}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageGallery images={filteredImages} onDelete={handleDelete} />
              </CardContent>
            </Card>

            {/* Storage Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <ImageIcon className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {images.filter((img) => img.type.startsWith("image/")).length}
                      </p>
                      <p className="text-sm text-muted-foreground">Images</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">📄</div>
                    <div>
                      <p className="text-2xl font-bold">
                        {images.filter((img) => img.type === "application/pdf").length}
                      </p>
                      <p className="text-sm text-muted-foreground">PDF Documents</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">📊</div>
                    <div>
                      <p className="text-2xl font-bold">
                        {
                          images.filter((img) => img.type.includes("presentation") || img.type.includes("powerpoint"))
                            .length
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">Presentations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
