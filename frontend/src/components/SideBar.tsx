import { CortexaIcon } from "../icons/CortexaIcon";
import { TwitterIcon } from "../icons/TwitterIcon";
import { YoutubeIcon } from "../icons/YoutubeIcon";
import { SideBarItem } from "./SideBarItem";



export function SideBar() {
    return <div className="h-screen w-64 bg-white border-r border-gray-200 border-2 shadow-sm fixed left-0 top-0 pl-4">
        <div className="flex text-2xl pt-4 items-center">
            <div className="pr-2 text-purple-600">
                <CortexaIcon />
            </div>
            Cortexa
        </div>
        <div className="pt-8 pl-4">
            <SideBarItem text="Twitter" icon={<TwitterIcon />} />
            <SideBarItem text="Youtube" icon={<YoutubeIcon />} />
        </div>
    </div>
}