import { useParams } from "@solidjs/router";
import { postApi, userApi } from "../shared/lib/api";
import { createResource, For } from "solid-js";
import { Post } from "../entities/post";

export const UserPage = () => {
  const { userId } = useParams();
  const [user] = createResource(() => {
    return userApi.getUser(userId);
  });

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
