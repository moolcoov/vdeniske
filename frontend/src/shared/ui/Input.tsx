import { Component, JSX } from "solid-js";

export const Input: Component<JSX.InputHTMLAttributes<HTMLInputElement>> = (
  props
) => {
  return (
    <input
      {...props}
      class={
        "w-full p-2 border border-zinc-900 bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-800 " +
        props.class
      }
    />
  );
};
