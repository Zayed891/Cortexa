import { useRef } from "react";
import { Button } from "../components/Button";
import { InputForm } from "../components/InputForm";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useNavigate } from "react-router-dom";



export function Signup() {
    const usernameRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const firstNameRef = useRef<HTMLInputElement | null>(null);
    const lastNameRef = useRef<HTMLInputElement | null>(null);
    const navigate = useNavigate();

    async function signup() {
        const email = usernameRef.current?.value;
        const password = passwordRef.current?.value;
        const firstName = firstNameRef.current?.value;
        const lastName = lastNameRef.current?.value;

        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
                email, password, firstName, lastName
            });
            console.log("Signup successfull", response.data);
        } catch (err) {
            console.error("Signup error", err);
        }
        
        navigate("/signin");

    }
    return <div className="h-screen w-screen bg-gray-300 flex justify-center items-center">
        <div className="bg-white rounded-xl min-w-48 p-8">
            <InputForm reference={usernameRef} placeholder="Email" />
            <InputForm reference={passwordRef} placeholder="Password" />
            <InputForm reference={firstNameRef} placeholder="firstName" />
            <InputForm reference={lastNameRef} placeholder="lastName" />
            <div className="flex justify-center pt-4">
                <Button onClick={signup} loading={false} variant="primary" text="Signup" fullWidth={true} />
            </div>
        </div>
    </div>
}