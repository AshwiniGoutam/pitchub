"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, FileImage, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  onUpload: (url: string) => void
  onError?: (error: string) => void
  maxSize?: number // in MB
  acceptedTypes?: string[]
  folder?: string
  className?: string
  multiple?: boolean
}

interface UploadState {
  isUploading: boolean
  progress: number
  error: string | null
  success: boolean
}

export function ImageUpload({
  onUpload,
  onError,
  maxSize = 10,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  folder = "general",
  className,
  multiple = false,
}: ImageUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    success: false,
  })
  const [dragActive, setDragActive] = useState(false)

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Please upload: ${acceptedTypes.join(", ")}`
    }

    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`
    }

    return null
  }

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setUploadState((prev) => ({ ...prev, error: validationError }))
      onError?.(validationError)
      return
    }

    setUploadState({
      isUploading: true,
      progress: 0,
      error: null,
      success: false,
    })

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", folder)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Upload failed")
      }

      const data = await response.json()

      setUploadState({
        isUploading: false,
        progress: 100,
        error: null,
        success: true,
      })

      onUpload(data.url)

      // Reset success state after 3 seconds
      setTimeout(() => {
        setUploadState((prev) => ({ ...prev, success: false, progress: 0 }))
      }, 3000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed"
      setUploadState({
        isUploading: false,
        progress: 0,
        error: errorMessage,
        success: false,
      })
      onError?.(errorMessage)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const files = Array.from(e.dataTransfer.files)
        if (multiple) {
          files.forEach(uploadFile)
        } else {
          uploadFile(files[0])
        }
      }
    },
    [multiple],
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      if (multiple) {
        files.forEach(uploadFile)
      } else {
        uploadFile(files[0])
      }
    }
  }

  const clearError = () => {
    setUploadState((prev) => ({ ...prev, error: null }))
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          dragActive && "border-primary bg-primary/5",
          uploadState.isUploading && "border-blue-300 bg-blue-50",
          uploadState.success && "border-green-300 bg-green-50",
          uploadState.error && "border-red-300 bg-red-50",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-8 text-center">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept={acceptedTypes.join(",")}
            multiple={multiple}
            onChange={handleFileSelect}
            disabled={uploadState.isUploading}
          />

          <div className="space-y-4">
            {uploadState.isUploading ? (
              <div className="space-y-2">
                <Upload className="h-8 w-8 text-blue-500 mx-auto animate-pulse" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
                <Progress value={uploadState.progress} className="w-full" />
              </div>
            ) : uploadState.success ? (
              <div className="space-y-2">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                <p className="text-sm text-green-600">Upload successful!</p>
              </div>
            ) : (
              <div className="space-y-2">
                <FileImage className="h-8 w-8 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {dragActive ? "Drop files here" : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {acceptedTypes.includes("application/pdf") ? "Images or PDF" : "Images"} up to {maxSize}MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("file-upload")?.click()}
                  disabled={uploadState.isUploading}
                >
                  Choose {multiple ? "Files" : "File"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {uploadState.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {uploadState.error}
            <Button variant="ghost" size="sm" onClick={clearError}>
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
