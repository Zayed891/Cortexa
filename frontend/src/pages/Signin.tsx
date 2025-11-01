import axios from "axios";
import { Button } from "../components/Button";
import { InputForm } from "../components/InputForm";
import { useRef } from "react";
import { BACKEND_URL } from "../config";
import { useNavigate } from "react-router-dom";



export function Signin() {

    const usernameRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const navigate = useNavigate();

    async function signin() {
        const email = usernameRef.current?.value;
        const password = passwordRef.current?.value;

        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
                email, password
            });
            const jwt = response.data.authorization;
            localStorage.setItem("token",jwt);
            console.log("Signin successfull");
        } catch (err) {
            console.error("Signup error", err);
        }
        navigate("/dashboard");
    }


    return <div className="h-screen w-screen bg-gray-300 flex justify-center items-center">
        <div className="bg-white rounded-xl min-w-48 p-8">
            <InputForm reference={usernameRef} placeholder="email" />
            <InputForm reference={passwordRef} placeholder="Password" />
            <div className="flex justify-center pt-4">
                <Button onClick={signin} loading={false} variant="primary" text="Signin" fullWidth={true} />
            </div>
        </div>
    </div>
}