import { HostSidebar } from '@/components/layout/host-sidebar';

export default function HostLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <HostSidebar />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
