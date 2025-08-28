import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function AddPetLoading() {
  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="flex items-center mb-6">
        <Skeleton className="h-9 w-16 mr-2" />
        <Skeleton className="h-8 w-48" />
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
          <div className="mt-2">
            <Skeleton className="h-2 w-full mt-4" />
            <div className="flex justify-between mt-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="w-full">
        <div className="grid grid-cols-4 gap-2 mb-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className="flex space-x-4">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex space-x-4">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
