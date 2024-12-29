import { useParams } from "@solidjs/router";
import { createResource, createSignal, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { Post } from "~/entities/post";
import { postApi } from "~/shared/lib/api";
import { CreatePostReq } from "~/shared/lib/api/groups/post";
import { Modal, Turnstile } from "~/shared/ui";
import InfiniteScroll from "~/shared/ui/InfiniteScroll";

export const PostPage = () => {
  const { postId } = useParams();

  const [post, { refetch }] = createResource(() =>
    postApi.getPostById(postId || "")
  );

  const [posts, { mutate }] = createResource(() => {
    return postApi.getRepliesByPostId(postId || "", 1);
  });
  const [loading, setLoading] = createSignal(false);

  let page = 1;
  async function loadMore() {
    if (page >= (posts()?.last_page ?? 0)) return [];

    page++;

    setLoading(true);
    const newPosts = await postApi.getRepliesByPostId(postId || "", page);

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

  const [isShowTurnstile, setIsShowTurnstile] = createSignal(false);
  const [form, setForm] = createStore<CreatePostReq>({
    content: "",
    reply_to: post()?.id || null,
    turnstile_token: "",
  });

  const createPost = async () => {
    await postApi.createPost(form);

    location.reload();
  };

  return (
    <div>
      <Show when={post()}>
        <Post post={post()!} refetch={() => refetch()} />
        <div class="border-b border-zinc-900 px-3 font-medium text-lg py-4">
          Ответы
        </div>
        <div class="border-b border-zinc-900">
          <textarea
            class="w-full bg-black text-white font-medium p-4"
            placeholder="Реплай в дениску..."
            value={form.content}
            onInput={(e) => setForm("content", e.target.value)}
          ></textarea>
        </div>
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
        <InfiniteScroll
          items={posts()?.content || []}
          loadMore={loadMore}
          renderItem={(post) => <Post post={post} refetch={() => refetch()} />}
          isLoading={loading()}
        />
      </Show>
    </div>
  );
};
