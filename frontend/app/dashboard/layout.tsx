import AdminReturnFab from "@/components/admin/AdminReturnFab";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AdminReturnFab />
    </>
  );
}
