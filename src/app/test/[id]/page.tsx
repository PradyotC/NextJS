import React from "react";

type DynamicProp = {
    params: Promise<{id:number}>
}

const DynamicPage: React.FC<DynamicProp> = async ({params}) => {
    const id = await (await params).id
    return (<div className="flex flex-col items-center justify-center p-25">
        <h3>This is page which id = {id}</h3>
    </div>)
}

export default DynamicPage