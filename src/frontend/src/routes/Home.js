import { useEffect, useState } from "react";

function Home() {
    const [message, setMessage] = useState("");

    const getMessage = async () => {
      const json = await (
        await fetch(
          "http://localhost/api/message"
        )
      ).json();
      setMessage(json.message);
    }

    useEffect(() => {
      getMessage();
    }, []);
    return (
        <div>
            <h1>Home PAGE</h1>
            <h2>this mesasge from API: {message}</h2>
            <button onClick={() => {
              window.location.href = 'https://api.intra.42.fr/oauth/authorize/?response_type=code&client_id=u-s4t2ud-7a4d91eaac011bcb231f6a2c475ff7b48445dde9311610e0db488b0f8add6fc3&redirect_uri=http://localhost/callback';
            }}>
                LOGIN
            </button>
        </div>
    );
}

export default Home;