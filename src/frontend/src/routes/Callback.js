import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

function Callback() {
    const [login, setLogin] = useState();
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');

    const getLogin = async (code) => {
        const json = await (
            await fetch(
                'http://localhost/api/auth/login?code=' + code
                )
        ).json();
        console.log(json.message);
        setLogin(json.message);
    }

    useEffect(() => {
        getLogin(code);
    },[]);

    // redirect
    if (code) {
        return (
            <div>
                login message: {login};
            </div>
        );
    }
    return (
        <div>
            <h1>No code</h1>
        </div>
    );
}

export default Callback;