import axios from "axios";
import { useEffect, useState } from "react"
import { BACKEND_URL } from "../config";


export function useContent() {
    const [contents, setContents] = useState<any[]>([]);

    async function fetchContents() {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/v1/content`, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });

            setContents(response.data.contents);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchContents();

        let interval= setInterval(()=>{
            fetchContents();
        },2*1000)

        return ()=>{
            clearInterval(interval);
        }
    }, [])

    return {contents,fetchContents};
}