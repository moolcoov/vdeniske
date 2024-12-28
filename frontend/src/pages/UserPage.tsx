import { useParams } from "@solidjs/router";
import { postApi, userApi } from "../shared/lib/api";
import {
  createEffect,
  createResource,
  createSignal,
  For,
  onCleanup,
} from "solid-js";
import { Post } from "../entities/post";

export const UserPage = () => {
  const { userId } = useParams();
  const [user] = createResource(() => {
    return userApi.getUser(userId);
  });

  const [loading, setLoading] = createSignal(false);
  const [posts, { mutate }] = createResource(() => {
    return postApi.getPostsByUserId(userId, 1);
  });

  const refetchPost = async (id: string) => {
    const post = await postApi.getPostById(id);

    mutate((prev) => {
      const prevClone = structuredClone(prev);
      const postIndex = prevClone!.content.findIndex((post) => post.id === id);
      prevClone!.content[postIndex] = post;

      return prevClone;
    });
  };

  let page = 1;
  const handleScroll = async () => {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    if (scrollHeight - scrollTop <= clientHeight + 50 && !loading()) {
      if (page >= (posts()?.last_page ?? 0)) return;
      page++;

      setLoading(true);
      const newPosts = await postApi.getPostsByUserId(userId, page);

      mutate((prev) => {
        const prevClone = structuredClone(prev);

        prevClone!.page_number = newPosts.page_number;
        prevClone!.last_page = newPosts.last_page;

        prevClone!.content.push(...newPosts.content);

        return prevClone;
      });
      setLoading(false);
    }
  };

  createEffect(() => {
    window.addEventListener("scroll", handleScroll);
    onCleanup(() => window.removeEventListener("scroll", handleScroll));
  });

  return (
    <>
      <div class="flex justify-between p-2 border-b border-zinc-900">
        <div class="flex flex-col">
          <h1 class="font-bold text-2xl">{user()?.name}</h1>
          <p class="text-lg">@{user()?.username}</p>
        </div>
        <div>
          <img
            src={user()?.avatar}
            alt={user()?.name}
            class="h-32 w-32 rounded-full"
          />
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <For each={posts()?.content}>
          {(post) => <Post post={post} refetch={() => refetchPost(post.id)} />}
        </For>
      </div>
    </>
  );
};
