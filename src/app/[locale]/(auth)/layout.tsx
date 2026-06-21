import { LanguageSwitcher } from "@/components/language-switcher";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-svh flex-1 flex-col">
      <header className="absolute inset-x-0 top-0 z-10 flex px-4 pt-4 sm:px-6 sm:pt-6">
        <LanguageSwitcher className="ms-auto min-w-20 rounded-full bg-background/90 shadow-sm backdrop-blur" />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-8 pt-20 sm:items-center sm:px-6 sm:py-12">
        {children}
      </main>
    </div>
  );
}
