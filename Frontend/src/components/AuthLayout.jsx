import { Box } from "lucide-react";

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  rightSlot,
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto grid min-h-screen max-w-[1200px] grid-cols-1 md:grid-cols-2">
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center gap-3 text-slate-900">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Box size={18} />
              </span>
              <span className="text-sm font-semibold tracking-wide">
                RESEARCH CONNECT
              </span>
            </div>

            {subtitle ? (
              <p className="text-sm text-slate-500">{subtitle}</p>
            ) : null}
            {title ? (
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                {title}
              </h1>
            ) : null}

            <div className="mt-8">{children}</div>

            {footer ? (
              <div className="mt-8 text-sm text-slate-500">{footer}</div>
            ) : null}
          </div>
        </div>

        <div className="relative hidden md:block">
          {rightSlot ?? (
            <div
              aria-hidden="true"
              className="h-full w-full bg-gradient-to-br from-sky-200 via-indigo-200 to-pink-200"
            />
          )}
        </div>
      </div>
    </div>
  );
}

