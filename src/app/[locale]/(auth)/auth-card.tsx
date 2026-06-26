import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthCardProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description: ReactNode;
  children: ReactNode;
};

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
}: AuthCardProps) {
  return (
    <Card className="w-full max-w-none bg-transparent py-0 ring-0 shadow-none sm:max-w-md sm:bg-card sm:py-4 sm:ring-1 sm:shadow-sm">
      <CardHeader className="px-0 sm:px-4">
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/80">
            {eyebrow}
          </p>
        ) : null}
        <CardTitle className="text-2xl font-bold tracking-tight sm:text-xl sm:font-medium">
          {title}
        </CardTitle>
        <CardDescription className="text-base leading-relaxed sm:text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-4 [&_button[type=submit]]:h-11 [&_input]:h-11">
        {children}
      </CardContent>
    </Card>
  );
}
