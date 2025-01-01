import { X } from "lucide-solid";
import { Component, JSX, Show } from "solid-js";

export type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: JSX.Element;
};

export const Modal: Component<ModalProps> = (props) => {
  return (
    <Show when={props.isOpen}>
      <div
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        onClick={props.onClose}
      >
        <div
          class="bg-black border border-zinc-900 rounded-xl shadow-lg z-10 p-4 w-96"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={props.onClose}
          >
            <X />
          </button>
          {props.children}
        </div>
      </div>
    </Show>
  );
};
