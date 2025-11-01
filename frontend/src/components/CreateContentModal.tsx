import { useRef, useState } from "react";
import { CrossIcon } from "../icons/CrossIcon";
import { Button } from "./Button";
import { InputForm } from "./InputForm";
import { BACKEND_URL } from "../config";
import axios from "axios";

enum ContentType {
    Youtube = "youtube",
    Twitter = "twitter"
}

export function CreateContentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const titleRef = useRef<HTMLInputElement | null>(null);
    const linkRef = useRef<HTMLInputElement | null>(null);
    const [type, setType] = useState(ContentType.Youtube);

    async function addContent() {
        const title = titleRef.current?.value;
        const link = linkRef.current?.value;
        try {
            await axios.post(`${BACKEND_URL}/api/v1/content`, {
                link,
                title,
                type
            }, {
                headers: {
                    "Authorization": localStorage.getItem("token")
                }
            });
            onClose();
        } catch (err) {
            console.error(err);
        }
    }

    if (!open) return null;

    return (
        <>
            {/* overlay: semi-transparent background, sits below the modal */}
            <div
                className="fixed inset-0 bg-slate-800/60 z-40"

                aria-hidden="true"
            />

            {/* modal container: centered and above the overlay */}
            <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
                <div className="bg-white p-8 rounded-lg shadow-xl min-w-48" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end">
                        <button onClick={onClose} className="p-1 cursor-pointer">
                            <CrossIcon />
                        </button>
                    </div>

                    <div className="flex flex-col gap-3">
                        <InputForm reference={titleRef} placeholder="Title" />
                        <InputForm reference={linkRef} placeholder="Link" />
                    </div>
                    <div className="flex flex-col gap-1 p-2">
                        <div className="flex justify-center">
                            <h1>Type</h1>
                        </div>
                        <div className="flex gap-2">
                            <Button text="Youtube" variant={type === ContentType.Youtube ? "primary" : "secondary"} onClick={() => {
                                setType(ContentType.Youtube)
                            }} />
                            <Button text="Twitter" variant={type === ContentType.Twitter ? "primary" : "secondary"} onClick={() => {
                                setType(ContentType.Twitter)
                            }} />
                        </div>
                        <div className="flex justify-center pt-4">
                            <Button onClick={addContent} variant="primary" text="Submit" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}