import { createStore } from "solid-js/store";
import { authApi } from "../../shared/lib/api";
import { LoginReq } from "../../shared/lib/api/groups/auth";
import { Input, Turnstile } from "../../shared/ui";
import { Component } from "solid-js";
import { $currentUser } from "../../entities/user";

export const LoginPart: Component<{
  setTab: (value: string) => void;
  onClose: () => void;
}> = (props) => {
  const [form, setForm] = createStore<LoginReq>({
    username: "",
    password: "",
    turnstile_token: "",
  });

  const onLogin = async () => {
    const res = await authApi
      .login(form)
      .catch(() => alert("Вероятно вы что-то не так ввели, хз"));

    if (!res) {
      alert("Вероятно вы что-то не так ввели, хз");
      return;
    }

    $currentUser.set(res.user);
    props.onClose();
  };

  return (
    <>
      <h4 class="text-xl font-bold">Авторизация</h4>
      <div class="flex flex-col gap-1 mt-2">
        <label class="text-sm">Имя пользователя:</label>
        <Input
          value={form.username}
          onInput={(e) => setForm("username", e.target.value)}
        />
      </div>
      <div class="flex flex-col gap-1 mt-2">
        <label class="text-sm">Пароль:</label>
        <Input
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
        class="text-sm text-zinc-800"
        onClick={() => props.setTab("register")}
      >
        еще не зарегистрированы?
      </button>
      <button
        class="w-full py-1 bg-white text-black font-semibold text-lg mt-3 rounded-lg disabled:bg-zinc-400"
        onClick={onLogin}
        disabled={form.turnstile_token == ""}
      >
        Войти
      </button>
    </>
  );
};
