import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

function Block({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-muted/50 ${className}`}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-border/60">
            <CardHeader className="pb-2">
              <Block className="h-4 w-24" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Block className="h-8 w-32" />
              <Block className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="border-border/60 xl:col-span-2">
          <CardHeader>
            <Block className="h-5 w-48" />
            <Block className="mt-2 h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Block className="h-52 w-full" />
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader>
            <Block className="h-5 w-40" />
            <Block className="mt-2 h-4 w-28" />
          </CardHeader>
          <CardContent>
            <Block className="mx-auto h-44 w-44 rounded-full" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <Block className="h-5 w-36" />
          <Block className="mt-2 h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Block key={index} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
