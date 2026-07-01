import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      {/* Background image — same as landing hero */}
      <Image
        src="/bg-hero.jpg"
        alt=""
        fill
        priority
        className="object-cover object-center"
        quality={90}
      />

      {/* Subtle warm overlay for card contrast */}
      <div className="absolute inset-0 bg-[#F2EDE4]/25" />

      {/* Auth card slot */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
