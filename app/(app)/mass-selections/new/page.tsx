import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import BackButton from "@/components/common/back-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { liturgyTemplates } from "@/lib/constants";

export default function SelectLiturgyTemplatePage() {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <BackButton fallback="/mass-selections" />
          <div>
            <h1 className="text-3xl font-bold">Create Mass Selection</h1>
            <p className="text-muted-foreground mt-1">
              Choose a liturgy template to get started
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {liturgyTemplates.map((template) => {
            const IconComponent = template.icon;
            return (
              <Card
                key={template.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/50"
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{template.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {template.parts.length > 0
                        ? `${template.parts.length} pre-filled parts:`
                        : "Empty template"}
                    </p>
                    {template.parts.length > 0 && (
                      <div className="text-xs text-muted-foreground space-y-1">
                        {template.parts.slice(0, 4).map((part, index) => (
                          <div key={index} className="flex items-center">
                            <span className="w-2 h-2 bg-primary/30 rounded-full mr-2"></span>
                            {part}
                          </div>
                        ))}
                        {template.parts.length > 4 && (
                          <div className="flex items-center text-muted-foreground/70">
                            <span className="w-2 h-2 bg-primary/20 rounded-full mr-2"></span>
                            +{template.parts.length - 4} more parts
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    className="w-full mt-4 bg-transparent"
                    variant="outline"
                    asChild
                  >
                    <Link
                      href={`/mass-selections/new/create?template=${template.id}`}
                    >
                      Select Template
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Don't see what you need? Start with the blank template and customize
            it to your requirements.
          </p>
        </div>
      </div>
    </div>
  );
}
