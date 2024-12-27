import { Accessor, Component } from "solid-js";
import { createStore } from "solid-js/store";
import { authApi } from "../shared/lib/api";
import { LoginReq } from "../shared/lib/api/groups/auth";
import { Modal, Turnstile } from "../shared/ui";

export const AuthModal: Component<{
  isOpen: Accessor<boolean>;
  onClose: () => void;
}> = (props) => {
  const [form, setForm] = createStore<LoginReq>({
    username: "",
    password: "",
    turnstile_token: "",
  });

  const onLogin = async () => {
    const res = await authApi.login(form).catch(console.error);
    console.log(res);
  };

  return (
    <Modal isOpen={props.isOpen()} onClose={props.onClose}>
      <h4 class="text-xl font-bold">Авторизация</h4>
      <div class="flex flex-col gap-1 mt-2">
        <label class="text-sm">Имя пользователя:</label>
        <input
          class="w-full p-2 border border-zinc-900 bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-800"
          value={form.username}
          onInput={(e) => setForm("username", e.target.value)}
        />
      </div>
      <div class="flex flex-col gap-1 mt-2">
        <label class="text-sm">Пароль:</label>
        <input
          class="w-full p-2 border border-zinc-900 bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-800"
          type="password"
          value={form.password}
          onInput={(e) => setForm("password", e.target.value)}
        />
      </div>
      <div class="flex flex-col mt-2">
        <label class="text-sm">знаем мы этих ваших продовцев...</label>
        <label class="text-sm mb-2">пройдите проверку:</label>
        <Turnstile
          onResult={(token) => {
            setForm("turnstile_token", token);
          }}
        />
      </div>
      <button
        class="w-full py-1 bg-white text-black font-semibold text-lg mt-3 rounded-lg disabled:bg-zinc-400"
        onClick={onLogin}
        disabled={form.turnstile_token == ""}
      >
        Войти
      </button>
    </Modal>
  );
};
