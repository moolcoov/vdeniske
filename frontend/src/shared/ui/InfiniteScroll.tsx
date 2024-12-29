import {
  createSignal,
  createEffect,
  onCleanup,
  For,
  Component,
  JSX,
} from "solid-js";
import { Show } from "solid-js";

interface InfiniteScrollProps<T> {
  loadMore: () => Promise<T[]>;
  items: T[];
  renderItem: (item: T) => JSX.Element;
  isLoading?: boolean;
  threshold?: number;
}

const InfiniteScroll: Component<InfiniteScrollProps<any>> = (props) => {
  const [sentinel, setSentinel] = createSignal<HTMLDivElement>();
  const [_isIntersecting, setIsIntersecting] = createSignal(false);

  createEffect(() => {
    const currentSentinel = sentinel();
    if (!currentSentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsIntersecting(entry.isIntersecting);

        if (entry.isIntersecting && !props.isLoading) {
          props.loadMore();
        }
      },
      {
        rootMargin: `${props.threshold || 200}px`,
      }
    );

    observer.observe(currentSentinel);

    onCleanup(() => {
      observer.disconnect();
    });
  });

  return (
    <div>
      <For each={props.items}>{(item) => props.renderItem(item)}</For>

      <Show when={props.isLoading}>
        <div>Загрузка...</div>
      </Show>

      <div ref={setSentinel} />
    </div>
  );
};

export default InfiniteScroll;
