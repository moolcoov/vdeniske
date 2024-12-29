import { useStore } from "@nanostores/solid";
import { SendHorizontal } from "lucide-solid";
import { createResource, createSignal, Match, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import InfiniteScroll from "~/shared/ui/InfiniteScroll";
import { Post } from "../entities/post";
import { $currentUser } from "../entities/user";
import { postApi } from "../shared/lib/api";
import { CreatePostReq } from "../shared/lib/api/groups/post";
import { Modal, Turnstile } from "../shared/ui";
import { CreatePost } from "~/widgets/CreatePost";

export const MainPage = () => {
  const user = useStore($currentUser);

  const [loading, setLoading] = createSignal(false);
  const [isShowTurnstile, setIsShowTurnstile] = createSignal(false);
  const [form, setForm] = createStore<CreatePostReq>({
    content: "",
    reply_to: null,
    turnstile_token: "",
  });

  const [posts, { mutate }] = createResource(() => {
    return postApi.getPosts(1);
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

  let page = 1;
  async function loadMore() {
    if (page >= (posts()?.last_page ?? 0)) return [];

    page++;

    setLoading(true);
    const newPosts = await postApi.getPosts(page);

    mutate((prev) => {
      const prevClone = structuredClone(prev);

      prevClone!.page_number = newPosts.page_number;
      prevClone!.last_page = newPosts.last_page;

      prevClone!.content.push(...newPosts.content);

      return prevClone;
    });
    setLoading(false);

    return newPosts.content;
  }

  return (
    <>
      <Switch>
        <Match when={user()}>
          <CreatePost placeholder="Заденисьте по дениске..." postId={null} />
        </Match>
        <Match when={!user()}>
          <div class="border-b border-zinc-900 px-3 font-medium text-lg py-4">
            Чтобы поденисить - войдите в аккаунт
          </div>
        </Match>
      </Switch>
      <div class="flex flex-col">
        <InfiniteScroll
          items={posts()?.content || []}
          loadMore={loadMore}
          renderItem={(post) => (
            <Post post={post} refetch={() => refetchPost(post.id)} />
          )}
          isLoading={loading()}
        />
      </div>
    </>
  );
};
