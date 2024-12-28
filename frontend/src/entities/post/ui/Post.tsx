import { Component } from "solid-js";
import { type Post as PostType } from "../../../shared/lib/api/groups/post";
import { A } from "@solidjs/router";
import { ThumbsDown, ThumbsUp } from "lucide-solid";
import { postApi } from "../../../shared/lib/api";

export const Post: Component<{ post: PostType; refetch: () => {} }> = (
  props
) => {
  const likePost = async () => {
    await postApi.likePost(props.post.id);
    props.refetch();
  };

  const dislikePost = async () => {
    await postApi.dislikePost(props.post.id);
    props.refetch();
  };

  return (
    <div class="text-white p-3 border-b border-zinc-900">
      <div class="flex gap-2">
        <A href={`/users/${props.post.author[0].id}`}>
          <img
            src={props.post.author[0].avatar}
            alt={props.post.author[0].name}
            class="h-12 min-w-12 aspect-square border border-zinc-900 rounded-full"
          />
        </A>
        <div>
          <A href={`/users/${props.post.author[0].id}`}>
            <div class="flex items-center gap-2">
              <div class="flex gap-2 items-center">
                <span class="font-bold text-md">
                  {props.post.author[0].name}
                </span>
                <span class="font-medium text-md text-zinc-500">
                  @{props.post.author[0].username}
                </span>
              </div>
            </div>
          </A>
          <p class="break-all whitespace-pre-wrap">{props.post.content}</p>
          <div class="flex gap-2 items-center mt-2">
            <div class="flex gap-1 items-center" onClick={likePost}>
              <ThumbsUp class="h-5" />
              <span class="text-sm font-bold text-zinc-400">
                {props.post.likes || 0}
              </span>
            </div>

            <div class="flex gap-1 items-center" onClick={dislikePost}>
              <ThumbsDown class="h-5" />
              <span class="text-sm font-bold text-zinc-400">
                {props.post.dislikes || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
