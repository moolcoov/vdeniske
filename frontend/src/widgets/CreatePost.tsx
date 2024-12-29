import { useStore } from "@nanostores/solid";
import { SendHorizontal } from "lucide-solid";
import { createSignal, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { $currentUser } from "~/entities/user";
import { postApi } from "~/shared/lib/api";
import { CreatePostReq } from "~/shared/lib/api/groups/post";
import { Modal, Turnstile } from "~/shared/ui";

export const CreatePost = (props: {
  postId: string | null;
  placeholder: string;
}) => {
  const [isShowTurnstile, setIsShowTurnstile] = createSignal(false);
  const [form, setForm] = createStore<CreatePostReq>({
    content: "",
    reply_to: null,
    turnstile_token: "",
  });

  const createPost = async () => {
    await postApi.createPost({
      ...form,
      reply_to: props.postId,
    });

    location.reload();
  };

  const currentUser = useStore($currentUser);

  return (
    <>
      <Show when={currentUser()}>
        <div class="relative border-b border-zinc-900">
          <textarea
            class="w-full bg-black text-white font-medium p-4"
            placeholder="Реплай в дениску..."
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
        </div>
      </Show>
      <Modal
        isOpen={isShowTurnstile()}
        onClose={() => setIsShowTurnstile(false)}
      >
        <div class="font-medium text-lg">Проверка на дениску</div>
        <Turnstile
          onResult={(token) => {
            setForm("turnstile_token", token);
            requestAnimationFrame(createPost);
          }}
        ></Turnstile>
      </Modal>
    </>
  );
};
