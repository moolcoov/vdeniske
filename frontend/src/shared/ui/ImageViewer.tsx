import { Component, createSignal, Show } from "solid-js";
import { Portal } from "solid-js/web";

export interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt?: string;
}

export interface Position {
  x: number;
  y: number;
}

export const ImageViewer: Component<ImageViewerProps> = (props) => {
  const [scale, setScale] = createSignal<number>(1);
  const [position, setPosition] = createSignal<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = createSignal<boolean>(false);
  const [dragStart, setDragStart] = createSignal<Position>({ x: 0, y: 0 });

  let containerRef: HTMLDivElement | undefined;

  const handleClose = (): void => {
    resetView();
    props.onClose();
  };

  const resetView = (): void => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: WheelEvent): void => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(0.5, scale() + delta), 4);
    setScale(newScale);
  };

  const handleMouseDown = (e: MouseEvent): void => {
    if (e.target === containerRef) {
      handleClose();
      return;
    }
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position().x,
      y: e.clientY - position().y,
    });
  };

  const handleMouseMove = (e: MouseEvent): void => {
    if (!isDragging()) return;
    setPosition({
      x: e.clientX - dragStart().x,
      y: e.clientY - dragStart().y,
    });
  };

  const handleMouseUp = (): void => {
    setIsDragging(false);
  };

  const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  return (
    <Show when={props.isOpen}>
      <Portal>
        <div
          ref={containerRef}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            "background-color": "rgba(0, 0, 0, 0.9)",
            "z-index": "9999",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            animation: "fadeIn 0.2s ease",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <button
            onClick={handleClose}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "none",
              border: "none",
              color: "white",
              "font-size": "24px",
              cursor: "pointer",
              "z-index": "10000",
              width: "40px",
              height: "40px",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
              "border-radius": "50%",
              "background-color": "rgba(0, 0, 0, 0.5)",
              transition: "background-color 0.2s ease",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "rgba(0, 0, 0, 0.8)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "rgba(0, 0, 0, 0.5)";
            }}
          >
            ✕
          </button>

          <img
            src={props.src}
            alt={props.alt || "Fullscreen view"}
            style={{
              "max-height": "90vh",
              "max-width": "90vw",
              "object-fit": "contain",
              transform: `translate(${position().x}px, ${
                position().y
              }px) scale(${scale()})`,
              transition: isDragging() ? "none" : "transform 0.1s ease-out",
              "user-select": "none",
              cursor: isDragging() ? "grabbing" : "grab",
            }}
            draggable={false}
          />
        </div>
      </Portal>
    </Show>
  );
};
