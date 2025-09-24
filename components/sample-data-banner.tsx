"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Database, Loader2 } from "lucide-react"

export function SampleDataBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const handleLoadSampleData = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would call an API endpoint to run the seed script
      // For now, we'll just simulate the action
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setIsVisible(false)
    } catch (error) {
      console.error("Error loading sample data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isVisible) return null

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold text-primary">Welcome to your Mass Selections Dashboard!</h3>
              <p className="text-sm text-muted-foreground">
                Get started by loading some sample Mass selections to explore the features.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleLoadSampleData}
              disabled={isLoading}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Load Sample Data
                </>
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
