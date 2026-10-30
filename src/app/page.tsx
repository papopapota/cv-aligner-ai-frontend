import { LoginView } from "@/views/login";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <LoginView />
    </div>
  );
}