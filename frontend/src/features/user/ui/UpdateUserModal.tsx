import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { $currentUser } from "~/entities/user";
import { userApi } from "~/shared/lib/api";
import { UpdateUserReq } from "~/shared/lib/api/groups/user";
import { Input, Modal } from "~/shared/ui";

export const UpdateUserModal = (props: { refetch: () => Promise<void> }) => {
  const [isOpen, setIsOpen] = createSignal(false);

  const currentUser = $currentUser.get();

  const [form, setForm] = createStore<UpdateUserReq>({
    name: currentUser?.name || "",
    username: currentUser?.username || "",
  });

  async function updateUser() {
    const res = await userApi.updateUser(form).catch(() => undefined);

    if (res) {
      $currentUser.set(res);
      props.refetch();
      setIsOpen(false);
    } else {
      alert("Чот не получилось, может имя пользователя уже занято?");
    }
  }

  return (
    <>
      <button
        class="text-black bg-white px-5 py-1 mt-2 font-bold rounded-full"
        onClick={() => setIsOpen(true)}
      >
        Редактировать
      </button>
      <Modal isOpen={isOpen()} onClose={() => setIsOpen(false)}>
        <div class="font-medium text-lg">Обновить информацию о себе</div>
        <div class="flex flex-col gap-1 mt-2">
          <label class="text-sm">Отображаемое имя</label>
          <Input
            value={form.name}
            onChange={(e) => setForm("name", e.target.value)}
          />
        </div>
        <div class="flex flex-col gap-1 mt-2">
          <label class="text-sm">Имя пользователя</label>
          <Input
            value={form.username}
            onChange={(e) => setForm("username", e.target.value)}
          />
        </div>
        <button
          class="text-black bg-white px-5 py-1 mt-2 font-bold rounded-full"
          onClick={() => updateUser()}
        >
          Сохранить
        </button>
      </Modal>
    </>
  );
};
