import { A } from "@solidjs/router";
import { LogIn } from "lucide-solid";
import { Component, createSignal, ParentProps } from "solid-js";
import { AuthModal } from "./AuthModal";

export const MainLayout: Component<ParentProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <main class="max-w-[720px] min-h-[100dvh] mx-auto md:border-x border-zinc-900 text-white">
      <div class="border-b border-zinc-900 flex items-center justify-between px-2 py-3">
        <A href="/">
          <img src="/vdeniske-big-dark.svg" alt="Vdeniske logo" class="h-8" />
        </A>
        <button
          class="p-2 rounded-full hover:bg-neutral-800"
          onClick={() => setIsOpen(!isOpen())}
        >
          <LogIn class="text-white mr-1" />
        </button>
      </div>
      <div>{props.children}</div>
      <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </main>
  );
};
