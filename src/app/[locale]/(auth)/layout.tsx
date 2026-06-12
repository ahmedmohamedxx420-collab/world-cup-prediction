import { LanguageSwitcher } from "@/components/language-switcher";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex h-14 items-center justify-end px-4">
        <LanguageSwitcher />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        {children}
      </main>
    </div>
  );
}
