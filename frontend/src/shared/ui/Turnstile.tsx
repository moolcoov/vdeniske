import { Component, onMount } from "solid-js";
import { turnstyleSiteKey } from "../lib/api";

export type TurnstileProps = {
  onResult: (token: string) => void;
};

export const Turnstile: Component<TurnstileProps> = (props) => {
  let ref!: HTMLDivElement;

  onMount(() => {
    (window as any).turnstile.render(ref, {
      sitekey: turnstyleSiteKey,
      theme: "dark",
      callback: props.onResult,
    });
  });

  return <div ref={ref}></div>;
};
