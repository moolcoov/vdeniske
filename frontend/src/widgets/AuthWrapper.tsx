import { Component, ParentProps } from "solid-js";

export const AuthWrapper: Component<ParentProps> = (props) => {
  return <>{props.children}</>;
};
