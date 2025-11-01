

import { useEffect, useState } from "react"
import { Button } from "../components/Button"
import { Card } from "../components/Card"
import { CreateContentModal } from "../components/CreateContentModal"
import { PlusIcon } from "../icons/PlusIcon"
import { ShareIcon } from "../icons/ShareIcon"
import { SideBar } from "../components/SideBar"
import { useContent } from "../hooks/useContent"


export function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const {contents, fetchContents} = useContent();

  useEffect(()=>{
    fetchContents();
  },[modalOpen])

  return (
    <div>
      <SideBar />
      <div className="p-4 ml-64 min-h-screen bg-gray-100 ">
        <CreateContentModal open={modalOpen} onClose={() => {
          setModalOpen(false);
        }} />
        <div className="flex justify-end gap-4">
          <Button onClick={() => {
            setModalOpen(true);
          }} variant="primary" text="Add Content" startIcon={<PlusIcon />}></Button>
          <Button variant="secondary" text="Share Brain" startIcon={<ShareIcon />}></Button>
        </div>

        <div className="flex gap-4 flex-wrap pt-4">
          {contents.map((content, idx) => (
            <Card  
            type={content.type} 
            link={content.link} 
            title={content.title} 
            />
          ))}
        </div>
      </div>
    </div>
  )
}

