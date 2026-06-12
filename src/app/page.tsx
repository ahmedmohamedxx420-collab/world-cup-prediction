import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">كأس العالم — توقعات</CardTitle>
          <CardDescription>
            توقّع نتائج المباريات ونافس عائلتك على لوحة واحدة.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          الهيكل الأساسي للتطبيق جاهز. الخطوات التالية: اللغات والاتجاه، ثم ربط
          Supabase، ثم واجهة التنقّل.
        </CardContent>
        <CardFooter>
          <Button className="w-full">ابدأ</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
