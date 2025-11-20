import React from "react"
import HeaderComponent from "../../components/headerComponent";

type LayoutProps = {
    children: React.ReactNode
}

const LayoutComponent: React.FC<LayoutProps> = ({ children }) => {
    return (<>
        <HeaderComponent />
        <div>
            {children}
        </div>
    </>);
}

export default LayoutComponent