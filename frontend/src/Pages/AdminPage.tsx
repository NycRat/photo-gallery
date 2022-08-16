import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";

const AdminPage = (): JSX.Element => {
  const tokenRef = useRef<string>("");
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
    alert("Entered Admin Token");
    setToken(tokenRef.current);
  }

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    tokenRef.current = e.currentTarget.value;
  }

  return (
    <div>
      <h1>Admin Login</h1>
      <form onSubmit={handleSubmit}>
        <label>Admin Token: </label>
        <input type={"password"} onChange={handleChange} />
        <input type={"submit"} value={"Enter"} />
      </form>
    </div>
  );
};

export default AdminPage;
