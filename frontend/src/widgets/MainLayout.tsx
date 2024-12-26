import { A } from "@solidjs/router";
import { LogIn } from "lucide-solid";
import { Component, ParentProps } from "solid-js";

export const MainLayout: Component<ParentProps> = (props) => {
  return (
    <main class="max-w-[720px] min-h-[100dvh] mx-auto md:border-x border-zinc-900 text-white">
      <div class="border-b border-zinc-900 flex items-center justify-between px-2 py-3">
        <A href="/">
          <img src="/vdeniske-big-dark.svg" alt="Vdeniske logo" class="h-8" />
        </A>
        <button class="p-2 rounded-full hover:bg-neutral-800">
          <LogIn class="text-white mr-1" />
        </button>
      </div>
      <div>{props.children}</div>
    </main>
  );
};
