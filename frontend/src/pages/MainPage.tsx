import { useStore } from "@nanostores/solid";
import { SendHorizontal } from "lucide-solid";
import { createResource, For, onMount } from "solid-js";
import { Post } from "../entities/post";
import { $currentUser } from "../entities/user";
import { conf, postApi } from "../shared/lib/api";

export const MainPage = () => {
  const user = useStore($currentUser);

  const [posts, { mutate }] = createResource(() => {
    return postApi.getPosts(1);
  });

  onMount(() => {
    conf.reloadToken();

    let page = 1;
    document.addEventListener("scrollend", async () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      if (scrollTop + windowHeight >= documentHeight) {
        // is end
        console.log("is end");

        if (page < (posts()?.last_page ?? 0)) {
          page++;

          const newPosts = await postApi.getPosts(page);

          mutate((prev) => {
            const prevClone = structuredClone(prev);

            prevClone!.page_number = newPosts.page_number;
            prevClone!.last_page = newPosts.last_page;

            prevClone!.content.push(...newPosts.content);

            return prevClone;
          });
        }
      }
    });
  });

  return (
    <>
      {user() ? (
        <div class="relative border-b border-zinc-900">
          <textarea
            class="w-full bg-black text-white font-medium p-4"
            placeholder="Заденисьте по дениске..."
          ></textarea>
          <button class="absolute right-2 bottom-4 rounded-full text-white">
            <SendHorizontal class="h-4" />
          </button>
        </div>
      ) : (
        <div class="border-b border-zinc-900 px-3 font-medium text-lg py-4">
          Чтобы поденисить - войдите в аккаунт
        </div>
      )}
      <div class="flex flex-col">
        <For each={posts()?.content}>{(post) => <Post post={post} />}</For>
      </div>
    </>
  );
};
