import { useBeforeLeave, useParams } from "@solidjs/router";
import { createResource, createSignal, Show } from "solid-js";
import { Post } from "~/entities/post";
import { postApi } from "~/shared/lib/api";
import InfiniteScroll from "~/shared/ui/InfiniteScroll";
import { CreatePost } from "~/widgets/CreatePost";

export const PostPage = () => {
  const { postId } = useParams();

  const [post, { refetch: refetchPost }] = createResource(() =>
    postApi.getPostById(postId || "")
  );

  const [replies, { mutate, refetch: refetchReplies }] = createResource(() => {
    return postApi.getRepliesByPostId(postId || "", 1);
  });
  const [loading, setLoading] = createSignal(false);

  let page = 1;
  async function loadMore() {
    if (page >= (replies()?.last_page ?? 0)) return [];

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

  const refetchReplyPost = async (id: string) => {
    const post = await postApi.getPostById(id);

    mutate((prev) => {
      const prevClone = structuredClone(prev);
      const postIndex = prevClone!.content.findIndex((post) => post.id === id);
      prevClone!.content[postIndex] = post;

      return prevClone;
    });
  };

  useBeforeLeave(() => {
    requestAnimationFrame(() => {
      refetchReplies();
      refetchPost();
    });
  });

  return (
    <div>
      <Show when={post()}>
        <Post post={post()!} refetch={() => refetchPost()} />
        <div class="border-b border-zinc-900 px-3 font-medium text-lg py-4">
          Ответы
        </div>
        <CreatePost
          postId={post()?.id || null}
          placeholder="Реплай в дениску..."
        />
        <InfiniteScroll
          items={replies()?.content || []}
          loadMore={loadMore}
          renderItem={(post) => (
            <Post post={post} refetch={() => refetchReplyPost(post.id)} />
          )}
          isLoading={loading()}
        />
      </Show>
    </div>
  );
};
