import Navigation from "@/components/Navigation";
import React from "react";

const IndexLayout = async ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <Navigation />
            {children}
        </div>
    );
};

export default IndexLayout;
