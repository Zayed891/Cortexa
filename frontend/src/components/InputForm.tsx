

export function InputForm({placeholder,reference}:{placeholder: string; reference?:any; }){
    return <div>
        <input ref={reference} placeholder={placeholder}  className="px-4 py-2 border border-gray-100 rounded m-2 shadow-sm" ></input>
    </div>
}