import { Component } from "solid-js";
import { type Post as PostType } from "../../../shared/lib/api/groups/post";
import { A } from "@solidjs/router";

export const Post: Component<{ post: PostType }> = (props) => {
  return (
    <div class="text-white p-3 border-b border-zinc-900 flex gap-2">
      <A href={`/users/${props.post.author[0].id}`}>
        <img
          src={props.post.author[0].avatar}
          alt={props.post.author[0].name}
          class="h-12 min-w-12 border border-zinc-900 rounded-full"
        />
      </A>
      <div>
        <A href={`/users/${props.post.author[0].id}`}>
          <div class="flex items-center gap-2">
            <div class="flex gap-2 items-center">
              <span class="font-bold text-md">{props.post.author[0].name}</span>
              <span class="font-medium text-md text-zinc-500">
                @{props.post.author[0].username}
              </span>
            </div>
          </div>
        </A>
        <p class="break-all">{props.post.content}</p>
      </div>
    </div>
  );
};
