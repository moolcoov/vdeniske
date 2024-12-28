import { useParams } from "@solidjs/router";
import { postApi, userApi } from "../shared/lib/api";
import {
  createEffect,
  createResource,
  createSignal,
  For,
  onCleanup,
  Show,
} from "solid-js";
import { Post } from "../entities/post";
import { useStore } from "@nanostores/solid";
import { $currentUser } from "../entities/user";
import { UpdateUserModal } from "../features/user";

export const UserPage = () => {
  const { userId } = useParams();
  const currentUser = useStore($currentUser);
  const [user, { refetch }] = createResource(() => {
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

  async function onUploadAvatar() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("image", file);

      const res = await userApi.updateAvatar(formData);
      $currentUser.set(res);
      refetchAll();
    };
    input.click();
  }

  async function refetchAll() {
    const user = await refetch();

    mutate((prev) => {
      const prevClone = structuredClone(prev);
      prevClone!.content = prevClone!.content.map((post) => ({
        ...post,
        author: post.author
          .filter((user) => user.id == currentUser()?.id)
          .map((u) => ({ ...u, avatar: user?.avatar || "" })),
      }));

      return prevClone;
    });
  }

  return (
    <>
      <div class="flex justify-between p-2 border-b border-zinc-900">
        <div class="flex flex-col">
          <h1 class="font-bold text-2xl">{user()?.name}</h1>
          <p class="text-lg">@{user()?.username}</p>
          <Show when={user()?.id == currentUser()?.id}>
            <UpdateUserModal refetch={refetchAll} />
          </Show>
        </div>
        <div>
          <img
            src={user()?.avatar}
            alt={user()?.name}
            class="h-32 w-32 rounded-full cursor-pointer"
            onClick={() => user()?.id == currentUser()?.id && onUploadAvatar()}
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
