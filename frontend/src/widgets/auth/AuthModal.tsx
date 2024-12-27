import { Accessor, Component, createSignal, Match, Switch } from "solid-js";
import { Modal } from "../../shared/ui";
import { LoginPart } from "./LoginPart";
import { RegisterPart } from "./RegisterPart";

export const AuthModal: Component<{
  isOpen: Accessor<boolean>;
  onClose: () => void;
}> = (props) => {
  const [tab, setTab] = createSignal<"login" | "register">("login");

  return (
    <Modal isOpen={props.isOpen()} onClose={props.onClose}>
      <Switch>
        <Match when={tab() == "login"}>
          <LoginPart setTab={setTab} onClose={props.onClose} />
        </Match>
        <Match when={tab() == "register"}>
          <RegisterPart setTab={setTab} onClose={props.onClose} />
        </Match>
      </Switch>
    </Modal>
  );
};
