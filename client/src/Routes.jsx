import { useContext } from "react";
import LoginPage from "./pages/LoginPage";
import { UserContext } from "./UserContext";
import Chat from "./pages/Chat";

export default function Routes() {

  const { username, id } = useContext(UserContext);

  if (username) {
    return <Chat />
  }
  return (
    <LoginPage />
  )
}