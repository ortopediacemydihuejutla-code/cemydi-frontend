export function AccountPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#0f3d3b]">
          {title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5e7472]">
          {description}
        </p>
      </div>
      {actions}
    </header>
  );
}

export const accountInputClassName =
  "h-12 w-full rounded-xl border border-transparent bg-[#f4f8f8] px-4 text-sm text-[#0f3d3b] outline-none transition-all placeholder:text-[#8b9c9b] hover:bg-[#eef5f5] focus:border-[#2ba2a1] focus:bg-white focus:ring-4 focus:ring-[#2ba2a1]/10 disabled:cursor-default disabled:bg-[#f4f7f7] disabled:text-[#607173]";
