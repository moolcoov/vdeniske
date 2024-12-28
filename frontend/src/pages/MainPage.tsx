import { useStore } from "@nanostores/solid";
import { SendHorizontal } from "lucide-solid";
import { createResource, createSignal, For, onMount } from "solid-js";
import { Post } from "../entities/post";
import { $currentUser } from "../entities/user";
import { conf, postApi } from "../shared/lib/api";
import { CreatePostReq } from "../shared/lib/api/groups/post";
import { Modal, Turnstile } from "../shared/ui";
import { createStore } from "solid-js/store";

export const MainPage = () => {
  const user = useStore($currentUser);

  const [isShowTurnstile, setIsShowTurnstile] = createSignal(false);
  const [form, setForm] = createStore<CreatePostReq>({
    content: "",
    turnstile_token: "",
  });

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

  const createPost = async () => {
    await postApi.createPost(form);

    location.reload();
  };

  const refetchPost = async (id: string) => {
    const post = await postApi.getPostById(id);

    mutate((prev) => {
      const prevClone = structuredClone(prev);
      const postIndex = prevClone!.content.findIndex((post) => post.id === id);
      prevClone!.content[postIndex] = post;

      return prevClone;
    });
  };

  return (
    <>
      {user() ? (
        <div class="relative border-b border-zinc-900">
          <textarea
            class="w-full bg-black text-white font-medium p-4"
            placeholder="Заденисьте по дениске..."
            value={form.content}
            onInput={(e) => setForm("content", e.target.value)}
          ></textarea>
          <button
            class="absolute right-2 bottom-4 rounded-full text-white"
            onClick={() => {
              if (form.content) {
                setIsShowTurnstile(true);
              }
            }}
          >
            <SendHorizontal class="h-4" />
          </button>

          <Modal
            isOpen={isShowTurnstile()}
            onClose={() => setIsShowTurnstile(false)}
          >
            <Turnstile
              onResult={(token) => {
                setForm("turnstile_token", token);
                requestAnimationFrame(createPost);
              }}
            ></Turnstile>
          </Modal>
        </div>
      ) : (
        <div class="border-b border-zinc-900 px-3 font-medium text-lg py-4">
          Чтобы поденисить - войдите в аккаунт
        </div>
      )}
      <div class="flex flex-col">
        <For each={posts()?.content}>
          {(post) => <Post post={post} refetch={() => refetchPost(post.id)} />}
        </For>
      </div>
    </>
  );
};
