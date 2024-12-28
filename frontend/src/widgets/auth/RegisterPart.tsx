import { Component } from "solid-js";
import { createStore } from "solid-js/store";
import { RegisterReq } from "../../shared/lib/api/groups/auth";
import { Input, Turnstile } from "../../shared/ui";
import { authApi } from "../../shared/lib/api";

export const RegisterPart: Component<{
  setTab: (value: string) => void;
  onClose: () => void;
}> = (props) => {
  const [form, setForm] = createStore<RegisterReq>({
    username: "",
    password: "",
    name: "",
    email: "",
    turnstile_token: "",
  });

  const onRegister = async () => {
    const res = await authApi
      .register(form)
      .catch(() =>
        alert(
          "Определенно, что-то пошло не так. Попробуйте другую почту/юзернейм"
        )
      );

    if (!res) return;

    alert("Успешная регистрация, теперь войдите ВДениску");
    props.setTab("login");
  };

  return (
    <>
      <h4 class="text-xl font-bold">Регистрация ВДениске</h4>
      <div class="flex flex-col gap-1 mt-2">
        <label class="text-sm">Отображаемое имя:</label>
        <Input
          value={form.name}
          onInput={(e) => setForm("name", e.target.value)}
        />
      </div>
      <div class="flex flex-col gap-1 mt-2">
        <label class="text-sm">Имя пользователя:</label>
        <Input
          value={form.username}
          onInput={(e) => setForm("username", e.target.value)}
        />
      </div>
      <div class="flex flex-col gap-1 mt-2">
        <label class="text-sm">Почта:</label>
        <Input
          value={form.email}
          onInput={(e) => setForm("email", e.target.value)}
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
        class="text-sm text-zinc-400"
        onClick={() => props.setTab("login")}
      >
        уже есть аккаунт?
      </button>
      <button
        class="w-full py-1 bg-white text-black font-semibold text-lg mt-3 rounded-lg disabled:bg-zinc-400"
        onClick={onRegister}
        disabled={form.turnstile_token == ""}
      >
        Зарегистрироваться
      </button>
    </>
  );
};
