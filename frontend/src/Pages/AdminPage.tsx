import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { apiUpdateServerCache } from "../Api/ApiFunctions";

const AdminPage = (): JSX.Element => {
  const [tokenInput, setTokenInput] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [cookies, setCookies] = useCookies(["auth_token"]);

  useEffect(() => {
    if (cookies.auth_token !== token && token !== "") {
      setCookies("auth_token", token, {
        path: "/",
        secure: false,
        httpOnly: false,
        // sameSite: "none"
      });
    }
  }, [cookies.auth_token, setCookies, token]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (tokenInput === "") {
      return;
    }
    if (tokenInput.trim() === "") {
      setToken("a");
    } else {
      setToken(tokenInput);
    }
    alert("Entered Admin Token");
    setTokenInput("");
  };

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    setTokenInput(e.currentTarget.value);
  };

  return (
    <div>
      <h1>Admin Login</h1>
      <form onSubmit={handleSubmit}>
        <label>Admin Token: </label>
        <input type={"password"} onChange={handleChange} value={tokenInput} />
        <input type={"submit"} value={"Enter"} disabled={tokenInput === ""} />
      </form>
      <button
        onClick={async () => {
          alert("Wait for next alert");
          await apiUpdateServerCache();
        }}
      >
        Update Server Cache
      </button>
    </div>
  );
};

export default AdminPage;
